import { useMemo, useState } from "react"
import { RotateCcwIcon } from "lucide-react"

import { GraphInspector } from "@/components/graph/graph-inspector"
import { GraphNodeCard } from "@/components/graph/graph-node-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { WikiNode } from "@/types/wiki"
import { commonLabels, indexStatusLabels, labelFromMap } from "@/utils/display-labels"
import {
  buildKnowledgeGraphEdges,
  getIncomingKnowledgeGraphEdges,
  getOutgoingKnowledgeGraphEdges,
  knowledgeObjectTypes,
  matchesKnowledgeGraphFilters,
  type KnowledgeGraphFilters,
} from "@/utils/knowledge-graph"
import { getIncomingLinks, getOutgoingLinks } from "@/utils/link-parser"

const defaultFilters: KnowledgeGraphFilters = {
  search: "",
  objectType: "all",
  indexStatus: "all",
  showBrokenLinks: true,
}

export function WikiGraphView({ nodes }: { nodes: WikiNode[] }) {
  const [filters, setFilters] = useState<KnowledgeGraphFilters>(defaultFilters)
  const [selectedNodeId, setSelectedNodeId] = useState("")
  const visibleNodes = useMemo(
    () => nodes.filter((node) => matchesKnowledgeGraphFilters(node, filters)),
    [filters, nodes],
  )
  const activeSelectedNodeId = visibleNodes.some((node) => node.nodeId === selectedNodeId)
    ? selectedNodeId
    : visibleNodes[0]?.nodeId ?? ""
  const selectedNode = nodes.find((node) => node.nodeId === activeSelectedNodeId)
  const graphEdges = useMemo(() => buildKnowledgeGraphEdges(nodes, filters), [filters, nodes])
  const inspectorEdges = useMemo(
    () => buildKnowledgeGraphEdges(nodes, { ...defaultFilters, showBrokenLinks: true }),
    [nodes],
  )
  const outgoingRelations = getOutgoingKnowledgeGraphEdges(activeSelectedNodeId, inspectorEdges)
  const incomingRelations = getIncomingKnowledgeGraphEdges(activeSelectedNodeId, inspectorEdges)
  const outgoingWikiLinks = selectedNode ? getOutgoingLinks(selectedNode.nodeId, nodes).filter((link) => link.resolved) : []
  const incomingWikiLinks = selectedNode ? getIncomingLinks(selectedNode.nodeId, nodes) : []
  const brokenLinks = selectedNode ? getOutgoingLinks(selectedNode.nodeId, nodes).filter((link) => !link.resolved) : []
  const groupedNodes = useMemo(() => groupNodesByObjectType(visibleNodes), [visibleNodes])

  return (
    <div data-testid="wiki-graph-page" className="grid min-h-[calc(100svh-11rem)] gap-4 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
      <Card className="min-h-0">
        <CardHeader>
          <CardTitle className="text-base">Graph Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="knowledge-graph-search">Search Knowledge Objects</Label>
            <Input
              id="knowledge-graph-search"
              aria-label="Search Knowledge Objects"
              value={filters.search}
              placeholder="title, slug, objectType, subtype, metadata"
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            />
          </div>
          <FilterSelect
            label="Object Type"
            value={filters.objectType}
            items={knowledgeObjectTypes}
            onChange={(objectType) => setFilters({ ...filters, objectType })}
          />
          <FilterSelect
            label="Index Status"
            value={filters.indexStatus}
            labels={indexStatusLabels}
            items={["not_indexed", "indexing", "indexed", "failed", "outdated", "deleted"]}
            onChange={(indexStatus) => setFilters({ ...filters, indexStatus })}
          />
          <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
            <Label htmlFor="knowledge-graph-show-broken">Show broken links</Label>
            <Switch
              id="knowledge-graph-show-broken"
              checked={filters.showBrokenLinks}
              onCheckedChange={(showBrokenLinks) => setFilters({ ...filters, showBrokenLinks })}
            />
          </div>
          <Button variant="outline" onClick={() => setFilters(defaultFilters)}>
            <RotateCcwIcon data-icon="inline-start" />
            Reset filters
          </Button>
          <GraphMetric label="Visible objects" value={visibleNodes.length} />
          <GraphMetric label="Visible relations" value={graphEdges.length} />
          <GraphMetric label="Selected" value={selectedNode?.title ?? commonLabels.none} />
        </CardContent>
      </Card>

      <Card className="min-h-[680px]">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <div className="text-base font-medium">Wiki Graph / Knowledge Object Relationships</div>
            <p className="text-sm text-muted-foreground">
              Wiki Graph visualizes WikiNode / Knowledge Object relationships from semantic relations, WikiLinks, backlinks, and broken links.
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
            Index Segment remains the controlled retrieval and indexing unit.
          </div>
          <div data-testid="knowledge-graph-workspace" className="flex flex-col gap-4">
            <div className="flex min-h-[500px] flex-col gap-4 rounded-md border bg-muted/20 p-4">
              {groupedNodes.length ? (
                groupedNodes.map(([objectType, groupNodes]) => (
                  <section key={objectType} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{objectType}</Badge>
                      <span className="text-xs text-muted-foreground">{groupNodes.length} objects</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                      {groupNodes.map((node) => (
                        <GraphNodeCard
                          key={node.nodeId}
                          node={node}
                          selected={node.nodeId === activeSelectedNodeId}
                          onSelect={() => setSelectedNodeId(node.nodeId)}
                        />
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <div className="flex min-h-[360px] items-center justify-center text-center text-sm text-muted-foreground">
                  No Knowledge Objects match the current graph filters.
                </div>
              )}
            </div>
            <RelationLane edges={graphEdges} />
          </div>
        </CardContent>
      </Card>

      <GraphInspector
        node={selectedNode}
        incomingRelations={incomingRelations}
        outgoingRelations={outgoingRelations}
        incomingWikiLinks={incomingWikiLinks}
        outgoingWikiLinks={outgoingWikiLinks}
        brokenLinks={brokenLinks}
      />
    </div>
  )
}

function RelationLane({ edges }: { edges: ReturnType<typeof buildKnowledgeGraphEdges> }) {
  return (
    <div className="flex max-h-[540px] flex-col gap-2 overflow-y-auto rounded-md border bg-background p-3">
      <div className="text-sm font-medium">Relationship lane</div>
      {edges.length ? (
        edges.slice(0, 18).map((edge) => (
          <div key={edge.edgeId} data-testid="knowledge-graph-edge" className="rounded-md border px-3 py-2 text-xs">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge variant={edge.resolved ? "outline" : "destructive"}>{edge.relationType}</Badge>
              <Badge variant="secondary">{edge.source}</Badge>
            </div>
            <div className="truncate text-muted-foreground">
              {edge.sourceTitle} {"->"} {edge.targetTitle}
            </div>
          </div>
        ))
      ) : (
        <p data-testid="knowledge-graph-edge" className="text-xs text-muted-foreground">No visible relationships.</p>
      )}
    </div>
  )
}

function FilterSelect({
  label,
  value,
  labels = {},
  items,
  onChange,
}: {
  label: string
  value: string
  labels?: Record<string, string>
  items: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">{commonLabels.all}</SelectItem>
            {items.map((item) => (
              <SelectItem key={item} value={item}>{labelFromMap(labels, item)}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

function GraphMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="truncate font-medium">{value}</div>
    </div>
  )
}

function groupNodesByObjectType(nodes: WikiNode[]) {
  const groups = new Map<string, WikiNode[]>()
  nodes.forEach((node) => {
    const key = node.objectType ?? "Article"
    groups.set(key, [...(groups.get(key) ?? []), node])
  })

  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))
}
