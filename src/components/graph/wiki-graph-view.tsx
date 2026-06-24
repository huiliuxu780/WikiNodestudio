import { useMemo, useState } from "react"
import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  type NodeMouseHandler,
} from "@xyflow/react"
import { RotateCcwIcon } from "lucide-react"

import { BrokenLinkNode } from "@/components/graph/broken-link-node"
import { GraphInspector } from "@/components/graph/graph-inspector"
import { WikiGraphNode } from "@/components/graph/wiki-graph-node"
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
import { actionLabels, commonLabels, indexStatusLabels, labelFromMap, objectTypeLabels, relationTypeLabels } from "@/utils/display-labels"
import {
  buildKnowledgeGraphEdges,
  buildKnowledgeGraphFlow,
  getIncomingKnowledgeGraphEdges,
  getOutgoingKnowledgeGraphEdges,
  knowledgeObjectTypes,
  type KnowledgeGraphFilters,
  type KnowledgeGraphFlowNode,
} from "@/utils/knowledge-graph"
import { getIncomingLinks, getOutgoingLinks } from "@/utils/link-parser"

const defaultFilters: KnowledgeGraphFilters = {
  search: "",
  objectType: "all",
  indexStatus: "all",
  showBrokenLinks: true,
}

const nodeTypes = {
  wikiNode: WikiGraphNode,
  brokenLink: BrokenLinkNode,
}

export function WikiGraphView({ nodes }: { nodes: WikiNode[] }) {
  const [filters, setFilters] = useState<KnowledgeGraphFilters>(defaultFilters)
  const [selectedNodeId, setSelectedNodeId] = useState("")
  const graph = useMemo(() => buildKnowledgeGraphFlow({ nodes, filters, selectedNodeId }), [filters, nodes, selectedNodeId])
  const activeSelectedNodeId = graph.nodes.some((node) => node.id === selectedNodeId)
    ? selectedNodeId
    : graph.visibleWikiNodes[0]?.nodeId ?? graph.nodes[0]?.id ?? ""
  const flowNodes = useMemo(
    () =>
      graph.nodes.map((node) => ({
        ...node,
        selected: node.id === activeSelectedNodeId,
        data: {
          ...node.data,
          onSelect: setSelectedNodeId,
        },
      })),
    [activeSelectedNodeId, graph.nodes],
  )
  const selectedNode = nodes.find((node) => node.nodeId === activeSelectedNodeId)
  const inspectorEdges = useMemo(
    () => buildKnowledgeGraphEdges(nodes, { ...defaultFilters, showBrokenLinks: true }),
    [nodes],
  )
  const outgoingRelations = getOutgoingKnowledgeGraphEdges(activeSelectedNodeId, inspectorEdges)
  const incomingRelations = getIncomingKnowledgeGraphEdges(activeSelectedNodeId, inspectorEdges)
  const outgoingWikiLinks = selectedNode ? getOutgoingLinks(selectedNode.nodeId, nodes).filter((link) => link.resolved) : []
  const incomingWikiLinks = selectedNode ? getIncomingLinks(selectedNode.nodeId, nodes) : []
  const brokenLinks = selectedNode ? getOutgoingLinks(selectedNode.nodeId, nodes).filter((link) => !link.resolved) : []

  const handleNodeClick: NodeMouseHandler<KnowledgeGraphFlowNode> = (_, node) => {
    setSelectedNodeId(node.id)
  }

  return (
    <div data-testid="wiki-graph-page" className="grid min-h-[calc(100svh-11rem)] gap-4 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
      <Card className="min-h-0">
        <CardHeader>
          <CardTitle className="text-base">图谱筛选</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="knowledge-graph-search">搜索知识对象</Label>
            <Input
              id="knowledge-graph-search"
              data-testid="wiki-graph-filter-search"
              aria-label="搜索知识对象"
              value={filters.search}
              placeholder="标题、Slug、objectType、subtype、元数据"
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            />
          </div>
          <FilterSelect
            label="Knowledge Object 类型"
            testId="wiki-graph-filter-object-type"
            value={filters.objectType}
            labels={objectTypeLabels}
            items={knowledgeObjectTypes}
            onChange={(objectType) => setFilters({ ...filters, objectType })}
          />
          <FilterSelect
            label="索引状态"
            value={filters.indexStatus}
            labels={indexStatusLabels}
            items={["not_indexed", "indexing", "indexed", "failed", "outdated", "deleted"]}
            onChange={(indexStatus) => setFilters({ ...filters, indexStatus })}
          />
          <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
            <Label htmlFor="knowledge-graph-show-broken">显示断链</Label>
            <Switch
              id="knowledge-graph-show-broken"
              data-testid="wiki-graph-toggle-broken-links"
              checked={filters.showBrokenLinks}
              onCheckedChange={(showBrokenLinks) => setFilters({ ...filters, showBrokenLinks })}
            />
          </div>
          <Button data-testid="wiki-graph-reset-filters" variant="outline" onClick={() => setFilters(defaultFilters)}>
            <RotateCcwIcon data-icon="inline-start" />
            {actionLabels.reset}筛选
          </Button>
          <GraphMetric label="可见知识对象" value={graph.visibleWikiNodes.length} />
          <GraphMetric label="可见关系" value={graph.visibleEdges.length} />
          <GraphMetric label="当前选择" value={selectedNode?.title ?? commonLabels.none} />
        </CardContent>
      </Card>

      <Card className="min-h-[680px] p-0">
        <div data-testid="knowledge-graph-workspace" className="h-full">
          <div data-testid="wiki-graph-canvas" className="h-full min-h-[680px] overflow-hidden rounded-md">
            {graph.nodes.length ? (
              <ReactFlow
                nodes={flowNodes}
                edges={graph.edges}
                nodeTypes={nodeTypes}
                onNodeClick={handleNodeClick}
                fitView
                fitViewOptions={{ padding: 0.18 }}
                minZoom={0.25}
                maxZoom={1.4}
                nodesDraggable
                nodesConnectable={false}
                elementsSelectable
              >
                <Background />
                <Controls />
                <MiniMap pannable zoomable />
                <Panel position="top-left">
                  <div className="rounded-md border bg-background/95 px-3 py-2 text-sm shadow-sm">
                    <div className="font-medium">Wiki Graph / Knowledge Object 关系</div>
                    <div className="text-xs text-muted-foreground">
                      节点展示 WikiNode，边展示 WikiLink、语义关系和断链。
                    </div>
                  </div>
                </Panel>
                <Panel position="bottom-left">
                  <div className="rounded-md border bg-background/95 px-3 py-2 text-xs text-muted-foreground shadow-sm">
                    Index Segment 是受控的索引和召回单元。
                  </div>
                </Panel>
                <Panel position="top-right">
                  <GraphEdgeSummary edges={graph.visibleEdges} />
                </Panel>
              </ReactFlow>
            ) : (
              <div className="flex h-full min-h-[680px] items-center justify-center p-6 text-center text-sm text-muted-foreground">
                当前筛选条件下没有图谱数据
              </div>
            )}
          </div>
        </div>
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

function GraphEdgeSummary({ edges }: { edges: ReturnType<typeof buildKnowledgeGraphEdges> }) {
  if (!edges.length) {
    return (
      <div data-testid="wiki-graph-edge" className="rounded-md border bg-background/95 px-3 py-2 text-xs text-muted-foreground shadow-sm">
        暂无可展示关系
      </div>
    )
  }

  return (
    <div className="flex max-w-[280px] flex-col gap-2 rounded-md border bg-background/95 p-3 text-xs shadow-sm">
      {edges.slice(0, 5).map((edge) => (
        <div key={edge.edgeId} data-testid="wiki-graph-edge" className="flex flex-col gap-1">
          <div data-testid="knowledge-graph-edge" className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={edge.resolved ? "outline" : "destructive"}>{labelFromMap(relationTypeLabels, edge.relationType)}</Badge>
              <Badge variant="secondary">{edge.source === "wikilink" ? "WikiLink" : "语义关系"}</Badge>
            </div>
            <div className="truncate text-muted-foreground">
              {edge.sourceTitle} {"->"} {edge.targetTitle}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function FilterSelect({
  label,
  testId,
  value,
  labels = {},
  items,
  onChange,
}: {
  label: string
  testId?: string
  value: string
  labels?: Record<string, string>
  items: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger data-testid={testId} className="w-full" aria-label={label}>
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
