import { useState } from "react"
import { useSearchParams } from "react-router-dom"

import { ApiErrorNotice } from "@/components/api-error-notice"
import { PageHeader } from "@/components/layout/page-header"
import { RetrievalQueryPanel } from "@/components/retrieval/retrieval-query-panel"
import { RetrievalResultCard } from "@/components/retrieval/retrieval-result-card"
import { useAsyncData } from "@/hooks/use-async-data"
import { searchWikiNodes } from "@/services/retrieval-api-service"
import type { RetrievalQuery } from "@/types/retrieval"
import { commonLabels } from "@/utils/display-labels"

const defaultQuery: RetrievalQuery = {
  query: "洗碗机保修期内维修收费吗？",
  filters: {},
  topK: 5,
  debug: false,
}

export function RetrievalTestPage() {
  const [searchParams] = useSearchParams()
  const queryFromRoute = searchParams.get("q")
  const [query, setQuery] = useState<RetrievalQuery>({
    ...defaultQuery,
    query: queryFromRoute ?? defaultQuery.query,
  })
  const [submittedQuery, setSubmittedQuery] = useState(query)
  const { data: results, isLoading, error, reload } = useAsyncData(() => searchWikiNodes(submittedQuery), [], [submittedQuery])

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="检索测试"
        description="Retrieval API 返回知识节点，调试模式仅展示命中的索引片段证据。"
      />
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-md border bg-muted/20 px-3 py-2 text-muted-foreground">
          普通模式：返回 WikiNode 结果，不展示 Index Segment 调试证据。
        </div>
        {query.debug ? (
          <div className="rounded-md border bg-muted/20 px-3 py-2 text-muted-foreground">
            调试模式已开启：下方仅补充 matchedSegments / Index Segment 证据，不改变主结果。
          </div>
        ) : (
          <div className="rounded-md border bg-muted/20 px-3 py-2 text-muted-foreground">
            打开调试模式后才展示索引片段证据。
          </div>
        )}
      </div>
      <RetrievalQueryPanel
        value={query}
        onChange={setQuery}
        onSearch={() => setSubmittedQuery(query)}
        onReset={() => {
          setQuery(defaultQuery)
          setSubmittedQuery(defaultQuery)
        }}
        isSearching={isLoading}
      />
      <ApiErrorNotice error={error} title={commonLabels.searchFailed} onRetry={reload} />
      <div className="flex flex-col gap-4">
        {isLoading ? <p className="text-sm text-muted-foreground">检索中...</p> : null}
        {!isLoading && !error && results.length === 0 ? (
          <p className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">{commonLabels.noMatchedNodes}</p>
        ) : null}
        {!isLoading
          ? results.map((result) => (
              <RetrievalResultCard key={result.node.nodeId} result={result} />
            ))
          : null}
      </div>
    </div>
  )
}
