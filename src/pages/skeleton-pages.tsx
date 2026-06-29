import { Link, useParams } from "react-router-dom"
import { useState, type ReactNode } from "react"
import type { KnowledgeMetadata, KnowledgeRelation } from "@/types/wiki"

import { mockIndexSegments } from "@/data/mock-index-segments"
import { mockKnowledgeBases } from "@/data/mock-knowledge-bases"
import { mockQualityIssues } from "@/data/mock-quality-issues"
import { mockRetrievalLogs } from "@/data/mock-retrieval"
import { mockUsers } from "@/data/mock-users"
import { mockWikiNodes } from "@/data/mock-wiki-nodes"
import { ApiErrorNotice } from "@/components/api-error-notice"
import { PageHeader } from "@/components/layout/page-header"
import { QualityIssueConsole } from "@/components/quality/quality-issue-console"
import { SegmentDebugPanel } from "@/components/segments/segment-debug-panel"
import { SegmentStrategyCard } from "@/components/segments/segment-strategy-card"
import { IndexSegmentTable } from "@/components/segments/index-segment-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { LinkList } from "@/components/wiki/link-list"
import { useAsyncData } from "@/hooks/use-async-data"
import { listIndexSegments } from "@/services/index-segment-api-service"
import { listParserProfiles } from "@/services/parser-profile-api-service"
import { listRetrievalEvaluationCases, listRetrievalLogs } from "@/services/retrieval-api-service"
import { getWikiNodeById } from "@/services/wiki-node-api-service"
import {
  acceptDraftWikiNodeSuggestion,
  getRawMaterial,
  getDraftWikiNodeSuggestion,
  getSource,
  generateDraftWikiNodeSuggestion,
  listDraftWikiNodeSuggestions,
  listDraftWikiNodeSuggestionsForParsedDocument,
  listDraftWikiNodeSuggestionsForRawMaterial,
  listParsedDocumentsForRawMaterial,
  listParsedDocumentSegments,
  listRawMaterials,
  listRawMaterialsForSource,
  listSourceOperations,
  listSourceOperationsForRawMaterial,
  listSourceOperationsForSource,
  rejectDraftWikiNodeSuggestion,
  retryDraftWikiNodeSuggestion,
  runSourceIngestion,
} from "@/services/source-api-service"
import type { IndexSegment } from "@/types/index-segment"
import type { ParserProfile } from "@/types/parser-profile"
import type { DraftWikiNodeSuggestion } from "@/types/draft-wikinode-suggestion"
import type { ParsedDocument, ParsedDocumentSegment, RawMaterial } from "@/types/raw-material"
import type { RetrievalEvaluationCase, RetrievalLog } from "@/types/retrieval"
import type { SourceItem } from "@/types/source"
import type { SourceOperation } from "@/types/source-operation"
import {
  contentFormatLabels,
  draftWikiNodeSuggestionConflictLabels,
  draftWikiNodeSuggestionStatusLabels,
  indexStatusLabels,
  labelFromMap,
  healthLabels,
  locatorTypeLabels,
  metadataLabels,
  nodeTypeLabels,
  objectTypeLabels,
  parseStatusLabels,
  rawMaterialTypeLabels,
  relationCandidateSourceLabels,
  relationTypeLabels,
  sourceTypeLabels,
  sourceOperationStatusLabels,
  sourceOperationTypeLabels,
  storageProviderLabels,
  statusLabels,
  subtypeLabels,
  syncStatusLabels,
  userRoleLabels,
  userStatusLabels,
} from "@/utils/display-labels"
import { getIncomingLinks } from "@/utils/link-parser"

type SuggestionStatusFilter = "all" | DraftWikiNodeSuggestion["status"]
type SuggestionConflictFilter = "all" | DraftWikiNodeSuggestion["conflictStatus"]

const routeCards = {
  同步任务: ["待同步来源", "最近同步时间", "关联 Raw Material"],
  同步日志: ["来源名称", "处理结果", "关联快照"],
  Backlinks: ["保修期内维修服务政策", "收费政策", "人为损坏判定规则"],
  影响分析: ["发布影响", "断链影响", "Index Segment 影响"],
  外部向量库同步: ["阿里云配置", "火山引擎配置", "试运行同步状态"],
  索引任务: ["已索引", "待更新", "索引失败"],
  召回调试: ["查询链路", "命中的 Index Segment", "WikiNode 结果映射"],
  "Retrieval API 文档": ["POST /api/knowledge/retrieve", "WikiNode 结果", "调试模式 matchedSegments"],
  查询日志: mockRetrievalLogs.map((log) => `${log.query} -> ${log.returnedNodeIds[0] ?? "未命中"}`),
  评测用例: ["保修收费", "人为损坏", "预约改约"],
  标签与元数据: ["保修", "收费", "洗碗机", "人为损坏"],
  节点类型: ["policy", "procedure", "guide", "fee_rule"].map((value) => labelFromMap(nodeTypeLabels, value)),
  元数据字段: ["businessDomain", "brand", "productCategory", "securityLevel"].map((value) => labelFromMap(metadataLabels, value)),
  质量问题: mockQualityIssues.map((issue) => `${issue.issueId} ${issue.nodeTitle}`),
  召回评测: ["TopK 一致性", "WikiNode 命中精度", "片段证据质量"],
  解析引擎: ["Markdown 解析器", "表格解析器", "图片引用"],
  存储引擎: ["原始材料快照", "解析文档存储", "来源证据"],
  向量模型配置: ["外部向量库", "Index Segment", "同步配置"],
  系统健康: ["前端可用性", "API 连通性", "索引任务状态"],
  用户: mockUsers.map((user) => `${user.name} ${labelFromMap(userRoleLabels, user.role)} ${labelFromMap(userStatusLabels, user.status)}`),
  角色: ["知识负责人", "编辑者", "审核员", "查看者"],
  权限: ["读取", "编辑", "审核", "管理"],
  审计日志: ["WikiNode 已更新", "Index Segment 已生成", "召回已测试"],
}

export function KnowledgeBaseListPage() {
  return (
    <PageScaffold title="知识库" description="管理以 WikiNode 为中心的知识库和召回健康度。">
      <div className="grid gap-4 lg:grid-cols-3">
        {mockKnowledgeBases.map((kb) => (
          <Card key={kb.kbId}>
            <CardHeader>
              <CardTitle className="text-base">
                <Link to={`/knowledge-bases/${kb.kbId}`} className="hover:underline">{kb.name}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>{kb.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{kb.businessDomain}</Badge>
                <Badge variant="outline">{kb.wikiNodeCount} 个 WikiNode</Badge>
                <Badge variant="outline">{kb.sourceCount} 个知识来源</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageScaffold>
  )
}

export function KnowledgeBaseDetailPage() {
  const { kbId } = useParams()
  const kb = mockKnowledgeBases.find((item) => item.kbId === kbId) ?? mockKnowledgeBases[0]

  return (
    <PageScaffold title={`${kb.name} 知识库详情`} description={kb.description}>
      <SummaryGrid items={[
        ["业务域", kb.businessDomain],
        ["WikiNode 数", String(kb.wikiNodeCount)],
        ["知识来源数", String(kb.sourceCount)],
        ["索引健康度", labelFromMap(healthLabels, kb.indexHealth ?? "warning")],
      ]} />
    </PageScaffold>
  )
}

export function KnowledgeBaseSettingsPage() {
  return (
    <PageScaffold title="知识库设置" description="配置知识库的召回、索引和默认治理口径。">
      <SummaryGrid items={[
        ["默认返回对象", "WikiNode"],
        ["调试证据", "matchedSegments"],
        ["向量存储", "外部向量库配置"],
        ["审核口径", "人工评审"],
      ]} />
    </PageScaffold>
  )
}

export function SourceDetailPage() {
  const { sourceId } = useParams()
  const activeSourceId = sourceId ?? ""
  const {
    data: source,
    error: sourceError,
    isLoading: isSourceLoading,
    reload: reloadSource,
  } = useAsyncData<SourceItem | null>(() => activeSourceId ? getSource(activeSourceId) : Promise.resolve(null), null, [activeSourceId])
  const {
    data: relatedRawMaterials,
    error: rawMaterialsError,
    isLoading: isRawMaterialsLoading,
    reload: reloadRawMaterials,
  } = useAsyncData(() => activeSourceId ? listRawMaterialsForSource(activeSourceId) : Promise.resolve([]), [], [activeSourceId])
  const {
    data: operations,
    error: operationsError,
    isLoading: isOperationsLoading,
    reload: reloadOperations,
  } = useAsyncData(() => activeSourceId ? listSourceOperationsForSource(activeSourceId) : Promise.resolve([]), [], [activeSourceId])
  const [ingestionStatus, setIngestionStatus] = useState<"idle" | "running" | "succeeded" | "skipped" | "failed">("idle")
  const [ingestionSummary, setIngestionSummary] = useState<string | null>(null)
  const knowledgeBaseId = source?.knowledgeBaseId ?? relatedRawMaterials[0]?.knowledgeBaseId ?? "未绑定"

  async function handleRunIngestion() {
    if (!activeSourceId || ingestionStatus === "running") return

    setIngestionStatus("running")
    setIngestionSummary("正在从已有 Parsed Document 生成待审核 WikiNode 建议...")
    try {
      const result = await runSourceIngestion(activeSourceId, {
        requestedBy: "ui",
      })
      setIngestionStatus(result.status)
      setIngestionSummary(result.summary)
      await Promise.all([reloadOperations(), reloadRawMaterials(), reloadSource()])
    } catch {
      setIngestionStatus("failed")
      setIngestionSummary("生成 WikiNode 建议失败，请检查 API 或稍后重试。")
    }
  }

  return (
    <PageScaffold
      title="知识来源详情"
      description={source ? `${source.title}。查看来源配置、快照和生成的 WikiNode。` : "查看 Source 到 Raw Material 的证据链。"}
      actions={source?.knowledgeBaseId ? (
        <Button asChild>
          <Link to={`/knowledge-bases/${source.knowledgeBaseId}/import?sourceId=${source.sourceId}`}>导入文件</Link>
        </Button>
      ) : null}
    >
      <ApiErrorNotice error={sourceError} onRetry={reloadSource} />
      <ApiErrorNotice error={rawMaterialsError} onRetry={reloadRawMaterials} />
      <ApiErrorNotice error={operationsError} onRetry={reloadOperations} />
      {isSourceLoading ? <LoadingBlock text="正在加载知识来源..." /> : null}
      {source ? (
        <SummaryGrid items={[
          ["来源类型", labelFromMap(sourceTypeLabels, source.sourceType)],
          ["Knowledge Base", knowledgeBaseId],
          ["负责人", source.owner],
          ["同步状态", labelFromMap(syncStatusLabels, source.syncStatus)],
          ["Raw Material", `${source.rawMaterialCount} 个`],
          ["生成 WikiNode", String(source.generatedNodes)],
        ]} />
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">WikiNode 建议生成</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground">扫描当前 Source 下已有 Parsed Document，生成待审核 Draft WikiNode Suggestion。</p>
            {ingestionSummary ? (
              <p className={ingestionStatus === "failed" ? "text-destructive" : "text-foreground"}>{ingestionSummary}</p>
            ) : null}
          </div>
          <Button type="button" onClick={handleRunIngestion} disabled={!activeSourceId || ingestionStatus === "running"} className="w-fit">
            {ingestionStatus === "running" ? "生成中..." : "生成 WikiNode 建议"}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">关联 Raw Material</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {isRawMaterialsLoading ? (
            <LoadingBlock text="正在加载 Raw Material..." />
          ) : relatedRawMaterials.length === 0 ? (
            <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              当前 Source 暂无关联 Raw Material。
            </div>
          ) : relatedRawMaterials.map((raw) => (
            <Link key={raw.rawMaterialId} to={`/raw-materials/${raw.rawMaterialId}`} className="rounded-md border p-3 text-sm hover:bg-muted/40">
              <div className="font-medium">{raw.title}</div>
              <div className="mt-1 text-muted-foreground">{raw.rawMaterialId} · {rawMaterialDisplayType(raw)} · {labelFromMap(parseStatusLabels, raw.parseStatus)}</div>
            </Link>
          ))}
        </CardContent>
      </Card>
      <SimpleList items={[
        "来源配置",
        "Raw Material 快照",
        "生成的 WikiNode",
      ]} />
      <SourceOperationLogPanel operations={operations} isLoading={isOperationsLoading} />
    </PageScaffold>
  )
}

export function RawMaterialListPage() {
  const {
    data: rawMaterials,
    error,
    isLoading,
    reload,
  } = useAsyncData(listRawMaterials, [])

  return (
    <PageScaffold title="原始材料" description="查看 Source 进入 WikiNode 标准化之前保留的原始快照。">
      <ApiErrorNotice error={error} onRetry={reload} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">快照清单</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 p-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <LoadingBlock text="正在加载 Raw Material..." />
          ) : rawMaterials.length === 0 ? (
            <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">暂无 Raw Material。</div>
          ) : rawMaterials.map((item) => (
            <Link key={item.rawMaterialId} to={`/raw-materials/${item.rawMaterialId}`} className="rounded-md border bg-muted/20 px-3 py-2 text-sm hover:bg-muted/40">
              <div className="font-medium">{item.title}</div>
              <div className="mt-1 text-muted-foreground">{item.rawMaterialId} · {rawMaterialDisplayType(item)} · {labelFromMap(parseStatusLabels, item.parseStatus)}</div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </PageScaffold>
  )
}

export function RawMaterialDetailPage() {
  const { rawMaterialId } = useParams()
  const activeRawMaterialId = rawMaterialId ?? ""
  const {
    data: raw,
    error: rawError,
    isLoading: isRawLoading,
    reload: reloadRaw,
  } = useAsyncData<RawMaterial | null>(() => activeRawMaterialId ? getRawMaterial(activeRawMaterialId) : Promise.resolve(null), null, [activeRawMaterialId])
  const {
    data: source,
    error: sourceError,
    reload: reloadSource,
  } = useAsyncData<SourceItem | null>(() => raw?.sourceId ? getSource(raw.sourceId) : Promise.resolve(null), null, [raw?.sourceId])
  const {
    data: parsedDocuments,
    error: parsedDocumentsError,
    reload: reloadParsedDocuments,
  } = useAsyncData(() => activeRawMaterialId ? listParsedDocumentsForRawMaterial(activeRawMaterialId) : Promise.resolve([]), [], [activeRawMaterialId])
  const {
    data: operations,
    error: operationsError,
    isLoading: isOperationsLoading,
    reload: reloadOperations,
  } = useAsyncData(() => activeRawMaterialId ? listSourceOperationsForRawMaterial(activeRawMaterialId) : Promise.resolve([]), [], [activeRawMaterialId])
  const {
    data: suggestions,
    error: suggestionsError,
    isLoading: isSuggestionsLoading,
    reload: reloadSuggestions,
  } = useAsyncData(() => activeRawMaterialId ? listDraftWikiNodeSuggestionsForRawMaterial(activeRawMaterialId) : Promise.resolve([]), [], [activeRawMaterialId])
  const knowledgeBaseId = raw?.knowledgeBaseId ?? source?.knowledgeBaseId ?? "未绑定"

  return (
    <PageScaffold title="原始材料详情" description={raw?.title ?? "查看 Raw Material 到 Parsed Document 的证据链。"}>
      <ApiErrorNotice error={rawError} onRetry={reloadRaw} />
      <ApiErrorNotice error={sourceError} onRetry={reloadSource} />
      <ApiErrorNotice error={parsedDocumentsError} onRetry={reloadParsedDocuments} />
      <ApiErrorNotice error={operationsError} onRetry={reloadOperations} />
      <ApiErrorNotice error={suggestionsError} onRetry={reloadSuggestions} />
      {isRawLoading ? <LoadingBlock text="正在加载 Raw Material..." /> : null}
      {raw ? (
        <SummaryGrid items={[
          ["材料类型", rawMaterialDisplayType(raw)],
          ["Knowledge Base", knowledgeBaseId],
          ["来源版本", raw.sourceVersion ?? "无"],
          ["存储位置", labelFromMap(storageProviderLabels, raw.storageProvider)],
          ["解析状态", labelFromMap(parseStatusLabels, raw.parseStatus)],
          ["Parsed Document", `${raw.parsedDocumentCount} 个`],
        ]} />
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">关联 Source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {source ? (
            <Link to={`/sources/${source.sourceId}`} className="block rounded-md border p-3 hover:bg-muted/40">
              <div className="font-medium">{source.title}</div>
              <div className="mt-1 text-muted-foreground">{labelFromMap(sourceTypeLabels, source.sourceType)} · {labelFromMap(syncStatusLabels, source.syncStatus)}</div>
            </Link>
          ) : (
            <div className="rounded-md border border-dashed p-3 text-muted-foreground">未找到关联 Source。</div>
          )}
          {raw && parsedDocuments.length > 0 ? (
            <Link to={`/raw-materials/${raw.rawMaterialId}/parsed-result`} className="inline-flex text-sm font-medium text-primary hover:underline">
              查看解析结果
            </Link>
          ) : (
            <div className="text-muted-foreground">尚未生成 Parsed Document。</div>
          )}
        </CardContent>
      </Card>
      <SimpleList items={[
        "材料元数据",
        "解析状态",
        "来源证据范围",
      ]} />
      <DraftWikiNodeSuggestionPanel suggestions={suggestions} isLoading={isSuggestionsLoading} mode="summary" />
      <SourceOperationLogPanel operations={operations} isLoading={isOperationsLoading} />
    </PageScaffold>
  )
}

export function ParsedResultPreviewPage() {
  const { rawMaterialId } = useParams()
  const activeRawMaterialId = rawMaterialId ?? ""
  const {
    data: raw,
    error: rawError,
    reload: reloadRaw,
  } = useAsyncData<RawMaterial | null>(() => activeRawMaterialId ? getRawMaterial(activeRawMaterialId) : Promise.resolve(null), null, [activeRawMaterialId])
  const {
    data: parsedDocuments,
    error: parsedDocumentsError,
    isLoading: isParsedDocumentsLoading,
    reload: reloadParsedDocuments,
  } = useAsyncData(() => activeRawMaterialId ? listParsedDocumentsForRawMaterial(activeRawMaterialId) : Promise.resolve([]), [], [activeRawMaterialId])
  const parsedDocument = parsedDocuments[0] ?? null
  const {
    data: source,
    error: sourceError,
    reload: reloadSource,
  } = useAsyncData<SourceItem | null>(() => raw?.sourceId ? getSource(raw.sourceId) : Promise.resolve(null), null, [raw?.sourceId])
  const {
    data: suggestions,
    error: suggestionsError,
    isLoading: isSuggestionsLoading,
    reload: reloadSuggestions,
  } = useAsyncData(() => parsedDocument?.parsedDocumentId ? listDraftWikiNodeSuggestionsForParsedDocument(parsedDocument.parsedDocumentId) : Promise.resolve([]), [], [parsedDocument?.parsedDocumentId])
  const {
    data: parsedDocumentSegments,
    error: parsedDocumentSegmentsError,
    isLoading: isParsedDocumentSegmentsLoading,
    reload: reloadParsedDocumentSegments,
  } = useAsyncData(() => parsedDocument?.parsedDocumentId ? listParsedDocumentSegments(parsedDocument.parsedDocumentId) : Promise.resolve([]), [], [parsedDocument?.parsedDocumentId])
  const [generationSummary, setGenerationSummary] = useState<string | null>(null)
  const [generationStatus, setGenerationStatus] = useState<"idle" | "running" | "succeeded" | "skipped" | "failed">("idle")
  const canGenerateSuggestion = Boolean(parsedDocument) && suggestions.length === 0
  const knowledgeBaseId = parsedDocument?.knowledgeBaseId ?? raw?.knowledgeBaseId ?? source?.knowledgeBaseId ?? "未绑定"

  async function handleGenerateSuggestion() {
    if (!parsedDocument || generationStatus === "running") return

    setGenerationStatus("running")
    setGenerationSummary("生成中...")
    try {
      const result = await generateDraftWikiNodeSuggestion(parsedDocument.parsedDocumentId, {
        conversionProfile: parsedDocument.parserProfile,
        idempotencyKey: `ui-${parsedDocument.parsedDocumentId}`,
      })
      setGenerationStatus(result.status)
      setGenerationSummary(result.summary)
      await reloadSuggestions()
    } catch {
      setGenerationStatus("failed")
      setGenerationSummary("生成 WikiNode 建议失败，请稍后重试。")
    }
  }

  return (
    <PageScaffold title="解析结果预览" description="查看进入 WikiNode 标准化之前的内容形态和来源证据。">
      <ApiErrorNotice error={rawError} onRetry={reloadRaw} />
      <ApiErrorNotice error={parsedDocumentsError} onRetry={reloadParsedDocuments} />
      <ApiErrorNotice error={sourceError} onRetry={reloadSource} />
      <ApiErrorNotice error={suggestionsError} onRetry={reloadSuggestions} />
      <ApiErrorNotice error={parsedDocumentSegmentsError} onRetry={reloadParsedDocumentSegments} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parsed Document 阶段</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <Badge variant="outline">标准化预览</Badge>
            {parsedDocument ? <p className="font-medium text-foreground">{parsedDocument.title}</p> : null}
            <p className="font-medium text-foreground">{"Knowledge Base -> Source -> Raw Material -> Parsed Document"}</p>
            <p>Knowledge Base</p>
            <p className="font-medium text-foreground">{knowledgeBaseId}</p>
            <p>Parsed Document 是 Raw Material 解析后的标准化内容，还不是最终 WikiNode。</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">标准化内容结构</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{parsedDocument ? labelFromMap(contentFormatLabels, parsedDocument.contentFormat) : "标题层级、段落、表格、图片引用和抽取元数据会在这里预览。"}</p>
            <p>后续转换为 WikiNode 前仍需人工治理。</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">可回溯证据</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{source?.title ?? "未知 Source"} / {raw?.title ?? "未知 Raw Material"}</p>
            <p>用于核对 Source、Raw Material 和 Parsed Document 的证据链。</p>
          </CardContent>
        </Card>
      </div>
      {isParsedDocumentsLoading ? <LoadingBlock text="正在加载 Parsed Document..." /> : null}
      {parsedDocument ? <ParsedDocumentPreview parsedDocument={parsedDocument} /> : null}
      {parsedDocument ? (
        <ParsedDocumentSegmentPanel segments={parsedDocumentSegments} isLoading={isParsedDocumentSegmentsLoading} />
      ) : null}
      {parsedDocument ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">WikiNode 建议生成</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-muted-foreground">从当前 Parsed Document 生成一个待审核 WikiNode 建议。</p>
              {generationSummary ? (
                <p className={generationStatus === "failed" ? "text-destructive" : "text-foreground"}>{generationSummary}</p>
              ) : suggestions.length > 0 ? (
                <p className="text-muted-foreground">该 Parsed Document 已有待审核 WikiNode 建议。</p>
              ) : null}
            </div>
            <Button
              type="button"
              onClick={handleGenerateSuggestion}
              disabled={!canGenerateSuggestion || generationStatus === "running"}
              className="w-fit"
            >
              {generationStatus === "running" ? "生成中..." : suggestions.length > 0 ? "已有 WikiNode 建议" : "生成 WikiNode 建议"}
            </Button>
          </CardContent>
        </Card>
      ) : null}
      <DraftWikiNodeSuggestionPanel suggestions={suggestions} isLoading={isSuggestionsLoading} mode="detail" />
      <SimpleList items={[
        "Parsed Document 是解析后的标准化内容预览。",
        "内容结构用于后续 WikiNode 建议评审。",
        "来源证据用于回溯原始材料。",
      ]} />
      <SimpleList items={["标题层级", "段落来源证据", "表格抽取预览", "图片引用"]} />
    </PageScaffold>
  )
}

export function DraftWikiNodeSuggestionDetailPage() {
  const { suggestionId } = useParams()
  const activeSuggestionId = suggestionId ?? ""
  const [acceptNote, setAcceptNote] = useState("")
  const [acceptFeedback, setAcceptFeedback] = useState("")
  const [acceptError, setAcceptError] = useState("")
  const [acceptedNodeId, setAcceptedNodeId] = useState("")
  const [isAccepting, setIsAccepting] = useState(false)
  const [reviewNote, setReviewNote] = useState("")
  const [reviewFeedback, setReviewFeedback] = useState("")
  const [reviewError, setReviewError] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)
  const [retryNote, setRetryNote] = useState("")
  const [retryFeedback, setRetryFeedback] = useState("")
  const [retryError, setRetryError] = useState("")
  const [replacementSuggestionId, setReplacementSuggestionId] = useState("")
  const [isRetrying, setIsRetrying] = useState(false)
  const {
    data: suggestion,
    error,
    isLoading,
    reload,
  } = useAsyncData<DraftWikiNodeSuggestion | null>(() => activeSuggestionId ? getDraftWikiNodeSuggestion(activeSuggestionId) : Promise.resolve(null), null, [activeSuggestionId])

  const canReviewSuggestion = suggestion ? ["draft", "needs_review"].includes(suggestion.status) : false
  const canAcceptSuggestion = canReviewSuggestion && suggestion?.conflictStatus === "none"
  const canRetrySuggestion = suggestion ? ["draft", "needs_review", "rejected"].includes(suggestion.status) : false
  const linkedAcceptedNodeId = acceptedNodeId || (suggestion?.status === "accepted" ? suggestion.matchedWikiNodeIds[0] ?? "" : "")
  const linkedReplacementSuggestionId = replacementSuggestionId || (suggestion?.status === "superseded" ? suggestion.matchedSuggestionIds[0] ?? "" : "")

  async function handleAcceptSuggestion() {
    if (!activeSuggestionId) return
    const cleanAcceptNote = acceptNote.trim()
    if (!cleanAcceptNote) {
      setAcceptError("采纳说明不能为空。")
      setAcceptFeedback("")
      return
    }

    setIsAccepting(true)
    setAcceptError("")
    setAcceptFeedback("")
    try {
      const result = await acceptDraftWikiNodeSuggestion(activeSuggestionId, {
        reviewNote: cleanAcceptNote,
      })
      setAcceptFeedback(result.summary)
      setAcceptedNodeId(result.nodeId ?? "")
      setAcceptNote("")
      await reload()
    } catch {
      setAcceptError("采纳 WikiNode 建议失败，请稍后重试。")
    } finally {
      setIsAccepting(false)
    }
  }

  async function handleRejectSuggestion() {
    if (!activeSuggestionId) return
    const cleanReviewNote = reviewNote.trim()
    if (!cleanReviewNote) {
      setReviewError("拒绝原因不能为空。")
      setReviewFeedback("")
      return
    }

    setIsRejecting(true)
    setReviewError("")
    setReviewFeedback("")
    try {
      const result = await rejectDraftWikiNodeSuggestion(activeSuggestionId, {
        reviewNote: cleanReviewNote,
      })
      setReviewFeedback(result.summary)
      setReviewNote("")
      await reload()
    } catch {
      setReviewError("拒绝 WikiNode 建议失败，请稍后重试。")
    } finally {
      setIsRejecting(false)
    }
  }

  async function handleRetrySuggestion() {
    if (!activeSuggestionId) return
    const cleanRetryNote = retryNote.trim()
    if (!cleanRetryNote) {
      setRetryError("重新生成原因不能为空。")
      setRetryFeedback("")
      return
    }

    setIsRetrying(true)
    setRetryError("")
    setRetryFeedback("")
    try {
      const result = await retryDraftWikiNodeSuggestion(activeSuggestionId, {
        reviewNote: cleanRetryNote,
      })
      setRetryFeedback(result.summary)
      setReplacementSuggestionId(result.replacementSuggestionId ?? "")
      setRetryNote("")
      await reload()
    } catch {
      setRetryError("重新生成 WikiNode 建议失败，请稍后重试。")
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <PageScaffold title="WikiNode 建议详情" description="查看 Draft WikiNode Suggestion，并处理单条采纳、拒绝或重新生成。">
      <ApiErrorNotice error={error} onRetry={reload} />
      {isLoading ? <LoadingBlock text="正在加载 WikiNode 建议..." /> : null}
      {suggestion ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">评审路径</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">Parsed Document → Draft WikiNode Suggestion → Review Decision</p>
              <p className="rounded-md border bg-muted/20 p-3 text-muted-foreground">
                评审重点包括标题、Knowledge Object 类型、来源证据、关系候选和冲突状态。
              </p>
              <Link className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline" to="/draft-wikinode-suggestions">
                回到建议评审
              </Link>
            </CardContent>
          </Card>
          <SummaryGrid items={[
            ["建议标题", suggestion.title],
            ["状态", labelFromMap(draftWikiNodeSuggestionStatusLabels, suggestion.status)],
            ["Knowledge Object", labelFromMap(objectTypeLabels, suggestion.objectType)],
            ["业务子类型", suggestion.subtype ? labelFromMap(subtypeLabels, suggestion.subtype) : "无"],
            ["来源证据", `${suggestion.sourceRefCount} 条`],
            ["关系候选", `${suggestion.relationCandidateCount} 条`],
            ["冲突状态", labelFromMap(draftWikiNodeSuggestionConflictLabels, suggestion.conflictStatus)],
            ["可信度", formatConfidence(suggestion.confidence)],
            ["Source Operation", suggestion.operationId],
          ]} />
          <Card>
            <CardContent className="space-y-3 p-4 text-sm text-muted-foreground">
              <p>采纳会进入草稿 WikiNode，并保留来源证据；拒绝或重新生成会更新建议审核状态和替代关系。</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-md border px-2 py-1">Source {suggestion.sourceId}</span>
                <span className="rounded-md border px-2 py-1">Raw Material {suggestion.rawMaterialId}</span>
                <span className="rounded-md border px-2 py-1">Parsed Document {suggestion.parsedDocumentId}</span>
                <span className="rounded-md border px-2 py-1">Source Operation {suggestion.operationId}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">审核处理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {canReviewSuggestion ? (
                <>
                  {canAcceptSuggestion ? (
                    <div className="space-y-2 rounded-md border p-3">
                      <Label htmlFor="draft-wikinode-suggestion-accept-note">采纳说明</Label>
                      <Textarea
                        id="draft-wikinode-suggestion-accept-note"
                        value={acceptNote}
                        onChange={(event) => setAcceptNote(event.target.value)}
                        placeholder="说明为什么可以进入草稿 WikiNode。"
                      />
                      <Button type="button" onClick={handleAcceptSuggestion} disabled={isAccepting}>
                        {isAccepting ? "正在采纳..." : "采纳为草稿 WikiNode"}
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed p-3 text-muted-foreground">
                      存在冲突，不能直接采纳为 WikiNode。
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="draft-wikinode-suggestion-review-note">拒绝原因</Label>
                    <Textarea
                      id="draft-wikinode-suggestion-review-note"
                      value={reviewNote}
                      onChange={(event) => setReviewNote(event.target.value)}
                      placeholder="说明为什么暂不进入 WikiNode。"
                    />
                  </div>
                  <Button type="button" onClick={handleRejectSuggestion} disabled={isRejecting}>
                    {isRejecting ? "正在拒绝..." : "拒绝建议"}
                  </Button>
                </>
              ) : (
                <div className="rounded-md border border-dashed p-3 text-muted-foreground">
                  当前状态为{labelFromMap(draftWikiNodeSuggestionStatusLabels, suggestion.status)}，不能继续采纳或拒绝。
                </div>
              )}
              {linkedAcceptedNodeId ? (
                <Link className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline" to={`/wiki-nodes/${linkedAcceptedNodeId}`}>
                  打开草稿 WikiNode
                </Link>
              ) : null}
              {canRetrySuggestion ? (
                <div className="space-y-2 rounded-md border p-3">
                  <Label htmlFor="draft-wikinode-suggestion-retry-note">重新生成原因</Label>
                  <Textarea
                    id="draft-wikinode-suggestion-retry-note"
                    value={retryNote}
                    onChange={(event) => setRetryNote(event.target.value)}
                    placeholder="说明为什么需要基于同一 Parsed Document 重新生成建议。"
                  />
                  <Button type="button" variant="outline" onClick={handleRetrySuggestion} disabled={isRetrying}>
                    {isRetrying ? "正在重新生成..." : "重新生成建议"}
                  </Button>
                </div>
              ) : null}
              {linkedReplacementSuggestionId ? (
                <Link className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline" to={`/draft-wikinode-suggestions/${linkedReplacementSuggestionId}`}>
                  打开新建议
                </Link>
              ) : null}
              {suggestion.reviewNote ? (
                <div className="rounded-md border bg-muted/20 p-3 text-muted-foreground">
                  当前审核备注：{suggestion.reviewNote}
                </div>
              ) : null}
              {acceptFeedback ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
                  {acceptFeedback}
                </div>
              ) : null}
              {reviewFeedback ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
                  {reviewFeedback}
                </div>
              ) : null}
              {retryFeedback ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
                  {retryFeedback}
                </div>
              ) : null}
              {acceptError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-destructive">
                  {acceptError}
                </div>
              ) : null}
              {reviewError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-destructive">
                  {reviewError}
                </div>
              ) : null}
              {retryError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-destructive">
                  {retryError}
                </div>
              ) : null}
            </CardContent>
          </Card>
          <DraftWikiNodeSuggestionPanel suggestions={[suggestion]} isLoading={false} mode="detail" showReviewOutcome={false} />
        </>
      ) : null}
    </PageScaffold>
  )
}

export function DraftWikiNodeSuggestionReviewConsolePage() {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<SuggestionStatusFilter>("all")
  const [conflictFilter, setConflictFilter] = useState<SuggestionConflictFilter>("all")
  const {
    data: suggestions,
    error,
    isLoading,
    reload,
  } = useAsyncData(() => listDraftWikiNodeSuggestions(), [], [])

  const normalizedQuery = query.trim().toLowerCase()
  const filteredSuggestions = suggestions.filter((suggestion) => {
    const matchesStatus = statusFilter === "all" || suggestion.status === statusFilter
    const matchesConflict = conflictFilter === "all" || suggestion.conflictStatus === conflictFilter
    const matchesQuery = !normalizedQuery || [
      suggestion.title,
      suggestion.suggestionId,
      suggestion.parsedDocumentId,
      suggestion.rawMaterialId,
      suggestion.sourceId,
      suggestion.operationId,
      suggestion.subtype ?? "",
    ].some((value) => value.toLowerCase().includes(normalizedQuery))
    return matchesStatus && matchesConflict && matchesQuery
  })

  const activeCount = suggestions.filter((suggestion) => ["draft", "needs_review"].includes(suggestion.status)).length
  const acceptedCount = suggestions.filter((suggestion) => suggestion.status === "accepted").length
  const supersededCount = suggestions.filter((suggestion) => suggestion.status === "superseded").length

  function resetFilters() {
    setQuery("")
    setStatusFilter("all")
    setConflictFilter("all")
  }

  return (
    <PageScaffold
      title="WikiNode 建议评审"
      description="按状态、冲突和来源证据检查 Draft WikiNode Suggestion 的完整评审生命周期。"
    >
      <ApiErrorNotice error={error} onRetry={reload} />
      <SummaryGrid items={[
        ["全部建议", String(suggestions.length)],
        ["待处理", String(activeCount)],
        ["已采纳", String(acceptedCount)],
        ["已替换", String(supersededCount)],
      ]} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">评审工作台</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Source → Raw Material → Parsed Document → Source Operation → Draft WikiNode Suggestion → 评审决策
          </p>
          <div className="rounded-md border bg-muted/20 p-3 text-muted-foreground">
            从来源证据进入建议评审，重点查看建议状态、冲突状态、证据追踪和替代关系。
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">评审筛选</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_180px_auto]">
          <div className="space-y-1">
            <Label htmlFor="draft-wikinode-suggestion-search">搜索 WikiNode 建议</Label>
            <Input
              id="draft-wikinode-suggestion-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="标题、Source、Raw Material、Parsed Document"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="draft-wikinode-suggestion-status-filter">建议状态</Label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SuggestionStatusFilter)}>
              <SelectTrigger id="draft-wikinode-suggestion-status-filter" aria-label="建议状态" className="w-full">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="draft">待审核</SelectItem>
                <SelectItem value="needs_review">需要复核</SelectItem>
                <SelectItem value="accepted">已采纳</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
                <SelectItem value="superseded">已替换</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="draft-wikinode-suggestion-conflict-filter">冲突状态</Label>
            <Select value={conflictFilter} onValueChange={(value) => setConflictFilter(value as SuggestionConflictFilter)}>
              <SelectTrigger id="draft-wikinode-suggestion-conflict-filter" aria-label="冲突状态" className="w-full">
                <SelectValue placeholder="全部冲突" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部冲突</SelectItem>
                <SelectItem value="none">未发现冲突</SelectItem>
                <SelectItem value="title_match">标题可能重复</SelectItem>
                <SelectItem value="source_ref_match">证据来源可能重复</SelectItem>
                <SelectItem value="existing_suggestion">已存在待审核建议</SelectItem>
                <SelectItem value="accepted_before">已采纳过相关建议</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" onClick={resetFilters}>重置筛选</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">建议生命周期</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            按评审状态、替代关系和证据追踪查看 Draft WikiNode Suggestion。
          </p>
          {isLoading ? <LoadingBlock text="正在加载 WikiNode 建议..." /> : null}
          {!isLoading && filteredSuggestions.length === 0 ? (
            <div className="rounded-md border border-dashed p-3 text-muted-foreground">
              暂无符合当前筛选条件的 WikiNode 建议。
            </div>
          ) : null}
          {filteredSuggestions.map((suggestion) => (
            <SuggestionLifecycleCard key={suggestion.suggestionId} suggestion={suggestion} />
          ))}
        </CardContent>
      </Card>
    </PageScaffold>
  )
}

export function WikiNodeDetailPage() {
  const { nodeId } = useParams()
  const {
    data: node,
    error,
    isLoading,
    reload,
  } = useAsyncData(
    () => nodeId ? getWikiNodeById(nodeId) : Promise.resolve(undefined),
    undefined,
    [nodeId],
  )

  if (isLoading && !node) {
    return <PageScaffold title="WikiNode 详情"><LoadingBlock text="正在加载 WikiNode 详情..." /></PageScaffold>
  }

  if (error && !node) {
    return <PageScaffold title="WikiNode 详情"><ApiErrorNotice error={error} onRetry={reload} /></PageScaffold>
  }

  if (!node) {
    return (
      <PageScaffold title="WikiNode 详情" description="未找到对应 WikiNode。">
        <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          当前 WikiNode 不存在或已被移除。
        </div>
      </PageScaffold>
    )
  }

  const relationSummary = formatKnowledgeRelations(node.relations)
  const sourceEvidence = node.sourceRefs
    .map((sourceRef) => `${sourceRef.sourceName ?? sourceRef.sourceTitle} / ${sourceRef.id ?? sourceRef.sourceId}`)
    .join("；") || "无"

  return (
    <PageScaffold title="WikiNode 详情" description={`${node.title}。查看 WikiNode 承载的 Knowledge Object 字段、来源证据和关系。`}>
      <SummaryGrid items={[
        ["WikiNode", node.title],
        [metadataLabels.objectType, labelFromMap(objectTypeLabels, node.objectType ?? "Article")],
        [metadataLabels.subtype, labelFromMap(subtypeLabels, node.subtype ?? node.nodeType)],
        [metadataLabels.processingProfile, node.processingProfile ?? "无"],
        ["发布状态", statusLabels[node.status]],
        ["索引状态", indexStatusLabels[node.indexStatus]],
        ["负责人", node.owner],
      ]} />
      <SimpleList items={[
        "Knowledge Object 承载字段",
        "objectType / subtype / metadata / sourceRefs / relations / processingProfile",
        `扩展元数据：${formatMetadataSummary(node.metadata)}`,
        `来源证据：${sourceEvidence}`,
        `语义关系：${relationSummary}`,
        `兼容节点类型：${labelFromMap(nodeTypeLabels, node.nodeType)}`,
      ]} />
    </PageScaffold>
  )
}

export function BacklinksPage() {
  return (
    <PageScaffold title="反向链接" description="按目标 WikiNode 分组查看入向 WikiLink。">
      <div className="grid gap-4 lg:grid-cols-2">
        {mockWikiNodes.slice(0, 6).map((node) => (
          <Card key={node.nodeId}>
            <CardHeader><CardTitle className="text-base">{node.title}</CardTitle></CardHeader>
            <CardContent><LinkList links={getIncomingLinks(node.nodeId, mockWikiNodes)} emptyText="暂无反向链接。" /></CardContent>
          </Card>
        ))}
      </div>
    </PageScaffold>
  )
}

export function IndexSegmentListPage() {
  const {
    data: segments,
    error,
    isLoading,
    reload,
  } = useAsyncData(listIndexSegments, [])

  return (
    <PageScaffold
      title="Index Segment"
      description="Index Segment 是从 WikiNode / Knowledge Object 生成的受控索引和召回单元，并始终关联父级 WikiNode。平台管理的是 WikiNode 发布前的 Index Segment，不管理外部向量库内部片段。"
    >
      <ApiErrorNotice error={error} onRetry={reload} />
      {isLoading ? <LoadingBlock text="正在加载 Index Segment..." /> : null}
      <IndexSegmentTable segments={segments} />
    </PageScaffold>
  )
}

export function SegmentStrategyPage() {
  return (
    <PageScaffold title="片段策略" description="展示 WikiNode / Knowledge Object 生成 Index Segment 的本地策略基线。">
      <SegmentStrategyCard />
    </PageScaffold>
  )
}

export function SegmentDebugPage() {
  const {
    data: segments,
    error,
    isLoading,
    reload,
  } = useAsyncData(listIndexSegments, [])
  const segment = segments[0] ?? mockIndexSegments[0]

  return (
    <PageScaffold title="片段调试" description="查看 Index Segment 证据，但不把片段作为主要召回结果。">
      <ApiErrorNotice error={error} onRetry={reload} />
      {isLoading ? <LoadingBlock text="正在加载 Index Segment 调试样例..." /> : null}
      <SegmentDebugPanel segment={segment} />
    </PageScaffold>
  )
}

export function GenericSkeletonPage({ title, description }: { title: keyof typeof routeCards | string; description?: string }) {
  const isQualityIssuePage = title === "质量问题"
  const isSourceOperationPage = title === "同步任务" || title === "同步日志"
  const isIndexJobPage = title === "索引任务"
  const isVectorSyncPage = title === "外部向量库同步"
  const isRetrievalDebugPage = title === "召回调试"
  const isSystemHealthPage = title === "系统健康"
  const isAdminPage = title === "用户" || title === "角色" || title === "权限" || title === "审计日志"
  const usesEvidenceConsole = isQualityIssuePage
    || isSourceOperationPage
    || isIndexJobPage
    || isVectorSyncPage
    || isRetrievalDebugPage
    || isSystemHealthPage
    || isAdminPage
  const pageDescription = isQualityIssuePage
    ? "集中查看影响 WikiNode、WikiLink、来源证据、Index Segment 和召回质量的风险线索。"
    : description ?? "查看 WikiNode Studio 对应模块的业务对象、状态和证据。"

  return (
    <PageScaffold title={title} description={pageDescription}>
      {usesEvidenceConsole ? null : (
        <SimpleList items={(routeCards as Record<string, string[]>)[title] ?? ["业务对象", "状态", "证据"]} />
      )}
      <SkeletonBoundaryContent title={title} />
      <RetrievalEvaluationConsoleContent title={title} />
      {isQualityIssuePage ? <QualityIssueConsole issues={mockQualityIssues} /> : null}
      {isSourceOperationPage ? <SourceOperationEvidenceConsole mode={title === "同步任务" ? "jobs" : "logs"} /> : null}
      {isIndexJobPage ? <IndexJobEvidenceConsole /> : null}
      {isVectorSyncPage ? <VectorSyncEvidenceConsole /> : null}
      {isRetrievalDebugPage ? <RetrievalDebugEvidenceConsole /> : null}
      {isSystemHealthPage ? <SystemHealthEvidenceConsole /> : null}
      {isAdminPage ? <AdminEvidenceConsole title={title} /> : null}
    </PageScaffold>
  )
}

export function PublishingPage() {
  return (
    <PageScaffold title="发布与索引" description="展示 WikiNode 发布前的索引检查、片段准备情况和外部同步状态。">
      <div className="grid gap-4 lg:grid-cols-3">
        <BoundaryCard
          title="发布前检查"
          items={[
            "检查 WikiNode 发布状态、断链风险和 Index Segment 准备情况。",
            "关注发布前的证据完整性、关系完整性和索引准备度。",
          ]}
        />
        <BoundaryCard
          title="Index Segment 生成状态"
          items={[
            "展示已索引、待更新、索引失败和未索引的状态口径。",
            "Index Segment 是发布前生成的受控索引和召回单元。",
          ]}
        />
        <BoundaryCard
          title="外部向量库同步"
          items={[
            "查看同步前置条件、目标配置和 Index Segment 准备状态。",
            "同步状态以 WikiNode 和 Index Segment 证据为中心。",
          ]}
        />
      </div>
      <SimpleList items={["发布状态", "索引状态", "外部向量库同步"]} />
    </PageScaffold>
  )
}

export function SystemVectorStorePage() {
  return (
    <PageScaffold title="外部向量库配置" description="本系统只配置外部向量库，不建设或替代底层向量存储。">
      <SimpleList items={["阿里云向量库配置", "火山引擎向量库配置", "外部存储边界"]} />
    </PageScaffold>
  )
}

export function ParserEnginePage() {
  const {
    data: parserProfiles,
    error,
    isLoading,
    reload,
  } = useAsyncData(listParserProfiles, [])

  return (
    <PageScaffold title="解析引擎" description="查看允许使用的 Parser Profile、适用内容类型和输出结构。">
      <ApiErrorNotice error={error} onRetry={reload} />
      <Card>
        <CardHeader>
          <h2 className="text-base font-medium leading-snug">Parser Profile 注册表</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">按 Profile 查看适用来源类型、输出格式和处理策略。</p>
          {isLoading ? (
            <LoadingBlock text="正在加载 Parser Profile..." />
          ) : parserProfiles.length === 0 ? (
            <div className="rounded-md border border-dashed p-3 text-muted-foreground">
              暂无 Parser Profile。
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {parserProfiles.map((profile) => (
                <ParserProfileCard key={profile.parserProfile} profile={profile} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <SimpleList items={[
        "Parser Profile 是解析策略 allowlist，不是可执行插件入口。",
        "Raw Material 需要匹配 Profile 后进入标准化处理。",
        "输出结构用于 Parsed Document 预览和 WikiNode 建议评审。",
      ]} />
    </PageScaffold>
  )
}

export function PageScaffold({ title, description, actions, children }: { title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={title} description={description} actions={actions} />
      {children}
    </div>
  )
}

function SummaryGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, value]) => (
        <Card key={label}>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
          <CardContent className="text-lg font-semibold">{value}</CardContent>
        </Card>
      ))}
    </div>
  )
}

function SkeletonBoundaryContent({ title }: { title: string }) {
  const sections: Record<string, { heading: string; items: string[] }> = {
    标签与元数据: {
      heading: "标签治理基线",
      items: [
        "标签用于筛选、检索和 Index Segment metadata。",
        "标签用于组织 WikiNode、筛选检索结果和补充 Index Segment metadata。",
      ],
    },
    元数据字段: {
      heading: "元数据字段治理基线",
      items: [
        "字段意图、校验规则、索引参与和检索参与在这里说明。",
        "字段定义用于约束 Knowledge Object 信息展示和检索参与方式。",
      ],
    },
    角色: {
      heading: "角色规划基线",
      items: [
        "角色仅说明协作分工，不做权限 enforcement。",
        "角色用于说明知识维护、评审和查看的协作分工。",
      ],
    },
    权限: {
      heading: "权限维度规划基线",
      items: [
        "权限维度用于区分查看、编辑、评审和管理动作。",
        "页面只呈现产品协作口径，不展示工程实现细节。",
      ],
    },
    审计日志: {
      heading: "审计证据规划基线",
      items: [
        "审计证据围绕 WikiNode、Index Segment 和检索测试记录。",
        "重点查看对象、动作、时间和操作者。",
      ],
    },
  }
  const section = sections[title]

  return section ? <BoundaryCard title={section.heading} items={section.items} /> : null
}

function BoundaryCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="text-base font-medium leading-snug">{title}</div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </CardContent>
    </Card>
  )
}

function SourceOperationEvidenceConsole({ mode }: { mode: "jobs" | "logs" }) {
  const {
    data: operations,
    error,
    isLoading,
    reload,
  } = useAsyncData(listSourceOperations, [], [mode])
  const succeededCount = operations.filter((operation) => operation.status === "succeeded").length
  const failedCount = operations.filter((operation) => operation.status === "failed").length

  return (
    <div className="grid gap-4">
      <ApiErrorNotice error={error} title="加载 Source Operation 失败" onRetry={reload} />
      <SummaryGrid items={[
        ["操作总数", isLoading ? "加载中..." : `${operations.length} 条`],
        ["已完成", isLoading ? "加载中..." : `${succeededCount} 条`],
        ["异常", isLoading ? "加载中..." : `${failedCount} 条`],
        ["关联对象", "Source / Raw Material / Parsed Document"],
      ]} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{mode === "jobs" ? "Source Operation 控制台" : "Source Operation 日志"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <LoadingBlock text="正在加载 Source Operation..." /> : null}
          {!isLoading && operations.length === 0 ? <LoadingBlock text="暂无 Source Operation 记录。" /> : null}
          {operations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">操作 ID</th>
                    <th className="px-3 py-2 font-medium">操作类型</th>
                    <th className="px-3 py-2 font-medium">状态</th>
                    <th className="px-3 py-2 font-medium">Source</th>
                    <th className="px-3 py-2 font-medium">Raw Material</th>
                    <th className="px-3 py-2 font-medium">Parsed Document</th>
                    <th className="px-3 py-2 font-medium">开始时间</th>
                    <th className="px-3 py-2 font-medium">{mode === "jobs" ? "摘要" : "日志摘要"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {operations.map((operation) => (
                    <tr key={operation.operationId} className="align-top">
                      <td className="whitespace-nowrap px-3 py-3 font-medium">{operation.operationId}</td>
                      <td className="whitespace-nowrap px-3 py-3">{labelFromMap(sourceOperationTypeLabels, operation.operationType)}</td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <Badge variant={operation.status === "failed" ? "destructive" : "secondary"}>
                          {labelFromMap(sourceOperationStatusLabels, operation.status)}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{operation.sourceId}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{operation.rawMaterialId ?? "-"}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{operation.parsedDocumentId ?? "-"}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{operation.startedAt}</td>
                      <td className="min-w-[260px] px-3 py-3 text-muted-foreground">
                        <div>{operation.summary}</div>
                        {operation.errorSummary ? (
                          <div className="mt-1 font-medium text-destructive">{operation.errorSummary}</div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function IndexJobEvidenceConsole() {
  const {
    data: segments,
    error,
    isLoading,
    reload,
  } = useAsyncData(listIndexSegments, [])
  const indexedCount = segments.filter((segment) => segment.indexStatus === "indexed").length
  const outdatedCount = segments.filter((segment) => segment.indexStatus === "outdated").length
  const failedCount = segments.filter((segment) => segment.indexStatus === "failed").length

  return (
    <div className="grid gap-4">
      <ApiErrorNotice error={error} title="加载 Index Segment 失败" onRetry={reload} />
      <SummaryGrid items={[
        ["Index Segment", isLoading ? "加载中..." : `${segments.length} 个`],
        ["已索引", isLoading ? "加载中..." : `${indexedCount} 个`],
        ["待更新", isLoading ? "加载中..." : `${outdatedCount} 个`],
        ["索引失败", isLoading ? "加载中..." : `${failedCount} 个`],
      ]} />
      <IndexSegmentEvidenceTable title="Index Segment 索引任务" segments={segments} isLoading={isLoading} />
    </div>
  )
}

function VectorSyncEvidenceConsole() {
  const {
    data: segments,
    error,
    isLoading,
    reload,
  } = useAsyncData(listIndexSegments, [])
  const vectorReadySegments = segments.filter((segment) => Boolean(segment.vectorDocId))

  return (
    <div className="grid gap-4">
      <ApiErrorNotice error={error} title="加载外部向量库同步证据失败" onRetry={reload} />
      <SummaryGrid items={[
        ["证据对象", "Index Segment"],
        ["向量文档 ID", isLoading ? "加载中..." : `${vectorReadySegments.length} 个`],
        ["关联 WikiNode", isLoading ? "加载中..." : `${new Set(vectorReadySegments.map((segment) => segment.nodeId)).size} 个`],
        ["召回命中", isLoading ? "加载中..." : `${vectorReadySegments.reduce((sum, segment) => sum + segment.retrievalHits, 0)} 次`],
      ]} />
      <IndexSegmentEvidenceTable title="外部向量库同步证据" segments={segments.filter((segment) => segment.vectorDocId).slice(0, 18)} isLoading={isLoading} showVectorDoc />
    </div>
  )
}

function RetrievalDebugEvidenceConsole() {
  const {
    data: logs,
    error: logsError,
    isLoading: areLogsLoading,
    reload: reloadLogs,
  } = useAsyncData(listRetrievalLogs, [])
  const {
    data: segments,
    error: segmentsError,
    isLoading: areSegmentsLoading,
    reload: reloadSegments,
  } = useAsyncData(listIndexSegments, [])

  return (
    <div className="grid gap-4">
      <ApiErrorNotice error={logsError} title="加载召回日志失败" onRetry={reloadLogs} />
      <ApiErrorNotice error={segmentsError} title="加载 Index Segment 失败" onRetry={reloadSegments} />
      <SummaryGrid items={[
        ["链路", "Query -> Index Segment -> WikiNode"],
        ["查询日志", areLogsLoading ? "加载中..." : `${logs.length} 条`],
        ["命中片段", areSegmentsLoading ? "加载中..." : `${segments.length} 个`],
        ["关系证据", "matchedRelations"],
      ]} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">召回调试证据链</CardTitle>
        </CardHeader>
        <CardContent>
          {areLogsLoading ? <LoadingBlock text="正在加载召回调试证据..." /> : null}
          {!areLogsLoading && logs.length === 0 ? <LoadingBlock text="暂无召回调试证据。" /> : null}
          {logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Query</th>
                    <th className="px-3 py-2 font-medium">Index Segment</th>
                    <th className="px-3 py-2 font-medium">WikiNode</th>
                    <th className="px-3 py-2 font-medium">matchedRelations</th>
                    <th className="px-3 py-2 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log) => (
                    <tr key={log.logId} className="align-top">
                      <td className="max-w-[260px] px-3 py-3 font-medium">{log.query}</td>
                      <td className="px-3 py-3 text-muted-foreground">{joinEvidenceIds(log.matchedSegmentIds)}</td>
                      <td className="px-3 py-3 text-muted-foreground">{joinEvidenceIds(log.returnedNodeIds)}</td>
                      <td className="px-3 py-3 text-muted-foreground">{relationDebugSummary(log.returnedNodeIds)}</td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <Badge variant={log.status === "succeeded" ? "secondary" : "destructive"}>{retrievalStatusLabel(log.status)}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function SystemHealthEvidenceConsole() {
  const indexStatusSummary = countBy(mockIndexSegments, (segment) => segment.indexStatus)
  const publishedNodeCount = mockWikiNodes.filter((node) => node.status === "published").length
  const retrievalSuccessCount = mockRetrievalLogs.filter((log) => log.status === "succeeded").length

  const rows = [
    ["WikiNode API", `${mockWikiNodes.length} 个 WikiNode`, `已发布 ${publishedNodeCount} 个`],
    ["Index Segment 证据", `${mockIndexSegments.length} 个 Index Segment`, `已索引 ${indexStatusSummary.indexed ?? 0} 个`],
    ["Retrieval API 证据", `${mockRetrievalLogs.length} 条查询日志`, `成功 ${retrievalSuccessCount} 条`],
    ["Source Operation 证据", "Source / Raw Material 处理记录", "最近操作可追踪"],
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">系统健康证据</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">模块</th>
              <th className="px-3 py-2 font-medium">对象</th>
              <th className="px-3 py-2 font-medium">最近状态</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(([module, object, status]) => (
              <tr key={module}>
                <td className="px-3 py-3 font-medium">{module}</td>
                <td className="px-3 py-3 text-muted-foreground">{object}</td>
                <td className="px-3 py-3 text-muted-foreground">{status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function AdminEvidenceConsole({ title }: { title: string }) {
  if (title === "用户") return <UserCollaborationConsole />
  if (title === "角色") return <RoleResponsibilityMatrix />
  if (title === "权限") return <PermissionDimensionMatrix />
  return <AuditEvidenceLogConsole />
}

function UserCollaborationConsole() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">用户协作控制台</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">用户</th>
              <th className="px-3 py-2 font-medium">邮箱</th>
              <th className="px-3 py-2 font-medium">角色</th>
              <th className="px-3 py-2 font-medium">状态</th>
              <th className="px-3 py-2 font-medium">最近活跃</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockUsers.map((user) => (
              <tr key={user.userId}>
                <td className="px-3 py-3 font-medium">{user.name}</td>
                <td className="px-3 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-3 py-3">{labelFromMap(userRoleLabels, user.role)}</td>
                <td className="px-3 py-3">
                  <Badge variant={user.status === "active" ? "secondary" : "outline"}>
                    {labelFromMap(userStatusLabels, user.status)}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{user.lastActiveAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function RoleResponsibilityMatrix() {
  const rows = [
    ["知识负责人", "维护知识库范围、发布前检查、质量问题分派", "WikiNode / WikiLink / Source 证据"],
    ["编辑者", "编辑 WikiNode 内容、补充来源证据、更新元数据", "WikiNode 草稿与变更记录"],
    ["审核员", "复核关系、断链、召回结果和来源证据", "质量问题与评测用例"],
    ["查看者", "浏览知识对象、查看召回证据和图谱关系", "只读查询与详情页"],
    ["管理员", "维护系统配置和团队协作视图", "设置、角色和审计证据"],
  ]

  return <MatrixTable title="角色职责矩阵" columns={["角色", "职责", "关注对象"]} rows={rows} />
}

function PermissionDimensionMatrix() {
  const rows = [
    ["查看 WikiNode", "浏览知识节点、详情、来源证据和图谱关系", "知识负责人 / 编辑者 / 审核员 / 查看者"],
    ["编辑 WikiNode", "维护标题、正文、元数据、关系和来源引用", "知识负责人 / 编辑者"],
    ["评审 WikiNode", "确认 Draft WikiNode Suggestion、断链和质量问题", "知识负责人 / 审核员"],
    ["管理配置", "维护知识库配置、系统配置和协作角色", "知识负责人 / 管理员"],
  ]

  return <MatrixTable title="权限维度矩阵" columns={["权限维度", "适用动作", "协作角色"]} rows={rows} />
}

function AuditEvidenceLogConsole() {
  const rows = [
    ["2026-06-22 18:00", "Rivers", "WikiNode 已更新", "wn-001 保修期内维修服务政策"],
    ["2026-06-22 17:40", "Knowledge Ops", "Index Segment 已生成", "SEG-001 / SEG-002 / SEG-003"],
    ["2026-06-22 16:55", "Service Finance", "Retrieval API 已测试", "保修收费查询返回 wn-001"],
    ["2026-06-22 15:20", "Product Docs", "Source 证据已关联", "src-feishu-cc / rm-001"],
  ]

  return <MatrixTable title="审计证据日志" columns={["时间", "操作者", "动作", "对象"]} rows={rows} />
}

function MatrixTable({ title, columns, rows }: { title: string; columns: string[]; rows: string[][] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b text-xs text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-3 py-2 font-medium">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.join("-")} className="align-top">
                {row.map((cell, index) => (
                  <td key={`${row[0]}-${cell}`} className={index === 0 ? "whitespace-nowrap px-3 py-3 font-medium" : "px-3 py-3 text-muted-foreground"}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function IndexSegmentEvidenceTable({
  title,
  segments,
  isLoading,
  showVectorDoc = false,
}: {
  title: string
  segments: IndexSegment[]
  isLoading: boolean
  showVectorDoc?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? <LoadingBlock text="正在加载 Index Segment..." /> : null}
        {!isLoading && segments.length === 0 ? <LoadingBlock text="暂无 Index Segment 证据。" /> : null}
        {segments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">片段 ID</th>
                  <th className="px-3 py-2 font-medium">父级 WikiNode</th>
                  <th className="px-3 py-2 font-medium">Knowledge Object 类型</th>
                  <th className="px-3 py-2 font-medium">片段类型</th>
                  <th className="px-3 py-2 font-medium">索引状态</th>
                  {showVectorDoc ? <th className="px-3 py-2 font-medium">向量文档 ID</th> : null}
                  <th className="px-3 py-2 font-medium">召回次数</th>
                  <th className="px-3 py-2 font-medium">更新时间</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {segments.map((segment) => (
                  <tr key={segment.segmentId} className="align-top">
                    <td className="whitespace-nowrap px-3 py-3 font-medium">{segment.segmentId}</td>
                    <td className="min-w-[180px] px-3 py-3">{segment.nodeTitle}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{segment.objectType ? labelFromMap(objectTypeLabels, segment.objectType) : "-"}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{segmentTypeLabel(segment.segmentType)}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <Badge variant={segment.indexStatus === "failed" ? "destructive" : "secondary"}>
                        {labelFromMap(indexStatusLabels, segment.indexStatus)}
                      </Badge>
                    </td>
                    {showVectorDoc ? <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{segment.vectorDocId ?? "-"}</td> : null}
                    <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{segment.retrievalHits}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{segment.updatedAt ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function segmentTypeLabel(segmentType: IndexSegment["segmentType"]) {
  const labels: Record<IndexSegment["segmentType"], string> = {
    title: "标题",
    summary: "摘要",
    body: "正文",
    section: "章节",
    table: "表格",
    qa: "问答",
    metadata: "元数据",
    condition: "条件",
    procedure_step: "流程步骤",
    troubleshooting_step: "排查步骤",
  }

  return labels[segmentType]
}

function relationDebugSummary(nodeIds: string[]) {
  const relatedCount = mockWikiNodes
    .filter((node) => nodeIds.includes(node.nodeId))
    .reduce((sum, node) => sum + (node.relations?.length ?? 0), 0)

  return relatedCount > 0 ? `${relatedCount} 条 WikiLink / 语义关系` : "无"
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
}

function RetrievalEvaluationConsoleContent({ title }: { title: string }) {
  const isRetrievalConsole = title === "查询日志" || title === "评测用例" || title === "召回评测"
  if (!isRetrievalConsole) return null

  return <RetrievalEvaluationConsolePanels title={title} />
}

function RetrievalEvaluationConsolePanels({ title }: { title: string }) {
  const {
    data: logs,
    error: logsError,
    isLoading: areLogsLoading,
    reload: reloadLogs,
  } = useAsyncData(listRetrievalLogs, [], [title])
  const {
    data: evaluationCases,
    error: casesError,
    isLoading: areCasesLoading,
    reload: reloadCases,
  } = useAsyncData(listRetrievalEvaluationCases, [], [title])

  return (
    <div className="grid gap-4">
      <ApiErrorNotice error={logsError} title="加载查询日志失败" onRetry={reloadLogs} />
      <ApiErrorNotice error={casesError} title="加载评测用例失败" onRetry={reloadCases} />
      {title === "查询日志" ? <QueryLogEvidencePanel logs={logs} isLoading={areLogsLoading} /> : null}
      {title === "评测用例" ? <EvaluationCaseEvidencePanel evaluationCases={evaluationCases} isLoading={areCasesLoading} /> : null}
      {title === "召回评测" ? (
        <RetrievalEvaluationSummaryPanel
          logs={logs}
          evaluationCases={evaluationCases}
          areLogsLoading={areLogsLoading}
          areCasesLoading={areCasesLoading}
        />
      ) : null}
    </div>
  )
}

function QueryLogEvidencePanel({ logs, isLoading }: { logs: RetrievalLog[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Retrieval API 查询日志证据</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-2">
        {isLoading ? <LoadingBlock text="正在加载查询日志..." /> : null}
        {!isLoading && logs.length === 0 ? (
          <LoadingBlock text="暂无查询日志。完成一次检索后，这里会展示返回 WikiNode 和命中 Index Segment 证据。" />
        ) : null}
        {logs.map((log) => (
          <div key={log.logId} className="rounded-md border bg-background p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium">{log.logId}</div>
              <Badge variant={log.status === "succeeded" ? "default" : "destructive"}>{retrievalStatusLabel(log.status)}</Badge>
            </div>
            <div className="mt-2 text-muted-foreground">{log.query}</div>
            <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
              <span>筛选条件：{retrievalFiltersSummary(log.filters)}</span>
              <span>返回 WikiNode：{joinEvidenceIds(log.returnedNodeIds)}</span>
              <span>命中 Index Segment：{joinEvidenceIds(log.matchedSegmentIds)}</span>
              <span>状态：{retrievalStatusLabel(log.status)} · {log.latencyMs}ms</span>
              {log.errorSummary ? <span>{log.errorSummary}</span> : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function EvaluationCaseEvidencePanel({
  evaluationCases,
  isLoading,
}: {
  evaluationCases: RetrievalEvaluationCase[]
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Retrieval Evaluation Case 证据</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-2">
        {isLoading ? <LoadingBlock text="正在加载评测用例..." /> : null}
        {!isLoading && evaluationCases.length === 0 ? (
          <LoadingBlock text="暂无评测用例。可先在检索测试中保存当前 WikiNode 结果作为评测证据。" />
        ) : null}
        {evaluationCases.map((evaluationCase) => (
          <div key={evaluationCase.caseId} className="rounded-md border bg-background p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium">{evaluationCase.caseId}</div>
              <Badge variant={evaluationCase.runResult.status === "passed" ? "default" : "destructive"}>
                {evaluationRunStatusLabel(evaluationCase.runResult.status)}
              </Badge>
            </div>
            <div className="mt-2 text-muted-foreground">{evaluationCase.query}</div>
            <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
              <span>筛选条件：{retrievalFiltersSummary(evaluationCase.filters)}</span>
              <span>返回数量：Top {evaluationCase.topK}</span>
              <span>预期 WikiNode：{joinEvidenceIds(evaluationCase.expectedNodeIds)}</span>
              <span>返回 WikiNode：{joinEvidenceIds(evaluationCase.runResult.returnedNodeIds)}</span>
              <span>命中 Index Segment：{joinEvidenceIds(evaluationCase.runResult.matchedSegmentIds)}</span>
              <span>运行结果：{evaluationRunStatusLabel(evaluationCase.runResult.status)}</span>
              <span>{evaluationCase.runResult.summary}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function RetrievalEvaluationSummaryPanel({
  logs,
  evaluationCases,
  areLogsLoading,
  areCasesLoading,
}: {
  logs: RetrievalLog[]
  evaluationCases: RetrievalEvaluationCase[]
  areLogsLoading: boolean
  areCasesLoading: boolean
}) {
  const passedCount = evaluationCases.filter((item) => item.runResult.status === "passed").length
  const failedCount = evaluationCases.filter((item) => item.runResult.status === "failed").length
  const latestLogCount = logs.length

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">召回评测基线</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm">
            <div className="text-muted-foreground">评测用例数</div>
            <div className="mt-1 text-xl font-semibold">{areCasesLoading ? "加载中..." : evaluationCases.length}</div>
          </div>
          <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm">
            <div className="text-muted-foreground">运行结果</div>
            <div className="mt-1 text-xl font-semibold">{areCasesLoading ? "加载中..." : `通过 ${passedCount} / 失败 ${failedCount}`}</div>
          </div>
          <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm">
            <div className="text-muted-foreground">最近查询日志</div>
            <div className="mt-1 text-xl font-semibold">{areLogsLoading ? "加载中..." : `最近查询日志 ${latestLogCount} 条`}</div>
          </div>
        </CardContent>
      </Card>
      <BoundaryCard
        title="评测说明"
        items={[
          "评测结果只解释 Retrieval API 返回 WikiNode 与命中 Index Segment 证据。",
          "评测用例用于对比查询、期望 WikiNode 和实际返回结果。",
        ]}
      />
      <EvaluationCaseEvidencePanel evaluationCases={evaluationCases} isLoading={areCasesLoading} />
    </div>
  )
}

function joinEvidenceIds(ids: string[] | undefined) {
  return ids?.length ? ids.join("、") : "无"
}

function retrievalStatusLabel(status: RetrievalLog["status"]) {
  return status === "succeeded" ? "成功" : "失败"
}

function evaluationRunStatusLabel(status: RetrievalEvaluationCase["runResult"]["status"]) {
  return status === "passed" ? "通过" : "失败"
}

function retrievalFiltersSummary(filters: RetrievalLog["filters"]) {
  if (!filters || Object.keys(filters).length === 0) return "全部"
  const entries = [
    filters.nodeType ? `节点类型 ${labelFromMap(nodeTypeLabels, filters.nodeType)}` : null,
    filters.status ? `发布状态 ${labelFromMap(statusLabels, filters.status)}` : null,
    filters.tags?.length ? `标签 ${filters.tags.join("、")}` : null,
  ].filter(Boolean)

  return entries.length ? entries.join("；") : "全部"
}

function SimpleList({ items }: { items: string[] }) {
  return (
    <Card>
      <CardContent className="grid gap-2 p-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item} className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">{item}</div>
        ))}
      </CardContent>
    </Card>
  )
}

function LoadingBlock({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
      {text}
    </div>
  )
}

function ParsedDocumentPreview({ parsedDocument }: { parsedDocument: ParsedDocument }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{parsedDocument.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap rounded-md border bg-muted/20 p-3 text-sm leading-6">
            {parsedDocument.normalizedContent}
          </pre>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">来源证据</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {parsedDocument.sourceRefs.length === 0 ? (
            <div className="rounded-md border border-dashed p-3 text-muted-foreground">暂无来源证据。</div>
          ) : parsedDocument.sourceRefs.map((sourceRef) => (
            <div key={`${sourceRef.parsedDocumentId}-${sourceRef.locator}`} className="rounded-md border p-3">
              <div className="font-medium">{labelFromMap(locatorTypeLabels, sourceRef.locatorType)} · {sourceRef.locator}</div>
              <div className="mt-1 text-muted-foreground">{sourceRef.excerpt}</div>
              {sourceRef.confidence === undefined ? null : (
                <div className="mt-1 text-xs text-muted-foreground">可信度 {Math.round(sourceRef.confidence * 100)}%</div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function ParsedDocumentSegmentPanel({ segments, isLoading }: { segments: ParsedDocumentSegment[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">文档片段</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {isLoading ? (
          <LoadingBlock text="正在加载文档片段..." />
        ) : segments.length === 0 ? (
          <div className="rounded-md border border-dashed p-3 text-muted-foreground">暂无文档片段。</div>
        ) : (
          <div className="grid gap-2 lg:grid-cols-2">
            {segments.map((segment) => (
              <div key={segment.segmentId} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{segment.segmentId}</Badge>
                  <Badge variant="secondary">{segment.segmentType === "section" ? "章节" : "正文"}</Badge>
                  <span className="text-xs text-muted-foreground">约 {segment.tokenCount} tokens</span>
                </div>
                <div className="mt-2 font-medium">{segment.title}</div>
                <p className="mt-1 text-muted-foreground">{segment.contentPreview}</p>
                <div className="mt-2 text-xs text-muted-foreground">片段归属：{segment.knowledgeBaseId ?? "未绑定"}</div>
                <div className="mt-2 text-xs text-muted-foreground">{segment.sourceLocator}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SourceOperationLogPanel({ operations, isLoading }: { operations: SourceOperation[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-medium leading-snug">操作日志</h2>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">按时间查看来源处理动作、处理状态、关联对象和错误摘要。</p>
        {isLoading ? (
          <LoadingBlock text="正在加载操作日志..." />
        ) : operations.length === 0 ? (
          <div className="rounded-md border border-dashed p-3 text-muted-foreground">
            暂无操作日志。
          </div>
        ) : operations.map((operation) => (
          <div key={operation.operationId} className="rounded-md border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{labelFromMap(sourceOperationTypeLabels, operation.operationType)}</Badge>
              <Badge variant={operation.status === "failed" ? "destructive" : "secondary"}>
                {labelFromMap(sourceOperationStatusLabels, operation.status)}
              </Badge>
              <span className="text-xs text-muted-foreground">执行人 {operation.requestedBy}</span>
            </div>
            <div className="mt-2 font-medium">{operation.summary}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {operation.startedAt}
              {operation.finishedAt ? ` -> ${operation.finishedAt}` : ""}
            </div>
            {operation.errorSummary ? (
              <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-destructive">
                {operation.errorSummary}
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function DraftWikiNodeSuggestionPanel({
  suggestions,
  isLoading,
  mode,
  showReviewOutcome = true,
}: {
  suggestions: DraftWikiNodeSuggestion[]
  isLoading: boolean
  mode: "summary" | "detail"
  showReviewOutcome?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-medium leading-snug">WikiNode 建议</h2>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">这里展示 Draft WikiNode Suggestion 与审核结果；采纳或拒绝请进入建议详情。</p>
        {isLoading ? (
          <LoadingBlock text="正在加载 WikiNode 建议..." />
        ) : suggestions.length === 0 ? (
          <div className="rounded-md border border-dashed p-3 text-muted-foreground">
            暂无 WikiNode 建议。
          </div>
        ) : suggestions.map((suggestion) => (
          <div key={suggestion.suggestionId} className="rounded-md border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{labelFromMap(objectTypeLabels, suggestion.objectType)}</Badge>
              <Badge variant="secondary">{labelFromMap(draftWikiNodeSuggestionStatusLabels, suggestion.status)}</Badge>
              <Badge variant={suggestion.conflictStatus === "none" ? "outline" : "destructive"}>
                {labelFromMap(draftWikiNodeSuggestionConflictLabels, suggestion.conflictStatus)}
              </Badge>
            </div>
            <Link to={`/draft-wikinode-suggestions/${suggestion.suggestionId}`} className="mt-2 block font-medium hover:underline">
              {suggestion.title}
            </Link>
            <div className="mt-1 text-xs text-muted-foreground">
              {suggestion.suggestionId} · Parsed Document {suggestion.parsedDocumentId} · 可信度 {formatConfidence(suggestion.confidence)}
            </div>
            {suggestion.conflictReasons.length > 0 ? (
              <div className="mt-2 text-xs text-destructive">{suggestion.conflictReasons.join("、")}</div>
            ) : null}
            {showReviewOutcome ? <SuggestionReviewOutcome suggestion={suggestion} /> : null}
            {mode === "detail" ? (
              <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
                <pre className="max-h-[280px] overflow-auto whitespace-pre-wrap rounded-md border bg-muted/20 p-3 text-sm leading-6">
                  {suggestion.contentDraft}
                </pre>
                <div className="space-y-3">
                  <SuggestionEvidenceBlock suggestion={suggestion} />
                  <SuggestionRelationBlock suggestion={suggestion} />
                </div>
              </div>
            ) : (
              <div className="mt-2 text-xs text-muted-foreground">
                来源证据 {suggestion.sourceRefCount} 条，关系候选 {suggestion.relationCandidateCount} 条。
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function SuggestionReviewOutcome({ suggestion }: { suggestion: DraftWikiNodeSuggestion }) {
  const linkedNodeId = suggestion.status === "accepted" ? suggestion.matchedWikiNodeIds[0] : ""

  if (suggestion.status === "accepted") {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
        <span>已采纳为草稿 WikiNode</span>
        {linkedNodeId ? (
          <Link className="font-medium underline-offset-4 hover:underline" to={`/wiki-nodes/${linkedNodeId}`}>
            打开草稿 WikiNode
          </Link>
        ) : null}
        {suggestion.reviewNote ? <span>审核备注：{suggestion.reviewNote}</span> : null}
      </div>
    )
  }

  if (suggestion.status === "rejected") {
    return (
      <div className="mt-2 rounded-md border border-muted bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        已拒绝{suggestion.reviewNote ? `：${suggestion.reviewNote}` : ""}
      </div>
    )
  }

  if (suggestion.status === "superseded") {
    const replacementSuggestionId = suggestion.matchedSuggestionIds[0]
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-muted bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        <span>已被新建议替代</span>
        {replacementSuggestionId ? (
          <Link className="font-medium text-primary underline-offset-4 hover:underline" to={`/draft-wikinode-suggestions/${replacementSuggestionId}`}>
            打开新建议
          </Link>
        ) : null}
        {suggestion.reviewNote ? <span>审核备注：{suggestion.reviewNote}</span> : null}
      </div>
    )
  }

  return null
}

function SuggestionLifecycleCard({ suggestion }: { suggestion: DraftWikiNodeSuggestion }) {
  const acceptedNodeId = suggestion.status === "accepted" ? suggestion.matchedWikiNodeIds[0] : ""
  const replacementSuggestionId = suggestion.status === "superseded" ? suggestion.matchedSuggestionIds[0] : ""
  const previousSuggestionId = suggestion.status !== "superseded" ? suggestion.matchedSuggestionIds[0] : ""
  const nextStep = lifecycleNextStep(suggestion)

  return (
    <div className="rounded-md border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{labelFromMap(objectTypeLabels, suggestion.objectType)}</Badge>
        <Badge variant="secondary">{labelFromMap(draftWikiNodeSuggestionStatusLabels, suggestion.status)}</Badge>
        <Badge variant={suggestion.conflictStatus === "none" ? "outline" : "destructive"}>
          {labelFromMap(draftWikiNodeSuggestionConflictLabels, suggestion.conflictStatus)}
        </Badge>
      </div>
      <Link to={`/draft-wikinode-suggestions/${suggestion.suggestionId}`} className="mt-2 block font-medium hover:underline">
        {suggestion.title}
      </Link>
      <div className="mt-2 grid gap-2 text-xs text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
        <span>Source {suggestion.sourceId}</span>
        <span>Raw Material {suggestion.rawMaterialId}</span>
        <span>Parsed Document {suggestion.parsedDocumentId}</span>
        <span>Source Operation {suggestion.operationId}</span>
      </div>
      <div className="mt-2 rounded-md border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        下一步：{nextStep}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs">
        <Link className="font-medium text-primary underline-offset-4 hover:underline" to={`/sources/${suggestion.sourceId}`}>
          查看 Source
        </Link>
        <Link className="font-medium text-primary underline-offset-4 hover:underline" to={`/raw-materials/${suggestion.rawMaterialId}`}>
          查看 Raw Material
        </Link>
        <Link className="font-medium text-primary underline-offset-4 hover:underline" to={`/raw-materials/${suggestion.rawMaterialId}/parsed-result`}>
          查看 Parsed Result
        </Link>
        <Link className="font-medium text-primary underline-offset-4 hover:underline" to={`/draft-wikinode-suggestions/${suggestion.suggestionId}`}>
          进入建议详情
        </Link>
        {acceptedNodeId ? (
          <Link className="font-medium text-primary underline-offset-4 hover:underline" to={`/wiki-nodes/${acceptedNodeId}`}>
            打开草稿 WikiNode
          </Link>
        ) : null}
        {replacementSuggestionId ? (
          <Link className="font-medium text-primary underline-offset-4 hover:underline" to={`/draft-wikinode-suggestions/${replacementSuggestionId}`}>
            打开新建议
          </Link>
        ) : null}
        {previousSuggestionId ? (
          <Link className="font-medium text-primary underline-offset-4 hover:underline" to={`/draft-wikinode-suggestions/${previousSuggestionId}`}>
            查看来源建议
          </Link>
        ) : null}
      </div>
      {suggestion.reviewNote ? (
        <div className="mt-2 text-xs text-muted-foreground">审核备注：{suggestion.reviewNote}</div>
      ) : null}
    </div>
  )
}

function lifecycleNextStep(suggestion: DraftWikiNodeSuggestion) {
  if (suggestion.status === "accepted") {
    return "进入草稿 WikiNode 后继续人工编辑。"
  }
  if (suggestion.status === "rejected") {
    return "保持拒绝记录，可在详情页基于同一 Parsed Document 重新生成。"
  }
  if (suggestion.status === "superseded") {
    return "查看新建议并继续评审，旧建议仅保留审计证据。"
  }
  if (suggestion.conflictStatus !== "none") {
    return "先处理冲突，可拒绝或重新生成，不能直接采纳。"
  }
  return "进入详情页采纳为草稿 WikiNode、拒绝或重新生成。"
}

function SuggestionEvidenceBlock({ suggestion }: { suggestion: DraftWikiNodeSuggestion }) {
  return (
    <div className="rounded-md border p-3">
      <div className="font-medium">来源证据</div>
      <div className="mt-2 space-y-2">
        {suggestion.sourceRefs.map((sourceRef) => (
          <div key={`${sourceRef.parsedDocumentId}-${sourceRef.locator}`} className="text-sm">
            <div>{labelFromMap(locatorTypeLabels, sourceRef.locatorType)} · {sourceRef.locator}</div>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>Source {sourceRef.sourceId}</span>
              <span>Raw Material {sourceRef.rawMaterialId}</span>
              <span>Parsed Document {sourceRef.parsedDocumentId}</span>
            </div>
            <div className="text-muted-foreground">{sourceRef.excerpt}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SuggestionRelationBlock({ suggestion }: { suggestion: DraftWikiNodeSuggestion }) {
  return (
    <div className="rounded-md border p-3">
      <div className="font-medium">关系候选</div>
      <div className="mt-2 space-y-2">
        {suggestion.relationCandidates.length === 0 ? (
          <div className="text-muted-foreground">暂无关系候选。</div>
        ) : suggestion.relationCandidates.map((candidate) => (
          <div key={`${candidate.targetTitle}-${candidate.relationType}`} className="text-sm">
            <div>{labelFromMap(relationTypeLabels, candidate.relationType)} · {candidate.targetTitle}</div>
            <div className="text-muted-foreground">来源 {labelFromMap(relationCandidateSourceLabels, candidate.source)} · 可信度 {formatConfidence(candidate.confidence)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ParserProfileCard({ profile }: { profile: ParserProfile }) {
  return (
    <div className="rounded-md border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{profile.version}</Badge>
        <Badge variant={profile.enabled ? "secondary" : "outline"}>{profile.enabled ? "已启用" : "已停用"}</Badge>
      </div>
      <div className="mt-2 font-medium">{profile.displayName}</div>
      <div className="mt-1 text-xs text-muted-foreground">{profile.parserProfile}</div>
      <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
        <div>
          <div className="text-xs text-muted-foreground">Raw Material</div>
          <div className="mt-1">{profile.supportedRawMaterialTypes.map((type) => labelFromMap(rawMaterialTypeLabels, type)).join("、")}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Source</div>
          <div className="mt-1">{profile.supportedSourceTypes.map((type) => labelFromMap(sourceTypeLabels, type)).join("、")}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">输出格式</div>
          <div className="mt-1">{labelFromMap(contentFormatLabels, profile.contentFormat)}</div>
        </div>
      </div>
    </div>
  )
}

function rawMaterialDisplayType(rawMaterial: RawMaterial) {
  return rawMaterial.fileType ?? labelFromMap(rawMaterialTypeLabels, rawMaterial.rawMaterialType)
}

function formatConfidence(confidence: number | undefined) {
  return confidence === undefined ? "无" : `${Math.round(confidence * 100)}%`
}

function formatMetadataSummary(metadata: KnowledgeMetadata | undefined) {
  if (!metadata) return "无"

  return Object.entries(metadata)
    .slice(0, 4)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join("；")
}

function formatKnowledgeRelations(relations: KnowledgeRelation[] | undefined) {
  if (!relations?.length) return "无"

  return relations
    .map((relation) => {
      const target = mockWikiNodes.find((node) => node.nodeId === relation.targetNodeId)
      return `${labelFromMap(relationTypeLabels, relation.relationType)} -> ${target?.title ?? relation.targetNodeId}`
    })
    .join("；")
}
