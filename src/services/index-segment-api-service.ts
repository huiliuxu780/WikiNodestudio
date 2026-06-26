import { mockIndexSegments } from "@/data/mock-index-segments"
import { apiGet, withMockFallback } from "@/services/api-client"
import type { IndexSegment } from "@/types/index-segment"

export function listIndexSegments() {
  return withMockFallback(
    apiGet<IndexSegment[]>("/index-segments"),
    () => mockIndexSegments,
  )
}

export function getIndexSegment(segmentId: string) {
  return withMockFallback(
    apiGet<IndexSegment>(`/index-segments/${segmentId}`),
    () => {
      const segment = mockIndexSegments.find((item) => item.segmentId === segmentId)
      if (!segment) {
        throw new Error("Index Segment not found")
      }
      return segment
    },
  )
}

export function listIndexSegmentsForWikiNode(nodeId: string) {
  return withMockFallback(
    apiGet<IndexSegment[]>(`/wiki-nodes/${nodeId}/index-segments`),
    () => mockIndexSegments.filter((segment) => segment.nodeId === nodeId),
  )
}
