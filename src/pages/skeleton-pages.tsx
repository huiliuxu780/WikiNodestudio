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
import { getIncomingLinks } from "@/utils/link-parser"

const routeCards = {
  "Sync Jobs": ["Feishu sync", "PDF parser", "Legacy KB import"],
  "Sync Logs": ["6 synced sources", "1 pending parse", "1 failed document"],
  Backlinks: ["保修期内维修服务政策", "收费政策", "人为损坏判定规则"],
  "Impact Analysis": ["Publishing impact", "Broken WikiLink impact", "Index Segment impact"],
  "Vector Store Sync": ["Aliyun config", "Volcano config", "Dry-run sync status"],
  "Index Jobs": ["indexed", "outdated", "failed"],
  "Retrieval Debug": ["Query trace", "Matched Index Segments", "WikiNode result mapping"],
  "Retrieval API Docs": ["POST /api/knowledge/retrieve", "WikiNode result", "Debug matchedSegments"],
  "Query Logs": mockRetrievalLogs.map((log) => `${log.query} -> ${log.topNodeTitle}`),
  "Evaluation Cases": ["保修收费", "人为损坏", "预约改约"],
  "Tags & Metadata": ["保修", "收费", "洗碗机", "人为损坏"],
  "Node Types": ["policy", "procedure", "guide", "fee_rule"],
  "Metadata Fields": ["businessDomain", "brand", "productCategory", "securityLevel"],
  "Quality Issues": mockQualityIssues.map((issue) => `${issue.issueId} ${issue.nodeTitle}`),
  "Conflict Detection": ["收费政策 vs 配件价格查询说明", "延保政策 vs 保修政策"],
  "Expired Knowledge": ["售后政策术语表", "历史客服口径"],
  "Duplicate Knowledge": ["收费说明重复候选", "安装注意事项重复候选"],
  "Retrieval Evaluation": ["topK consistency", "WikiNode precision", "segment evidence quality"],
  "Parser Engine": ["Markdown parser", "Table parser", "Image refs"],
  "Storage Engine": ["Raw material snapshots", "Parsed document store", "Source refs"],
  "Embedding Config": ["External vector store only", "No local embedding pipeline in MVP"],
  "System Health": ["Mock frontend healthy", "No backend dependency", "Harness checks required"],
  Users: mockUsers.map((user) => `${user.name} ${user.email}`),
  Roles: ["owner", "editor", "reviewer", "viewer"],
  Permissions: ["read", "edit", "review", "admin"],
  "Audit Logs": ["WikiNode updated", "Index Segment generated", "Retrieval tested"],
}

export function KnowledgeBaseListPage() {
  return (
    <PageScaffold title="Knowledge Bases 知识库" description="Manage WikiNode-centered knowledge bases and retrieval health.">
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
                <Badge variant="outline">{kb.wikiNodeCount} WikiNodes</Badge>
                <Badge variant="outline">{kb.sourceCount} Sources</Badge>
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
    <PageScaffold title={`${kb.name} Knowledge Base Detail`} description={kb.description}>
      <SummaryGrid items={[
        ["Business domain", kb.businessDomain],
        ["WikiNodes", String(kb.wikiNodeCount)],
        ["Sources", String(kb.sourceCount)],
        ["Index health", kb.indexHealth],
      ]} />
    </PageScaffold>
  )
}

export function KnowledgeBaseSettingsPage() {
  return (
    <PageScaffold title="Knowledge Base Settings" description="Mock-only workspace settings for retrieval and indexing boundaries.">
      <SummaryGrid items={[
        ["Default result object", "WikiNode"],
        ["Debug evidence", "matchedSegments"],
        ["Vector database ownership", "External vector stores only"],
        ["Approval flow", "Out of scope for this skeleton"],
      ]} />
    </PageScaffold>
  )
}

export function SourceDetailPage() {
  const { sourceId } = useParams()
  const source = mockSources.find((item) => item.sourceId === sourceId) ?? mockSources[0]

  return (
    <PageScaffold title="Source Detail" description={source.title}>
      <SummaryGrid items={[
        ["Source type", source.sourceType],
        ["Owner", source.owner],
        ["Sync status", source.syncStatus],
        ["Generated WikiNodes", String(source.generatedNodes)],
      ]} />
    </PageScaffold>
  )
}

export function RawMaterialListPage() {
  return (
    <PageScaffold title="Raw Materials" description="Original source snapshots before parsed documents and WikiNode normalization.">
      <SimpleList items={mockRawMaterials.map((item) => `${item.rawMaterialId} ${item.title} ${item.parseStatus}`)} />
    </PageScaffold>
  )
}

export function RawMaterialDetailPage() {
  const { rawMaterialId } = useParams()
  const raw = mockRawMaterials.find((item) => item.rawMaterialId === rawMaterialId) ?? mockRawMaterials[0]

  return (
    <PageScaffold title="Raw Material Detail" description={raw.title}>
      <SummaryGrid items={[
        ["File type", raw.fileType],
        ["Storage", raw.storageProvider],
        ["Parse status", raw.parseStatus],
        ["Parsed document", raw.parsedDocumentId ?? "Not generated"],
      ]} />
    </PageScaffold>
  )
}

export function ParsedResultPreviewPage() {
  return (
    <PageScaffold title="Parsed Result Preview" description="Markdown, tables, source_refs, and section hierarchy before WikiNode normalization.">
      <SimpleList items={["Heading hierarchy", "Paragraph source refs", "Table extraction preview", "Image references"]} />
    </PageScaffold>
  )
}

export function WikiNodeDetailPage() {
  const { nodeId } = useParams()
  const node = mockWikiNodes.find((item) => item.nodeId === nodeId || item.slug === nodeId) ?? mockWikiNodes[0]

  return (
    <PageScaffold title="WikiNode Detail" description={node.title}>
      <SummaryGrid items={[
        ["WikiNode", node.title],
        ["Status", node.status],
        ["Index status", node.indexStatus],
        ["Owner", node.owner],
      ]} />
    </PageScaffold>
  )
}

export function BacklinksPage() {
  return (
    <PageScaffold title="Backlinks" description="Incoming WikiLinks grouped by target WikiNode.">
      <div className="grid gap-4 lg:grid-cols-2">
        {mockWikiNodes.slice(0, 6).map((node) => (
          <Card key={node.nodeId}>
            <CardHeader><CardTitle className="text-base">{node.title}</CardTitle></CardHeader>
            <CardContent><LinkList links={getIncomingLinks(node.nodeId, mockWikiNodes)} emptyText="No backlinks yet." /></CardContent>
          </Card>
        ))}
      </div>
    </PageScaffold>
  )
}

export function IndexSegmentListPage() {
  return (
    <PageScaffold
      title="Index Segments"
      description="Index Segment is the controlled retrieval/indexing unit derived from a WikiNode / Knowledge Object. Index Segments are controlled retrieval units generated from WikiNodes before vector-store sync and remain attached to parent WikiNodes."
    >
      <IndexSegmentTable segments={mockIndexSegments} />
    </PageScaffold>
  )
}

export function SegmentStrategyPage() {
  return (
    <PageScaffold title="Segment Strategy" description="ObjectType-aware mock rules for WikiNode / Knowledge Object to Index Segment generation.">
      <SegmentStrategyCard />
    </PageScaffold>
  )
}

export function SegmentDebugPage() {
  return (
    <PageScaffold title="Segment Debug" description="Inspect mock Index Segment evidence without exposing it as the primary retrieval result.">
      <SegmentDebugPanel segment={mockIndexSegments[0]} />
    </PageScaffold>
  )
}

export function GenericSkeletonPage({ title, description }: { title: keyof typeof routeCards | string; description?: string }) {
  return (
    <PageScaffold title={title} description={description ?? "Static mock-only skeleton page for the WikiNode Studio product IA."}>
      <SimpleList items={(routeCards as Record<string, string[]>)[title] ?? ["Mock module", "Navigation target", "No real backend connection"]} />
    </PageScaffold>
  )
}

export function PublishingPage() {
  return <GenericSkeletonPage title="Publishing & Index" description="Mock publishing, index, and vector-store sync overview." />
}

export function SystemVectorStorePage() {
  return (
    <PageScaffold title="Vector Store" description="This system configures external vector stores; it does not implement or own a vector database.">
      <SimpleList items={["Aliyun vector store config", "Volcano vector store config", "External ownership boundary"]} />
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
