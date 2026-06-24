import { PageHeader } from "@/components/layout/page-header"
import { WikiGraphView } from "@/components/graph/wiki-graph-view"
import { ApiErrorNotice } from "@/components/api-error-notice"
import { useAsyncData } from "@/hooks/use-async-data"
import { listWikiNodes } from "@/services/wiki-node-api-service"

export function WikiGraphPage() {
  const { data: nodes, error, reload } = useAsyncData(listWikiNodes, [])

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="知识图谱"
        description="查看 WikiNode / Knowledge Object 之间的关系、来源证据、WikiLink、反向链接和断链。"
      />
      <ApiErrorNotice error={error} onRetry={reload} />
      <WikiGraphView nodes={nodes} />
    </div>
  )
}
