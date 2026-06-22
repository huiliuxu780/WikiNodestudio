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
  return withMockFallback(apiGet<WikiNode[]>("/wiki-nodes"), mockService.listWikiNodes)
}

export function getWikiNodeById(nodeId: string) {
  return withMockFallback(apiGet<WikiNode>(`/wiki-nodes/${nodeId}`), () => mockService.getWikiNodeById(nodeId))
}

export async function createWikiNode(node: WikiNodeCreateInput) {
  return apiPost<WikiNode>("/wiki-nodes", node)
}

export async function updateWikiNode(nodeId: string, node: WikiNode) {
  return apiPut<WikiNode>(`/wiki-nodes/${nodeId}`, node)
}

export function getWikiLinks() {
  return withMockFallback(apiGet<WikiLink[]>("/wiki-graph/overview/links"), mockService.getWikiLinks)
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
  return withMockFallback(apiGet<BrokenLink[]>("/broken-links"), () => mockService.listBrokenLinks() as BrokenLink[])
}

export function getWikiGraphOverview() {
  return apiGet<WikiGraphOverview>("/wiki-graph/overview")
}

export function getWikiGraphEgo(nodeId: string) {
  return apiGet<WikiGraphOverview>(`/wiki-graph/ego/${nodeId}`)
}

export function getIndexStatus() {
  return apiGet("/index-status")
}
