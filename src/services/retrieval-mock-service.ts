import { mockIndexSegments } from "@/data/mock-index-segments"
import { mockWikiNodes } from "@/data/mock-wiki-nodes"
import type { MatchedSegment, RetrievalMode, RetrievalQuery, RetrievalResult, RetrievalTraceStep } from "@/types/retrieval"
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

function modeBoost(mode: RetrievalMode, field: "title" | "summary" | "tags" | "contentMarkdown" | "segment" | "link") {
  const boosts = {
    vector: { title: 1, summary: 1.2, tags: 0.9, contentMarkdown: 1, segment: 1.25, link: 0.8 },
    keyword: { title: 1.35, summary: 0.9, tags: 1.2, contentMarkdown: 1.1, segment: 0.85, link: 0.7 },
    hybrid: { title: 1.2, summary: 1.1, tags: 1.1, contentMarkdown: 1.05, segment: 1.15, link: 0.9 },
    graph: { title: 0.9, summary: 0.9, tags: 0.9, contentMarkdown: 0.8, segment: 0.85, link: 1.35 },
  } satisfies Record<RetrievalMode, Record<string, number>>

  return boosts[mode][field]
}

function bestSegmentMatches(query: string, nodeId: string, mode: RetrievalMode) {
  return mockIndexSegments
    .filter((segment) => segment.nodeId === nodeId)
    .map((segment) => {
      const baseScore = fieldScore(query, `${segment.content} ${segment.contentPreview} ${segment.metadata.tags.join(" ")}`, 0.22)
      const score = Math.min(0.98, baseScore * modeBoost(mode, "segment"))

      return {
        segment,
        score,
        whyMatched: segment.segmentType === "summary"
          ? `Index Segment summary matched "${query.slice(0, 8) || "query"}"`
          : `Index Segment ${segment.segmentType} contributed retrieval evidence`,
      }
    })
    .filter((match) => match.score > 0.025 || !query.trim())
    .sort((left, right) => right.score - left.score)
}

function matchedReasonFor(fields: string[], matchedTags: string[], hasSegmentHit: boolean, nodeTypeMatched: boolean) {
  const reasons = []

  if (fields.includes("title")) reasons.push("标题命中检索问题")
  if (matchedTags.length) reasons.push(`标签命中“${matchedTags.join("、")}”`)
  if (fields.includes("summary")) reasons.push("摘要命中关键语义")
  if (hasSegmentHit) reasons.push("Index Segment 提供召回证据")
  if (nodeTypeMatched) reasons.push("nodeType filter matched")

  return reasons.join("；") || "Returned as a related WikiNode."
}

export function buildRetrievalTrace(query: RetrievalQuery, resultCount: number): RetrievalTraceStep[] {
  const filters = [
    query.filters.nodeType ? `nodeType=${query.filters.nodeType}` : null,
    query.filters.status ? `status=${query.filters.status}` : null,
    query.filters.tags?.length ? `tags=${query.filters.tags.join(",")}` : null,
  ].filter(Boolean)

  return [
    { step: "Query received", detail: query.query.trim() || "Empty query" },
    { step: "Filters applied", detail: filters.length ? filters.join(" / ") : "No filters" },
    { step: "Retrieval mode selected", detail: query.retrievalMode },
    { step: "Index Segments searched", detail: "Mock Index Segments generated from WikiNodes before vector-store sync were searched." },
    { step: "WikiNode resolved from matched segments", detail: query.debug ? "matchedSegments are exposed for debug evidence." : "Segment evidence stays hidden in normal mode." },
    { step: "WikiNode results returned", detail: `${resultCount} WikiNode result${resultCount === 1 ? "" : "s"} returned.` },
  ]
}

export function searchWikiNodes(query: RetrievalQuery): RetrievalResult[] {
  const cleanQuery = query.query.trim()

  return mockWikiNodes
    .filter((node) => !query.filters.nodeType || node.nodeType === query.filters.nodeType)
    .filter((node) => !query.filters.status || node.status === query.filters.status)
    .map((node) => {
      const segmentMatches = bestSegmentMatches(cleanQuery, node.nodeId, query.retrievalMode)
      const matchedTags = query.filters.tags?.filter((tag) => node.tags.includes(tag)) ?? []
      const nodeTypeMatched = Boolean(query.filters.nodeType && node.nodeType === query.filters.nodeType)
      const linkBoost = query.retrievalMode === "graph" ? Math.min(0.14, (node.incomingCount + node.outgoingCount) * 0.025) : 0
      const fieldScores = {
        title: fieldScore(cleanQuery, node.title, 0.38) * modeBoost(query.retrievalMode, "title"),
        summary: fieldScore(cleanQuery, node.summary, 0.22) * modeBoost(query.retrievalMode, "summary"),
        tags: fieldScore(cleanQuery, node.tags.join(" "), 0.18) * modeBoost(query.retrievalMode, "tags"),
        contentMarkdown: fieldScore(cleanQuery, node.contentMarkdown, 0.14) * modeBoost(query.retrievalMode, "contentMarkdown"),
      }
      const tagBoost = matchedTags.length * 0.1
      const segmentBoost = Math.min(0.26, segmentMatches[0]?.score ?? 0)
      const nodeTypeBoost = nodeTypeMatched ? 0.06 : 0
      const score = Math.min(
        0.99,
        Object.values(fieldScores).reduce((sum, value) => sum + value, 0) + tagBoost + segmentBoost + nodeTypeBoost + linkBoost,
      )
      const matchedFields = Object.entries(fieldScores)
        .filter(([, value]) => value > 0.04)
        .map(([field]) => field)
      const debugSegments: MatchedSegment[] = segmentMatches.slice(0, 3).map(({ segment, score: segmentScore, whyMatched }) => ({
        segmentId: segment.segmentId,
        segmentType: segment.segmentType,
        score: Math.max(0.55, Math.min(0.98, segmentScore + score * 0.2)),
        contentPreview: segment.contentPreview,
        vectorDocId: segment.vectorDocId,
        whyMatched,
        nodeId: segment.nodeId,
      }))

      return {
        node,
        score,
        matchedReason: matchedReasonFor(matchedFields, matchedTags, Boolean(segmentMatches.length), nodeTypeMatched),
        matchedFields,
        incomingLinks: getIncomingLinks(node.nodeId, mockWikiNodes),
        outgoingLinks: getOutgoingLinks(node.nodeId, mockWikiNodes),
        matchedSegments: query.debug ? debugSegments : undefined,
      }
    })
    .filter((result) => result.score > 0.05 || !cleanQuery)
    .sort((left, right) => right.score - left.score)
    .slice(0, query.topK)
}
