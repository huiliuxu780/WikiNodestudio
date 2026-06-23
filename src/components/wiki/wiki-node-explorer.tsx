import { Link } from "react-router-dom"
import { AlertTriangleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { IndexStatusBadge } from "@/components/wiki/index-status-badge"
import { StatusBadge } from "@/components/wiki/status-badge"
import type { WikiNode } from "@/types/wiki"
import { nodeTypeLabels } from "@/utils/formatters"

export function WikiNodeExplorer({
  nodes,
  currentNodeId,
  query,
  onQueryChange,
}: {
  nodes: WikiNode[]
  currentNodeId: string
  query: string
  onQueryChange: (query: string) => void
}) {
  const filteredNodes = nodes.filter((node) =>
    `${node.title} ${node.summary} ${node.tags.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )
  const grouped = Object.entries(
    filteredNodes.reduce<Record<string, WikiNode[]>>((groups, node) => {
      groups[node.nodeType] = groups[node.nodeType] ?? []
      groups[node.nodeType].push(node)
      return groups
    }, {}),
  )
  const recentNodes = [...nodes]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 3)

  return (
    <aside className="flex min-h-0 flex-col gap-3 border-r bg-muted/20 p-3" data-testid="wikinode-explorer">
      <Input
        placeholder="搜索知识节点"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 pr-3">
          <section className="flex flex-col gap-2">
            <div className="text-xs font-medium text-muted-foreground">最近更新</div>
            {recentNodes.map((node) => (
              <ExplorerNodeLink key={node.nodeId} node={node} currentNodeId={currentNodeId} meta={node.updatedAt} />
            ))}
          </section>
          {grouped.map(([nodeType, groupNodes]) => (
            <section key={nodeType} className="flex flex-col gap-2">
              <div className="text-xs font-medium uppercase text-muted-foreground">
                {nodeTypeLabels[nodeType as keyof typeof nodeTypeLabels]}
              </div>
              {groupNodes.map((node) => (
                <ExplorerNodeLink key={node.nodeId} node={node} currentNodeId={currentNodeId} />
              ))}
            </section>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}

function ExplorerNodeLink({
  node,
  currentNodeId,
  meta,
}: {
  node: WikiNode
  currentNodeId: string
  meta?: string
}) {
  const isCurrent = node.nodeId === currentNodeId

  return (
    <Link
      to={`/wiki-nodes/${node.nodeId}`}
      className="rounded-md border border-transparent px-2 py-2 text-sm data-[current=true]:border-border data-[current=true]:bg-accent data-[current=true]:font-medium hover:bg-accent"
      data-current={isCurrent}
    >
      <span className="flex min-w-0 items-center justify-between gap-2">
        <span className="truncate">{node.title}</span>
        {node.brokenLinkCount > 0 ? (
          <Badge variant="destructive" aria-label={`${node.brokenLinkCount} broken links`}>
            <AlertTriangleIcon data-icon="inline-start" />
            {node.brokenLinkCount}
          </Badge>
        ) : null}
      </span>
      <span className="mt-1 flex flex-wrap items-center gap-1">
        <StatusBadge status={node.status} />
        <IndexStatusBadge status={node.indexStatus} />
        {meta ? <span className="text-xs text-muted-foreground">{meta}</span> : null}
      </span>
    </Link>
  )
}
