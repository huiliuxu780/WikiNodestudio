import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiErrorNotice } from "@/components/api-error-notice"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/layout/page-header"
import { WikiNodeTable } from "@/components/wiki/wiki-node-table"
import { useAsyncData } from "@/hooks/use-async-data"
import { listWikiNodes } from "@/services/wiki-node-api-service"
import {
  commonLabels,
  indexStatusLabels,
  labelFromMap,
  nodeTypeLabels,
  statusLabels,
} from "@/utils/display-labels"

export function WikiNodeListPage() {
  const [search, setSearch] = useState("")
  const [nodeType, setNodeType] = useState("all")
  const [status, setStatus] = useState("all")
  const [indexStatus, setIndexStatus] = useState("all")
  const [tag, setTag] = useState("all")
  const { data: nodes, error, reload } = useAsyncData(listWikiNodes, [])
  const filteredNodes = useMemo(
    () =>
      nodes
        .filter((node) => `${node.title} ${node.summary} ${node.tags.join(" ")}`.includes(search))
        .filter((node) => nodeType === "all" || node.nodeType === nodeType)
        .filter((node) => status === "all" || node.status === status)
        .filter((node) => indexStatus === "all" || node.indexStatus === indexStatus)
        .filter((node) => tag === "all" || node.tags.includes(tag)),
    [indexStatus, nodeType, nodes, search, status, tag],
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="WikiNodes 知识节点"
        description="管理标准知识节点、元数据、双向链接和索引状态。"
        actions={
          <Button asChild>
            <Link to="/wiki-nodes/create"><PlusIcon data-icon="inline-start" />新建知识节点</Link>
          </Button>
        }
      />
      <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="node-search">搜索</Label>
          <Input id="node-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="标题、标签、摘要" />
        </div>
        <FilterSelect label="节点类型" value={nodeType} labels={nodeTypeLabels} items={["policy", "procedure", "guide", "troubleshooting", "term"]} onChange={setNodeType} />
        <FilterSelect label="发布状态" value={status} labels={statusLabels} items={["published", "draft", "archived"]} onChange={setStatus} />
        <FilterSelect label="索引状态" value={indexStatus} labels={indexStatusLabels} items={["indexed", "not_indexed", "failed", "outdated"]} onChange={setIndexStatus} />
        <FilterSelect label="标签" value={tag} items={["保修", "收费", "洗碗机", "人为损坏", "洗衣机"]} onChange={setTag} />
      </div>
      <ApiErrorNotice error={error} onRetry={reload} />
      <WikiNodeTable nodes={filteredNodes} />
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
