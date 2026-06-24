import { mockWikiNodes } from "@/data/mock-wiki-nodes"
import type { IndexSegment } from "@/types/index-segment"
import type { WikiNode } from "@/types/wiki"

const defaultSegmentTypes: IndexSegment["segmentType"][] = ["title", "summary", "body"]

export const mockIndexSegments: IndexSegment[] = mockWikiNodes.flatMap((node, nodeIndex) =>
  getSegmentTypes(node).map((segmentType, segmentIndex) => {
    const segmentNumber = nodeIndex * defaultSegmentTypes.length + segmentIndex + 1
    const content = getSegmentContent(node, segmentType)
    const sourceRefIds = node.sourceRefs.map((sourceRef) => sourceRef.id ?? sourceRef.sourceId)
    const metadataSummary = getMetadataSummary(node)

    return {
      segmentId: `SEG-${String(segmentNumber).padStart(3, "0")}`,
      nodeId: node.nodeId,
      nodeTitle: node.title,
      objectType: node.objectType,
      subtype: node.subtype,
      segmentType,
      title: `${node.title} / ${getSegmentTitle(segmentType)}`,
      content,
      contentPreview: content.replace(/\s+/g, " ").slice(0, 96),
      tokenCount: Math.max(12, Math.round(content.length / 2)),
      enabled: node.status !== "archived",
      indexStatus: node.indexStatus,
      vectorDocId: node.indexStatus === "indexed" ? `vec-${node.nodeId}-${segmentType}` : undefined,
      lastIndexedAt: node.lastIndexedAt,
      retrievalHits: Math.max(0, 24 - segmentNumber),
      avgScore: node.indexStatus === "indexed" ? 0.82 - segmentIndex * 0.05 : undefined,
      sourceRefs: node.sourceRefs,
      sourceRefIds,
      processingProfile: node.processingProfile,
      metadataSummary,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      metadata: {
        nodeType: node.nodeType,
        status: node.status,
        tags: node.tags,
        objectType: node.objectType,
        subtype: node.subtype,
        processingProfile: node.processingProfile,
        sourceRefIds,
      },
    }
  }),
)

function getSegmentTypes(node: WikiNode): IndexSegment["segmentType"][] {
  switch (node.objectType) {
    case "Product":
      return ["metadata", "summary", "body"]
    case "DataRecord":
      return ["table", "metadata", "summary"]
    case "MediaAsset":
      return ["metadata", "section", "summary"]
    case "Procedure":
      return node.subtype === "troubleshooting_flow"
        ? ["troubleshooting_step", "summary", "body"]
        : ["procedure_step", "summary", "body"]
    case "Rule":
      return ["condition", "summary", "body"]
    case "Collection":
      return ["summary", "metadata", "body"]
    default:
      return defaultSegmentTypes
  }
}

function getSegmentContent(node: WikiNode, segmentType: IndexSegment["segmentType"]) {
  if (segmentType === "title") {
    return node.title
  }
  if (segmentType === "summary") {
    return node.summary
  }
  if (segmentType === "metadata") {
    return getMetadataSummary(node).map(({ label, value }) => `${label}: ${value}`).join("; ")
  }
  if (segmentType === "table") {
    return `${node.title} table-backed record evidence. ${node.summary}`
  }
  if (segmentType === "condition") {
    return `${node.title} condition and outcome evidence. ${node.summary}`
  }
  if (segmentType === "procedure_step" || segmentType === "troubleshooting_step") {
    return `${node.title} step evidence. ${node.contentMarkdown.replace(/\s+/g, " ")}`
  }
  if (segmentType === "section") {
    return `${node.title} extracted asset section. ${node.contentMarkdown.replace(/\s+/g, " ")}`
  }

  return node.contentMarkdown
}

function getSegmentTitle(segmentType: IndexSegment["segmentType"]) {
  const labels: Record<IndexSegment["segmentType"], string> = {
    title: "Title segment",
    summary: "Summary segment",
    body: "Body section segment",
    section: "Asset section segment",
    table: "Structured record segment",
    qa: "QA segment",
    metadata: "Metadata segment",
    condition: "Rule condition segment",
    procedure_step: "Procedure step segment",
    troubleshooting_step: "Troubleshooting step segment",
  }

  return labels[segmentType]
}

function getMetadataSummary(node: WikiNode) {
  const rawMetadata = node.metadata ?? {}
  const preferredKeys = ["brand", "productCategory", "modelCode", "businessDomain", "scenario", "sourceKind", "lifecycleStatus"]
  const entries = preferredKeys
    .filter((key) => rawMetadata[key] !== undefined)
    .map((key) => ({ label: key, value: String(rawMetadata[key]) }))

  return [
    { label: "objectType", value: node.objectType ?? "Article" },
    { label: "subtype", value: node.subtype ?? node.nodeType },
    ...entries,
  ].slice(0, 8)
}
