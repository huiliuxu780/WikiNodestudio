import { Badge } from "@/components/ui/badge"
import type { RetrievalResult } from "@/types/retrieval"
import { toPercent } from "@/utils/formatters"

export function MatchedSegmentList({ segments }: { segments: NonNullable<RetrievalResult["matchedSegments"]> }) {
  if (!segments.length) {
    return <p className="text-sm text-muted-foreground">Debug mode 当前没有匹配的 Index Segment。</p>
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-medium text-muted-foreground">Matched Index Segments</div>
      {segments.map((segment) => (
        <div key={segment.segmentId} className="rounded-md border bg-background p-3 text-sm">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{segment.segmentId}</Badge>
            <Badge variant="secondary">Index Segment</Badge>
            <Badge variant="outline">{segment.segmentType}</Badge>
            <span className="text-xs text-muted-foreground">{toPercent(segment.score)}</span>
          </div>
          <p className="text-muted-foreground">{segment.contentPreview}</p>
        </div>
      ))}
    </div>
  )
}
