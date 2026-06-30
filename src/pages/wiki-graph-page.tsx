import { PageHeader } from "@/components/layout/page-header"
import { WikiGraphView } from "@/components/graph/wiki-graph-view"
import { ApiErrorNotice } from "@/components/api-error-notice"
import { useAsyncData } from "@/hooks/use-async-data"
import { listKnowledgeBases } from "@/services/knowledge-base-api-service"
import { listWikiNodes } from "@/services/wiki-node-api-service"
import { useSearchParams } from "react-router-dom"

export function WikiGraphPage() {
  const [searchParams] = useSearchParams()
  const initialKnowledgeBaseId = searchParams.get("knowledgeBaseId") ?? "all"
  const { data: nodes, error, reload } = useAsyncData(listWikiNodes, [])
  const { data: knowledgeBases, error: knowledgeBaseError, reload: reloadKnowledgeBases } = useAsyncData(() => listKnowledgeBases({ status: "active" }), [])

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="知识图谱"
        description="查看 WikiNode / Knowledge Object 之间的关系、来源证据、WikiLink、反向链接和断链。"
      />
      <ApiErrorNotice error={error} onRetry={reload} />
      <ApiErrorNotice error={knowledgeBaseError} title="知识库列表加载失败" onRetry={reloadKnowledgeBases} />
      <WikiGraphView nodes={nodes} knowledgeBases={knowledgeBases} initialKnowledgeBaseId={initialKnowledgeBaseId} />
    </div>
  )
}
