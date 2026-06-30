import { useState } from "react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { ApiErrorNotice } from "@/components/api-error-notice"
import { useAsyncData } from "@/hooks/use-async-data"
import { listKnowledgeBases } from "@/services/knowledge-base-api-service"
import { getNodesBySourceId, listSources } from "@/services/source-api-service"
import {
  labelFromMap,
  sourceConnectionStatusLabels,
  sourceIngestionModeLabels,
  sourceTypeLabels,
  syncStatusLabels,
} from "@/utils/display-labels"

export function SourcesPage() {
  const { data: sources, error: sourcesError, reload: reloadSources } = useAsyncData(listSources, [])
  const { data: knowledgeBases, error: knowledgeBaseError, reload: reloadKnowledgeBases } = useAsyncData(listKnowledgeBases, [])
  const [selectedSourceId, setSelectedSourceId] = useState("")
  const activeSourceId = selectedSourceId || sources[0]?.sourceId || ""
  const activeSource = sources.find((source) => source.sourceId === activeSourceId) ?? sources[0]
  const { data: selectedNodes, error: nodesError, reload: reloadNodes } = useAsyncData(() => getNodesBySourceId(activeSourceId), [], [activeSourceId])
  const knowledgeBaseNameById = new Map(knowledgeBases.map((kb) => [kb.kbId, kb.name]))

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="知识来源"
        description="按 Source 查看快照、解析结果、生成的 WikiNode 和最近处理状态。"
        actions={activeSource ? (
          <Button asChild>
            <Link to={sourceImportHref(activeSource)}>导入文件</Link>
          </Button>
        ) : null}
      />
      <ApiErrorNotice error={sourcesError} onRetry={reloadSources} />
      <ApiErrorNotice error={knowledgeBaseError} title="知识库列表加载失败" onRetry={reloadKnowledgeBases} />
      <ApiErrorNotice error={nodesError} onRetry={reloadNodes} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">来源清单</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="p-2">Source</th>
                  <th className="p-2">Knowledge Base</th>
                  <th className="p-2">来源类型</th>
                  <th className="p-2">负责人</th>
                  <th className="p-2">接入模式</th>
                  <th className="p-2">连接状态</th>
                  <th className="p-2">同步状态</th>
                  <th className="p-2">最后同步</th>
                  <th className="p-2">Raw Material</th>
                  <th className="p-2">WikiNode 建议</th>
                  <th className="p-2">处理记录</th>
                  <th className="p-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {sources.length === 0 ? (
                  <tr>
                    <td className="p-4 text-sm text-muted-foreground" colSpan={12}>
                      暂无知识来源。来源接入后会在这里展示快照、解析预览和关联 WikiNode。
                    </td>
                  </tr>
                ) : sources.map((source) => (
                  <tr key={source.sourceId} className="cursor-pointer border-b hover:bg-muted/40" onClick={() => setSelectedSourceId(source.sourceId)}>
                    <td className="p-2 font-medium">
                      <Link to={`/sources/${source.sourceId}`} className="hover:underline">{source.title}</Link>
                      <div className="text-xs text-muted-foreground">{source.sourceId}</div>
                    </td>
                    <td className="p-2">{knowledgeBaseNameById.get(source.knowledgeBaseId ?? "") ?? source.knowledgeBaseId ?? "未绑定"}</td>
                    <td className="p-2"><Badge variant="outline">{labelFromMap(sourceTypeLabels, source.sourceType)}</Badge></td>
                    <td className="p-2">{source.owner}</td>
                    <td className="p-2">{labelFromMap(sourceIngestionModeLabels, source.ingestionMode ?? "not_configured")}</td>
                    <td className="p-2">
                      <Badge variant={source.connectionStatus === "failed" ? "destructive" : "secondary"}>
                        {labelFromMap(sourceConnectionStatusLabels, source.connectionStatus ?? "not_configured")}
                      </Badge>
                    </td>
                    <td className="p-2"><Badge variant={source.syncStatus === "failed" ? "destructive" : "outline"}>{labelFromMap(syncStatusLabels, source.syncStatus)}</Badge></td>
                    <td className="p-2">{source.lastSyncedAt}</td>
                    <td className="p-2">{source.rawMaterialCount} 个 Raw Material</td>
                    <td className="p-2">{source.generatedNodes}</td>
                    <td className="p-2">{source.lastCheckedAt ?? source.lastSyncedAt}</td>
                    <td className="p-2 space-x-3 whitespace-nowrap">
                      <Link to={`/sources/${source.sourceId}`} className="font-medium text-primary hover:underline" onClick={(event) => event.stopPropagation()}>查看 Source</Link>
                      <Link to={sourceImportHref(source)} className="font-medium text-primary hover:underline" onClick={(event) => event.stopPropagation()}>导入文件</Link>
                    </td>
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
                当前来源暂无关联 WikiNode。
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

function sourceImportHref(source: { sourceId: string; knowledgeBaseId?: string | null }) {
  return source.knowledgeBaseId
    ? `/knowledge-bases/${source.knowledgeBaseId}/import?sourceId=${source.sourceId}`
    : `/sources/${source.sourceId}`
}
