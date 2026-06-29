#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:8080/api}"
CLEANUP_ON_EXIT="${CLEANUP_ON_EXIT:-true}"
RESET_AFTER_SMOKE="${RESET_AFTER_SMOKE:-false}"

DB_HOST="${WIKINODE_DB_HOST:-localhost}"
DB_PORT="${WIKINODE_DB_PORT:-5432}"
DB_NAME="${WIKINODE_DB_NAME:-wikinode_studio}"
DB_USER="${WIKINODE_DB_USERNAME:-wikinode}"
DB_PASSWORD="${WIKINODE_DB_PASSWORD:-wikinode}"

cleanup() {
  if [[ "${CLEANUP_ON_EXIT}" == "true" ]]; then
    if [[ "${RESET_AFTER_SMOKE}" == "true" ]]; then
      echo "api-smoke: resetting database after smoke"
      "${ROOT_DIR}/scripts/reset-db.sh"
      return
    fi

    command -v psql >/dev/null 2>&1 || {
      echo "api-smoke: skip cleanup because psql is not installed or not on PATH" >&2
      return
    }

    export PGPASSWORD="${DB_PASSWORD}"
    psql \
      --set=ON_ERROR_STOP=1 \
      --quiet \
      --host="${DB_HOST}" \
      --port="${DB_PORT}" \
      --username="${DB_USER}" \
      --dbname="${DB_NAME}" \
      --command="delete from draft_wikinode_relation_candidates where suggestion_id in (select suggestion_id from draft_wikinode_suggestions where raw_material_id like 'rm-import-%' or parsed_document_id like 'pd-import-%'); delete from draft_wikinode_suggestion_source_refs where suggestion_id in (select suggestion_id from draft_wikinode_suggestions where raw_material_id like 'rm-import-%' or parsed_document_id like 'pd-import-%'); delete from draft_wikinode_suggestions where raw_material_id like 'rm-import-%' or parsed_document_id like 'pd-import-%'; delete from source_operations where raw_material_id like 'rm-import-%' or parsed_document_id like 'pd-import-%'; delete from raw_materials where raw_material_id like 'rm-import-%'; delete from wiki_nodes where node_id like 'wn-from-sug-pd-import-%'; delete from wiki_nodes where node_id like 'api-smoke-%';" >/dev/null
    echo "api-smoke: cleaned temporary api-smoke nodes"
  fi
}

trap cleanup EXIT

node - "${API_BASE_URL}" <<'NODE'
const baseUrl = process.argv[2].replace(/\/$/, "")
const slug = `api-smoke-${Date.now()}`

async function request(label, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
    },
    ...options,
  })
  const text = await response.text()
  let body = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }

  if (!response.ok) {
    throw new Error(`${label}: FAIL ${response.status} ${text}`)
  }

  console.log(`${label}: PASS ${response.status}`)
  return body
}

async function requestForm(label, path, formData) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "accept": "application/json",
    },
    body: formData,
  })
  const text = await response.text()
  let body = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }

  if (!response.ok) {
    throw new Error(`${label}: FAIL ${response.status} ${text}`)
  }

  console.log(`${label}: PASS ${response.status}`)
  return body
}

const nodes = await request("GET /api/wiki-nodes", "/wiki-nodes")
if (!Array.isArray(nodes) || nodes.length < 5) {
  throw new Error("GET /api/wiki-nodes: FAIL expected at least 5 nodes")
}

if (!nodes.some((node) => node.nodeId === "wn-001" && node.knowledgeBaseId === "kb-cc-after-sales")) {
  throw new Error("GET /api/wiki-nodes: FAIL expected WikiNode knowledgeBaseId")
}

const nodeDetail = await request("GET /api/wiki-nodes/{id}", "/wiki-nodes/wn-001")
if (nodeDetail.objectType !== "Article" || !nodeDetail.subtype || !nodeDetail.metadata || !Array.isArray(nodeDetail.relations) || !nodeDetail.processingProfile) {
  throw new Error("GET /api/wiki-nodes/{id}: FAIL expected Knowledge Object fields")
}

if (nodeDetail.knowledgeBaseId !== "kb-cc-after-sales") {
  throw new Error("GET /api/wiki-nodes/{id}: FAIL expected WikiNode Knowledge Base scope")
}

const knowledgeBases = await request("GET /api/knowledge-bases", "/knowledge-bases")
if (!Array.isArray(knowledgeBases) || !knowledgeBases.some((kb) => kb.kbId === "kb-cc-after-sales" && kb.status === "active")) {
  throw new Error("GET /api/knowledge-bases: FAIL expected seeded active Knowledge Base")
}

const knowledgeBaseDetail = await request("GET /api/knowledge-bases/{id}", "/knowledge-bases/kb-product-guide")
if (knowledgeBaseDetail.kbId !== "kb-product-guide" || knowledgeBaseDetail.visibility !== "internal") {
  throw new Error("GET /api/knowledge-bases/{id}: FAIL expected Knowledge Base detail")
}

const sources = await request("GET /api/sources", "/sources")
if (!Array.isArray(sources) || !sources.some((source) => source.sourceId === "src-feishu-cc" && source.rawMaterialCount >= 1)) {
  throw new Error("GET /api/sources: FAIL expected source rawMaterialCount")
}

if (!sources.some((source) => source.sourceId === "src-pdf-dishwasher" && source.knowledgeBaseId === "kb-product-guide")) {
  throw new Error("GET /api/sources: FAIL expected Source knowledgeBaseId")
}

const sourceDetail = await request("GET /api/sources/{id}", "/sources/src-feishu-cc")
if (sourceDetail.sourceType !== "feishu") {
  throw new Error("GET /api/sources/{id}: FAIL expected Source detail")
}

if (sourceDetail.knowledgeBaseId !== "kb-cc-after-sales") {
  throw new Error("GET /api/sources/{id}: FAIL expected Source Knowledge Base scope")
}

const scopedRetrieval = await request("POST /api/retrieval-test Knowledge Base scoped", "/retrieval-test", {
  method: "POST",
  body: JSON.stringify({
    query: "",
    filters: {
      knowledgeBaseId: "kb-product-guide",
    },
    topK: 5,
    debug: false,
  }),
})

if (
  !Array.isArray(scopedRetrieval) ||
  !scopedRetrieval.some((result) => result.node?.knowledgeBaseId === "kb-product-guide") ||
  scopedRetrieval.some((result) => result.node?.knowledgeBaseId === "kb-cc-after-sales")
) {
  throw new Error("POST /api/retrieval-test Knowledge Base scoped: FAIL expected Knowledge Base-scoped WikiNode results")
}

const sourceRawMaterials = await request("GET /api/sources/{id}/raw-materials", "/sources/src-feishu-cc/raw-materials")
if (!Array.isArray(sourceRawMaterials) || !sourceRawMaterials.some((rawMaterial) => rawMaterial.rawMaterialId === "rm-001")) {
  throw new Error("GET /api/sources/{id}/raw-materials: FAIL expected Raw Material list")
}

const sourceOperations = await request("GET /api/sources/{id}/operations", "/sources/src-feishu-cc/operations")
if (!Array.isArray(sourceOperations) || !sourceOperations.some((operation) => operation.operationId === "op-src-feishu-sync-001")) {
  throw new Error("GET /api/sources/{id}/operations: FAIL expected Source Operation list")
}

const rawMaterials = await request("GET /api/raw-materials", "/raw-materials")
if (!Array.isArray(rawMaterials) || !rawMaterials.some((rawMaterial) => rawMaterial.parseStatus === "parsed")) {
  throw new Error("GET /api/raw-materials: FAIL expected parsed Raw Material")
}

const rawMaterialDetail = await request("GET /api/raw-materials/{id}", "/raw-materials/rm-001")
if (rawMaterialDetail.sourceId !== "src-feishu-cc" || rawMaterialDetail.parsedDocumentCount < 1) {
  throw new Error("GET /api/raw-materials/{id}: FAIL expected parsed document count")
}

const parsedDocuments = await request("GET /api/raw-materials/{id}/parsed-documents", "/raw-materials/rm-001/parsed-documents")
if (!Array.isArray(parsedDocuments) || !parsedDocuments.some((parsedDocument) => parsedDocument.parsedDocumentId === "pd-001")) {
  throw new Error("GET /api/raw-materials/{id}/parsed-documents: FAIL expected Parsed Document list")
}

const rawMaterialOperations = await request("GET /api/raw-materials/{id}/operations", "/raw-materials/rm-001/operations")
if (!Array.isArray(rawMaterialOperations) || !rawMaterialOperations.some((operation) => operation.operationType === "parse_raw_material")) {
  throw new Error("GET /api/raw-materials/{id}/operations: FAIL expected Raw Material Operation list")
}

const parsedDocumentDetail = await request("GET /api/parsed-documents/{id}", "/parsed-documents/pd-001")
if (!parsedDocumentDetail.normalizedContent || !Array.isArray(parsedDocumentDetail.sourceRefs)) {
  throw new Error("GET /api/parsed-documents/{id}: FAIL expected normalized content and source refs")
}

if (Object.prototype.hasOwnProperty.call(parsedDocumentDetail, "chunk")) {
  throw new Error("GET /api/parsed-documents/{id}: FAIL response exposed chunk")
}

const importForm = new FormData()
importForm.append("requestedBy", "api-smoke")
importForm.append("file", new Blob(["# API Smoke 端到端验收排查\n\nAPI Smoke 端到端验收排查用于确认导入、拆分、图谱和召回。\n\n## 关系证据\n\n请参考 [[收费政策]]。"], { type: "text/markdown" }), "api-smoke-import.md")
const sourceImport = await requestForm("POST /api/sources/{id}/raw-materials/import", "/sources/src-pdf-dishwasher/raw-materials/import", importForm)
if (sourceImport.sourceId !== "src-pdf-dishwasher" || sourceImport.status !== "succeeded" || sourceImport.segmentCount < 1 || !sourceImport.rawMaterialId || !sourceImport.parsedDocumentId || !sourceImport.suggestionId) {
  throw new Error("POST /api/sources/{id}/raw-materials/import: FAIL expected import result")
}

if (JSON.stringify(sourceImport).includes("nodeId") || JSON.stringify(sourceImport).includes("embedding") || JSON.stringify(sourceImport).includes("vector")) {
  throw new Error("POST /api/sources/{id}/raw-materials/import: FAIL response exposed forbidden internals")
}

const importedRawMaterial = await request("GET /api/raw-materials/{importedId}", `/raw-materials/${sourceImport.rawMaterialId}`)
if (importedRawMaterial.parseStatus !== "parsed" || importedRawMaterial.parsedDocumentCount !== 1) {
  throw new Error("GET /api/raw-materials/{importedId}: FAIL expected parsed imported Raw Material")
}

const importedSegments = await request("GET /api/parsed-documents/{id}/segments", `/parsed-documents/${sourceImport.parsedDocumentId}/segments`)
if (!Array.isArray(importedSegments) || importedSegments.length < 1 || importedSegments[0].parsedDocumentId !== sourceImport.parsedDocumentId) {
  throw new Error("GET /api/parsed-documents/{id}/segments: FAIL expected persisted document segments")
}

if (JSON.stringify(importedSegments).includes("embedding") || JSON.stringify(importedSegments).includes("vector")) {
  throw new Error("GET /api/parsed-documents/{id}/segments: FAIL response exposed forbidden internals")
}

const importedSuggestion = await request("GET /api/draft-wikinode-suggestions/{importedSuggestionId}", `/draft-wikinode-suggestions/${sourceImport.suggestionId}`)
if (importedSuggestion.parsedDocumentId !== sourceImport.parsedDocumentId || importedSuggestion.status !== "draft") {
  throw new Error("GET /api/draft-wikinode-suggestions/{importedSuggestionId}: FAIL expected generated draft suggestion")
}

if (JSON.stringify(importedSuggestion).includes("indexSegmentId") || JSON.stringify(importedSuggestion).includes("nodeId") || JSON.stringify(importedSuggestion).includes("embedding") || JSON.stringify(importedSuggestion).includes("vector")) {
  throw new Error("GET /api/draft-wikinode-suggestions/{importedSuggestionId}: FAIL response exposed forbidden internals")
}

const importedAcceptedSuggestion = await request("POST /api/draft-wikinode-suggestions/{importedSuggestionId}/accept", `/draft-wikinode-suggestions/${sourceImport.suggestionId}/accept`, {
  method: "POST",
  body: JSON.stringify({
    reviewNote: "API smoke 确认本地导入建议进入 WikiNode。",
  }),
})

if (importedAcceptedSuggestion.status !== "accepted" || !importedAcceptedSuggestion.nodeId || importedAcceptedSuggestion.indexSegmentCount !== 3) {
  throw new Error("POST /api/draft-wikinode-suggestions/{importedSuggestionId}/accept: FAIL expected imported suggestion to become draft WikiNode")
}

const importedPublished = await request("POST /api/wiki-nodes/{importedNodeId}/publish", `/wiki-nodes/${importedAcceptedSuggestion.nodeId}/publish`, {
  method: "POST",
  body: JSON.stringify({}),
})

if (importedPublished.status !== "published" || importedPublished.indexStatus !== "outdated" || importedPublished.indexSegmentCount !== 3) {
  throw new Error("POST /api/wiki-nodes/{importedNodeId}/publish: FAIL expected imported WikiNode local publish preparation")
}

const importedGraph = await request("GET /api/wiki-graph/overview after imported publish", "/wiki-graph/overview")
if (
  !Array.isArray(importedGraph.nodes) ||
  !importedGraph.nodes.some((node) => node.nodeId === importedAcceptedSuggestion.nodeId && node.title === "API Smoke 端到端验收排查") ||
  !Array.isArray(importedGraph.edges) ||
  !importedGraph.edges.some((edge) =>
    edge.fromNodeId === importedAcceptedSuggestion.nodeId &&
    edge.targetTitle === "收费政策" &&
    edge.resolved === true
  )
) {
  throw new Error("GET /api/wiki-graph/overview after imported publish: FAIL expected imported WikiNode and resolved WikiLink edge")
}

const importedRetrieval = await request("POST /api/retrieval-test imported WikiNode", "/retrieval-test", {
  method: "POST",
  body: JSON.stringify({
    query: "API Smoke 端到端验收排查 图谱 召回",
    filters: {},
    topK: 5,
    debug: true,
  }),
})

const importedRetrievalResult = Array.isArray(importedRetrieval)
  ? importedRetrieval.find((result) => result.node?.nodeId === importedAcceptedSuggestion.nodeId)
  : null

if (!importedRetrievalResult || !Array.isArray(importedRetrievalResult.matchedSegments) || !importedRetrievalResult.matchedSegments.some((segment) => segment.nodeId === importedAcceptedSuggestion.nodeId)) {
  throw new Error("POST /api/retrieval-test imported WikiNode: FAIL expected imported WikiNode result with matched Index Segment evidence")
}

if (importedRetrieval.some((result) => Object.prototype.hasOwnProperty.call(result, "chunk") || Object.prototype.hasOwnProperty.call(result, "document"))) {
  throw new Error("POST /api/retrieval-test imported WikiNode: FAIL response exposed chunk or document as primary result")
}

const sourceOperationDetail = await request("GET /api/source-operations/{id}", "/source-operations/op-src-feishu-sync-001")
if (sourceOperationDetail.operationType !== "source_sync" || sourceOperationDetail.requestedBy !== "system") {
  throw new Error("GET /api/source-operations/{id}: FAIL expected Source Operation detail")
}

if (JSON.stringify(sourceOperationDetail).includes("credential") || JSON.stringify(sourceOperationDetail).includes("secret") || JSON.stringify(sourceOperationDetail).includes("chunk")) {
  throw new Error("GET /api/source-operations/{id}: FAIL response exposed forbidden internals")
}

const parserProfiles = await request("GET /api/parser-profiles", "/parser-profiles")
if (!Array.isArray(parserProfiles) || !parserProfiles.some((profile) => profile.parserProfile === "feishu_article_v1" && profile.enabled === true)) {
  throw new Error("GET /api/parser-profiles: FAIL expected Parser Profile registry")
}

if (JSON.stringify(parserProfiles).includes("credential") || JSON.stringify(parserProfiles).includes("secret") || JSON.stringify(parserProfiles).includes("plugin") || JSON.stringify(parserProfiles).includes("chunk")) {
  throw new Error("GET /api/parser-profiles: FAIL response exposed forbidden internals")
}

const indexSegments = await request("GET /api/index-segments", "/index-segments")
if (!Array.isArray(indexSegments) || !indexSegments.some((segment) => segment.segmentId === "seg-001" && segment.nodeId === "wn-001")) {
  throw new Error("GET /api/index-segments: FAIL expected Index Segment list")
}

if (JSON.stringify(indexSegments).includes("chunk") || JSON.stringify(indexSegments).includes("embedding")) {
  throw new Error("GET /api/index-segments: FAIL response exposed forbidden internals")
}

const indexSegmentDetail = await request("GET /api/index-segments/{id}", "/index-segments/seg-001")
if (indexSegmentDetail.nodeId !== "wn-001" || indexSegmentDetail.indexStatus !== "indexed" || !Array.isArray(indexSegmentDetail.sourceRefs)) {
  throw new Error("GET /api/index-segments/{id}: FAIL expected Index Segment detail")
}

const wikiNodeIndexSegments = await request("GET /api/wiki-nodes/{id}/index-segments", "/wiki-nodes/wn-001/index-segments")
if (!Array.isArray(wikiNodeIndexSegments) || !wikiNodeIndexSegments.some((segment) => segment.segmentId === "seg-001")) {
  throw new Error("GET /api/wiki-nodes/{id}/index-segments: FAIL expected WikiNode scoped Index Segments")
}

const suggestions = await request("GET /api/draft-wikinode-suggestions", "/draft-wikinode-suggestions")
if (!Array.isArray(suggestions) || !suggestions.some((suggestion) => suggestion.suggestionId === "sug-001" && suggestion.status === "draft")) {
  throw new Error("GET /api/draft-wikinode-suggestions: FAIL expected Draft WikiNode Suggestion list")
}

const suggestionDetail = await request("GET /api/draft-wikinode-suggestions/{id}", "/draft-wikinode-suggestions/sug-001")
if (suggestionDetail.parsedDocumentId !== "pd-001" || !Array.isArray(suggestionDetail.sourceRefs) || !Array.isArray(suggestionDetail.relationCandidates)) {
  throw new Error("GET /api/draft-wikinode-suggestions/{id}: FAIL expected sourceRefs and relationCandidates")
}

if (JSON.stringify(suggestionDetail).includes("indexSegmentId") || JSON.stringify(suggestionDetail).includes("signedUrl") || JSON.stringify(suggestionDetail).includes("chunk")) {
  throw new Error("GET /api/draft-wikinode-suggestions/{id}: FAIL response exposed forbidden internals")
}

const parsedDocumentSuggestions = await request("GET /api/parsed-documents/{id}/draft-wikinode-suggestions", "/parsed-documents/pd-001/draft-wikinode-suggestions")
if (!Array.isArray(parsedDocumentSuggestions) || !parsedDocumentSuggestions.some((suggestion) => suggestion.suggestionId === "sug-001")) {
  throw new Error("GET /api/parsed-documents/{id}/draft-wikinode-suggestions: FAIL expected scoped suggestions")
}

const rawMaterialSuggestions = await request("GET /api/raw-materials/{id}/draft-wikinode-suggestions", "/raw-materials/rm-001/draft-wikinode-suggestions")
if (!Array.isArray(rawMaterialSuggestions) || !rawMaterialSuggestions.some((suggestion) => suggestion.suggestionId === "sug-001")) {
  throw new Error("GET /api/raw-materials/{id}/draft-wikinode-suggestions: FAIL expected scoped suggestions")
}

const sourceIngestionRun = await request("POST /api/sources/{id}/ingestion-runs", "/sources/src-excel-fee/ingestion-runs", {
  method: "POST",
  body: JSON.stringify({
    conversionProfile: "excel_fee_table_v1",
    requestedBy: "api-smoke",
  }),
})

if (sourceIngestionRun.sourceId !== "src-excel-fee" || !["succeeded", "skipped"].includes(sourceIngestionRun.status) || sourceIngestionRun.parsedDocumentCount < 1) {
  throw new Error("POST /api/sources/{id}/ingestion-runs: FAIL expected local Source ingestion result")
}

if (JSON.stringify(sourceIngestionRun).includes("nodeId") || JSON.stringify(sourceIngestionRun).includes("indexSegmentId") || JSON.stringify(sourceIngestionRun).includes("chunk")) {
  throw new Error("POST /api/sources/{id}/ingestion-runs: FAIL response exposed forbidden internals")
}

const generatedSuggestion = await request("POST /api/parsed-documents/{id}/suggest-wikinode", "/parsed-documents/pd-003/suggest-wikinode", {
  method: "POST",
  body: JSON.stringify({
    conversionProfile: "excel_fee_table_v1",
    idempotencyKey: "api-smoke-pd-003",
  }),
})

if (generatedSuggestion.parsedDocumentId !== "pd-003" || !["succeeded", "skipped"].includes(generatedSuggestion.status)) {
  throw new Error("POST /api/parsed-documents/{id}/suggest-wikinode: FAIL expected generated or skipped result")
}

if (JSON.stringify(generatedSuggestion).includes("nodeId") || JSON.stringify(generatedSuggestion).includes("indexSegmentId") || JSON.stringify(generatedSuggestion).includes("chunk")) {
  throw new Error("POST /api/parsed-documents/{id}/suggest-wikinode: FAIL response exposed forbidden internals")
}

const generatedScopedSuggestions = await request("GET /api/parsed-documents/{id}/draft-wikinode-suggestions", "/parsed-documents/pd-003/draft-wikinode-suggestions")
if (!Array.isArray(generatedScopedSuggestions) || !generatedScopedSuggestions.some((suggestion) => suggestion.suggestionId === "sug-pd-003")) {
  throw new Error("GET /api/parsed-documents/{id}/draft-wikinode-suggestions: FAIL expected generated suggestion")
}

const rejectedSuggestion = await request("POST /api/draft-wikinode-suggestions/{id}/reject", "/draft-wikinode-suggestions/sug-001/reject", {
  method: "POST",
  body: JSON.stringify({
    reviewNote: "API smoke 确认冲突建议暂不进入 WikiNode。",
  }),
})

if (rejectedSuggestion.suggestionId !== "sug-001" || !["rejected", "skipped"].includes(rejectedSuggestion.status)) {
  throw new Error("POST /api/draft-wikinode-suggestions/{id}/reject: FAIL expected rejected or skipped result")
}

if (JSON.stringify(rejectedSuggestion).includes("nodeId") || JSON.stringify(rejectedSuggestion).includes("indexSegmentId") || JSON.stringify(rejectedSuggestion).includes("chunk")) {
  throw new Error("POST /api/draft-wikinode-suggestions/{id}/reject: FAIL response exposed forbidden internals")
}

const rejectedSuggestionDetail = await request("GET /api/draft-wikinode-suggestions/{id}", "/draft-wikinode-suggestions/sug-001")
if (rejectedSuggestionDetail.status !== "rejected" || rejectedSuggestionDetail.reviewNote !== "API smoke 确认冲突建议暂不进入 WikiNode。") {
  throw new Error("GET /api/draft-wikinode-suggestions/{id}: FAIL expected rejected suggestion")
}

const acceptedSuggestion = await request("POST /api/draft-wikinode-suggestions/{id}/accept", "/draft-wikinode-suggestions/sug-002/accept", {
  method: "POST",
  body: JSON.stringify({
    reviewNote: "API smoke 确认进入草稿 WikiNode。",
  }),
})

if (acceptedSuggestion.suggestionId !== "sug-002" || !["accepted", "skipped"].includes(acceptedSuggestion.status)) {
  throw new Error("POST /api/draft-wikinode-suggestions/{id}/accept: FAIL expected accepted or skipped result")
}

if (acceptedSuggestion.status === "accepted" && acceptedSuggestion.indexSegmentCount !== 3) {
  throw new Error("POST /api/draft-wikinode-suggestions/{id}/accept: FAIL expected local Index Segment preparation")
}

if (JSON.stringify(acceptedSuggestion).includes("wikiLinkId") || JSON.stringify(acceptedSuggestion).includes("indexSegmentId") || JSON.stringify(acceptedSuggestion).includes("chunk")) {
  throw new Error("POST /api/draft-wikinode-suggestions/{id}/accept: FAIL response exposed forbidden internals")
}

const acceptedSuggestionDetail = await request("GET /api/draft-wikinode-suggestions/{id}", "/draft-wikinode-suggestions/sug-002")
if (acceptedSuggestionDetail.status !== "accepted" || acceptedSuggestionDetail.reviewNote !== "API smoke 确认进入草稿 WikiNode。") {
  throw new Error("GET /api/draft-wikinode-suggestions/{id}: FAIL expected accepted suggestion")
}

const acceptedNode = await request("GET /api/wiki-nodes/{id}", `/wiki-nodes/${acceptedSuggestion.nodeId ?? "wn-from-sug-002"}`)
if (acceptedNode.status !== "draft" || acceptedNode.indexStatus !== "not_indexed") {
  throw new Error("GET /api/wiki-nodes/{id}: FAIL accepted suggestion should create draft non-indexed WikiNode")
}

const acceptedNodeSegments = await request("GET /api/wiki-nodes/{id}/index-segments", `/wiki-nodes/${acceptedSuggestion.nodeId ?? "wn-from-sug-002"}/index-segments`)
if (acceptedSuggestion.status === "accepted" && (!Array.isArray(acceptedNodeSegments) || acceptedNodeSegments.length !== 3 || acceptedNodeSegments.some((segment) => segment.indexStatus !== "not_indexed"))) {
  throw new Error("GET /api/wiki-nodes/{id}/index-segments: FAIL expected prepared non-indexed Index Segments for accepted draft")
}

if (acceptedSuggestion.status === "accepted" && acceptedNodeSegments.some((segment) => segment.vectorDocId !== null)) {
  throw new Error("GET /api/wiki-nodes/{id}/index-segments: FAIL expected unsynced vectorDocId")
}

if (JSON.stringify(acceptedNodeSegments).includes("embedding")) {
  throw new Error("GET /api/wiki-nodes/{id}/index-segments: FAIL response exposed forbidden internals")
}

const publishedLifecycle = await request("POST /api/wiki-nodes/{id}/publish", `/wiki-nodes/${acceptedSuggestion.nodeId ?? "wn-from-sug-002"}/publish`, {
  method: "POST",
  body: JSON.stringify({}),
})

if (
  acceptedSuggestion.status === "accepted" &&
  (
    publishedLifecycle.nodeId !== acceptedSuggestion.nodeId ||
    publishedLifecycle.status !== "published" ||
    publishedLifecycle.indexStatus !== "outdated" ||
    publishedLifecycle.indexSegmentCount !== 3
  )
) {
  throw new Error("POST /api/wiki-nodes/{id}/publish: FAIL expected local publish and Index Segment preparation")
}

if (JSON.stringify(publishedLifecycle).includes("indexSegmentId") || JSON.stringify(publishedLifecycle).includes("vectorDocId") || JSON.stringify(publishedLifecycle).includes("chunk")) {
  throw new Error("POST /api/wiki-nodes/{id}/publish: FAIL response exposed forbidden internals")
}

const publishedNode = await request("GET /api/wiki-nodes/{id} after publish", `/wiki-nodes/${acceptedSuggestion.nodeId ?? "wn-from-sug-002"}`)
if (acceptedSuggestion.status === "accepted" && (publishedNode.status !== "published" || publishedNode.indexStatus !== "outdated")) {
  throw new Error("GET /api/wiki-nodes/{id} after publish: FAIL expected published outdated WikiNode")
}

const publishedNodeSegments = await request("GET /api/wiki-nodes/{id}/index-segments after publish", `/wiki-nodes/${acceptedSuggestion.nodeId ?? "wn-from-sug-002"}/index-segments`)
if (acceptedSuggestion.status === "accepted" && (!Array.isArray(publishedNodeSegments) || publishedNodeSegments.length !== 3 || publishedNodeSegments.some((segment) => segment.vectorDocId !== null))) {
  throw new Error("GET /api/wiki-nodes/{id}/index-segments after publish: FAIL expected unsynced local Index Segments")
}

const reindexLifecycle = await request("POST /api/wiki-nodes/{id}/reindex", `/wiki-nodes/${acceptedSuggestion.nodeId ?? "wn-from-sug-002"}/reindex`, {
  method: "POST",
  body: JSON.stringify({}),
})

if (acceptedSuggestion.status === "accepted" && (reindexLifecycle.indexStatus !== "outdated" || reindexLifecycle.indexSegmentCount !== 3)) {
  throw new Error("POST /api/wiki-nodes/{id}/reindex: FAIL expected local Index Segment preparation")
}

const created = await request("POST /api/wiki-nodes", "/wiki-nodes", {
  method: "POST",
  body: JSON.stringify({
    slug,
    title: "API Smoke Node",
    nodeType: "term",
    objectType: "Article",
    subtype: "term",
    metadata: {
      businessDomain: "after_sales",
      language: "zh-CN",
    },
    relations: [{
      targetNodeId: "wn-001",
      relationType: "references",
      direction: "outgoing",
      confidence: 0.7,
      createdBy: "user",
      evidence: {
        sourceRefId: "api-smoke-ref",
      },
    }],
    processingProfile: "manual_article_v1",
    summary: "Created by repeatable API smoke",
    contentMarkdown: "API smoke create content.",
    tags: ["api-smoke"],
    status: "draft",
    sourceRefs: [],
    indexStatus: "not_indexed",
  }),
})

if (created.nodeId !== slug || created.slug !== slug || created.objectType !== "Article" || created.processingProfile !== "manual_article_v1") {
  throw new Error("POST /api/wiki-nodes: FAIL response does not contain created WikiNode")
}

const generatedIndexSegments = await request("POST /api/wiki-nodes/{id}/index-segments/generate", `/wiki-nodes/${created.nodeId}/index-segments/generate`, {
  method: "POST",
  body: JSON.stringify({}),
})
const generatedSegmentPrefix = `seg-${created.nodeId}-`
if (!Array.isArray(generatedIndexSegments) || generatedIndexSegments.length !== 3) {
  throw new Error("POST /api/wiki-nodes/{id}/index-segments/generate: FAIL expected 3 local Index Segments")
}

if (!generatedIndexSegments.some((segment) => segment.segmentId === `${generatedSegmentPrefix}title` && segment.indexStatus === "not_indexed" && segment.vectorDocId == null && segment.metadata?.generationMode === "local_deterministic" && segment.metadata?.traceSource === "wiki_node")) {
  throw new Error("POST /api/wiki-nodes/{id}/index-segments/generate: FAIL expected deterministic title segment trace metadata")
}

if (!generatedIndexSegments.every((segment) => segment.nodeId === created.nodeId && segment.metadata?.parentNodeId === created.nodeId)) {
  throw new Error("POST /api/wiki-nodes/{id}/index-segments/generate: FAIL expected parent WikiNode trace")
}

if (JSON.stringify(generatedIndexSegments).includes("chunk") || JSON.stringify(generatedIndexSegments).includes("embedding")) {
  throw new Error("POST /api/wiki-nodes/{id}/index-segments/generate: FAIL response exposed forbidden internals")
}

const updated = await request("PUT /api/wiki-nodes/{id}", `/wiki-nodes/${slug}`, {
  method: "PUT",
  body: JSON.stringify({
    slug,
    title: "API Smoke Node Updated",
    nodeType: "term",
    objectType: "Article",
    subtype: "term",
    metadata: {
      businessDomain: "after_sales",
      language: "zh-CN",
      scenario: "api_smoke",
    },
    relations: [{
      targetNodeId: "wn-001",
      relationType: "references",
      direction: "outgoing",
      confidence: 0.8,
      createdBy: "user",
      evidence: {
        sourceRefId: "api-smoke-ref",
      },
    }],
    processingProfile: "manual_article_v2",
    summary: "Updated by repeatable API smoke",
    contentMarkdown: "API smoke updated content is searchable.",
    tags: ["api-smoke", "updated"],
    status: "published",
    sourceRefs: [],
    indexStatus: "indexed",
    lastIndexedAt: "2026-06-22",
  }),
})

if (updated.title !== "API Smoke Node Updated" || updated.processingProfile !== "manual_article_v2" || updated.metadata?.scenario !== "api_smoke") {
  throw new Error("PUT /api/wiki-nodes/{id}: FAIL response does not contain updated title")
}

const brokenLinks = await request("GET /api/broken-links", "/broken-links")
if (!Array.isArray(brokenLinks)) {
  throw new Error("GET /api/broken-links: FAIL response is not an array")
}

const retrieval = await request("POST /api/retrieval-test", "/retrieval-test", {
  method: "POST",
  body: JSON.stringify({
    query: "API Smoke Node Updated searchable",
    filters: {},
    topK: 5,
  }),
})

if (!Array.isArray(retrieval) || retrieval.length === 0) {
  throw new Error("POST /api/retrieval-test: FAIL expected non-empty result array")
}

if (!retrieval.some((result) => result.node?.nodeId === slug)) {
  throw new Error("POST /api/retrieval-test: FAIL expected result.node WikiNode for smoke node")
}

if (retrieval.some((result) => Object.prototype.hasOwnProperty.call(result, "chunk"))) {
  throw new Error("POST /api/retrieval-test: FAIL response exposed chunk")
}

if (retrieval.some((result) => Object.prototype.hasOwnProperty.call(result, "document"))) {
  throw new Error("POST /api/retrieval-test: FAIL response exposed document")
}

const retrievalDebug = await request("POST /api/retrieval-test debug", "/retrieval-test", {
  method: "POST",
  body: JSON.stringify({
    query: "保修期内维修",
    filters: {},
    topK: 3,
    debug: true,
  }),
})

if (!Array.isArray(retrievalDebug) || !retrievalDebug.some((result) => result.node?.nodeId === "wn-001")) {
  throw new Error("POST /api/retrieval-test debug: FAIL expected WikiNode wn-001")
}

const debugMatch = retrievalDebug.find((result) => result.node?.nodeId === "wn-001")
if (!Array.isArray(debugMatch?.matchedSegments) || !debugMatch.matchedSegments.some((segment) => segment.segmentId === "seg-001" && Array.isArray(segment.sourceRefIds))) {
  throw new Error("POST /api/retrieval-test debug: FAIL expected matched Index Segment evidence")
}

if (JSON.stringify(retrievalDebug).includes("chunk") || JSON.stringify(retrievalDebug).includes("Chat API")) {
  throw new Error("POST /api/retrieval-test debug: FAIL response exposed forbidden product wording")
}

const retrievalLogs = await request("GET /api/retrieval-test/logs", "/retrieval-test/logs")
if (
  !Array.isArray(retrievalLogs) ||
  !retrievalLogs.some((log) =>
    log.query === "保修期内维修" &&
    Array.isArray(log.returnedNodeIds) &&
    log.returnedNodeIds.includes("wn-001") &&
    Array.isArray(log.matchedSegmentIds) &&
    log.matchedSegmentIds.includes("seg-001") &&
    typeof log.latencyMs === "number" &&
    log.status === "succeeded"
  )
) {
  throw new Error("GET /api/retrieval-test/logs: FAIL expected Retrieval API evidence log")
}

const evaluationCaseId = `api-smoke-eval-${Date.now()}`
const evaluationCase = await request("POST /api/retrieval-test/evaluation-cases", "/retrieval-test/evaluation-cases", {
  method: "POST",
  body: JSON.stringify({
    caseId: evaluationCaseId,
    query: "保修期内维修",
    filters: {},
    topK: 3,
    expectedNodeIds: ["wn-001"],
  }),
})

if (
  evaluationCase.caseId !== evaluationCaseId ||
  !Array.isArray(evaluationCase.expectedNodeIds) ||
  !evaluationCase.expectedNodeIds.includes("wn-001") ||
  evaluationCase.runResult?.status !== "passed" ||
  !Array.isArray(evaluationCase.runResult?.matchedSegmentIds) ||
  !evaluationCase.runResult.matchedSegmentIds.includes("seg-001")
) {
  throw new Error("POST /api/retrieval-test/evaluation-cases: FAIL expected evaluation evidence")
}

const evaluationCases = await request("GET /api/retrieval-test/evaluation-cases", "/retrieval-test/evaluation-cases")
if (!Array.isArray(evaluationCases) || !evaluationCases.some((item) => item.caseId === evaluationCaseId)) {
  throw new Error("GET /api/retrieval-test/evaluation-cases: FAIL expected saved evaluation case")
}

console.log("Retrieval node contract: PASS node=true chunk=false document=false")
console.log("Retrieval evidence contract: PASS debug=true logs=true evaluation=true")
console.log("API smoke: PASS")
NODE
