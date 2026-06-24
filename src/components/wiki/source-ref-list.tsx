import { Badge } from "@/components/ui/badge"
import type { SourceRef } from "@/types/wiki"
import { commonLabels, labelFromMap, metadataLabels, sourceTypeLabels } from "@/utils/display-labels"

export function SourceRefList({ sourceRefs }: { sourceRefs: SourceRef[] }) {
  if (!sourceRefs.length) {
    return (
      <div className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
        No source evidence is linked to this WikiNode yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
        Source evidence traces WikiNode content back to original Source and Raw Material records.
      </div>
      {sourceRefs.map((source) => (
        <div key={`${source.sourceId}-${source.paragraphRef ?? source.id ?? source.sourceRecordId ?? source.sourceName}`} className="rounded-md border bg-background p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium">{source.sourceName ?? source.sourceTitle}</div>
            <Badge variant="outline">{labelFromMap(sourceTypeLabels, source.sourceType)}</Badge>
          </div>
          <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
            <span>{metadataLabels.sourceType}：{source.sourceType}</span>
            <span>{metadataLabels.paragraphRef}：{source.paragraphRef ?? commonLabels.none}</span>
            <span>{metadataLabels.version}：{source.version ?? commonLabels.none}</span>
            <span>{metadataLabels.sourceUrl}：{source.sourceUrl ?? commonLabels.none}</span>
            <span>{metadataLabels.sourceRecordId}：{source.sourceRecordId ?? commonLabels.none}</span>
            <span>{metadataLabels.snapshotId}：{source.snapshotId ?? commonLabels.none}</span>
            <span>{metadataLabels.snapshotTime}：{source.snapshotTime ?? commonLabels.none}</span>
            <span>{metadataLabels.evidenceRange}：{source.evidenceRange ?? commonLabels.none}</span>
            <span>{metadataLabels.syncJobId}：{source.syncJobId ?? commonLabels.none}</span>
            <span>{metadataLabels.confidence}：{source.confidence ?? commonLabels.none}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
