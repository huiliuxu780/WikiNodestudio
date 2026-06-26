import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BrokenLinkActionList } from "@/components/wiki/link-list"
import { PageHeader } from "@/components/layout/page-header"
import { ApiErrorNotice } from "@/components/api-error-notice"
import { useAsyncData } from "@/hooks/use-async-data"
import { listBrokenLinks } from "@/services/wiki-node-api-service"

export function BrokenLinksPage() {
  const { data: brokenLinks, error, reload } = useAsyncData(listBrokenLinks, [])

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="断链检查" description="查看 WikiNode 之间尚未解析的 WikiLink，并按关系类型、来源和状态定位治理线索。" />
      <ApiErrorNotice error={error} onRetry={reload} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">未解析关系</CardTitle>
        </CardHeader>
        <CardContent>
          <BrokenLinkActionList links={brokenLinks} />
        </CardContent>
      </Card>
    </div>
  )
}
