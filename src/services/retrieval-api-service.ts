import { searchWikiNodes as searchMockWikiNodes } from "@/services/retrieval-mock-service"
import { apiPost, withMockFallback } from "@/services/api-client"
import type { RetrievalQuery, RetrievalResult } from "@/types/retrieval"

export function searchWikiNodes(query: RetrievalQuery) {
  return withMockFallback(apiPost<RetrievalResult[]>("/retrieval-test", query), () => searchMockWikiNodes(query))
}
