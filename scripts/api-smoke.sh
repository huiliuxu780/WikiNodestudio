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
      --command="delete from wiki_nodes where node_id like 'api-smoke-%';" >/dev/null
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

const nodes = await request("GET /api/wiki-nodes", "/wiki-nodes")
if (!Array.isArray(nodes) || nodes.length < 5) {
  throw new Error("GET /api/wiki-nodes: FAIL expected at least 5 nodes")
}

await request("GET /api/wiki-nodes/{id}", "/wiki-nodes/wn-001")

const created = await request("POST /api/wiki-nodes", "/wiki-nodes", {
  method: "POST",
  body: JSON.stringify({
    slug,
    title: "API Smoke Node",
    nodeType: "term",
    summary: "Created by repeatable API smoke",
    contentMarkdown: "API smoke create content.",
    tags: ["api-smoke"],
    status: "draft",
    sourceRefs: [],
    indexStatus: "not_indexed",
  }),
})

if (created.nodeId !== slug || created.slug !== slug) {
  throw new Error("POST /api/wiki-nodes: FAIL response does not contain created WikiNode")
}

const updated = await request("PUT /api/wiki-nodes/{id}", `/wiki-nodes/${slug}`, {
  method: "PUT",
  body: JSON.stringify({
    slug,
    title: "API Smoke Node Updated",
    nodeType: "term",
    summary: "Updated by repeatable API smoke",
    contentMarkdown: "API smoke updated content is searchable.",
    tags: ["api-smoke", "updated"],
    status: "published",
    sourceRefs: [],
    indexStatus: "indexed",
    lastIndexedAt: "2026-06-22",
  }),
})

if (updated.title !== "API Smoke Node Updated") {
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

console.log("Retrieval node contract: PASS node=true chunk=false document=false")
console.log("API smoke: PASS")
NODE
