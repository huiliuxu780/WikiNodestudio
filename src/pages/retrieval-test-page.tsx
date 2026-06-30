import { useState } from "react"
import { useSearchParams } from "react-router-dom"

import { ApiErrorNotice } from "@/components/api-error-notice"
import { PageHeader } from "@/components/layout/page-header"
import { RetrievalQueryPanel } from "@/components/retrieval/retrieval-query-panel"
import { RetrievalResultCard } from "@/components/retrieval/retrieval-result-card"
import { Button } from "@/components/ui/button"
import { useAsyncData } from "@/hooks/use-async-data"
import { listKnowledgeBases } from "@/services/knowledge-base-api-service"
import { createRetrievalEvaluationCase, listRetrievalLogs, searchWikiNodes } from "@/services/retrieval-api-service"
import type { RetrievalEvaluationCase, RetrievalQuery, RetrievalResult } from "@/types/retrieval"
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
  const knowledgeBaseIdFromRoute = searchParams.get("knowledgeBaseId")
  const [query, setQuery] = useState<RetrievalQuery>({
    ...defaultQuery,
    query: queryFromRoute ?? defaultQuery.query,
    filters: knowledgeBaseIdFromRoute ? { ...defaultQuery.filters, knowledgeBaseId: knowledgeBaseIdFromRoute } : defaultQuery.filters,
  })
  const [submittedQuery, setSubmittedQuery] = useState(query)
  const [results, setResults] = useState<RetrievalResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<Error | null>(null)
  const [logReloadVersion, setLogReloadVersion] = useState(0)
  const [evaluationCase, setEvaluationCase] = useState<RetrievalEvaluationCase | null>(null)
  const [evaluationError, setEvaluationError] = useState<Error | null>(null)
  const [isSavingEvaluation, setIsSavingEvaluation] = useState(false)
  const { data: retrievalLogs, error: logsError, reload: reloadLogs } = useAsyncData(listRetrievalLogs, [], [logReloadVersion])
  const { data: knowledgeBases, error: knowledgeBaseError, reload: reloadKnowledgeBases } = useAsyncData(() => listKnowledgeBases({ status: "active" }), [])

  async function handleSearch() {
    const nextQuery = query
    setSubmittedQuery(nextQuery)
    setEvaluationCase(null)
    setHasSearched(true)
    setIsSearching(true)
    setSearchError(null)
    try {
      const nextResults = await searchWikiNodes(nextQuery)
      setResults(nextResults)
      setLogReloadVersion((version) => version + 1)
    } catch (loadError) {
      setSearchError(loadError instanceof Error ? loadError : new Error("检索失败，请稍后重试"))
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  async function handleSaveEvaluationCase() {
    setIsSavingEvaluation(true)
    setEvaluationError(null)
    try {
      const saved = await createRetrievalEvaluationCase({
        caseId: `eval-${Date.now()}`,
        query: submittedQuery.query,
        filters: submittedQuery.filters,
        topK: submittedQuery.topK,
        expectedNodeIds: results.map((result) => result.node.nodeId),
      })
      setEvaluationCase(saved)
    } catch (saveError) {
      setEvaluationError(saveError instanceof Error ? saveError : new Error("保存评测用例失败，请稍后重试"))
    } finally {
      setIsSavingEvaluation(false)
    }
  }

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
        onSearch={() => void handleSearch()}
        onReset={() => {
          setQuery(defaultQuery)
          setSubmittedQuery(defaultQuery)
          setResults([])
          setHasSearched(false)
          setSearchError(null)
          setEvaluationCase(null)
        }}
        isSearching={isSearching}
        knowledgeBases={knowledgeBases}
      />
      <ApiErrorNotice error={searchError} title={commonLabels.searchFailed} onRetry={() => void handleSearch()} />
      <ApiErrorNotice error={knowledgeBaseError} title="知识库列表加载失败" onRetry={reloadKnowledgeBases} />
      <ApiErrorNotice error={logsError} title="加载查询日志失败" onRetry={reloadLogs} />
      <ApiErrorNotice error={evaluationError} title="保存评测用例失败" />
      <div className="flex flex-col gap-4">
        {isSearching ? <p className="text-sm text-muted-foreground">检索中...</p> : null}
        {hasSearched && !isSearching && !searchError && results.length === 0 ? (
          <p className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">{commonLabels.noMatchedNodes}</p>
        ) : null}
        {!isSearching
          ? results.map((result) => (
              <RetrievalResultCard key={result.node.nodeId} result={result} />
            ))
          : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-md border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium">最近查询日志</h2>
              <p className="text-xs text-muted-foreground">记录问题、返回 WikiNode、命中片段和耗时，仅用于调试证据。</p>
            </div>
            <Button size="sm" variant="outline" onClick={reloadLogs}>刷新</Button>
          </div>
          {retrievalLogs.slice(0, 3).map((log) => (
            <div key={log.logId} className="rounded-md border bg-background p-3 text-sm">
              <div className="mb-1 font-medium">{log.logId}</div>
              <div className="text-muted-foreground">{log.query}</div>
              <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                <span>返回 WikiNode：{log.returnedNodeIds.join("、") || commonLabels.none}</span>
                <span>命中片段：{log.matchedSegmentIds.join("、") || commonLabels.none}</span>
                <span>状态：{log.status === "succeeded" ? "成功" : "失败"} · {log.latencyMs}ms</span>
              </div>
            </div>
          ))}
          {!retrievalLogs.length ? <p className="text-sm text-muted-foreground">暂无查询日志。</p> : null}
        </section>
        <section className="flex flex-col gap-3 rounded-md border bg-card p-4">
          <div>
            <h2 className="text-sm font-medium">评测用例证据</h2>
            <p className="text-xs text-muted-foreground">把当前查询结果保存为最小评测用例，便于后续对比期望 WikiNode 和实际返回结果。</p>
          </div>
          <Button
            variant="outline"
            onClick={handleSaveEvaluationCase}
            disabled={isSavingEvaluation || isSearching || results.length === 0}
          >
            {isSavingEvaluation ? "保存中..." : "保存为评测用例"}
          </Button>
          {evaluationCase ? (
            <div className="rounded-md border bg-background p-3 text-sm">
              <div className="font-medium">{evaluationCase.caseId}</div>
              <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                <span>预期 WikiNode：{evaluationCase.expectedNodeIds.join("、") || commonLabels.none}</span>
                <span>返回 WikiNode：{evaluationCase.runResult.returnedNodeIds.join("、") || commonLabels.none}</span>
                <span>命中片段：{evaluationCase.runResult.matchedSegmentIds.join("、") || commonLabels.none}</span>
                <span>{evaluationCase.runResult.summary}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">检索后可保存当前结果作为评测用例证据。</p>
          )}
        </section>
      </div>
    </div>
  )
}
