import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { IndexSegment } from "@/types/index-segment"

export function SegmentDebugPanel({ segment }: { segment: IndexSegment }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Segment Debug</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <InfoRow label="Index Segment" value={segment.segmentId} />
        <InfoRow label="WikiNode" value={segment.nodeTitle} />
        <InfoRow label="Status" value={segment.indexStatus} />
        <InfoRow label="Vector doc" value={segment.vectorDocId ?? "Not synced"} />
        <div className="rounded-md border bg-muted/20 p-3 text-muted-foreground">{segment.content}</div>
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
