import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { RetrievalQuery } from "@/types/retrieval"
import { actionLabels, commonLabels, labelFromMap, nodeTypeLabels, statusLabels } from "@/utils/display-labels"

const sampleQueries = [
  "洗碗机保修期内维修收费吗？",
  "人为损坏还可以免费维修吗？",
  "延保服务和普通保修有什么区别？",
  "洗衣机不脱水怎么办？",
  "上门服务什么情况下收费？",
]

export function RetrievalQueryPanel({
  value,
  onChange,
  onSearch,
  onReset,
  isSearching = false,
}: {
  value: RetrievalQuery
  onChange: (value: RetrievalQuery) => void
  onSearch: () => void
  onReset: () => void
  isSearching?: boolean
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4" data-testid="retrieval-query-panel">
      <div className="flex flex-col gap-2">
        <Label htmlFor="retrieval-query">检索问题</Label>
        <Input
          id="retrieval-query"
          value={value.query}
          onChange={(event) => onChange({ ...value, query: event.target.value })}
          placeholder="输入要验证的知识问题"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-6">
        <FilterSelect
          label="节点类型"
          value={value.filters.nodeType ?? "all"}
          labels={nodeTypeLabels}
          items={["policy", "procedure", "guide", "troubleshooting", "term"]}
          onChange={(nodeType) =>
            onChange({ ...value, filters: { ...value.filters, nodeType: nodeType === "all" ? undefined : nodeType } })
          }
        />
        <FilterSelect
          label="发布状态"
          value={value.filters.status ?? "all"}
          labels={statusLabels}
          items={["published", "draft", "archived"]}
          onChange={(status) =>
            onChange({ ...value, filters: { ...value.filters, status: status === "all" ? undefined : status } })
          }
        />
        <FilterSelect
          label="标签"
          value={value.filters.tags?.[0] ?? "all"}
          items={["保修", "收费", "洗碗机", "人为损坏", "洗衣机"]}
          onChange={(tag) =>
            onChange({ ...value, filters: { ...value.filters, tags: tag === "all" ? undefined : [tag] } })
          }
        />
        <FilterSelect
          label="返回数量"
          value={String(value.topK)}
          items={["3", "5", "8"]}
          includeAll={false}
          onChange={(topK) => onChange({ ...value, topK: Number(topK) })}
        />
        <FilterSelect
          label="召回模式"
          value={value.retrievalMode}
          labels={{
            vector: "Vector",
            keyword: "Keyword",
            hybrid: "Hybrid",
            graph: "Graph",
          }}
          items={["vector", "keyword", "hybrid", "graph"]}
          includeAll={false}
          onChange={(retrievalMode) => onChange({ ...value, retrievalMode: retrievalMode as RetrievalQuery["retrievalMode"] })}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onSearch} disabled={isSearching || !value.query.trim()}>
          {isSearching ? actionLabels.searching : actionLabels.search}
        </Button>
        <Button variant="outline" onClick={onReset} disabled={isSearching}>{actionLabels.reset}</Button>
        <div className="ml-auto flex items-center gap-2 rounded-md border px-3 py-2">
          <Switch
            id="retrieval-debug-mode"
            checked={Boolean(value.debug)}
            onCheckedChange={(debug) => onChange({ ...value, debug })}
          />
          <Label htmlFor="retrieval-debug-mode" className="text-sm">Debug mode</Label>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {sampleQueries.map((sample) => (
          <Button
            key={sample}
            variant="outline"
            size="sm"
            onClick={() => onChange({ ...value, query: sample })}
            data-testid="sample-query"
          >
            {sample}
          </Button>
        ))}
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  labels = {},
  items,
  includeAll = true,
  onChange,
}: {
  label: string
  value: string
  labels?: Record<string, string>
  items: string[]
  includeAll?: boolean
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
            {includeAll ? <SelectItem value="all">{commonLabels.all}</SelectItem> : null}
            {items.map((item) => (
              <SelectItem key={item} value={item}>{labelFromMap(labels, item)}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
