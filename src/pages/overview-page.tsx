import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/layout/page-header"
import { ApiErrorNotice } from "@/components/api-error-notice"
import { useAsyncData } from "@/hooks/use-async-data"
import { listBrokenLinks, listWikiNodes } from "@/services/wiki-node-api-service"

export function OverviewPage() {
  const { data: nodes, error: nodesError } = useAsyncData(listWikiNodes, [])
  const { data: brokenLinks, error: brokenLinksError } = useAsyncData(listBrokenLinks, [])
  const published = nodes.filter((node) => node.status === "published")
  const indexed = nodes.filter((node) => node.indexStatus === "indexed")
  const recent = [...nodes].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)).slice(0, 5)
  const topReferenced = [...nodes].sort((left, right) => right.incomingCount - left.incomingCount).slice(0, 5)

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Overview" description="WikiNode knowledge service health for product and ops review." />
      <ApiErrorNotice error={nodesError ?? brokenLinksError} />
      <Alert>
        <AlertTitle>MVP Boundary</AlertTitle>
        <AlertDescription>当前 MVP 只验证 WikiNode、双链、Retrieval API，不做 Agent 平台。</AlertDescription>
      </Alert>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total WikiNodes" value={nodes.length} />
        <MetricCard label="Published" value={published.length} />
        <MetricCard label="Broken Links" value={brokenLinks.length} />
        <MetricCard label="Indexed" value={indexed.length} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ListCard title="Recent Updated WikiNodes" items={recent.map((node) => `${node.title} · ${node.updatedAt}`)} />
        <ListCard title="Top Referenced WikiNodes" items={topReferenced.map((node) => `${node.title} · ${node.incomingCount} refs`)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <DistributionCard title="Node Type Distribution" items={groupBy(nodes.map((node) => node.nodeType))} />
        <DistributionCard title="Index Status Distribution" items={groupBy(nodes.map((node) => node.indexStatus))} />
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

function DistributionCard({ title, items }: { title: string; items: Record<string, number> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {Object.entries(items).map(([label, count]) => (
          <Badge key={label} variant="outline">{label}: {count}</Badge>
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
