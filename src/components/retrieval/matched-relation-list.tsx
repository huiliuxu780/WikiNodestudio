import { Badge } from "@/components/ui/badge"
import type { RetrievalResult } from "@/types/retrieval"
import { labelFromMap, relationSourceLabels, relationStatusLabels, relationTypeLabels } from "@/utils/display-labels"
import { toPercent } from "@/utils/formatters"

export function MatchedRelationList({ relations }: { relations: NonNullable<RetrievalResult["matchedRelations"]> }) {
  if (!relations.length) {
    return <p className="text-sm text-muted-foreground">调试模式当前没有匹配的 Knowledge Relation。</p>
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-medium text-muted-foreground">命中的 Knowledge Relation</div>
      {relations.map((relation, index) => (
        <div key={relation.relationId ?? `${relation.relationType}-${relation.targetNodeId ?? relation.targetTitle}-${index}`} className="rounded-md border bg-background p-3 text-sm">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={relation.relationType === "conflicts_with" ? "destructive" : "outline"}>
              {labelFromMap(relationTypeLabels, relation.relationType)}
            </Badge>
            <Badge variant="secondary">Knowledge Relation</Badge>
            {relation.status ? <Badge variant="outline">{labelFromMap(relationStatusLabels, relation.status)}</Badge> : null}
            {relation.source ? <span className="text-xs text-muted-foreground">{labelFromMap(relationSourceLabels, relation.source)}</span> : null}
            {typeof relation.score === "number" ? <span className="text-xs text-muted-foreground">{toPercent(relation.score)}</span> : null}
          </div>
          <div className="font-medium">{relation.targetTitle}</div>
          {relation.evidenceSummary ? <p className="mt-1 text-muted-foreground">{relation.evidenceSummary}</p> : null}
        </div>
      ))}
    </div>
  )
}
