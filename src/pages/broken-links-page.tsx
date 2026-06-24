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
      <PageHeader title="断链检查" description="查看 Markdown 双链语法中尚未解析的 WikiLink 引用。" />
      <ApiErrorNotice error={error} onRetry={reload} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">未解析的 WikiLink</CardTitle>
        </CardHeader>
        <CardContent>
          <BrokenLinkActionList links={brokenLinks} />
        </CardContent>
      </Card>
    </div>
  )
}
