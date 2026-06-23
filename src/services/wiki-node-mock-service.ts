import { mockSources } from "@/data/mock-sources"
import { mockWikiNodes } from "@/data/mock-wiki-nodes"
import { buildAllLinks, getBrokenLinks, getIncomingLinks, getOutgoingLinks } from "@/utils/link-parser"
import type { WikiNode, WikiNodeCreateInput } from "@/types/wiki"

const nodes: WikiNode[] = [...mockWikiNodes]
const storageKey = "wikinode-studio.mock.nodes"

function cloneNode(node: WikiNode) {
  return { ...node, tags: [...node.tags], sourceRefs: [...node.sourceRefs] }
}

function getNodes() {
  if (typeof window === "undefined") return nodes

  const rawNodes = window.localStorage.getItem(storageKey)
  if (!rawNodes) return nodes

  try {
    return JSON.parse(rawNodes) as WikiNode[]
  } catch {
    return nodes
  }
}

function saveNodes(nextNodes: WikiNode[]) {
  nodes.splice(0, nodes.length, ...nextNodes)
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(nextNodes))
  }
}

export function listWikiNodes() {
  return getNodes().map(cloneNode)
}

export function getWikiNodeById(nodeId: string) {
  const node = getNodes().find((item) => item.nodeId === nodeId || item.slug === nodeId)
  return node ? cloneNode(node) : undefined
}

export function getWikiLinks() {
  return buildAllLinks(getNodes())
}

export function getNodeLinks(nodeId: string) {
  const node = getWikiNodeById(nodeId)
  const activeNodeId = node?.nodeId ?? nodeId
  const activeNodes = getNodes()

  return {
    outgoingLinks: getOutgoingLinks(activeNodeId, activeNodes),
    incomingLinks: getIncomingLinks(activeNodeId, activeNodes),
    brokenLinks: getOutgoingLinks(activeNodeId, activeNodes).filter((link) => !link.resolved),
  }
}

export function listBrokenLinks() {
  return getBrokenLinks(getNodes())
}

export function listSources() {
  return mockSources
}

export function getNodesBySourceId(sourceId: string) {
  return getNodes().filter((node) => node.sourceRefs.some((source) => source.sourceId === sourceId)).map(cloneNode)
}

export function createWikiNode(input: WikiNodeCreateInput) {
  const activeNodes = getNodes()

  if (activeNodes.some((node) => node.slug === input.slug || node.nodeId === input.slug)) {
    throw new Error("Slug already exists")
  }

  const now = "2026-06-23"
  const node: WikiNode = {
    nodeId: input.slug,
    slug: input.slug,
    title: input.title,
    nodeType: input.nodeType ?? "term",
    summary: input.summary,
    contentMarkdown: input.contentMarkdown,
    tags: input.tags,
    status: input.status ?? "draft",
    reviewStatus: "not_required",
    publishStatus: "not_published",
    sourceRefs: input.sourceRefs ?? [],
    indexStatus: input.indexStatus ?? "not_indexed",
    owner: "Rivers",
    incomingCount: 0,
    outgoingCount: 0,
    brokenLinkCount: 0,
    securityLevel: "internal",
    version: 1,
    createdAt: now,
    updatedAt: now,
  }

  saveNodes([node, ...activeNodes])
  return cloneNode(node)
}

export function updateWikiNode(nodeId: string, nextNode: WikiNode) {
  const activeNodes = getNodes()
  const index = activeNodes.findIndex((node) => node.nodeId === nodeId || node.slug === nodeId)
  if (index === -1) {
    throw new Error("WikiNode not found")
  }

  const savedNode = {
    ...activeNodes[index],
    ...nextNode,
    updatedAt: "2026-06-23",
    version: (activeNodes[index].version ?? 1) + 1,
  }
  const nextNodes = [...activeNodes]
  nextNodes[index] = savedNode
  saveNodes(nextNodes)
  return cloneNode(savedNode)
}
