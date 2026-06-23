import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

import { ApiErrorNotice } from "@/components/api-error-notice"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { RetrievalQueryPanel } from "@/components/retrieval/retrieval-query-panel"
import { RetrievalResultCard } from "@/components/retrieval/retrieval-result-card"
import { RetrievalTracePanel } from "@/components/retrieval/retrieval-trace-panel"
import { useAsyncData } from "@/hooks/use-async-data"
import { buildRetrievalTrace, searchWikiNodes } from "@/services/retrieval-api-service"
import type { RetrievalQuery } from "@/types/retrieval"
import { commonLabels } from "@/utils/display-labels"

const defaultQuery: RetrievalQuery = {
  query: "洗碗机保修期内维修收费吗？",
  filters: {},
  topK: 5,
  retrievalMode: "hybrid",
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
  const traceSteps = buildRetrievalTrace(submittedQuery, results.length)

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Retrieval Test 检索测试"
        description="Validate WikiNode-centered retrieval without generating final answers."
      />
      <Card>
        <CardContent className="grid gap-3 p-4 text-sm text-muted-foreground md:grid-cols-2">
          <p>Retrieval API returns WikiNode objects by default, not vector chunks.</p>
          <p>This platform does not implement a vector database.</p>
          <p>Index Segments are controlled retrieval units generated from WikiNodes before vector-store sync.</p>
          <p>matchedSegments are debug-only retrieval evidence.</p>
        </CardContent>
      </Card>
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
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">Save as Evaluation Case</Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/query-logs">View Query Logs</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/evaluation-cases">View Evaluation Cases</Link>
        </Button>
      </div>
      <RetrievalTracePanel steps={traceSteps} />
      <div className="flex flex-col gap-4" data-testid="retrieval-results">
        {isLoading ? <p className="text-sm text-muted-foreground">检索中...</p> : null}
        {!isLoading && !error && results.length === 0 ? (
          <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground" data-testid="retrieval-empty-state">
            <div className="font-medium text-foreground">{commonLabels.noMatchedNodes}</div>
            <p className="mt-2">Check filters, status, and tags. Published and indexed WikiNodes are the best candidates for retrieval validation.</p>
            <p className="mt-1">This page validates retrieval evidence only; it does not generate a final answer.</p>
          </div>
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
