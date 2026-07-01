import { apiGet, apiPost, apiPostForm, withMockFallback } from "@/services/api-client"
import { mockRawMaterials } from "@/data/mock-raw-materials"
import { mockSources } from "@/data/mock-sources"
import { listWikiNodes } from "@/services/wiki-node-api-service"
import type {
  DraftWikiNodeSuggestion,
  DraftWikiNodeSuggestionAcceptRequest,
  DraftWikiNodeSuggestionAcceptResult,
  DraftWikiNodeSuggestionRejectRequest,
  DraftWikiNodeSuggestionRetryRequest,
  DraftWikiNodeSuggestionRetryResult,
  DraftWikiNodeSuggestionReviewResult,
} from "@/types/draft-wikinode-suggestion"
import type { ParsedDocument, ParsedDocumentSegment, RawMaterial } from "@/types/raw-material"
import type { SourceItem } from "@/types/source"
import type { SourceImportResult, SourceIngestionRunRequest, SourceIngestionRunResult, SourceOperation } from "@/types/source-operation"

export function listSources() {
  return withMockFallback(
    apiGet<SourceItem[]>("/sources"),
    () => mockSources
  )
}

export function getSource(sourceId: string) {
  return withMockFallback(
    apiGet<SourceItem>(`/sources/${sourceId}`),
    () => mockSources.find((source) => source.sourceId === sourceId) ?? mockSources[0]
  )
}

export function listRawMaterials() {
  return withMockFallback(
    apiGet<RawMaterial[]>("/raw-materials"),
    () => mockRawMaterials
  )
}

export function listRawMaterialsForSource(sourceId: string) {
  return withMockFallback(
    apiGet<RawMaterial[]>(`/sources/${sourceId}/raw-materials`),
    () => mockRawMaterials.filter((rawMaterial) => rawMaterial.sourceId === sourceId)
  )
}

export function listSourceOperationsForSource(sourceId: string) {
  return withMockFallback(
    apiGet<SourceOperation[]>(`/sources/${sourceId}/operations`),
    () => mockSourceOperations.filter((operation) => operation.sourceId === sourceId)
  )
}

export function runSourceIngestion(sourceId: string, request: SourceIngestionRunRequest) {
  return withMockFallback(
    apiPost<SourceIngestionRunResult>(`/sources/${sourceId}/ingestion-runs`, request),
    (): SourceIngestionRunResult => ({
      operationId: `mock-${sourceId}-ingestion`,
      sourceId,
      status: "skipped",
      summary: "暂未生成新的 WikiNode 建议。",
      rawMaterialCount: 0,
      parsedDocumentCount: 0,
      generatedSuggestionIds: [],
      skippedParsedDocumentIds: [],
    })
  )
}

export function importSourceFile(sourceId: string, file: File, requestedBy = "ui") {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("requestedBy", requestedBy)
  const source = mockSources.find((item) => item.sourceId === sourceId)
  return withMockFallback(
    apiPostForm<SourceImportResult>(`/sources/${sourceId}/raw-materials/import`, formData),
    (): SourceImportResult => ({
      operationId: `local-${sourceId}-import`,
      sourceId,
      knowledgeBaseId: source?.knowledgeBaseId ?? null,
      rawMaterialId: `local-${sourceId}-raw-material`,
      parsedDocumentId: `local-${sourceId}-parsed-document`,
      status: "skipped",
      summary: "本地预览环境暂未连接文件导入接口。",
      segmentCount: 0,
      segmentIds: [],
      suggestionId: null,
    })
  )
}

export function listSourceOperations() {
  return Promise.resolve(mockSourceOperations)
}

export function getRawMaterial(rawMaterialId: string) {
  return withMockFallback(
    apiGet<RawMaterial>(`/raw-materials/${rawMaterialId}`),
    () => mockRawMaterials.find((rawMaterial) => rawMaterial.rawMaterialId === rawMaterialId) ?? mockRawMaterials[0]
  )
}

export function listParsedDocumentsForRawMaterial(rawMaterialId: string) {
  return withMockFallback(
    apiGet<ParsedDocument[]>(`/raw-materials/${rawMaterialId}/parsed-documents`),
    () => mockParsedDocuments.filter((parsedDocument) => parsedDocument.rawMaterialId === rawMaterialId)
  )
}

export function listSourceOperationsForRawMaterial(rawMaterialId: string) {
  return withMockFallback(
    apiGet<SourceOperation[]>(`/raw-materials/${rawMaterialId}/operations`),
    () => mockSourceOperations.filter((operation) => operation.rawMaterialId === rawMaterialId)
  )
}

export function getSourceOperation(operationId: string) {
  return withMockFallback(
    apiGet<SourceOperation>(`/source-operations/${operationId}`),
    () => mockSourceOperations.find((operation) => operation.operationId === operationId) ?? mockSourceOperations[0]
  )
}

export function getParsedDocument(parsedDocumentId: string) {
  return withMockFallback(
    apiGet<ParsedDocument>(`/parsed-documents/${parsedDocumentId}`),
    () => mockParsedDocuments.find((parsedDocument) => parsedDocument.parsedDocumentId === parsedDocumentId) ?? mockParsedDocuments[0]
  )
}

export function listParsedDocumentSegments(parsedDocumentId: string) {
  return withMockFallback(
    apiGet<ParsedDocumentSegment[]>(`/parsed-documents/${parsedDocumentId}/segments`),
    () => mockParsedDocumentSegments.filter((segment) => segment.parsedDocumentId === parsedDocumentId)
  )
}

export function listDraftWikiNodeSuggestionsForRawMaterial(rawMaterialId: string) {
  return withMockFallback(
    apiGet<DraftWikiNodeSuggestion[]>(`/raw-materials/${rawMaterialId}/draft-wikinode-suggestions`),
    () => mockDraftWikiNodeSuggestions.filter((suggestion) => suggestion.rawMaterialId === rawMaterialId)
  )
}

export function listDraftWikiNodeSuggestionsForParsedDocument(parsedDocumentId: string) {
  return withMockFallback(
    apiGet<DraftWikiNodeSuggestion[]>(`/parsed-documents/${parsedDocumentId}/draft-wikinode-suggestions`),
    () => mockDraftWikiNodeSuggestions.filter((suggestion) => suggestion.parsedDocumentId === parsedDocumentId)
  )
}

export function getDraftWikiNodeSuggestion(suggestionId: string) {
  return withMockFallback(
    apiGet<DraftWikiNodeSuggestion>(`/draft-wikinode-suggestions/${suggestionId}`),
    () => mockDraftWikiNodeSuggestions.find((suggestion) => suggestion.suggestionId === suggestionId) ?? mockDraftWikiNodeSuggestions[0]
  )
}

export function listDraftWikiNodeSuggestions() {
  return withMockFallback(
    apiGet<DraftWikiNodeSuggestion[]>("/draft-wikinode-suggestions"),
    () => mockDraftWikiNodeSuggestions
  )
}

export type DraftWikiNodeSuggestionGenerationRequest = {
  conversionProfile?: string
  idempotencyKey?: string
}

export type DraftWikiNodeSuggestionGenerationResult = {
  operationId?: string | null
  parsedDocumentId: string
  status: "succeeded" | "skipped" | "failed"
  summary: string
  suggestionId?: string | null
}

export function generateDraftWikiNodeSuggestion(
  parsedDocumentId: string,
  request: DraftWikiNodeSuggestionGenerationRequest
) {
  return withMockFallback(
    apiPost<DraftWikiNodeSuggestionGenerationResult>(`/parsed-documents/${parsedDocumentId}/suggest-wikinode`, request),
    (): DraftWikiNodeSuggestionGenerationResult => ({
      operationId: `mock-${parsedDocumentId}-suggest`,
      parsedDocumentId,
      status: "skipped",
      summary: "WikiNode 建议生成未完成，请稍后重试。",
      suggestionId: null,
    })
  )
}

export function rejectDraftWikiNodeSuggestion(
  suggestionId: string,
  request: DraftWikiNodeSuggestionRejectRequest
) {
  return withMockFallback(
    apiPost<DraftWikiNodeSuggestionReviewResult>(`/draft-wikinode-suggestions/${suggestionId}/reject`, request),
    (): DraftWikiNodeSuggestionReviewResult => ({
      suggestionId,
      status: "skipped",
      summary: "WikiNode 建议拒绝未完成，请稍后重试。",
      reviewNote: request.reviewNote,
    })
  )
}

export function acceptDraftWikiNodeSuggestion(
  suggestionId: string,
  request: DraftWikiNodeSuggestionAcceptRequest
) {
  return withMockFallback(
    apiPost<DraftWikiNodeSuggestionAcceptResult>(`/draft-wikinode-suggestions/${suggestionId}/accept`, request),
    (): DraftWikiNodeSuggestionAcceptResult => ({
      suggestionId,
      status: "skipped",
      summary: "WikiNode 建议采纳未完成，请稍后重试。",
      reviewNote: request.reviewNote,
      nodeId: null,
      nodeStatus: null,
      indexSegmentCount: null,
    })
  )
}

export function retryDraftWikiNodeSuggestion(
  suggestionId: string,
  request: DraftWikiNodeSuggestionRetryRequest
) {
  return withMockFallback(
    apiPost<DraftWikiNodeSuggestionRetryResult>(`/draft-wikinode-suggestions/${suggestionId}/retry`, request),
    (): DraftWikiNodeSuggestionRetryResult => ({
      suggestionId,
      status: "skipped",
      summary: "WikiNode 建议重新生成未完成，请稍后重试。",
      reviewNote: request.reviewNote,
      replacementSuggestionId: null,
      replacementStatus: null,
      operationId: null,
    })
  )
}

export async function getNodesBySourceId(sourceId: string) {
  if (!sourceId) return []

  const nodes = await listWikiNodes()
  return nodes.filter((node) => node.sourceRefs.some((source) => source.sourceId === sourceId))
}

const mockParsedDocuments: ParsedDocument[] = [
  {
    parsedDocumentId: "pd-001",
    rawMaterialId: "rm-001",
    sourceId: "src-feishu-cc",
    knowledgeBaseId: "kb-cc-after-sales",
    title: "售后政策空间快照解析结果",
    contentFormat: "markdown",
    normalizedContent: "# 保修政策\n\n保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。",
    metadata: {
      language: "zh-CN",
      businessDomain: "after_sales",
    },
    sourceRefs: [{
      sourceId: "src-feishu-cc",
      rawMaterialId: "rm-001",
      parsedDocumentId: "pd-001",
      locatorType: "heading",
      locator: "保修政策/收费例外",
      excerpt: "保修期内维修不收取人工费",
      confidence: 0.92,
    }],
    parserProfile: "feishu_article_v1",
    parseStatus: "parsed",
    parseErrorSummary: null,
    createdAt: "2026-06-20",
    updatedAt: "2026-06-20",
  },
  {
    parsedDocumentId: "pd-002",
    rawMaterialId: "rm-002",
    sourceId: "src-pdf-dishwasher",
    knowledgeBaseId: "kb-product-guide",
    title: "洗碗机培训 PDF 解析结果",
    contentFormat: "markdown",
    normalizedContent: "# 洗碗机培训\n\n排查时先确认电源、水路和错误码。",
    metadata: {
      language: "zh-CN",
      businessDomain: "product_support",
    },
    sourceRefs: [{
      sourceId: "src-pdf-dishwasher",
      rawMaterialId: "rm-002",
      parsedDocumentId: "pd-002",
      locatorType: "page",
      locator: "P-8",
      excerpt: "先检查电源、水路和错误码",
      confidence: 0.88,
    }],
    parserProfile: "pdf_manual_article_v1",
    parseStatus: "parsed",
    parseErrorSummary: null,
    createdAt: "2026-06-18",
    updatedAt: "2026-06-18",
  },
  {
    parsedDocumentId: "pd-003",
    rawMaterialId: "rm-003",
    sourceId: "src-excel-fee",
    knowledgeBaseId: "kb-cc-after-sales",
    title: "维修收费标准 Excel 解析结果",
    contentFormat: "structured_table",
    normalizedContent: "| 项目 | 费用 |\n| --- | --- |\n| 上门检测 | 按服务单收费 |",
    metadata: {
      language: "zh-CN",
      businessDomain: "service_fee",
    },
    sourceRefs: [{
      sourceId: "src-excel-fee",
      rawMaterialId: "rm-003",
      parsedDocumentId: "pd-003",
      locatorType: "row",
      locator: "Sheet1:R2",
      excerpt: "上门检测按服务单收费",
      confidence: 0.9,
    }],
    parserProfile: "excel_fee_table_v1",
    parseStatus: "parsed",
    parseErrorSummary: null,
    createdAt: "2026-06-16",
    updatedAt: "2026-06-16",
  },
]

const mockSourceOperations: SourceOperation[] = [
  {
    operationId: "op-src-feishu-sync-001",
    operationType: "source_sync",
    sourceId: "src-feishu-cc",
    knowledgeBaseId: "kb-cc-after-sales",
    rawMaterialId: null,
    parsedDocumentId: null,
    status: "succeeded",
    requestedBy: "system",
    startedAt: "2026-06-20T10:30:00+08:00",
    finishedAt: "2026-06-20T10:35:00+08:00",
    summary: "Completed read-only Source sync evidence capture for 2 Raw Materials.",
    errorSummary: null,
  },
  {
    operationId: "op-src-feishu-parse-001",
    operationType: "parse_raw_material",
    sourceId: "src-feishu-cc",
    knowledgeBaseId: "kb-cc-after-sales",
    rawMaterialId: "rm-001",
    parsedDocumentId: "pd-001",
    status: "succeeded",
    requestedBy: "system",
    startedAt: "2026-06-20T10:36:00+08:00",
    finishedAt: "2026-06-20T10:37:00+08:00",
    summary: "Completed read-only Parsed Document evidence preview.",
    errorSummary: null,
  },
  {
    operationId: "op-word-parse-001",
    operationType: "parse_raw_material",
    sourceId: "src-word-manual",
    knowledgeBaseId: "kb-product-guide",
    rawMaterialId: "rm-004",
    parsedDocumentId: null,
    status: "failed",
    requestedBy: "system",
    startedAt: "2026-06-12T18:21:00+08:00",
    finishedAt: "2026-06-12T18:22:00+08:00",
    summary: "Parser profile rejected this Raw Material in the read-only seed baseline.",
    errorSummary: "Unsupported document structure in seed evidence.",
  },
]

const mockParsedDocumentSegments: ParsedDocumentSegment[] = [
  {
    segmentId: "pds-pd-001-001",
    parsedDocumentId: "pd-001",
    rawMaterialId: "rm-001",
    sourceId: "src-feishu-cc",
    knowledgeBaseId: "kb-cc-after-sales",
    position: 0,
    segmentType: "section",
    title: "保修政策",
    content: "# 保修政策\n\n保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。",
    contentPreview: "# 保修政策 保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。",
    tokenCount: 35,
    sourceLocator: "section:1",
    createdAt: "2026-06-20",
    updatedAt: "2026-06-20",
  },
  {
    segmentId: "pds-pd-002-001",
    parsedDocumentId: "pd-002",
    rawMaterialId: "rm-002",
    sourceId: "src-pdf-dishwasher",
    knowledgeBaseId: "kb-product-guide",
    position: 0,
    segmentType: "section",
    title: "洗碗机培训",
    content: "# 洗碗机培训\n\n排查时先确认电源、水路和错误码。",
    contentPreview: "# 洗碗机培训 排查时先确认电源、水路和错误码。",
    tokenCount: 24,
    sourceLocator: "section:1",
    createdAt: "2026-06-18",
    updatedAt: "2026-06-18",
  },
]

const mockDraftWikiNodeSuggestions: DraftWikiNodeSuggestion[] = [
  {
    suggestionId: "sug-001",
    parsedDocumentId: "pd-001",
    rawMaterialId: "rm-001",
    sourceId: "src-feishu-cc",
    knowledgeBaseId: "kb-cc-after-sales",
    operationId: "op-src-feishu-suggest-001",
    title: "保修期内维修服务政策",
    objectType: "Article",
    subtype: "service_fee_policy",
    contentDraft: "# 保修期内维修服务政策\n\n保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。",
    metadataDraft: {
      language: "zh-CN",
      businessDomain: "after_sales",
    },
    sourceRefs: [{
      sourceId: "src-feishu-cc",
      rawMaterialId: "rm-001",
      parsedDocumentId: "pd-001",
      locatorType: "heading",
      locator: "保修政策/收费例外",
      excerpt: "保修期内维修不收取人工费",
      confidence: 0.92,
    }],
    relationCandidates: [{
      targetTitle: "收费政策",
      relationType: "references",
      source: "inferred_from_source_ref",
      confidence: 0.74,
    }],
    confidence: 0.88,
    status: "draft",
    reviewNote: null,
    conflictStatus: "title_match",
    conflictReasons: ["标题可能重复"],
    matchedWikiNodeIds: ["wn-001"],
    matchedSuggestionIds: [],
    sourceRefCount: 1,
    relationCandidateCount: 1,
    createdAt: "2026-06-20",
    updatedAt: "2026-06-20",
  },
  {
    suggestionId: "sug-002",
    parsedDocumentId: "pd-002",
    rawMaterialId: "rm-002",
    sourceId: "src-pdf-dishwasher",
    knowledgeBaseId: "kb-product-guide",
    operationId: "op-pdf-suggest-001",
    title: "洗碗机基础排查建议",
    objectType: "Procedure",
    subtype: "troubleshooting_flow",
    contentDraft: "# 洗碗机基础排查建议\n\n排查时先确认电源、水路和错误码。\n\n该内容仍需人工复核后才能进入 WikiNode。",
    metadataDraft: {
      language: "zh-CN",
      businessDomain: "product_support",
    },
    sourceRefs: [{
      sourceId: "src-pdf-dishwasher",
      rawMaterialId: "rm-002",
      parsedDocumentId: "pd-002",
      locatorType: "page",
      locator: "P-8",
      excerpt: "先检查电源、水路和错误码",
      confidence: 0.88,
    }],
    relationCandidates: [{
      targetTitle: "保修期内维修服务政策",
      relationType: "references",
      source: "inferred_from_source_ref",
      confidence: 0.62,
    }],
    confidence: 0.76,
    status: "needs_review",
    reviewNote: "需要产品培训负责人复核标题和适用范围。",
    conflictStatus: "none",
    conflictReasons: [],
    matchedWikiNodeIds: [],
    matchedSuggestionIds: [],
    sourceRefCount: 1,
    relationCandidateCount: 1,
    createdAt: "2026-06-18",
    updatedAt: "2026-06-18",
  },
]
