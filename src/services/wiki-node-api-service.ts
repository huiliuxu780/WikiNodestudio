import * as mockService from "@/services/wiki-node-mock-service"
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
  return Promise.resolve(mockService.listWikiNodes())
}

export function getWikiNodeById(nodeId: string) {
  return Promise.resolve(mockService.getWikiNodeById(nodeId))
}

export async function createWikiNode(node: WikiNodeCreateInput) {
  return mockService.createWikiNode(node)
}

export async function updateWikiNode(nodeId: string, node: WikiNode) {
  return mockService.updateWikiNode(nodeId, node)
}

export function getWikiLinks() {
  return Promise.resolve(mockService.getWikiLinks())
}

export async function getNodeLinks(nodeId: string): Promise<WikiNodeLinks> {
  return mockService.getNodeLinks(nodeId) as WikiNodeLinks
}

export function listBrokenLinks() {
  return Promise.resolve(mockService.listBrokenLinks() as BrokenLink[])
}

export function getWikiGraphOverview() {
  return Promise.resolve({ nodes: [], edges: [] } satisfies WikiGraphOverview)
}

export function getWikiGraphEgo(nodeId: string) {
  const node = mockService.getWikiNodeById(nodeId)

  return Promise.resolve({
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
  } satisfies WikiGraphOverview)
}

export function getIndexStatus() {
  return Promise.resolve([])
}
