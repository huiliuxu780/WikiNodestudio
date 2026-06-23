import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GraphInspector } from "@/components/graph/graph-inspector"
import { GraphNodeCard } from "@/components/graph/graph-node-card"
import type { WikiNode } from "@/types/wiki"
import { commonLabels, labelFromMap, nodeTypeLabels, statusLabels } from "@/utils/display-labels"
import { getBrokenLinks, getIncomingLinks, getOutgoingLinks } from "@/utils/link-parser"

export function WikiGraphView({ nodes }: { nodes: WikiNode[] }) {
  const [nodeType, setNodeType] = useState("all")
  const [status, setStatus] = useState("all")
  const [showBroken, setShowBroken] = useState(true)
  const [selectedNodeId, setSelectedNodeId] = useState(nodes[0]?.nodeId ?? "")
  const selectedNode = nodes.find((node) => node.nodeId === selectedNodeId) ?? nodes[0]
  const filteredNodes = useMemo(
    () =>
      nodes
        .filter((node) => nodeType === "all" || node.nodeType === nodeType)
        .filter((node) => status === "all" || node.status === status),
    [nodeType, nodes, status],
  )
  const outgoingLinks = selectedNode ? getOutgoingLinks(selectedNode.nodeId, nodes) : []
  const incomingLinks = selectedNode ? getIncomingLinks(selectedNode.nodeId, nodes) : []
  const brokenLinks = getBrokenLinks(nodes)

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">筛选</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FilterSelect label="节点类型" value={nodeType} labels={nodeTypeLabels} items={["policy", "procedure", "guide", "troubleshooting", "term"]} onChange={setNodeType} />
          <FilterSelect label="发布状态" value={status} labels={statusLabels} items={["published", "draft", "archived"]} onChange={setStatus} />
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="show-broken">显示断链</Label>
            <Switch id="show-broken" checked={showBroken} onCheckedChange={setShowBroken} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">知识节点关系图</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredNodes.map((node) => (
              <GraphNodeCard
                key={node.nodeId}
                node={node}
                selected={node.nodeId === selectedNode?.nodeId}
                onSelect={() => setSelectedNodeId(node.nodeId)}
              />
            ))}
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="mb-2 text-sm font-medium">关系</div>
            <div className="flex flex-col gap-2 text-sm">
              {outgoingLinks.map((link) => (
                <div key={link.linkId} className="flex flex-wrap items-center gap-2">
                  <span>{link.fromTitle}</span>
                  <span className="text-muted-foreground">→</span>
                  <span>{link.targetTitle}</span>
                  <Badge variant={link.resolved ? "outline" : "destructive"}>
                    {link.resolved ? "引用" : "断链"}
                  </Badge>
                </div>
              ))}
              {showBroken
                ? brokenLinks.map((link) => (
                    <div key={`broken-${link.linkId}`} className="flex flex-wrap items-center gap-2">
                      <span>{link.fromTitle}</span>
                      <span className="text-muted-foreground">→</span>
                      <span>{link.targetTitle}</span>
                      <Badge variant="destructive">未解析</Badge>
                    </div>
                  ))
                : null}
            </div>
          </div>
        </CardContent>
      </Card>
      {selectedNode ? (
        <GraphInspector
          node={selectedNode}
          incomingLinks={incomingLinks}
          outgoingLinks={outgoingLinks}
          brokenLinks={outgoingLinks.filter((link) => !link.resolved)}
        />
      ) : null}
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
        <SelectTrigger className="w-full">
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
