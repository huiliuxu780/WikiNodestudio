import { Link, useParams, useSearchParams } from "react-router-dom"
import { useMemo, useState, type ReactNode } from "react"

import { ApiErrorNotice } from "@/components/api-error-notice"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getKnowledgeBase } from "@/services/knowledge-base-api-service"
import { importSourceFile, listSources } from "@/services/source-api-service"
import type { SourceImportResult } from "@/types/source-operation"
import { labelFromMap, sourceTypeLabels, syncStatusLabels } from "@/utils/display-labels"
import { useAsyncData } from "@/hooks/use-async-data"

export function KnowledgeBaseImportPage() {
  const { kbId = "" } = useParams()
  const [searchParams] = useSearchParams()
  const requestedSourceId = searchParams.get("sourceId") ?? ""
  const { data: knowledgeBase, error: knowledgeBaseError, reload: reloadKnowledgeBase } = useAsyncData(() => getKnowledgeBase(kbId), null, [kbId])
  const { data: sources, error: sourcesError, isLoading: isLoadingSources, reload: reloadSources } = useAsyncData(() => listSources(), [], [kbId])
  const scopedSources = useMemo(() => sources.filter((source) => source.knowledgeBaseId === kbId), [kbId, sources])
  const [selectedSourceId, setSelectedSourceId] = useState(requestedSourceId)
  const activeSourceId = selectedSourceId || scopedSources[0]?.sourceId || ""
  const activeSource = scopedSources.find((source) => source.sourceId === activeSourceId) ?? scopedSources[0] ?? null
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importStatus, setImportStatus] = useState<"idle" | "running" | "succeeded" | "skipped" | "failed">("idle")
  const [importResult, setImportResult] = useState<SourceImportResult | null>(null)
  const [importError, setImportError] = useState("")

  async function handleImport() {
    if (!activeSource || !selectedFile || importStatus === "running") return

    setImportStatus("running")
    setImportError("")
    setImportResult(null)
    try {
      const result = await importSourceFile(activeSource.sourceId, selectedFile)
      setImportStatus(result.status)
      setImportResult(result)
      setSelectedFile(null)
    } catch {
      setImportStatus("failed")
      setImportError("导入失败，请检查文件格式或后端服务后重试。")
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="导入文件到知识库"
        description="选择 Source，导入本地文件，并生成 Raw Material、Parsed Document 和待审核 WikiNode 建议。"
        actions={<Button variant="outline" asChild><Link to={`/knowledge-bases/${kbId}`}>返回知识库</Link></Button>}
      />
      <ApiErrorNotice error={knowledgeBaseError} title="知识库加载失败" onRetry={reloadKnowledgeBase} />
      <ApiErrorNotice error={sourcesError} title="Source 加载失败" onRetry={reloadSources} />
      {importResult ? (
        <div role="status" className="rounded-md border bg-card px-4 py-3 text-sm">
          <span className="font-medium">导入完成</span>
          <span className="ml-2 text-muted-foreground">
            {importResult.knowledgeBaseId ?? kbId} · {importResult.summary}
          </span>
        </div>
      ) : null}
      {importError ? (
        <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {importError}
        </div>
      ) : null}
      <section className="rounded-md border bg-card">
        <div className="grid gap-0 border-b md:grid-cols-3">
          <ImportMetric label="Knowledge Base" value={knowledgeBase?.name ?? kbId} helper={kbId} />
          <ImportMetric label="默认解析引擎" value={knowledgeBase?.settings.defaultParserEngine ?? "markdown"} />
          <ImportMetric label="默认召回策略" value={knowledgeBase?.settings.defaultRetrievalStrategy ?? "wikinode_first"} />
        </div>
        <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Source</Label>
              <Select value={activeSourceId} onValueChange={setSelectedSourceId} disabled={isLoadingSources || scopedSources.length === 0}>
                <SelectTrigger aria-label="Source">
                  <SelectValue placeholder={isLoadingSources ? "正在加载 Source..." : "选择 Source"} />
                </SelectTrigger>
                <SelectContent>
                  {scopedSources.map((source) => (
                    <SelectItem key={source.sourceId} value={source.sourceId}>{source.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kb-import-file">文件</Label>
              <label
                htmlFor="kb-import-file"
                className="flex min-h-32 cursor-pointer flex-col justify-center rounded-md border border-dashed bg-muted/20 px-4 py-5 text-sm hover:bg-muted/40"
              >
                <span className="font-medium">选择文件</span>
                <span className="mt-1 text-muted-foreground">支持 txt、md、markdown、docx；导入后进入解析结果和 WikiNode 建议评审。</span>
                <span className="mt-3 text-foreground">{selectedFile?.name ?? "尚未选择文件"}</span>
              </label>
              <input
                id="kb-import-file"
                className="sr-only"
                type="file"
                accept=".txt,.md,.markdown,.docx,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                aria-label="选择文件"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" onClick={handleImport} disabled={!activeSource || !selectedFile || importStatus === "running"}>
                {importStatus === "running" ? "导入中..." : "导入并解析"}
              </Button>
              {selectedFile ? <span className="text-sm text-muted-foreground">{selectedFile.name}</span> : null}
            </div>
          </div>
          <div className="rounded-md border bg-background p-4 text-sm">
            <div className="font-medium">当前 Source</div>
            {activeSource ? (
              <div className="mt-3 grid gap-2">
                <div className="font-medium">{activeSource.title}</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{labelFromMap(sourceTypeLabels, activeSource.sourceType)}</Badge>
                  <Badge variant={activeSource.syncStatus === "failed" ? "destructive" : "secondary"}>{labelFromMap(syncStatusLabels, activeSource.syncStatus)}</Badge>
                </div>
                <div className="text-muted-foreground">负责人：{activeSource.owner}</div>
                <div className="text-muted-foreground">Raw Material：{activeSource.rawMaterialCount}</div>
                <Link to={`/sources/${activeSource.sourceId}`} className="font-medium text-primary hover:underline">查看 Source 详情</Link>
              </div>
            ) : (
              <div className="mt-3 text-muted-foreground">该知识库下暂无 Source。</div>
            )}
          </div>
        </div>
      </section>
      {importResult ? <ImportResultPanel result={importResult} /> : null}
    </div>
  )
}

function ImportMetric({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="min-w-0 border-b px-4 py-3 text-sm md:border-b-0 md:border-r md:last:border-r-0">
      <div className="text-muted-foreground">{label}</div>
      <div className="mt-1 truncate font-medium">{value}</div>
      {helper ? <div className="mt-1 truncate text-xs text-muted-foreground">{helper}</div> : null}
    </div>
  )
}

function ImportResultPanel({ result }: { result: SourceImportResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">导入结果</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm md:grid-cols-4">
        <ResultItem label="Raw Material" value={result.rawMaterialId}>
          <Link to={`/raw-materials/${result.rawMaterialId}`} className="font-medium text-primary hover:underline">打开 Raw Material</Link>
        </ResultItem>
        <ResultItem label="Parsed Document" value={result.parsedDocumentId}>
          <Link to={`/raw-materials/${result.rawMaterialId}/parsed-result`} className="font-medium text-primary hover:underline">打开解析结果</Link>
        </ResultItem>
        <ResultItem label="Document Segment" value={`文档片段 ${result.segmentCount} 条`} />
        <ResultItem label="WikiNode 建议" value={result.suggestionId ?? "未生成"}>
          {result.suggestionId ? (
            <Link to={`/draft-wikinode-suggestions/${result.suggestionId}`} className="font-medium text-primary hover:underline">打开 WikiNode 建议</Link>
          ) : null}
        </ResultItem>
      </CardContent>
    </Card>
  )
}

function ResultItem({ label, value, children }: { label: string; value: string; children?: ReactNode }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 break-all font-medium">{value}</div>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  )
}
