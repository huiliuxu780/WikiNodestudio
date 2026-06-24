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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndexStatusBadge } from "@/components/wiki/index-status-badge"
import { cn } from "@/lib/utils"
import type { KnowledgeObjectType, WikiNode } from "@/types/wiki"
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

export function GraphNodeCard({
  node,
  selected,
  onSelect,
}: {
  node: WikiNode
  selected: boolean
  onSelect: () => void
}) {
  const objectType = node.objectType ?? "Article"
  const Icon = iconByObjectType[objectType]

  return (
    <button
      type="button"
      data-testid="knowledge-graph-node"
      onClick={onSelect}
      className="block w-full text-left"
      aria-label={`${node.title} ${objectType} ${node.subtype ?? ""}`}
    >
      <Card className={cn("h-full transition-colors hover:bg-accent/40", selected && "ring-2 ring-ring")}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Icon data-icon="inline-start" />
            <span className="truncate">{node.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">{labelFromMap(objectTypeLabels, objectType)}</Badge>
            <Badge variant="outline">{labelFromMap(subtypeLabels, node.subtype ?? node.nodeType)}</Badge>
            <IndexStatusBadge status={node.indexStatus} />
            {node.brokenLinkCount > 0 ? <Badge variant="destructive">断链 {node.brokenLinkCount}</Badge> : null}
          </div>
          <p className="line-clamp-2 text-xs text-muted-foreground">{node.summary}</p>
        </CardContent>
      </Card>
    </button>
  )
}
