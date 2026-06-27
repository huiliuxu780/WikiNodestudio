import type { WikiLink, WikiNode } from "@/types/wiki"

const LINK_PATTERN = /\[\[([^\]]+)\]\]/g

type ParsedWikiLink = {
  targetTitle: string
  label: string
}

function parseWikiLinkTarget(rawTarget: string): ParsedWikiLink {
  const trimmedTarget = rawTarget.trim()
  const [targetTitle, label] = trimmedTarget.split("|", 2).map((part) => part.trim())

  return {
    targetTitle: targetTitle || label || trimmedTarget,
    label: label || targetTitle || trimmedTarget,
  }
}

export function parseWikiLinks(markdown: string) {
  return Array.from(markdown.matchAll(LINK_PATTERN), (match) => parseWikiLinkTarget(match[1]))
}

export function parseWikiLinkTitles(markdown: string) {
  return parseWikiLinks(markdown).map((link) => link.targetTitle)
}

function buildNodeReferenceMap(nodes: WikiNode[]) {
  const referenceMap = new Map<string, WikiNode>()
  nodes.forEach((node) => {
    referenceMap.set(node.nodeId, node)
    referenceMap.set(node.slug, node)
    referenceMap.set(node.title, node)
  })
  return referenceMap
}

export function buildOutgoingLinks(node: WikiNode, nodes: WikiNode[]) {
  const referenceMap = buildNodeReferenceMap(nodes)

  return parseWikiLinks(node.contentMarkdown).map<WikiLink>((link, index) => {
    const target = referenceMap.get(link.targetTitle)

    return {
      linkId: `${node.nodeId}-${index}-${link.targetTitle}`,
      fromNodeId: node.nodeId,
      fromTitle: node.title,
      toNodeId: target?.nodeId,
      toTitle: target?.title,
      targetTitle: link.targetTitle,
      targetSlug: target?.slug ?? link.targetTitle,
      anchorText: link.label,
      relationType: "reference",
      source: "markdown_link",
      status: target ? "active" : "broken",
      resolved: Boolean(target),
    }
  })
}

export function buildAllLinks(nodes: WikiNode[]) {
  return nodes.flatMap((node) => buildOutgoingLinks(node, nodes))
}

export function getOutgoingLinks(nodeId: string, nodes: WikiNode[]) {
  const node = nodes.find((item) => item.nodeId === nodeId)
  return node ? buildOutgoingLinks(node, nodes) : []
}

export function getIncomingLinks(nodeId: string, nodes: WikiNode[]) {
  return buildAllLinks(nodes).filter((link) => link.toNodeId === nodeId)
}

export function getBrokenLinks(nodes: WikiNode[]) {
  return buildAllLinks(nodes).filter((link) => !link.resolved)
}

export function renderMarkdownWithWikiLinks(
  markdown: string,
  renderLink: (title: string, resolved: boolean, node?: WikiNode) => string,
  nodes: WikiNode[],
) {
  const referenceMap = buildNodeReferenceMap(nodes)

  return markdown.replace(LINK_PATTERN, (_, title: string) => {
    const link = parseWikiLinkTarget(title)
    const node = referenceMap.get(link.targetTitle)
    return renderLink(link.label, Boolean(node), node)
  })
}
