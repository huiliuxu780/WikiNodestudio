import { mockWikiNodes } from "@/data/mock-wiki-nodes"
import type { IndexSegment } from "@/types/index-segment"

const segmentTypes: IndexSegment["segmentType"][] = ["title", "summary", "body"]

export const mockIndexSegments: IndexSegment[] = mockWikiNodes.flatMap((node, nodeIndex) =>
  segmentTypes.map((segmentType, segmentIndex) => {
    const segmentNumber = nodeIndex * segmentTypes.length + segmentIndex + 1
    const content =
      segmentType === "title"
        ? node.title
        : segmentType === "summary"
          ? node.summary
          : node.contentMarkdown

    return {
      segmentId: `SEG-${String(segmentNumber).padStart(3, "0")}`,
      nodeId: node.nodeId,
      nodeTitle: node.title,
      segmentType,
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
      metadata: {
        nodeType: node.nodeType,
        status: node.status,
        tags: node.tags,
      },
    }
  }),
)
