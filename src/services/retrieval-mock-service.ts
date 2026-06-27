import { mockIndexSegments } from "@/data/mock-index-segments"
import { mockWikiNodes } from "@/data/mock-wiki-nodes"
import type { RetrievalQuery, RetrievalResult } from "@/types/retrieval"
import type { KnowledgeRelation, KnowledgeRelationType, WikiNode } from "@/types/wiki"
import { getIncomingLinks, getOutgoingLinks } from "@/utils/link-parser"

const retrievalRelationTypes = new Set<KnowledgeRelationType>([
  "applies_to",
  "replaces",
  "conflicts_with",
  "derived_from",
])

const sourceBackedRelationTypes = new Set<KnowledgeRelationType>([
  "has_manual",
  "has_part_catalog",
  "has_asset",
])

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
          ? "Matched relevant WikiNode content."
          : "Returned as a related WikiNode.",
        matchedFields,
        incomingLinks: getIncomingLinks(node.nodeId, mockWikiNodes),
        outgoingLinks: getOutgoingLinks(node.nodeId, mockWikiNodes),
        matchedSegments: query.debug
          ? mockIndexSegments
              .filter((segment) => segment.nodeId === node.nodeId)
              .slice(0, 2)
              .map((segment) => ({
                segmentId: segment.segmentId,
                nodeId: segment.nodeId,
                segmentType: segment.segmentType,
                score: Math.max(0.55, score - 0.05),
                contentPreview: segment.contentPreview,
                sourceRefIds: segment.sourceRefIds,
                metadataSummary: segment.metadataSummary,
              }))
          : undefined,
        matchedRelations: query.debug ? matchedRelations(node, score) : undefined,
      }
    })
    .filter((result) => result.score > 0.05 || !cleanQuery)
    .sort((left, right) => right.score - left.score)
    .slice(0, query.topK)
}

function matchedRelations(node: WikiNode, score: number): NonNullable<RetrievalResult["matchedRelations"]> {
  return (node.relations ?? [])
    .filter((relation) => relation.direction !== "incoming")
    .filter((relation) => relation.status !== "rejected")
    .filter((relation) => retrievalRelationTypes.has(relation.relationType) || sourceBackedRelationTypes.has(relation.relationType))
    .slice(0, 4)
    .map((relation) => {
      const target = mockWikiNodes.find((candidate) => candidate.nodeId === relation.targetNodeId)
      const relationType = retrievalRelationType(relation)

      return {
        relationId: relation.id,
        relationType,
        sourceNodeId: node.nodeId,
        targetNodeId: relation.targetNodeId,
        targetTitle: target?.title ?? relation.targetNodeId,
        status: relation.status ?? "active",
        source: relation.source,
        score: Math.max(0.55, Math.min(0.95, relation.confidence ?? score - 0.08)),
        evidenceSummary: relationEvidenceSummary(relationType),
      }
    })
}

function retrievalRelationType(relation: KnowledgeRelation): KnowledgeRelationType {
  if (sourceBackedRelationTypes.has(relation.relationType)) return "derived_from"
  return relation.relationType
}

function relationEvidenceSummary(relationType: KnowledgeRelationType) {
  if (relationType === "applies_to") return "适用关系用于解释该 WikiNode 为什么匹配当前业务对象。"
  if (relationType === "replaces") return "替代关系用于提示检索结果可能存在新旧口径。"
  if (relationType === "conflicts_with") return "冲突关系用于提示召回结果需要人工复核。"
  return "来源关系用于解释 WikiNode 的证据出处。"
}
