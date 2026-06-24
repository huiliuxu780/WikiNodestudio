import { Handle, Position, type NodeProps } from "@xyflow/react"
import {
  BoxesIcon,
  DatabaseIcon,
  FileTextIcon,
  FolderKanbanIcon,
  GitBranchIcon,
  ImageIcon,
  PackageIcon,
  ScaleIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { IndexStatusBadge } from "@/components/wiki/index-status-badge"
import { cn } from "@/lib/utils"
import type { KnowledgeObjectType } from "@/types/wiki"
import type { KnowledgeGraphFlowNode } from "@/utils/knowledge-graph"
import { labelFromMap, objectTypeLabels, subtypeLabels } from "@/utils/display-labels"

const iconByObjectType: Record<KnowledgeObjectType, typeof FileTextIcon> = {
  Article: FileTextIcon,
  Product: PackageIcon,
  Procedure: GitBranchIcon,
  DataRecord: DatabaseIcon,
  MediaAsset: ImageIcon,
  Collection: FolderKanbanIcon,
  ExternalSource: BoxesIcon,
  Rule: ScaleIcon,
}

export function WikiGraphNode({ data, selected }: NodeProps<KnowledgeGraphFlowNode>) {
  const objectType = data.objectType ?? "Article"
  const Icon = iconByObjectType[objectType]

  return (
    <button
      type="button"
      data-testid="wiki-graph-node"
      onClick={() => data.onSelect?.(data.nodeId)}
      className={cn(
        "w-[270px] rounded-md border bg-background p-3 text-left text-sm shadow-sm transition-colors hover:bg-accent",
        selected && "ring-2 ring-ring",
      )}
      aria-label={`${data.title} ${labelFromMap(objectTypeLabels, objectType)} ${data.subtype ?? ""}`}
    >
      <Handle type="target" position={Position.Left} className="!bg-muted-foreground" />
      <span data-testid="knowledge-graph-node" className="flex flex-col gap-2">
        <span className="flex min-w-0 items-center gap-2 font-medium">
          <Icon data-icon="inline-start" className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{data.title}</span>
        </span>
        <span className="flex flex-wrap gap-1">
          <Badge variant="secondary">{labelFromMap(objectTypeLabels, objectType)}</Badge>
          <Badge variant="outline">{labelFromMap(subtypeLabels, data.subtype ?? data.nodeType)}</Badge>
          <IndexStatusBadge status={data.indexStatus} />
          {data.brokenLinkCount > 0 ? <Badge variant="destructive">断链 {data.brokenLinkCount}</Badge> : null}
        </span>
        <span className="line-clamp-2 text-xs text-muted-foreground">{data.summary}</span>
      </span>
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground" />
    </button>
  )
}
