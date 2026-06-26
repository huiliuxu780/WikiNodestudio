import { mockIndexSegments } from "@/data/mock-index-segments"
import { apiGet, apiPost, withMockFallback } from "@/services/api-client"
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

export function generateIndexSegmentsForWikiNode(nodeId: string) {
  return withMockFallback(
    apiPost<IndexSegment[]>(`/wiki-nodes/${nodeId}/index-segments/generate`, {}),
    () => mockIndexSegments.filter((segment) => segment.nodeId === nodeId),
  )
}
