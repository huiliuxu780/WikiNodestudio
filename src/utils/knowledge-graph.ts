import type { Edge, Node } from "@xyflow/react"

import type { KnowledgeObjectType, KnowledgeRelationType, WikiLink, WikiNode } from "@/types/wiki"
import { buildAllLinks } from "@/utils/link-parser"
import { labelFromMap, relationTypeLabels } from "@/utils/display-labels"

export type KnowledgeGraphRelationTypeFilter =
  | "all"
  | "references"
  | "related"
  | "applies"
  | "replaces"
  | "conflicts"
  | "derived_source"
  | "broken"

export type KnowledgeGraphRelationStatusFilter = "all" | "active" | "broken" | "pending_review" | "rejected"

export type KnowledgeGraphEdge = {
  edgeId: string
  sourceNodeId: string
  sourceTitle: string
  targetNodeId?: string
  targetTitle: string
  relationType: KnowledgeRelationType | "broken_wikilink"
  source: "relation" | "wikilink"
  status: Exclude<KnowledgeGraphRelationStatusFilter, "all">
  resolved: boolean
}

export type KnowledgeGraphFilters = {
  search: string
  objectType: string
  indexStatus: string
  relationType: KnowledgeGraphRelationTypeFilter
  relationStatus: KnowledgeGraphRelationStatusFilter
  showBrokenLinks: boolean
}

export type KnowledgeGraphNodeData = Record<string, unknown> & {
  nodeId: string
  title: string
  slug?: string
  nodeType: string
  objectType: KnowledgeObjectType
  subtype?: string
  status: WikiNode["status"] | "unresolved"
  indexStatus: WikiNode["indexStatus"]
  summary: string
  tags: string[]
  brokenLinkCount: number
  targetTitle?: string
  sourceNodeId?: string
  sourceTitle?: string
  relationType?: KnowledgeGraphEdge["relationType"]
  isBrokenVirtual?: boolean
  onSelect?: (nodeId: string) => void
}

export type KnowledgeGraphEdgeData = Record<string, unknown> & {
  edgeId: string
  relationType: KnowledgeGraphEdge["relationType"]
  status: KnowledgeGraphEdge["status"]
  source: KnowledgeGraphEdge["source"]
  resolved: boolean
  sourceTitle: string
  targetTitle: string
}

export type KnowledgeGraphFlowNode = Node<KnowledgeGraphNodeData, "wikiNode" | "brokenLink">
export type KnowledgeGraphFlowEdge = Edge<KnowledgeGraphEdgeData>

export type BuildKnowledgeGraphFlowOptions = {
  nodes: WikiNode[]
  filters: KnowledgeGraphFilters
  selectedNodeId?: string
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

const supportedRelationTypes = new Set<KnowledgeRelationType>([
  "references",
  "derived_from",
  "applies_to",
  "contains",
  "part_of",
  "replaces",
  "conflicts_with",
  "explains",
  "has_manual",
  "has_part_catalog",
  "has_policy",
  "has_asset",
  "related_to",
])

const nodeWidth = 330
const nodeHeight = 210
const wikiNodeCardWidth = 270
const wikiNodeCardHeight = 132
const brokenLinkNodeWidth = 250
const brokenLinkNodeHeight = 118
const columns = 3

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
      .filter((relation) => matchesRelationFilters(relation.relationType, relation.status ?? "active", filters))
      .map<KnowledgeGraphEdge>((relation) => ({
        edgeId: relation.id ?? `${node.nodeId}-${relation.relationType}-${relation.targetNodeId}`,
        sourceNodeId: node.nodeId,
        sourceTitle: node.title,
        targetNodeId: relation.targetNodeId,
        targetTitle: nodeById.get(relation.targetNodeId)?.title ?? relation.targetNodeId,
        relationType: relation.relationType,
        source: "relation",
        status: relation.status ?? "active",
        resolved: relation.status !== "broken",
      })),
  )

  const wikiLinkEdges = buildAllLinks(nodes)
    .filter((link) => visibleNodeIds.has(link.fromNodeId))
    .filter((link) => (link.resolved && link.toNodeId ? visibleNodeIds.has(link.toNodeId) : filters.showBrokenLinks))
    .map((link) => wikiLinkToGraphEdge(link))
    .filter((edge) => matchesRelationFilters(edge.relationType, edge.status, filters))

  return dedupeEdges([...relationEdges, ...wikiLinkEdges])
}

export function getIncomingKnowledgeGraphEdges(nodeId: string, edges: KnowledgeGraphEdge[]) {
  return edges.filter((edge) => edge.targetNodeId === nodeId)
}

export function getOutgoingKnowledgeGraphEdges(nodeId: string, edges: KnowledgeGraphEdge[]) {
  return edges.filter((edge) => edge.sourceNodeId === nodeId)
}

export function buildKnowledgeGraphFlow({
  nodes,
  filters,
  selectedNodeId,
}: BuildKnowledgeGraphFlowOptions) {
  const visibleNodes = nodes.filter((node) => matchesKnowledgeGraphFilters(node, filters))
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.nodeId))
  const graphEdges = buildKnowledgeGraphEdges(nodes, filters)
  const flowNodes = visibleNodes.map((node, index) => nodeToFlowNode(node, index, selectedNodeId))
  const brokenEdges = graphEdges.filter((edge) => !edge.resolved)
  const brokenNodes = filters.showBrokenLinks
    ? brokenEdges.map((edge, index) => brokenNodeFromEdge(edge, visibleNodes.length + index, selectedNodeId))
    : []
  const flowEdges = graphEdges
    .filter((edge) => visibleNodeIds.has(edge.sourceNodeId))
    .map((edge) => graphEdgeToFlowEdge(edge))

  return {
    nodes: [...flowNodes, ...brokenNodes],
    edges: flowEdges,
    visibleWikiNodes: visibleNodes,
    visibleEdges: graphEdges,
    brokenEdges,
  }
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
    status: link.resolved ? "active" : "broken",
    resolved: link.resolved,
  }
}

function nodeToFlowNode(node: WikiNode, index: number, selectedNodeId?: string): KnowledgeGraphFlowNode {
  return {
    id: node.nodeId,
    type: "wikiNode",
    position: {
      x: (index % columns) * nodeWidth,
      y: Math.floor(index / columns) * nodeHeight,
    },
    width: wikiNodeCardWidth,
    height: wikiNodeCardHeight,
    selected: selectedNodeId === node.nodeId,
    data: {
      nodeId: node.nodeId,
      slug: node.slug,
      title: node.title,
      nodeType: node.nodeType,
      objectType: node.objectType ?? "Article",
      subtype: node.subtype,
      status: node.status,
      indexStatus: node.indexStatus,
      summary: node.summary,
      tags: node.tags,
      brokenLinkCount: node.brokenLinkCount,
    },
  }
}

function brokenNodeFromEdge(edge: KnowledgeGraphEdge, index: number, selectedNodeId?: string): KnowledgeGraphFlowNode {
  const id = brokenNodeId(edge)

  return {
    id,
    type: "brokenLink",
    position: {
      x: (index % columns) * nodeWidth + 24,
      y: Math.floor(index / columns) * nodeHeight + 64,
    },
    width: brokenLinkNodeWidth,
    height: brokenLinkNodeHeight,
    selected: selectedNodeId === id,
    data: {
      nodeId: id,
      title: `异常 WikiLink：${edge.targetTitle}`,
      nodeType: "broken_link",
      objectType: "Article",
      status: "unresolved",
      indexStatus: "failed",
      summary: "当前 WikiLink 目标还没有匹配的 WikiNode。",
      tags: ["broken-link"],
      brokenLinkCount: 0,
      targetTitle: edge.targetTitle,
      sourceNodeId: edge.sourceNodeId,
      sourceTitle: edge.sourceTitle,
      relationType: edge.relationType,
      isBrokenVirtual: true,
    },
  }
}

function graphEdgeToFlowEdge(edge: KnowledgeGraphEdge): KnowledgeGraphFlowEdge {
  const style = edgeStyle(edge)

  return {
    id: edge.edgeId,
    source: edge.sourceNodeId,
    target: edge.targetNodeId ?? brokenNodeId(edge),
    type: "smoothstep",
    animated: !edge.resolved || edge.status === "pending_review",
    label: labelFromMap(relationTypeLabels, edge.relationType),
    style,
    markerEnd: {
      type: "arrowclosed",
      color: style.stroke,
    },
    data: {
      edgeId: edge.edgeId,
      relationType: edge.relationType,
      status: edge.status,
      source: edge.source,
      resolved: edge.resolved,
      sourceTitle: edge.sourceTitle,
      targetTitle: edge.targetTitle,
    },
  }
}

function brokenNodeId(edge: KnowledgeGraphEdge) {
  return `broken-${edge.edgeId}`
}

function relationFilterGroup(relationType: KnowledgeGraphEdge["relationType"]): KnowledgeGraphRelationTypeFilter {
  if (relationType === "broken_wikilink") return "broken"
  if (relationType === "references" || relationType === "has_policy") return "references"
  if (relationType === "related_to" || relationType === "explains" || relationType === "contains" || relationType === "part_of") return "related"
  if (relationType === "applies_to") return "applies"
  if (relationType === "replaces") return "replaces"
  if (relationType === "conflicts_with") return "conflicts"
  if (relationType === "derived_from" || relationType === "has_manual" || relationType === "has_part_catalog" || relationType === "has_asset") return "derived_source"
  return "related"
}

function matchesRelationFilters(
  relationType: KnowledgeGraphEdge["relationType"],
  status: KnowledgeGraphEdge["status"],
  filters: KnowledgeGraphFilters,
) {
  return (
    (filters.relationType === "all" || relationFilterGroup(relationType) === filters.relationType) &&
    (filters.relationStatus === "all" || status === filters.relationStatus)
  )
}

function edgeStyle(edge: KnowledgeGraphEdge) {
  if (!edge.resolved || edge.status === "broken") {
    return { strokeWidth: 2, strokeDasharray: "6 5", stroke: "hsl(var(--destructive))" }
  }
  if (edge.relationType === "conflicts_with" || edge.status === "pending_review") {
    return { strokeWidth: 2, strokeDasharray: edge.status === "pending_review" ? "5 4" : undefined, stroke: "hsl(24 95% 45%)" }
  }
  if (edge.status === "rejected") {
    return { strokeWidth: 1.4, strokeDasharray: "3 4", stroke: "hsl(var(--muted-foreground))" }
  }
  return { strokeWidth: 1.6, stroke: "hsl(var(--foreground))" }
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
