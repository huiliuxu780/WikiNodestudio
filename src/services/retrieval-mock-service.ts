import { mockWikiNodes } from "@/data/mock-wiki-nodes"
import type { RetrievalQuery, RetrievalResult } from "@/types/retrieval"
import { getIncomingLinks, getOutgoingLinks } from "@/utils/link-parser"

function charOverlap(query: string, text: string) {
  const queryChars = Array.from(new Set(query.replace(/\s/g, "")))
  if (!queryChars.length) return 0
  return queryChars.filter((char) => text.includes(char)).length / queryChars.length
}

function fieldScore(query: string, text: string, weight: number) {
  const normalizedQuery = query.trim().toLowerCase()
  const normalizedText = text.toLowerCase()
  if (!normalizedQuery) return 0
  if (normalizedText.includes(normalizedQuery)) return weight
  return charOverlap(normalizedQuery, normalizedText) * weight * 0.7
}

export function searchWikiNodes(query: RetrievalQuery): RetrievalResult[] {
  const cleanQuery = query.query.trim()

  return mockWikiNodes
    .filter((node) => !query.filters.nodeType || node.nodeType === query.filters.nodeType)
    .filter((node) => !query.filters.status || node.status === query.filters.status)
    .map((node) => {
      const fieldScores = {
        title: fieldScore(cleanQuery, node.title, 0.48),
        summary: fieldScore(cleanQuery, node.summary, 0.24),
        tags: fieldScore(cleanQuery, node.tags.join(" "), 0.18),
        contentMarkdown: fieldScore(cleanQuery, node.contentMarkdown, 0.16),
      }
      const tagBoost =
        query.filters.tags?.filter((tag) => node.tags.includes(tag)).length ?? 0
      const score = Math.min(
        0.99,
        Object.values(fieldScores).reduce((sum, value) => sum + value, 0) + tagBoost * 0.08,
      )
      const matchedFields = Object.entries(fieldScores)
        .filter(([, value]) => value > 0.04)
        .map(([field]) => field)

      return {
        node,
        score,
        matchedReason: matchedFields.length
          ? `Query matched ${matchedFields.join(", ")} on WikiNode object fields.`
          : "Returned as low-confidence WikiNode candidate from mock corpus.",
        matchedFields,
        incomingLinks: getIncomingLinks(node.nodeId, mockWikiNodes),
        outgoingLinks: getOutgoingLinks(node.nodeId, mockWikiNodes),
      }
    })
    .filter((result) => result.score > 0.05 || !cleanQuery)
    .sort((left, right) => right.score - left.score)
    .slice(0, query.topK)
}

