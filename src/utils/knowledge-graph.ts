import type { Edge, Node } from "@xyflow/react"

import type { KnowledgeObjectType, KnowledgeRelationType, WikiLink, WikiNode } from "@/types/wiki"
import { buildAllLinks } from "@/utils/link-parser"
import { labelFromMap, relationTypeLabels } from "@/utils/display-labels"

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

const supportedRelationTypes = new Set([
  "references",
  "applies_to",
  "contains",
  "has_manual",
  "has_part_catalog",
  "has_policy",
  "related_to",
])

const nodeWidth = 330
const nodeHeight = 210
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
  return {
    id: edge.edgeId,
    source: edge.sourceNodeId,
    target: edge.targetNodeId ?? brokenNodeId(edge),
    type: "smoothstep",
    animated: !edge.resolved,
    label: labelFromMap(relationTypeLabels, edge.relationType),
    style: edge.resolved
      ? { strokeWidth: 1.6 }
      : { strokeWidth: 2, strokeDasharray: "6 5", stroke: "hsl(var(--destructive))" },
    markerEnd: {
      type: "arrowclosed",
      color: edge.resolved ? undefined : "hsl(var(--destructive))",
    },
    data: {
      edgeId: edge.edgeId,
      relationType: edge.relationType,
      resolved: edge.resolved,
      sourceTitle: edge.sourceTitle,
      targetTitle: edge.targetTitle,
    },
  }
}

function brokenNodeId(edge: KnowledgeGraphEdge) {
  return `broken-${edge.edgeId}`
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
