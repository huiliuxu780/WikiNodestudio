import type { KnowledgeObjectType, KnowledgeRelationType, WikiLink, WikiNode } from "@/types/wiki"
import { buildAllLinks } from "@/utils/link-parser"

export type KnowledgeGraphEdge = {
  edgeId: string
  sourceNodeId: string
  sourceTitle: string
  targetNodeId?: string
  targetTitle: string
  relationType: KnowledgeRelationType | "broken_wikilink"
  source: "relation" | "wikilink"
  resolved: boolean
}

export type KnowledgeGraphFilters = {
  search: string
  objectType: string
  indexStatus: string
  showBrokenLinks: boolean
}

export const knowledgeObjectTypes: KnowledgeObjectType[] = [
  "Article",
  "Product",
  "Procedure",
  "DataRecord",
  "MediaAsset",
  "Collection",
  "ExternalSource",
  "Rule",
]

const supportedRelationTypes = new Set([
  "references",
  "applies_to",
  "contains",
  "has_manual",
  "has_part_catalog",
  "has_policy",
  "related_to",
])

export function matchesKnowledgeGraphFilters(node: WikiNode, filters: KnowledgeGraphFilters) {
  const normalizedSearch = filters.search.trim().toLowerCase()
  const searchable = [
    node.title,
    node.slug,
    node.objectType,
    node.subtype,
    node.summary,
    ...node.tags,
    ...Object.values(node.metadata ?? {}).map((value) => String(value)),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return (
    (!normalizedSearch || searchable.includes(normalizedSearch)) &&
    (filters.objectType === "all" || node.objectType === filters.objectType) &&
    (filters.indexStatus === "all" || node.indexStatus === filters.indexStatus)
  )
}

export function buildKnowledgeGraphEdges(nodes: WikiNode[], filters: KnowledgeGraphFilters): KnowledgeGraphEdge[] {
  const visibleNodes = nodes.filter((node) => matchesKnowledgeGraphFilters(node, filters))
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.nodeId))
  const nodeById = new Map(nodes.map((node) => [node.nodeId, node]))
  const relationEdges = visibleNodes.flatMap((node) =>
    (node.relations ?? [])
      .filter((relation) => supportedRelationTypes.has(relation.relationType))
      .filter((relation) => visibleNodeIds.has(relation.targetNodeId))
      .map<KnowledgeGraphEdge>((relation) => ({
        edgeId: relation.id ?? `${node.nodeId}-${relation.relationType}-${relation.targetNodeId}`,
        sourceNodeId: node.nodeId,
        sourceTitle: node.title,
        targetNodeId: relation.targetNodeId,
        targetTitle: nodeById.get(relation.targetNodeId)?.title ?? relation.targetNodeId,
        relationType: relation.relationType,
        source: "relation",
        resolved: true,
      })),
  )

  const wikiLinkEdges = buildAllLinks(nodes)
    .filter((link) => visibleNodeIds.has(link.fromNodeId))
    .filter((link) => (link.resolved && link.toNodeId ? visibleNodeIds.has(link.toNodeId) : filters.showBrokenLinks))
    .map((link) => wikiLinkToGraphEdge(link))

  return dedupeEdges([...relationEdges, ...wikiLinkEdges])
}

export function getIncomingKnowledgeGraphEdges(nodeId: string, edges: KnowledgeGraphEdge[]) {
  return edges.filter((edge) => edge.targetNodeId === nodeId)
}

export function getOutgoingKnowledgeGraphEdges(nodeId: string, edges: KnowledgeGraphEdge[]) {
  return edges.filter((edge) => edge.sourceNodeId === nodeId)
}

function wikiLinkToGraphEdge(link: WikiLink): KnowledgeGraphEdge {
  return {
    edgeId: `wikilink-${link.linkId}`,
    sourceNodeId: link.fromNodeId,
    sourceTitle: link.fromTitle,
    targetNodeId: link.toNodeId,
    targetTitle: link.targetTitle,
    relationType: link.resolved ? "references" : "broken_wikilink",
    source: "wikilink",
    resolved: link.resolved,
  }
}

function dedupeEdges(edges: KnowledgeGraphEdge[]) {
  const seen = new Set<string>()
  return edges.filter((edge) => {
    const key = `${edge.sourceNodeId}:${edge.targetNodeId ?? edge.targetTitle}:${edge.relationType}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
