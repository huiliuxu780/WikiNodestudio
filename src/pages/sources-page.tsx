import { useState } from "react"

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
      <PageHeader title="知识来源" />
      <ApiErrorNotice error={sourcesError} onRetry={reloadSources} />
      <ApiErrorNotice error={nodesError} onRetry={reloadNodes} />
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
                  <th className="p-2">生成节点</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.sourceId} className="cursor-pointer border-b hover:bg-muted/40" onClick={() => setSelectedSourceId(source.sourceId)}>
                    <td className="p-2"><Badge variant="outline">{labelFromMap(sourceTypeLabels, source.sourceType)}</Badge></td>
                    <td className="p-2 font-medium">{source.title}</td>
                    <td className="p-2">{source.owner}</td>
                    <td className="p-2">{labelFromMap(syncStatusLabels, source.syncStatus)}</td>
                    <td className="p-2">{source.lastSyncedAt}</td>
                    <td className="p-2">{source.generatedNodes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">关联知识节点</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {selectedNodes.map((node) => (
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
