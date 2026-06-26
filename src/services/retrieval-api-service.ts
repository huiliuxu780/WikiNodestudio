import { searchWikiNodes as searchMockWikiNodes } from "@/services/retrieval-mock-service"
import { apiGet, apiPost, withMockFallback } from "@/services/api-client"
import { mockRetrievalLogs } from "@/data/mock-retrieval"
import type { RetrievalEvaluationCase, RetrievalEvaluationCaseRequest, RetrievalLog, RetrievalQuery, RetrievalResult } from "@/types/retrieval"

export function searchWikiNodes(query: RetrievalQuery) {
  return withMockFallback(
    apiPost<RetrievalResult[]>("/retrieval-test", query),
    () => searchMockWikiNodes(query),
  )
}

export function listRetrievalLogs() {
  return withMockFallback(
    apiGet<RetrievalLog[]>("/retrieval-test/logs"),
    () => mockRetrievalLogs,
  )
}

export function listRetrievalEvaluationCases() {
  return withMockFallback(
    apiGet<RetrievalEvaluationCase[]>("/retrieval-test/evaluation-cases"),
    () => mockRetrievalEvaluationCases,
  )
}

export function createRetrievalEvaluationCase(request: RetrievalEvaluationCaseRequest) {
  return withMockFallback(
    apiPost<RetrievalEvaluationCase>("/retrieval-test/evaluation-cases", request),
    (): RetrievalEvaluationCase => ({
      caseId: request.caseId ?? `eval-${Date.now()}`,
      query: request.query,
      filters: request.filters,
      topK: request.topK,
      expectedNodeIds: request.expectedNodeIds,
      runResult: {
        returnedNodeIds: request.expectedNodeIds,
        matchedSegmentIds: [],
        status: "passed",
        summary: "命中预期 WikiNode。",
      },
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    }),
  )
}

const mockRetrievalEvaluationCases: RetrievalEvaluationCase[] = [
  {
    caseId: "eval-warranty-fee",
    query: "洗碗机保修期内维修收费吗？",
    filters: { nodeType: "policy", tags: ["保修"] },
    topK: 5,
    expectedNodeIds: ["wn-001"],
    runResult: {
      returnedNodeIds: ["wn-001"],
      matchedSegmentIds: ["seg-001"],
      status: "passed",
      summary: "命中预期 WikiNode。",
    },
    createdAt: "2026-06-26",
    updatedAt: "2026-06-26",
  },
  {
    caseId: "eval-extended-warranty",
    query: "延保范围",
    filters: {},
    topK: 3,
    expectedNodeIds: ["wn-004"],
    runResult: {
      returnedNodeIds: ["wn-002"],
      matchedSegmentIds: ["seg-009"],
      status: "failed",
      summary: "返回 WikiNode 与预期不一致。",
    },
    createdAt: "2026-06-26",
    updatedAt: "2026-06-26",
  },
]
