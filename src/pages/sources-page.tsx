import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { ApiErrorNotice } from "@/components/api-error-notice"
import { useAsyncData } from "@/hooks/use-async-data"
import { getNodesBySourceId, listSources } from "@/services/source-api-service"

export function SourcesPage() {
  const { data: sources, error: sourcesError } = useAsyncData(listSources, [])
  const [selectedSourceId, setSelectedSourceId] = useState("")
  const activeSourceId = selectedSourceId || sources[0]?.sourceId || ""
  const { data: selectedNodes, error: nodesError } = useAsyncData(() => getNodesBySourceId(activeSourceId), [], [activeSourceId])

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Sources" description="Mock source inventory and WikiNode lineage tracing." />
      <ApiErrorNotice error={sourcesError ?? nodesError} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mock Sources</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="p-2">sourceType</th>
                  <th className="p-2">title</th>
                  <th className="p-2">owner</th>
                  <th className="p-2">syncStatus</th>
                  <th className="p-2">lastSyncedAt</th>
                  <th className="p-2">generatedNodes</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.sourceId} className="cursor-pointer border-b hover:bg-muted/40" onClick={() => setSelectedSourceId(source.sourceId)}>
                    <td className="p-2"><Badge variant="outline">{source.sourceType}</Badge></td>
                    <td className="p-2 font-medium">{source.title}</td>
                    <td className="p-2">{source.owner}</td>
                    <td className="p-2">{source.syncStatus}</td>
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
            <CardTitle className="text-base">Generated WikiNodes</CardTitle>
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
