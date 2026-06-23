import { FileTextIcon, GitBranchIcon, WrenchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NodeTypeBadge } from "@/components/wiki/node-type-badge"
import { StatusBadge } from "@/components/wiki/status-badge"
import type { WikiNode, WikiNodeType } from "@/types/wiki"

const iconByType: Record<WikiNodeType, typeof FileTextIcon> = {
  policy: FileTextIcon,
  procedure: GitBranchIcon,
  faq: FileTextIcon,
  product: FileTextIcon,
  guide: FileTextIcon,
  troubleshooting: WrenchIcon,
  term: FileTextIcon,
  fee_rule: FileTextIcon,
  regulation: FileTextIcon,
  notice: FileTextIcon,
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
  const Icon = iconByType[node.nodeType]

  return (
    <button type="button" onClick={onSelect} className="text-left">
      <Card className={selected ? "ring-2 ring-ring" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Icon />
            <span className="truncate">{node.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1">
            <NodeTypeBadge type={node.nodeType} />
            <StatusBadge status={node.status} />
            {node.brokenLinkCount > 0 ? <Badge variant="destructive">broken {node.brokenLinkCount}</Badge> : null}
          </div>
          <p className="line-clamp-2 text-xs text-muted-foreground">{node.summary}</p>
        </CardContent>
      </Card>
    </button>
  )
}
