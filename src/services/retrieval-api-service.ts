import { buildRetrievalTrace as buildMockRetrievalTrace, searchWikiNodes as searchMockWikiNodes } from "@/services/retrieval-mock-service"
import type { RetrievalQuery } from "@/types/retrieval"

export function searchWikiNodes(query: RetrievalQuery) {
  return Promise.resolve(searchMockWikiNodes(query))
}

export function buildRetrievalTrace(query: RetrievalQuery, resultCount: number) {
  return buildMockRetrievalTrace(query, resultCount)
}
