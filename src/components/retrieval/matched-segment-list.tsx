import { Badge } from "@/components/ui/badge"
import type { RetrievalResult } from "@/types/retrieval"
import { toPercent } from "@/utils/formatters"

export function MatchedSegmentList({ segments }: { segments: NonNullable<RetrievalResult["matchedSegments"]> }) {
  if (!segments.length) {
    return <p className="text-sm text-muted-foreground">Debug mode 当前没有匹配的 Index Segment。</p>
  }

  return (
    <div className="flex flex-col gap-2" data-testid="matched-segments">
      <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
        Matched Index Segments are shown only in debug mode. They are controlled retrieval units generated from WikiNodes before vector-store sync.
      </div>
      {segments.map((segment) => (
        <div key={segment.segmentId} className="rounded-md border bg-background p-3 text-sm">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{segment.segmentId}</Badge>
            <Badge variant="secondary">Index Segment</Badge>
            <Badge variant="outline">{segment.segmentType}</Badge>
            <span className="text-xs text-muted-foreground">{toPercent(segment.score)}</span>
          </div>
          <p className="text-muted-foreground">{segment.contentPreview}</p>
          <div className="mt-3 grid gap-1 text-xs text-muted-foreground md:grid-cols-2">
            <span>vectorDocId: {segment.vectorDocId ?? "not synced"}</span>
            <span>nodeId: {segment.nodeId}</span>
            <span className="md:col-span-2">whyMatched: {segment.whyMatched}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
