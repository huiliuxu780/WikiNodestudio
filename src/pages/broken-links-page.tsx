import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BrokenLinkActionList } from "@/components/wiki/link-list"
import { PageHeader } from "@/components/layout/page-header"
import { ApiErrorNotice } from "@/components/api-error-notice"
import { useAsyncData } from "@/hooks/use-async-data"
import { listBrokenLinks } from "@/services/wiki-node-api-service"

export function BrokenLinksPage() {
  const { data: brokenLinks, error } = useAsyncData(listBrokenLinks, [])

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Broken Links" description="Unresolved WikiLink references parsed from Markdown double-link syntax." />
      <ApiErrorNotice error={error} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Unresolved WikiLinks</CardTitle>
        </CardHeader>
        <CardContent>
          <BrokenLinkActionList links={brokenLinks} />
        </CardContent>
      </Card>
    </div>
  )
}
