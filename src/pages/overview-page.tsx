import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/layout/page-header"
import { ApiErrorNotice } from "@/components/api-error-notice"
import { useAsyncData } from "@/hooks/use-async-data"
import { listBrokenLinks, listWikiNodes } from "@/services/wiki-node-api-service"
import { indexStatusLabels, labelFromMap, nodeTypeLabels } from "@/utils/display-labels"

export function OverviewPage() {
  const { data: nodes, error: nodesError, reload: reloadNodes } = useAsyncData(listWikiNodes, [])
  const { data: brokenLinks, error: brokenLinksError, reload: reloadBrokenLinks } = useAsyncData(listBrokenLinks, [])
  const published = nodes.filter((node) => node.status === "published")
  const indexed = nodes.filter((node) => node.indexStatus === "indexed")
  const recent = [...nodes].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)).slice(0, 5)
  const topReferenced = [...nodes].sort((left, right) => right.incomingCount - left.incomingCount).slice(0, 5)

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="总览" />
      <ApiErrorNotice error={nodesError} onRetry={reloadNodes} />
      <ApiErrorNotice error={brokenLinksError} onRetry={reloadBrokenLinks} />
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="知识节点总数" value={nodes.length} />
        <MetricCard label="已发布" value={published.length} />
        <MetricCard label="断链数" value={brokenLinks.length} />
        <MetricCard label="已索引" value={indexed.length} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ListCard title="最近更新的知识节点" items={recent.map((node) => `${node.title} · ${node.updatedAt}`)} />
        <ListCard title="入链最多的知识节点" items={topReferenced.map((node) => `${node.title} · ${node.incomingCount} 条入链`)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <DistributionCard title="节点类型分布" items={groupBy(nodes.map((node) => node.nodeType))} labels={nodeTypeLabels} />
        <DistributionCard title="索引状态分布" items={groupBy(nodes.map((node) => node.indexStatus))} labels={indexStatusLabels} />
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item} className="rounded-md border px-3 py-2 text-sm text-muted-foreground">{item}</div>
        ))}
      </CardContent>
    </Card>
  )
}

function DistributionCard({ title, items, labels }: { title: string; items: Record<string, number>; labels: Record<string, string> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {Object.entries(items).map(([label, count]) => (
          <Badge key={label} variant="outline">{labelFromMap(labels, label)}：{count}</Badge>
        ))}
      </CardContent>
    </Card>
  )
}

function groupBy(values: string[]) {
  return values.reduce<Record<string, number>>((groups, value) => {
    groups[value] = (groups[value] ?? 0) + 1
    return groups
  }, {})
}
