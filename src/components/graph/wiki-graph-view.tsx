import { useMemo, useState } from "react"
import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  type EdgeMouseHandler,
  type ReactFlowInstance,
  type NodeMouseHandler,
} from "@xyflow/react"
import { Maximize2Icon, PanelRightCloseIcon, PanelRightOpenIcon, RotateCcwIcon } from "lucide-react"

import { BrokenLinkNode } from "@/components/graph/broken-link-node"
import { GraphInspector } from "@/components/graph/graph-inspector"
import { WikiGraphNode } from "@/components/graph/wiki-graph-node"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { cn } from "@/lib/utils"
import type { KnowledgeBase } from "@/types/knowledge-base"
import type { WikiNode } from "@/types/wiki"
import { actionLabels, commonLabels, indexStatusLabels, labelFromMap, objectTypeLabels, relationStatusLabels } from "@/utils/display-labels"
import {
  buildKnowledgeGraphEdges,
  buildKnowledgeGraphFlow,
  getIncomingKnowledgeGraphEdges,
  getOutgoingKnowledgeGraphEdges,
  knowledgeObjectTypes,
  type KnowledgeGraphFilters,
  type KnowledgeGraphRelationStatusFilter,
  type KnowledgeGraphRelationTypeFilter,
} from "@/utils/knowledge-graph"
import { getIncomingLinks, getOutgoingLinks } from "@/utils/link-parser"

const defaultFilters: KnowledgeGraphFilters = {
  search: "",
  knowledgeBaseId: "all",
  objectType: "all",
  indexStatus: "all",
  relationType: "all",
  relationStatus: "all",
  showBrokenLinks: true,
}

const relationTypeFilterLabels: Record<KnowledgeGraphRelationTypeFilter, string> = {
  all: commonLabels.all,
  references: "引用关系",
  related: "相关关系",
  applies: "适用关系",
  replaces: "替代关系",
  conflicts: "冲突关系",
  derived_source: "来源关系",
  broken: "断链关系",
}

const relationStatusFilterLabels: Record<KnowledgeGraphRelationStatusFilter, string> = {
  all: commonLabels.all,
  active: relationStatusLabels.active,
  broken: relationStatusLabels.broken,
  pending_review: relationStatusLabels.pending_review,
  rejected: relationStatusLabels.rejected,
}

const nodeTypes = {
  wikiNode: WikiGraphNode,
  brokenLink: BrokenLinkNode,
}

export function WikiGraphView({
  nodes,
  knowledgeBases = [],
  initialKnowledgeBaseId = "all",
  isLoading = false,
}: {
  nodes: WikiNode[]
  knowledgeBases?: KnowledgeBase[]
  initialKnowledgeBaseId?: string
  isLoading?: boolean
}) {
  const initialFilters = { ...defaultFilters, knowledgeBaseId: initialKnowledgeBaseId || "all" }
  const [filters, setFilters] = useState<KnowledgeGraphFilters>(initialFilters)
  const [selectedNodeId, setSelectedNodeId] = useState("")
  const [selectedEdgeId, setSelectedEdgeId] = useState("")
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(null)
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
          onSelect: (nodeId: string) => {
            setSelectedNodeId(nodeId)
            setInspectorOpen(true)
          },
        },
      })),
    [activeSelectedNodeId, graph.nodes],
  )
  const flowEdges = useMemo(
    () => graph.edges.map((edge) => ({ ...edge, selected: edge.id === selectedEdgeId })),
    [graph.edges, selectedEdgeId],
  )
  const selectedNode = nodes.find((node) => node.nodeId === activeSelectedNodeId)
  const selectedEdge = graph.visibleEdges.find((edge) => edge.edgeId === selectedEdgeId)
  const inspectorEdges = useMemo(
    () => buildKnowledgeGraphEdges(nodes, { ...defaultFilters, showBrokenLinks: true }),
    [nodes],
  )
  const outgoingRelations = getOutgoingKnowledgeGraphEdges(activeSelectedNodeId, inspectorEdges)
  const incomingRelations = getIncomingKnowledgeGraphEdges(activeSelectedNodeId, inspectorEdges)
  const outgoingWikiLinks = selectedNode ? getOutgoingLinks(selectedNode.nodeId, nodes).filter((link) => link.resolved) : []
  const incomingWikiLinks = selectedNode ? getIncomingLinks(selectedNode.nodeId, nodes) : []
  const brokenLinks = selectedNode ? getOutgoingLinks(selectedNode.nodeId, nodes).filter((link) => !link.resolved) : []

  const handleNodeClick: NodeMouseHandler = (_, node) => {
    setSelectedNodeId(node.id)
    setSelectedEdgeId("")
    setInspectorOpen(true)
  }

  const handleEdgeClick: EdgeMouseHandler = (_, edge) => {
    setSelectedEdgeId(edge.id)
    setInspectorOpen(true)
  }

  return (
    <div data-testid="wiki-graph-page" className="flex min-h-[calc(100svh-11rem)] flex-col gap-4">
      <div
        data-slot="wiki-graph-toolbar"
        data-testid="wiki-graph-toolbar"
        className="flex flex-col gap-3 rounded-md border bg-card p-3"
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.4fr)_minmax(170px,0.8fr)_minmax(170px,0.8fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)_auto]">
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
            label="Knowledge Base"
            testId="wiki-graph-filter-knowledge-base"
            value={filters.knowledgeBaseId}
            labels={Object.fromEntries(knowledgeBases.map((kb) => [kb.kbId, kb.name]))}
            items={knowledgeBases.map((kb) => kb.kbId)}
            onChange={(knowledgeBaseId) => setFilters({ ...filters, knowledgeBaseId })}
          />
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
          <FilterSelect
            label="关系类型"
            testId="wiki-graph-filter-relation-type"
            value={filters.relationType}
            labels={relationTypeFilterLabels}
            items={["references", "related", "applies", "replaces", "conflicts", "derived_source", "broken"]}
            onChange={(relationType) => setFilters({ ...filters, relationType: relationType as KnowledgeGraphRelationTypeFilter })}
          />
          <FilterSelect
            label="关系状态"
            testId="wiki-graph-filter-relation-status"
            value={filters.relationStatus}
            labels={relationStatusFilterLabels}
            items={["active", "broken", "pending_review", "rejected"]}
            onChange={(relationStatus) => setFilters({ ...filters, relationStatus: relationStatus as KnowledgeGraphRelationStatusFilter })}
          />
          <div className="flex items-end">
            <div className="flex h-8 w-full items-center justify-between gap-3 rounded-md border px-3 text-sm">
              <Label htmlFor="knowledge-graph-show-broken" className="whitespace-nowrap">显示断链</Label>
              <Switch
                id="knowledge-graph-show-broken"
                data-testid="wiki-graph-toggle-broken-links"
                checked={filters.showBrokenLinks}
                onCheckedChange={(showBrokenLinks) => setFilters({ ...filters, showBrokenLinks })}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button data-testid="wiki-graph-reset-filters" variant="outline" size="sm" onClick={() => setFilters(initialFilters)}>
            <RotateCcwIcon data-icon="inline-start" />
            {actionLabels.reset}筛选
          </Button>
          <Button data-testid="wiki-graph-fit-view" variant="outline" size="sm" onClick={() => flowInstance?.fitView({ padding: 0.18 })}>
            <Maximize2Icon data-icon="inline-start" />
            适应视图
          </Button>
          <Button
            data-testid="wiki-graph-toggle-inspector"
            variant="outline"
            size="sm"
            onClick={() => setInspectorOpen((open) => !open)}
          >
            {inspectorOpen ? <PanelRightCloseIcon data-icon="inline-start" /> : <PanelRightOpenIcon data-icon="inline-start" />}
            {inspectorOpen ? "隐藏详情" : "显示详情"}
          </Button>
          <GraphMetric label="可见知识对象" value={graph.visibleWikiNodes.length} />
          <GraphMetric label="可见关系" value={graph.visibleEdges.length} />
          <GraphMetric label="当前选择" value={selectedNode?.title ?? commonLabels.none} />
        </div>
      </div>

      <div
        data-slot="wiki-graph-layout"
        data-testid="wiki-graph-layout"
        className={cn(
          "grid min-h-[720px] gap-4",
          inspectorOpen ? "xl:grid-cols-[minmax(0,1fr)_340px]" : "grid-cols-1",
        )}
      >
        <Card data-slot="wiki-graph-canvas-frame" className="min-h-[720px] p-0">
          <div data-testid="knowledge-graph-workspace" className="h-full">
            <div data-testid="wiki-graph-canvas" className="h-full min-h-[720px] overflow-hidden rounded-md">
              {isLoading ? (
                <div
                  data-testid="wiki-graph-loading"
                  className="flex h-full min-h-[720px] items-center justify-center p-6 text-center text-sm text-muted-foreground"
                >
                  正在加载知识图谱...
                </div>
              ) : graph.nodes.length ? (
                <ReactFlow
                  nodes={flowNodes}
                  edges={flowEdges}
                  nodeTypes={nodeTypes}
                  onNodeClick={handleNodeClick}
                  onEdgeClick={handleEdgeClick}
                  onInit={setFlowInstance}
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
                  <MiniMap
                    pannable
                    zoomable
                    ariaLabel="知识图谱缩略图"
                    bgColor="var(--muted)"
                    maskColor="color-mix(in oklch, var(--background) 72%, transparent)"
                    maskStrokeColor="var(--border)"
                    maskStrokeWidth={2}
                    nodeBorderRadius={8}
                    nodeColor={(node) => (node.type === "brokenLink" ? "var(--destructive)" : "var(--primary)")}
                    nodeStrokeColor="var(--foreground)"
                    nodeStrokeWidth={4}
                  />
                  <Panel position="top-left">
                    <div className="rounded-md border bg-background/95 px-3 py-2 text-sm shadow-sm">
                      <div className="font-medium">Wiki Graph / Knowledge Object 关系</div>
                      <div className="text-xs text-muted-foreground">
                        节点展示 WikiNode，边展示 WikiLink、语义关系和断链。
                      </div>
                    </div>
                  </Panel>
                  <Panel position="top-right">
                    <GraphLegend />
                  </Panel>
                  <Panel position="bottom-left">
                    <div className="rounded-md border bg-background/95 px-3 py-2 text-xs text-muted-foreground shadow-sm">
                      Index Segment 是受控的索引和召回单元。
                    </div>
                  </Panel>
                </ReactFlow>
              ) : (
                <div className="flex h-full min-h-[720px] items-center justify-center p-6 text-center text-sm text-muted-foreground">
                  当前筛选条件下没有图谱数据
                </div>
              )}
            </div>
          </div>
        </Card>

        {inspectorOpen ? (
          <div data-slot="wiki-graph-inspector-panel" data-testid="wiki-graph-inspector-panel" className="min-h-0">
            <GraphInspector
              node={selectedNode}
              incomingRelations={incomingRelations}
              outgoingRelations={outgoingRelations}
              incomingWikiLinks={incomingWikiLinks}
              outgoingWikiLinks={outgoingWikiLinks}
              brokenLinks={brokenLinks}
              selectedEdge={selectedEdge}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function GraphLegend() {
  return (
    <div data-testid="wiki-graph-legend" className="grid gap-2 rounded-md border bg-background/95 px-3 py-2 text-xs shadow-sm">
      <div className="font-medium">图例</div>
      <LegendItem color="hsl(var(--foreground))" label="普通关系" />
      <LegendItem color="hsl(24 95% 45%)" label="冲突关系" />
      <LegendItem color="hsl(var(--destructive))" label="断链关系" dashed />
    </div>
  )
}

function LegendItem({ color, label, dashed = false }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-0 w-8 border-t-2"
        style={{ borderColor: color, borderStyle: dashed ? "dashed" : "solid" }}
      />
      <span>{label}</span>
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
    <div className="rounded-md border bg-background px-3 py-1.5 text-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="truncate font-medium">{value}</div>
    </div>
  )
}
