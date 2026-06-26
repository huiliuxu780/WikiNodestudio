import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndexStatusBadge } from "@/components/wiki/index-status-badge"
import { PageHeader } from "@/components/layout/page-header"
import { ApiErrorNotice } from "@/components/api-error-notice"
import { useAsyncData } from "@/hooks/use-async-data"
import { listWikiNodes } from "@/services/wiki-node-api-service"
import type { WikiIndexStatus } from "@/types/wiki"
import { indexStatusLabels } from "@/utils/display-labels"

const groups: WikiIndexStatus[] = ["indexed", "indexing", "outdated", "failed", "not_indexed"]

export function IndexStatusPage() {
  const { data: nodes, error, reload } = useAsyncData(listWikiNodes, [])

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="索引状态" description="查看知识节点发布状态与索引状态是否可被验收。" />
      <ApiErrorNotice error={error} onRetry={reload} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">索引状态说明</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
          <div className="rounded-md border bg-muted/20 px-3 py-2">
            索引失败：需要查看失败原因、关联 WikiNode 和对应 Index Segment。
          </div>
          <div className="rounded-md border bg-muted/20 px-3 py-2">
            待更新：WikiNode 已变化，需要重新生成或同步 Index Segment。
          </div>
          <div className="rounded-md border bg-muted/20 px-3 py-2">
            未索引：尚未进入发布或索引流程。
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-4">
        {groups.map((status) => {
          const groupNodes = nodes.filter((node) => node.indexStatus === status)

          return (
            <Card key={status}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{indexStatusLabels[status]}</span>
                  <IndexStatusBadge status={status} />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {groupNodes.length === 0 ? (
                  <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">暂无该状态的知识节点。</div>
                ) : (
                  groupNodes.map((node) => (
                    <div key={node.nodeId} className="rounded-md border p-3 text-sm">
                      <div className="font-medium">{node.title}</div>
                      <div className="text-xs text-muted-foreground">{node.lastIndexedAt ?? "尚未索引"}</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
