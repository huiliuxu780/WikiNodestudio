import { mockSources } from "@/data/mock-sources"
import { mockWikiNodes } from "@/data/mock-wiki-nodes"
import { buildAllLinks, getBrokenLinks, getIncomingLinks, getOutgoingLinks } from "@/utils/link-parser"

export function listWikiNodes() {
  return mockWikiNodes
}

export function getWikiNodeById(nodeId: string) {
  return mockWikiNodes.find((node) => node.nodeId === nodeId)
}

export function getWikiLinks() {
  return buildAllLinks(mockWikiNodes)
}

export function getNodeLinks(nodeId: string) {
  return {
    outgoingLinks: getOutgoingLinks(nodeId, mockWikiNodes),
    incomingLinks: getIncomingLinks(nodeId, mockWikiNodes),
    brokenLinks: getOutgoingLinks(nodeId, mockWikiNodes).filter((link) => !link.resolved),
  }
}

export function listBrokenLinks() {
  return getBrokenLinks(mockWikiNodes)
}

export function listSources() {
  return mockSources
}

export function getNodesBySourceId(sourceId: string) {
  return mockWikiNodes.filter((node) => node.sourceRefs.some((source) => source.sourceId === sourceId))
}

