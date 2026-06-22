import { useState } from "react"
import { useSearchParams } from "react-router-dom"

import { ApiErrorNotice } from "@/components/api-error-notice"
import { PageHeader } from "@/components/layout/page-header"
import { RetrievalQueryPanel } from "@/components/retrieval/retrieval-query-panel"
import { RetrievalResultCard } from "@/components/retrieval/retrieval-result-card"
import { useAsyncData } from "@/hooks/use-async-data"
import { searchWikiNodes } from "@/services/retrieval-api-service"
import type { RetrievalQuery } from "@/types/retrieval"

const defaultQuery: RetrievalQuery = {
  query: "洗碗机保修期内维修收费吗？",
  filters: {},
  topK: 5,
}

export function RetrievalTestPage() {
  const [searchParams] = useSearchParams()
  const queryFromRoute = searchParams.get("q")
  const [query, setQuery] = useState<RetrievalQuery>({
    ...defaultQuery,
    query: queryFromRoute ?? defaultQuery.query,
  })
  const [submittedQuery, setSubmittedQuery] = useState(query)
  const { data: results, error } = useAsyncData(() => searchWikiNodes(submittedQuery), [], [submittedQuery])

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Knowledge Retrieval Test" />
      <RetrievalQueryPanel
        value={query}
        onChange={setQuery}
        onSearch={() => setSubmittedQuery(query)}
        onReset={() => {
          setQuery(defaultQuery)
          setSubmittedQuery(defaultQuery)
        }}
      />
      <ApiErrorNotice error={error} />
      <div className="flex flex-col gap-4">
        {results.map((result) => (
          <RetrievalResultCard key={result.node.nodeId} result={result} />
        ))}
      </div>
    </div>
  )
}
