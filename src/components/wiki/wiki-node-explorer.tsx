import { Link } from "react-router-dom"

import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
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
    <aside className="flex min-h-0 flex-col gap-3 border-r bg-muted/20 p-3">
      <Input
        placeholder="Search WikiNode"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 pr-3">
          <section className="flex flex-col gap-2">
            <div className="text-xs font-medium uppercase text-muted-foreground">Recent Updated</div>
            {recentNodes.map((node) => (
              <Link
                key={node.nodeId}
                to={`/wiki-nodes/${node.nodeId}`}
                className="rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                data-current={node.nodeId === currentNodeId}
              >
                <span className="block truncate font-medium">{node.title}</span>
                <span className="text-xs text-muted-foreground">{node.updatedAt}</span>
              </Link>
            ))}
          </section>
          {grouped.map(([nodeType, groupNodes]) => (
            <section key={nodeType} className="flex flex-col gap-2">
              <div className="text-xs font-medium uppercase text-muted-foreground">
                {nodeTypeLabels[nodeType as keyof typeof nodeTypeLabels]}
              </div>
              {groupNodes.map((node) => (
                <Link
                  key={node.nodeId}
                  to={`/wiki-nodes/${node.nodeId}`}
                  className="rounded-md px-2 py-1.5 text-sm data-[current=true]:bg-accent data-[current=true]:font-medium hover:bg-accent"
                  data-current={node.nodeId === currentNodeId}
                >
                  <span className="block truncate">{node.title}</span>
                </Link>
              ))}
            </section>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}

