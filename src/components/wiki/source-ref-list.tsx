import { Badge } from "@/components/ui/badge"
import type { SourceRef } from "@/types/wiki"
import { commonLabels, labelFromMap, metadataLabels, sourceTypeLabels } from "@/utils/display-labels"

export function SourceRefList({ sourceRefs }: { sourceRefs: SourceRef[] }) {
  return (
    <div className="flex flex-col gap-2">
      {sourceRefs.map((source) => (
        <div key={`${source.sourceId}-${source.paragraphRef}`} className="rounded-md border p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium">{source.sourceTitle}</div>
            <Badge variant="outline">{labelFromMap(sourceTypeLabels, source.sourceType)}</Badge>
          </div>
          <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
            <span>{metadataLabels.paragraphRef}：{source.paragraphRef ?? commonLabels.none}</span>
            <span>{metadataLabels.version}：{source.version ?? commonLabels.none}</span>
            <span>{metadataLabels.sourceUrl}：{source.sourceUrl ?? commonLabels.none}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
