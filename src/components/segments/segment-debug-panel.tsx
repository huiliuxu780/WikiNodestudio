import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { IndexSegment } from "@/types/index-segment"
import { commonLabels, indexStatusLabels, labelFromMap, metadataLabels, objectTypeLabels, sourceTypeLabels, subtypeLabels } from "@/utils/display-labels"

export function SegmentDebugPanel({ segment }: { segment: IndexSegment }) {
  return (
    <Card data-testid="segment-debug-panel">
      <CardHeader>
        <CardTitle className="text-base">片段调试</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div className="rounded-md border bg-muted/20 p-3 text-muted-foreground">
          Knowledge Object -&gt; 处理策略 -&gt; 片段策略 -&gt; Index Segment -&gt; 召回证据
        </div>
        <div className="rounded-md border bg-background p-3 text-muted-foreground">
          处理策略说明来源材料如何变成 WikiNode / Knowledge Object；片段策略说明该对象如何生成 Index Segment。召回结果仍以 WikiNode 为中心。
        </div>
        <InfoRow label="Index Segment" value={segment.segmentId} />
        <InfoRow label="父级 WikiNode / Knowledge Object" value={segment.nodeTitle} />
        <InfoRow label={metadataLabels.objectType} value={labelFromMap(objectTypeLabels, segment.objectType ?? "Article")} />
        <InfoRow label={metadataLabels.subtype} value={labelFromMap(subtypeLabels, segment.subtype ?? commonLabels.none)} />
        <InfoRow label="片段类型" value={segment.segmentType} />
        <InfoRow label={metadataLabels.processingProfile} value={segment.processingProfile ?? commonLabels.none} />
        <InfoRow label={metadataLabels.indexStatus} value={indexStatusLabels[segment.indexStatus]} />
        <InfoRow label={metadataLabels.vectorDocId} value={segment.vectorDocId ?? "未同步"} />
        <InfoRow label="召回证据" value={segment.contentPreview} />
        <div className="rounded-md border bg-background p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">来源证据</div>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {segment.sourceRefs.map((sourceRef) => (
              <span key={sourceRef.id ?? sourceRef.sourceId}>
                {labelFromMap(sourceTypeLabels, sourceRef.sourceType)} · {sourceRef.sourceName ?? sourceRef.sourceTitle} · {sourceRef.evidenceRange ?? sourceRef.paragraphRef ?? sourceRef.sourceRecordId ?? "证据范围待补充"}
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
