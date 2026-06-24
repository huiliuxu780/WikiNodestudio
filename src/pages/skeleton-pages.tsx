import { Link, useParams } from "react-router-dom"
import type { ReactNode } from "react"

import { mockIndexSegments } from "@/data/mock-index-segments"
import { mockKnowledgeBases } from "@/data/mock-knowledge-bases"
import { mockQualityIssues } from "@/data/mock-quality-issues"
import { mockRawMaterials } from "@/data/mock-raw-materials"
import { mockRetrievalLogs } from "@/data/mock-retrieval"
import { mockSources } from "@/data/mock-sources"
import { mockUsers } from "@/data/mock-users"
import { mockWikiNodes } from "@/data/mock-wiki-nodes"
import { PageHeader } from "@/components/layout/page-header"
import { SegmentDebugPanel } from "@/components/segments/segment-debug-panel"
import { SegmentStrategyCard } from "@/components/segments/segment-strategy-card"
import { IndexSegmentTable } from "@/components/segments/index-segment-table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkList } from "@/components/wiki/link-list"
import {
  indexStatusLabels,
  labelFromMap,
  healthLabels,
  metadataLabels,
  nodeTypeLabels,
  parseStatusLabels,
  sourceTypeLabels,
  storageProviderLabels,
  statusLabels,
  syncStatusLabels,
  userRoleLabels,
  userStatusLabels,
} from "@/utils/display-labels"
import { getIncomingLinks } from "@/utils/link-parser"

const routeCards = {
  同步任务: ["飞书同步", "PDF 解析", "历史知识库导入"],
  同步日志: ["6 个已同步来源", "1 个待解析任务", "1 个失败文档"],
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
  const source = mockSources.find((item) => item.sourceId === sourceId) ?? mockSources[0]

  return (
    <PageScaffold title="知识来源详情" description={source.title}>
      <SummaryGrid items={[
        ["来源类型", labelFromMap(sourceTypeLabels, source.sourceType)],
        ["负责人", source.owner],
        ["同步状态", labelFromMap(syncStatusLabels, source.syncStatus)],
        ["生成 WikiNode", String(source.generatedNodes)],
      ]} />
    </PageScaffold>
  )
}

export function RawMaterialListPage() {
  return (
    <PageScaffold title="原始材料" description="解析文档和 WikiNode 标准化之前的原始来源快照。">
      <SimpleList items={mockRawMaterials.map((item) => `${item.rawMaterialId} ${item.title} ${labelFromMap(parseStatusLabels, item.parseStatus)}`)} />
    </PageScaffold>
  )
}

export function RawMaterialDetailPage() {
  const { rawMaterialId } = useParams()
  const raw = mockRawMaterials.find((item) => item.rawMaterialId === rawMaterialId) ?? mockRawMaterials[0]

  return (
    <PageScaffold title="原始材料详情" description={raw.title}>
      <SummaryGrid items={[
        ["文件类型", raw.fileType],
        ["存储位置", labelFromMap(storageProviderLabels, raw.storageProvider)],
        ["解析状态", labelFromMap(parseStatusLabels, raw.parseStatus)],
        ["解析文档", raw.parsedDocumentId ?? "尚未生成"],
      ]} />
    </PageScaffold>
  )
}

export function ParsedResultPreviewPage() {
  return (
    <PageScaffold title="解析结果预览" description="进入 WikiNode 标准化之前的 Markdown、表格、来源证据和章节层级。">
      <SimpleList items={["标题层级", "段落来源证据", "表格抽取预览", "图片引用"]} />
    </PageScaffold>
  )
}

export function WikiNodeDetailPage() {
  const { nodeId } = useParams()
  const node = mockWikiNodes.find((item) => item.nodeId === nodeId || item.slug === nodeId) ?? mockWikiNodes[0]

  return (
    <PageScaffold title="WikiNode 详情" description={node.title}>
      <SummaryGrid items={[
        ["WikiNode", node.title],
        ["发布状态", statusLabels[node.status]],
        ["索引状态", indexStatusLabels[node.indexStatus]],
        ["负责人", node.owner],
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
      description="Index Segment 是从 WikiNode / Knowledge Object 生成的受控索引和召回单元，并始终关联父级 WikiNode。"
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
