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
