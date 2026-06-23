import { PageHeader } from "@/components/layout/page-header"
import { WikiGraphView } from "@/components/graph/wiki-graph-view"
import { ApiErrorNotice } from "@/components/api-error-notice"
import { useAsyncData } from "@/hooks/use-async-data"
import { listWikiNodes } from "@/services/wiki-node-api-service"

export function WikiGraphPage() {
  const { data: nodes, error, reload } = useAsyncData(listWikiNodes, [])

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="知识图谱" />
      <ApiErrorNotice error={error} onRetry={reload} />
      <WikiGraphView nodes={nodes} />
    </div>
  )
}
