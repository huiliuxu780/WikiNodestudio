import * as mockService from "@/services/wiki-node-mock-service"
import { apiGet, apiPost, apiPut, withMockFallback } from "@/services/api-client"
import type { BrokenLink, GraphEdge, GraphNode, WikiLink, WikiNode, WikiNodeCreateInput } from "@/types/wiki"

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
