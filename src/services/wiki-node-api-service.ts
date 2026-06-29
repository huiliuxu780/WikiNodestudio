import * as mockService from "@/services/wiki-node-mock-service"
import { apiDelete, apiGet, apiPatch, apiPost, apiPut, withMockFallback } from "@/services/api-client"
import type { BrokenLink, GraphEdge, GraphNode, KnowledgeRelation, KnowledgeRelationInput, WikiLink, WikiNode, WikiNodeCreateInput, WikiNodeLifecycleResult } from "@/types/wiki"

export type WikiNodeLinks = {
  outgoingLinks: WikiLink[]
  incomingLinks: WikiLink[]
  brokenLinks: BrokenLink[]
}

export type WikiGraphOverview = {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export function listWikiNodes() {
  return withMockFallback(
    apiGet<WikiNode[]>("/wiki-nodes"),
    () => mockService.listWikiNodes(),
  )
}

export function getWikiNodeById(nodeId: string) {
  return withMockFallback(
    apiGet<WikiNode>(`/wiki-nodes/${nodeId}`),
    () => mockService.getWikiNodeById(nodeId),
  )
}

export async function createWikiNode(node: WikiNodeCreateInput) {
  return withMockFallback(
    apiPost<WikiNode>("/wiki-nodes", node),
    () => mockService.createWikiNode(node),
  )
}

export async function updateWikiNode(nodeId: string, node: WikiNode) {
  return withMockFallback(
    apiPut<WikiNode>(`/wiki-nodes/${nodeId}`, node),
    () => mockService.updateWikiNode(nodeId, node),
  )
}

export function publishWikiNode(nodeId: string) {
  return withMockFallback(
    apiPost<WikiNodeLifecycleResult>(`/wiki-nodes/${nodeId}/publish`, {}),
    () => ({
      nodeId,
      knowledgeBaseId: null,
      status: "published",
      indexStatus: "outdated",
      summary: "已发布 WikiNode，并准备本地 Index Segment；外部向量库同步待后续执行。",
      indexSegmentCount: null,
      lastPublishedAt: new Date().toISOString().slice(0, 10),
      lastIndexedAt: null,
    }) satisfies WikiNodeLifecycleResult,
  )
}

export function reindexWikiNode(nodeId: string) {
  return withMockFallback(
    apiPost<WikiNodeLifecycleResult>(`/wiki-nodes/${nodeId}/reindex`, {}),
    () => ({
      nodeId,
      knowledgeBaseId: null,
      status: "published",
      indexStatus: "outdated",
      summary: "已重新准备本地 Index Segment；外部向量库同步待后续执行。",
      indexSegmentCount: null,
      lastPublishedAt: null,
      lastIndexedAt: null,
    }) satisfies WikiNodeLifecycleResult,
  )
}

export function listKnowledgeRelations(nodeId: string) {
  return withMockFallback(
    apiGet<KnowledgeRelation[]>(`/wiki-nodes/${nodeId}/relations`),
    () => mockService.getWikiNodeById(nodeId)?.relations ?? [],
  )
}

export function createKnowledgeRelation(nodeId: string, input: KnowledgeRelationInput) {
  return withMockFallback(
    apiPost<KnowledgeRelation>(`/wiki-nodes/${nodeId}/relations`, input),
    () => {
      const relation: KnowledgeRelation = {
        id: `rel-${nodeId}-${Date.now()}`,
        sourceNodeId: nodeId,
        targetNodeId: input.targetNodeId,
        relationType: input.relationType,
        status: input.status ?? "active",
        source: input.source ?? "manual",
        direction: "outgoing",
        confidence: input.confidence,
        createdBy: "user",
        anchorText: input.anchorText,
        note: input.note,
        evidence: input.evidenceSourceRefId ? { sourceRefId: input.evidenceSourceRefId } : undefined,
      }
      return relation
    },
  )
}

export function updateKnowledgeRelation(nodeId: string, relationId: string, input: KnowledgeRelationInput) {
  return withMockFallback(
    apiPatch<KnowledgeRelation>(`/wiki-nodes/${nodeId}/relations/${relationId}`, input),
    () => {
      const relation: KnowledgeRelation = {
        id: relationId,
        sourceNodeId: nodeId,
        targetNodeId: input.targetNodeId,
        relationType: input.relationType,
        status: input.status ?? "active",
        source: input.source ?? "manual",
        direction: "outgoing",
        confidence: input.confidence,
        createdBy: "user",
        anchorText: input.anchorText,
        note: input.note,
        evidence: input.evidenceSourceRefId ? { sourceRefId: input.evidenceSourceRefId } : undefined,
      }
      return relation
    },
  )
}

export function deleteKnowledgeRelation(nodeId: string, relationId: string) {
  return withMockFallback(
    apiDelete<void>(`/wiki-nodes/${nodeId}/relations/${relationId}`),
    () => undefined,
  )
}

export function getWikiLinks() {
  return Promise.resolve(mockService.getWikiLinks())
}

export async function getNodeLinks(nodeId: string): Promise<WikiNodeLinks> {
  return withMockFallback(
    Promise.all([
      apiGet<WikiLink[]>(`/wiki-nodes/${nodeId}/links`),
      apiGet<WikiLink[]>(`/wiki-nodes/${nodeId}/backlinks`),
    ]).then(([outgoingLinks, incomingLinks]) => ({
      outgoingLinks,
      incomingLinks,
      brokenLinks: outgoingLinks.filter((link): link is BrokenLink => !link.resolved),
    })),
    () => mockService.getNodeLinks(nodeId) as WikiNodeLinks,
  )
}

export function listBrokenLinks() {
  return withMockFallback(
    apiGet<BrokenLink[]>("/broken-links"),
    () => mockService.listBrokenLinks() as BrokenLink[],
  )
}

export function getWikiGraphOverview() {
  return withMockFallback(
    apiGet<WikiGraphOverview>("/wiki-graph/overview"),
    () => ({ nodes: [], edges: [] }) satisfies WikiGraphOverview,
  )
}

export function getWikiGraphEgo(nodeId: string) {
  return withMockFallback(
    apiGet<WikiGraphOverview>(`/wiki-graph/ego/${nodeId}`),
    () => {
      const node = mockService.getWikiNodeById(nodeId)

      return {
        nodes: node
          ? [{
              nodeId: node.nodeId,
              title: node.title,
              nodeType: node.nodeType,
              status: node.status,
              indexStatus: node.indexStatus,
              incomingCount: node.incomingCount,
              outgoingCount: node.outgoingCount,
              brokenLinkCount: node.brokenLinkCount,
            }]
          : [],
        edges: [],
      } satisfies WikiGraphOverview
    },
  )
}

export function getIndexStatus() {
  return withMockFallback(
    apiGet<unknown[]>("/index-status"),
    () => [],
  )
}
