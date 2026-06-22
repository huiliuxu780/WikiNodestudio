import { Button } from "@/components/ui/button"
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
import type { RetrievalQuery } from "@/types/retrieval"

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
}: {
  value: RetrievalQuery
  onChange: (value: RetrievalQuery) => void
  onSearch: () => void
  onReset: () => void
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="retrieval-query">Query</Label>
        <Input
          id="retrieval-query"
          value={value.query}
          onChange={(event) => onChange({ ...value, query: event.target.value })}
          placeholder="Ask a retrieval question"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <FilterSelect
          label="nodeType"
          value={value.filters.nodeType ?? "all"}
          items={["policy", "procedure", "guide", "troubleshooting", "term"]}
          onChange={(nodeType) =>
            onChange({ ...value, filters: { ...value.filters, nodeType: nodeType === "all" ? undefined : nodeType } })
          }
        />
        <FilterSelect
          label="status"
          value={value.filters.status ?? "all"}
          items={["published", "draft", "archived"]}
          onChange={(status) =>
            onChange({ ...value, filters: { ...value.filters, status: status === "all" ? undefined : status } })
          }
        />
        <FilterSelect
          label="tag"
          value={value.filters.tags?.[0] ?? "all"}
          items={["保修", "收费", "洗碗机", "人为损坏", "洗衣机"]}
          onChange={(tag) =>
            onChange({ ...value, filters: { ...value.filters, tags: tag === "all" ? undefined : [tag] } })
          }
        />
        <FilterSelect
          label="topK"
          value={String(value.topK)}
          items={["3", "5", "8"]}
          onChange={(topK) => onChange({ ...value, topK: Number(topK) })}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onSearch}>Search</Button>
        <Button variant="outline" onClick={onReset}>Reset</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sampleQueries.map((sample) => (
          <Button
            key={sample}
            variant="outline"
            size="sm"
            onClick={() => onChange({ ...value, query: sample })}
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
            {label !== "topK" ? <SelectItem value="all">All</SelectItem> : null}
            {items.map((item) => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

