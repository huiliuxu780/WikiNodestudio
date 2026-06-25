import { useState } from "react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { ApiErrorNotice } from "@/components/api-error-notice"
import { useAsyncData } from "@/hooks/use-async-data"
import { getNodesBySourceId, listSources } from "@/services/source-api-service"
import { labelFromMap, sourceTypeLabels, syncStatusLabels } from "@/utils/display-labels"

export function SourcesPage() {
  const { data: sources, error: sourcesError, reload: reloadSources } = useAsyncData(listSources, [])
  const [selectedSourceId, setSelectedSourceId] = useState("")
  const activeSourceId = selectedSourceId || sources[0]?.sourceId || ""
  const { data: selectedNodes, error: nodesError, reload: reloadNodes } = useAsyncData(() => getNodesBySourceId(activeSourceId), [], [activeSourceId])

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="知识来源"
        description="查看 Source、Raw Material、Parsed Document 到 WikiNode 的上游证据链；当前为 MVP 验收基线。"
      />
      <ApiErrorNotice error={sourcesError} onRetry={reloadSources} />
      <ApiErrorNotice error={nodesError} onRetry={reloadNodes} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">上游证据链</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-[1fr_1.2fr]">
          <div className="rounded-md border bg-muted/20 px-3 py-2">
            <div className="font-medium">Source - Raw Material - Parsed Document - WikiNode</div>
            <p className="mt-1 text-muted-foreground">{"Source -> Raw Material -> Parsed Document -> WikiNode"}</p>
          </div>
          <div className="rounded-md border border-dashed px-3 py-2">
            <div className="font-medium">当前只读：不会执行真实同步、上传、解析或导入。</div>
            <p className="mt-1 text-muted-foreground">本页只帮助验收来源、快照、解析预览和生成 WikiNode 的关系。</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="grid gap-3 p-4 text-sm md:grid-cols-3">
          <div className="rounded-md border bg-muted/20 px-3 py-2">
            <div className="font-medium">Source 是原始知识的来源。</div>
            <p className="mt-1 text-muted-foreground">当前仅展示本地样例数据，不执行真实同步、上传或解析。</p>
          </div>
          <div className="rounded-md border bg-muted/20 px-3 py-2">
            <div className="font-medium">Raw Material 是来源快照。</div>
            <p className="mt-1 text-muted-foreground">真实 Source import、文件上传和解析任务留到后续阶段。</p>
          </div>
          <div className="rounded-md border bg-muted/20 px-3 py-2">
            <div className="font-medium">Parsed Document 是标准化预览。</div>
            <p className="mt-1 text-muted-foreground">当前只用于解释证据链，不运行后台同步任务。</p>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">来源清单</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="p-2">来源类型</th>
                  <th className="p-2">标题</th>
                  <th className="p-2">负责人</th>
                  <th className="p-2">同步状态</th>
                  <th className="p-2">最后同步</th>
                  <th className="p-2">Raw Material</th>
                  <th className="p-2">生成节点</th>
                </tr>
              </thead>
              <tbody>
                {sources.length === 0 ? (
                  <tr>
                    <td className="p-4 text-sm text-muted-foreground" colSpan={7}>
                      暂无知识来源。本页当前只展示后端只读证据链，不提供真实 Source import 或文件上传。
                    </td>
                  </tr>
                ) : sources.map((source) => (
                  <tr key={source.sourceId} className="cursor-pointer border-b hover:bg-muted/40" onClick={() => setSelectedSourceId(source.sourceId)}>
                    <td className="p-2"><Badge variant="outline">{labelFromMap(sourceTypeLabels, source.sourceType)}</Badge></td>
                    <td className="p-2 font-medium">
                      <Link to={`/sources/${source.sourceId}`} className="hover:underline">{source.title}</Link>
                    </td>
                    <td className="p-2">{source.owner}</td>
                    <td className="p-2">{labelFromMap(syncStatusLabels, source.syncStatus)}</td>
                    <td className="p-2">{source.lastSyncedAt}</td>
                    <td className="p-2">{source.rawMaterialCount} 个 Raw Material</td>
                    <td className="p-2">{source.generatedNodes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">生成的 WikiNode</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {selectedNodes.length === 0 ? (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                当前来源暂无关联 WikiNode。真实生成、同步和解析流程不在 MVP v0.2 范围内。
              </div>
            ) : selectedNodes.map((node) => (
              <div key={node.nodeId} className="rounded-md border p-3">
                <div className="font-medium">{node.title}</div>
                <div className="text-xs text-muted-foreground">{node.sourceRefs[0]?.paragraphRef} · {node.sourceRefs[0]?.version}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
