import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { IndexSegment } from "@/types/index-segment"

export function SegmentDebugPanel({ segment }: { segment: IndexSegment }) {
  return (
    <Card data-testid="segment-debug-panel">
      <CardHeader>
        <CardTitle className="text-base">Segment Debug</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div className="rounded-md border bg-muted/20 p-3 text-muted-foreground">
          Knowledge Object -&gt; Processing Profile -&gt; Segment Strategy -&gt; Index Segments -&gt; Retrieval evidence
        </div>
        <div className="rounded-md border bg-background p-3 text-muted-foreground">
          Processing Profile explains how source material becomes a WikiNode / Knowledge Object. Segment Strategy explains how that object becomes Index Segments. Retrieval result remains WikiNode-centered.
        </div>
        <InfoRow label="Index Segment" value={segment.segmentId} />
        <InfoRow label="Parent WikiNode / Knowledge Object" value={segment.nodeTitle} />
        <InfoRow label="objectType" value={segment.objectType ?? "Article"} />
        <InfoRow label="subtype" value={segment.subtype ?? "-"} />
        <InfoRow label="segmentType" value={segment.segmentType} />
        <InfoRow label="processingProfile" value={segment.processingProfile ?? "-"} />
        <InfoRow label="Status" value={segment.indexStatus} />
        <InfoRow label="Vector doc" value={segment.vectorDocId ?? "Not synced"} />
        <InfoRow label="Retrieval evidence" value={segment.contentPreview} />
        <div className="rounded-md border bg-background p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">sourceRefs</div>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {segment.sourceRefs.map((sourceRef) => (
              <span key={sourceRef.id ?? sourceRef.sourceId}>
                {sourceRef.sourceType} · {sourceRef.sourceName ?? sourceRef.sourceTitle} · {sourceRef.evidenceRange ?? sourceRef.paragraphRef ?? sourceRef.sourceRecordId ?? "evidence pending"}
              </span>
            ))}
          </div>
        </div>
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
