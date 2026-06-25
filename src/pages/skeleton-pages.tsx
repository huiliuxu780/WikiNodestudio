import { Link, useParams } from "react-router-dom"
import type { ReactNode } from "react"
import type { KnowledgeMetadata, KnowledgeRelation } from "@/types/wiki"

import { mockIndexSegments } from "@/data/mock-index-segments"
import { mockKnowledgeBases } from "@/data/mock-knowledge-bases"
import { mockQualityIssues } from "@/data/mock-quality-issues"
import { mockRetrievalLogs } from "@/data/mock-retrieval"
import { mockUsers } from "@/data/mock-users"
import { mockWikiNodes } from "@/data/mock-wiki-nodes"
import { ApiErrorNotice } from "@/components/api-error-notice"
import { PageHeader } from "@/components/layout/page-header"
import { SegmentDebugPanel } from "@/components/segments/segment-debug-panel"
import { SegmentStrategyCard } from "@/components/segments/segment-strategy-card"
import { IndexSegmentTable } from "@/components/segments/index-segment-table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkList } from "@/components/wiki/link-list"
import { useAsyncData } from "@/hooks/use-async-data"
import { listParserProfiles } from "@/services/parser-profile-api-service"
import {
  getRawMaterial,
  getDraftWikiNodeSuggestion,
  getSource,
  listDraftWikiNodeSuggestionsForParsedDocument,
  listDraftWikiNodeSuggestionsForRawMaterial,
  listParsedDocumentsForRawMaterial,
  listRawMaterials,
  listRawMaterialsForSource,
  listSourceOperationsForRawMaterial,
  listSourceOperationsForSource,
} from "@/services/source-api-service"
import type { ParserProfile } from "@/types/parser-profile"
import type { DraftWikiNodeSuggestion } from "@/types/draft-wikinode-suggestion"
import type { ParsedDocument, RawMaterial } from "@/types/raw-material"
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

const routeCards = {
  同步任务: ["当前不执行真实同步任务", "展示 Source 到 Raw Material 的验收边界", "后台任务留到后续阶段"],
  同步日志: ["当前不写入真实同步日志", "仅展示来源状态口径", "真实任务日志留到后续阶段"],
  Backlinks: ["保修期内维修服务政策", "收费政策", "人为损坏判定规则"],
  影响分析: ["发布影响", "断链影响", "Index Segment 影响"],
  外部向量库同步: ["阿里云配置", "火山引擎配置", "试运行同步状态"],
  索引任务: ["已索引", "待更新", "索引失败"],
  召回调试: ["查询链路", "命中的 Index Segment", "WikiNode 结果映射"],
  "Retrieval API 文档": ["POST /api/knowledge/retrieve", "WikiNode 结果", "调试模式 matchedSegments"],
  查询日志: mockRetrievalLogs.map((log) => `${log.query} -> ${log.topNodeTitle}`),
  评测用例: ["保修收费", "人为损坏", "预约改约"],
  标签与元数据: ["保修", "收费", "洗碗机", "人为损坏"],
  节点类型: ["policy", "procedure", "guide", "fee_rule"].map((value) => labelFromMap(nodeTypeLabels, value)),
  元数据字段: ["businessDomain", "brand", "productCategory", "securityLevel"].map((value) => labelFromMap(metadataLabels, value)),
  质量问题: mockQualityIssues.map((issue) => `${issue.issueId} ${issue.nodeTitle}`),
  冲突检测: ["收费政策 vs 配件价格查询说明", "延保政策 vs 保修政策"],
  过期知识: ["售后政策术语表", "历史客服口径"],
  重复知识: ["收费说明重复候选", "安装注意事项重复候选"],
  召回评测: ["TopK 一致性", "WikiNode 命中精度", "片段证据质量"],
  解析引擎: ["Markdown 解析器", "表格解析器", "图片引用"],
  存储引擎: ["原始材料快照", "解析文档存储", "来源证据"],
  向量模型配置: ["仅配置外部向量库", "MVP 不实现本地向量化流程"],
  系统健康: ["前端基线可用", "当前页不依赖真实后端", "需要 Harness 检查"],
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
        ["索引健康度", labelFromMap(healthLabels, kb.indexHealth)],
      ]} />
    </PageScaffold>
  )
}

export function KnowledgeBaseSettingsPage() {
  return (
    <PageScaffold title="知识库设置" description="仅展示召回和索引边界的本地配置基线。">
      <SummaryGrid items={[
        ["默认返回对象", "WikiNode"],
        ["调试证据", "matchedSegments"],
        ["向量存储边界", "仅配置外部向量库"],
        ["审批流", "不在当前范围"],
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

  return (
    <PageScaffold title="知识来源详情" description={source ? `${source.title}。当前页面只展示来源配置和生成 WikiNode 的验收基线。` : "查看 Source 到 Raw Material 的只读证据链。"}>
      <ApiErrorNotice error={sourceError} onRetry={reloadSource} />
      <ApiErrorNotice error={rawMaterialsError} onRetry={reloadRawMaterials} />
      <ApiErrorNotice error={operationsError} onRetry={reloadOperations} />
      {isSourceLoading ? <LoadingBlock text="正在加载知识来源..." /> : null}
      {source ? (
        <SummaryGrid items={[
          ["来源类型", labelFromMap(sourceTypeLabels, source.sourceType)],
          ["负责人", source.owner],
          ["同步状态", labelFromMap(syncStatusLabels, source.syncStatus)],
          ["Raw Material", `${source.rawMaterialCount} 个`],
          ["生成 WikiNode", String(source.generatedNodes)],
        ]} />
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">证据链位置</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <Badge variant="outline" className="w-fit">Source 阶段</Badge>
            <p className="text-muted-foreground">Source 是原始知识来源，只负责说明来源类别、负责人、同步结果和后续快照入口。</p>
            <p className="font-medium">{"Source -> Raw Material -> Parsed Document -> WikiNode"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">下一步只读检查</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>当前阶段不会启动同步、授权连接或后台任务。</p>
            <p>真实 Source import、文件上传和解析留到后续阶段。</p>
            <p>当前仅沿着已有样例数据查看 Raw Material 和 WikiNode 证据。</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">关联 Raw Material</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {isRawMaterialsLoading ? (
            <LoadingBlock text="正在加载 Raw Material..." />
          ) : relatedRawMaterials.length === 0 ? (
            <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              当前 Source 暂无关联 Raw Material。真实同步和快照生成不在本轮范围内。
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
        "只读来源验收基线",
        "不执行真实同步、授权连接或后台任务。",
        "真实 Source import、文件上传和解析留到后续阶段。",
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
    <PageScaffold title="原始材料" description="查看 Source 进入 WikiNode 标准化之前保留的原始快照；当前不提供真实上传或解析执行。">
      <ApiErrorNotice error={error} onRetry={reload} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">快照清单</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-[1fr_1.2fr]">
          <div className="rounded-md border bg-muted/20 px-3 py-2">
            <div className="font-medium">{"Source -> Raw Material -> Parsed Document"}</div>
            <p className="mt-1 text-muted-foreground">Raw Material 是 Source 的快照证据，还不是 WikiNode。</p>
          </div>
          <div className="rounded-md border border-dashed px-3 py-2">
            <div className="font-medium">当前只读：不会上传、下载、重新解析或访问真实存储。</div>
            <p className="mt-1 text-muted-foreground">点击条目只进入后端只读详情页。</p>
          </div>
        </CardContent>
      </Card>
      <SimpleList items={[
        "Raw Material 是 Source 同步或上传后的原始快照。",
        "当前不提供文件上传或重新解析。",
        "Parsed Document 仅作为标准化内容预览。",
      ]} />
      <Card>
        <CardContent className="grid gap-2 p-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <LoadingBlock text="正在加载 Raw Material..." />
          ) : rawMaterials.length === 0 ? (
            <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">暂无 Raw Material。真实上传和同步不在当前范围内。</div>
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

  return (
    <PageScaffold title="原始材料详情" description={raw?.title ?? "查看 Raw Material 到 Parsed Document 的只读证据链。"}>
      <ApiErrorNotice error={rawError} onRetry={reloadRaw} />
      <ApiErrorNotice error={sourceError} onRetry={reloadSource} />
      <ApiErrorNotice error={parsedDocumentsError} onRetry={reloadParsedDocuments} />
      <ApiErrorNotice error={operationsError} onRetry={reloadOperations} />
      <ApiErrorNotice error={suggestionsError} onRetry={reloadSuggestions} />
      {isRawLoading ? <LoadingBlock text="正在加载 Raw Material..." /> : null}
      {raw ? (
        <SummaryGrid items={[
          ["材料类型", rawMaterialDisplayType(raw)],
          ["来源版本", raw.sourceVersion ?? "无"],
          ["存储位置", labelFromMap(storageProviderLabels, raw.storageProvider)],
          ["解析状态", labelFromMap(parseStatusLabels, raw.parseStatus)],
          ["Parsed Document", `${raw.parsedDocumentCount} 个`],
        ]} />
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">证据链位置</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <Badge variant="outline" className="w-fit">Raw Material 阶段</Badge>
            <p className="text-muted-foreground">Raw Material 是从 Source 捕获的原始快照，只作为 Parsed Document 和 WikiNode 的来源证据。</p>
            <p className="font-medium">{"Source -> Raw Material -> Parsed Document -> WikiNode"}</p>
          </CardContent>
        </Card>
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
              <div className="text-muted-foreground">尚未生成 Parsed Document，本页不会触发解析任务。</div>
            )}
            <p className="text-muted-foreground">当前不提供下载、重新解析或真实存储访问。</p>
          </CardContent>
        </Card>
      </div>
      <SimpleList items={[
        "仅展示原始材料元数据和解析状态。",
        "下载、重新解析和真实存储访问均未开放。",
        "真实文件存储、解析任务和访问控制留到后续阶段。",
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

  return (
    <PageScaffold title="解析结果预览" description="查看进入 WikiNode 标准化之前的内容形态和来源证据；当前不运行真实解析器。">
      <ApiErrorNotice error={rawError} onRetry={reloadRaw} />
      <ApiErrorNotice error={parsedDocumentsError} onRetry={reloadParsedDocuments} />
      <ApiErrorNotice error={sourceError} onRetry={reloadSource} />
      <ApiErrorNotice error={suggestionsError} onRetry={reloadSuggestions} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parsed Document 阶段</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <Badge variant="outline">标准化预览</Badge>
            {parsedDocument ? <p className="font-medium text-foreground">{parsedDocument.title}</p> : null}
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
            <p>当前只展示样例来源证据，不访问真实存储。</p>
          </CardContent>
        </Card>
      </div>
      {isParsedDocumentsLoading ? <LoadingBlock text="正在加载 Parsed Document..." /> : null}
      {parsedDocument ? <ParsedDocumentPreview parsedDocument={parsedDocument} /> : null}
      <DraftWikiNodeSuggestionPanel suggestions={suggestions} isLoading={isSuggestionsLoading} mode="detail" />
      <SimpleList items={[
        "Parsed Document 是解析后的标准化内容预览。",
        "当前不运行 PDF / Word / 网页 / 数据库 / API 解析。",
        "这里只说明进入 WikiNode 标准化之前的内容形态。",
      ]} />
      <SimpleList items={["标题层级", "段落来源证据", "表格抽取预览", "图片引用"]} />
    </PageScaffold>
  )
}

export function DraftWikiNodeSuggestionDetailPage() {
  const { suggestionId } = useParams()
  const activeSuggestionId = suggestionId ?? ""
  const {
    data: suggestion,
    error,
    isLoading,
    reload,
  } = useAsyncData<DraftWikiNodeSuggestion | null>(() => activeSuggestionId ? getDraftWikiNodeSuggestion(activeSuggestionId) : Promise.resolve(null), null, [activeSuggestionId])

  return (
    <PageScaffold title="WikiNode 建议详情" description="只读查看 Draft WikiNode Suggestion；本页不会采纳、拒绝、发布、索引或批量转换。">
      <ApiErrorNotice error={error} onRetry={reload} />
      {isLoading ? <LoadingBlock text="正在加载 WikiNode 建议..." /> : null}
      {suggestion ? (
        <>
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
              <p>不是已采纳的 WikiNode，不影响 Retrieval API 结果。当前页面只读，不会生成、采纳、拒绝、发布、索引或批量转换。</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-md border px-2 py-1">Source {suggestion.sourceId}</span>
                <span className="rounded-md border px-2 py-1">Raw Material {suggestion.rawMaterialId}</span>
                <span className="rounded-md border px-2 py-1">Parsed Document {suggestion.parsedDocumentId}</span>
                <span className="rounded-md border px-2 py-1">Source Operation {suggestion.operationId}</span>
              </div>
            </CardContent>
          </Card>
          <DraftWikiNodeSuggestionPanel suggestions={[suggestion]} isLoading={false} mode="detail" />
        </>
      ) : null}
    </PageScaffold>
  )
}

export function WikiNodeDetailPage() {
  const { nodeId } = useParams()
  const node = mockWikiNodes.find((item) => item.nodeId === nodeId || item.slug === nodeId) ?? mockWikiNodes[0]
  const relationSummary = formatKnowledgeRelations(node.relations)
  const sourceEvidence = node.sourceRefs
    .map((sourceRef) => `${sourceRef.sourceName ?? sourceRef.sourceTitle} / ${sourceRef.id ?? sourceRef.sourceId}`)
    .join("；") || "无"

  return (
    <PageScaffold title="WikiNode 详情" description={`${node.title}。WikiNode 是 Knowledge Object carrier，当前页只读展示承载字段。`}>
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
  return (
    <PageScaffold
      title="Index Segment"
      description="Index Segment 是从 WikiNode / Knowledge Object 生成的受控索引和召回单元，并始终关联父级 WikiNode。平台管理的是 WikiNode 发布前的 Index Segment，不管理外部向量库内部片段。"
    >
      <IndexSegmentTable segments={mockIndexSegments} />
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
  return (
    <PageScaffold title="片段调试" description="查看 Index Segment 证据，但不把片段作为主要召回结果。">
      <SegmentDebugPanel segment={mockIndexSegments[0]} />
    </PageScaffold>
  )
}

export function GenericSkeletonPage({ title, description }: { title: keyof typeof routeCards | string; description?: string }) {
  return (
    <PageScaffold title={title} description={description ?? "当前页是 WikiNode Studio 产品信息架构的本地占位基线。"}>
      <SimpleList items={(routeCards as Record<string, string[]>)[title] ?? ["本地占位模块", "导航目标", "当前不连接真实后端"]} />
    </PageScaffold>
  )
}

export function PublishingPage() {
  return <GenericSkeletonPage title="发布与索引" description="展示发布、索引和外部向量库同步的本地占位基线。" />
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
    <PageScaffold title="解析引擎" description="查看允许使用的 Parser Profile；当前页面只读，不运行解析器。">
      <ApiErrorNotice error={error} onRetry={reload} />
      <Card>
        <CardHeader>
          <h2 className="text-base font-medium leading-snug">Parser Profile 只读注册表</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">只展示允许使用的解析 Profile，不会运行解析器或加载插件。</p>
          {isLoading ? (
            <LoadingBlock text="正在加载 Parser Profile..." />
          ) : parserProfiles.length === 0 ? (
            <div className="rounded-md border border-dashed p-3 text-muted-foreground">
              暂无 Parser Profile。解析执行、插件加载和上传不在当前范围内。
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
        "Raw Material 需要匹配 Profile 后才可能进入后续已批准的解析流程。",
        "当前不提供运行解析、加载插件、上传文件或重试操作。",
      ]} />
    </PageScaffold>
  )
}

export function PageScaffold({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={title} description={description} />
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

function SourceOperationLogPanel({ operations, isLoading }: { operations: SourceOperation[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-medium leading-snug">操作日志</h2>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">只读操作日志，不会启动同步、上传、解析或重试。</p>
        {isLoading ? (
          <LoadingBlock text="正在加载操作日志..." />
        ) : operations.length === 0 ? (
          <div className="rounded-md border border-dashed p-3 text-muted-foreground">
            暂无操作日志。当前页面不会创建同步、上传、解析或重试任务。
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
}: {
  suggestions: DraftWikiNodeSuggestion[]
  isLoading: boolean
  mode: "summary" | "detail"
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-medium leading-snug">WikiNode 建议</h2>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">只读建议，不会创建 WikiNode、发布、索引或批量转换。</p>
        {isLoading ? (
          <LoadingBlock text="正在加载 WikiNode 建议..." />
        ) : suggestions.length === 0 ? (
          <div className="rounded-md border border-dashed p-3 text-muted-foreground">
            暂无 WikiNode 建议。当前页面不会生成、采纳、拒绝或批量转换建议。
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
