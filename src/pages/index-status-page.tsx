import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndexStatusBadge } from "@/components/wiki/index-status-badge"
import { PageHeader } from "@/components/layout/page-header"
import { ApiErrorNotice } from "@/components/api-error-notice"
import { useAsyncData } from "@/hooks/use-async-data"
import { listWikiNodes } from "@/services/wiki-node-api-service"
import type { WikiIndexStatus } from "@/types/wiki"

const groups: WikiIndexStatus[] = ["indexed", "outdated", "failed", "not_indexed"]

export function IndexStatusPage() {
  const { data: nodes, error } = useAsyncData(listWikiNodes, [])

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Index Status" description="Verify WikiNode publication and index-state visibility." />
      <ApiErrorNotice error={error} />
      <div className="grid gap-4 lg:grid-cols-4">
        {groups.map((status) => (
          <Card key={status}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>{status}</span>
                <IndexStatusBadge status={status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {nodes.filter((node) => node.indexStatus === status).map((node) => (
                <div key={node.nodeId} className="rounded-md border p-3 text-sm">
                  <div className="font-medium">{node.title}</div>
                  <div className="text-xs text-muted-foreground">{node.lastIndexedAt ?? "not indexed"}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
