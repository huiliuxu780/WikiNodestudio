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

export function WikiNodeListPage() {
  const [search, setSearch] = useState("")
  const [nodeType, setNodeType] = useState("all")
  const [status, setStatus] = useState("all")
  const [indexStatus, setIndexStatus] = useState("all")
  const [tag, setTag] = useState("all")
  const { data: nodes, error } = useAsyncData(listWikiNodes, [])
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
        title="WikiNodes"
        description="Manage standard knowledge nodes, metadata, double links, and index state."
        actions={
          <Button asChild>
            <Link to="/wiki-nodes/new"><PlusIcon data-icon="inline-start" />New WikiNode</Link>
          </Button>
        }
      />
      <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="node-search">search</Label>
          <Input id="node-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="title, tag, summary" />
        </div>
        <FilterSelect label="nodeType" value={nodeType} items={["policy", "procedure", "guide", "troubleshooting", "term"]} onChange={setNodeType} />
        <FilterSelect label="status" value={status} items={["published", "draft", "archived"]} onChange={setStatus} />
        <FilterSelect label="indexStatus" value={indexStatus} items={["indexed", "not_indexed", "failed", "outdated"]} onChange={setIndexStatus} />
        <FilterSelect label="tags" value={tag} items={["保修", "收费", "洗碗机", "人为损坏", "洗衣机"]} onChange={setTag} />
      </div>
      <ApiErrorNotice error={error} />
      <WikiNodeTable nodes={filteredNodes} />
    </div>
  )
}

function FilterSelect({
  label,
  value,
  items,
  onChange,
}: {
  label: string
  value: string
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
            <SelectItem value="all">All</SelectItem>
            {items.map((item) => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
