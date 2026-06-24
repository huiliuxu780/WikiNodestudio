import { Handle, Position, type NodeProps } from "@xyflow/react"
import { AlertTriangleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { KnowledgeGraphFlowNode } from "@/utils/knowledge-graph"
import { labelFromMap, relationTypeLabels } from "@/utils/display-labels"

export function BrokenLinkNode({ data, selected }: NodeProps<KnowledgeGraphFlowNode>) {
  return (
    <button
      type="button"
      data-testid="wiki-graph-broken-node"
      onClick={() => data.onSelect?.(data.nodeId)}
      className={[
        "w-[250px] rounded-md border border-destructive/50 bg-destructive/10 p-3 text-left text-sm shadow-sm",
        selected ? "ring-2 ring-destructive" : "",
      ].join(" ")}
      aria-label={`异常 WikiLink ${data.targetTitle}`}
    >
      <Handle type="target" position={Position.Left} className="!bg-destructive" />
      <span className="flex flex-col gap-2">
        <span className="flex min-w-0 items-center gap-2 font-medium text-destructive">
          <AlertTriangleIcon data-icon="inline-start" className="size-4 shrink-0" />
          <span className="truncate">异常 WikiLink</span>
        </span>
        <span className="truncate text-xs text-muted-foreground">{data.sourceTitle} -&gt; {data.targetTitle}</span>
        <span className="flex flex-wrap gap-1">
          <Badge variant="destructive">{labelFromMap(relationTypeLabels, data.relationType ?? "broken_wikilink")}</Badge>
          <Badge variant="outline">未解析</Badge>
        </span>
      </span>
    </button>
  )
}
