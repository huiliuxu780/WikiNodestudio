import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockWikiNodes } from "@/data/mock-wiki-nodes"
import { IndexStatusBadge } from "@/components/wiki/index-status-badge"
import { LinkList } from "@/components/wiki/link-list"
import { SourceRefList } from "@/components/wiki/source-ref-list"
import type { IndexSegment } from "@/types/index-segment"
import type { KnowledgeRelation, WikiLink, WikiNode } from "@/types/wiki"
import {
  commonLabels,
  indexStatusLabels,
  labelFromMap,
  metadataLabels,
  nodeTypeLabels,
  objectTypeLabels,
  publishStatusLabels,
  relationSourceLabels,
  relationStatusLabels,
  relationTypeLabels,
  reviewStatusLabels,
  securityLevelLabels,
  statusLabels,
  subtypeLabels,
} from "@/utils/display-labels"

export function WikiNodeInspector({
  node,
  outgoingLinks,
  incomingLinks,
  brokenLinks,
  indexSegments,
  onGenerateIndexSegments,
  isGeneratingIndexSegments = false,
  segmentGenerationFeedback = "",
}: {
  node: WikiNode
  outgoingLinks: WikiLink[]
  incomingLinks: WikiLink[]
  brokenLinks: WikiLink[]
  indexSegments: IndexSegment[]
  onGenerateIndexSegments?: () => void
  isGeneratingIndexSegments?: boolean
  segmentGenerationFeedback?: string
}) {
  const nodeSegments = indexSegments
  const firstVectorDocId = nodeSegments.find((segment) => segment.vectorDocId)?.vectorDocId

  return (
    <aside className="min-h-0 border-l bg-muted/20 p-3" data-testid="wikinode-inspector">
      <Tabs defaultValue="metadata" className="flex h-full flex-col gap-3">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metadata">元数据</TabsTrigger>
          <TabsTrigger value="relations">关联关系</TabsTrigger>
          <TabsTrigger value="links">双链</TabsTrigger>
        </TabsList>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sources">来源</TabsTrigger>
          <TabsTrigger value="index">索引</TabsTrigger>
          <TabsTrigger value="segments">片段</TabsTrigger>
        </TabsList>
        <TabsContent value="metadata" className="mt-0 min-h-0 overflow-y-auto text-sm">
          <div className="flex flex-col gap-2 pr-1">
          <div className="rounded-md border bg-background p-3 text-muted-foreground">
            Knowledge Object 字段用于扩展 WikiNode，不替代当前节点类型筛选。
          </div>
          <MetaRow label={metadataLabels.nodeId} value={node.nodeId} />
          <MetaRow label={metadataLabels.slug} value={node.slug} />
          <MetaRow label={metadataLabels.objectType} value={labelFromMap(objectTypeLabels, node.objectType ?? "Article")} />
          <MetaRow label={metadataLabels.subtype} value={labelFromMap(subtypeLabels, node.subtype ?? commonLabels.none)} />
          <MetaRow label={metadataLabels.processingProfile} value={node.processingProfile ?? commonLabels.none} />
          <MetaRow label={metadataLabels.nodeType} value={nodeTypeLabels[node.nodeType]} />
          <MetaRow label={metadataLabels.businessDomain} value={node.businessDomain ?? commonLabels.none} />
          <MetaRow label={metadataLabels.brand} value={node.brand ?? commonLabels.none} />
          <MetaRow label={metadataLabels.productCategory} value={node.productCategory ?? commonLabels.none} />
          <MetaRow label={metadataLabels.scenario} value={node.scenario ?? commonLabels.none} />
          <MetaRow label={metadataLabels.status} value={statusLabels[node.status]} />
          <MetaRow label={metadataLabels.reviewStatus} value={node.reviewStatus ? reviewStatusLabels[node.reviewStatus] : commonLabels.none} />
          <MetaRow label={metadataLabels.publishStatus} value={node.publishStatus ? publishStatusLabels[node.publishStatus] : commonLabels.none} />
          <div className="flex flex-wrap gap-1 rounded-md border bg-background px-3 py-2">
            {node.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
          <MetaRow label={metadataLabels.owner} value={node.owner} />
          <MetaRow label={metadataLabels.securityLevel} value={node.securityLevel ? securityLevelLabels[node.securityLevel] : commonLabels.none} />
          <MetaRow label={metadataLabels.effectiveDate} value={node.effectiveDate ?? commonLabels.none} />
          <MetaRow label={metadataLabels.expiredDate} value={node.expiredDate ?? commonLabels.none} />
          <MetaRow label={metadataLabels.version} value={`v${node.version}`} />
          <MetaRow label={metadataLabels.createdAt} value={node.createdAt} />
          <MetaRow label={metadataLabels.updatedAt} value={node.updatedAt} />
          {node.metadata ? (
            <PanelSection title="扩展元数据">
              <div className="flex flex-col gap-2">
                {Object.entries(node.metadata).map(([key, value]) => (
                  <MetaRow key={key} label={key} value={formatMetadataValue(value)} />
                ))}
              </div>
            </PanelSection>
          ) : null}
          <PanelSection title="Knowledge Object 承载字段">
            <div className="rounded-md border bg-background p-3 text-xs text-muted-foreground">
              objectType / subtype / metadata / sourceRefs / relations / processingProfile
            </div>
          </PanelSection>
          </div>
        </TabsContent>
        <TabsContent value="relations" className="mt-0 min-h-0 overflow-y-auto text-sm">
          <RelationSurface
            node={node}
            outgoingLinks={outgoingLinks}
            brokenLinks={brokenLinks}
          />
        </TabsContent>
        <TabsContent value="links" className="mt-0 min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-4 pr-1">
          <PanelSection title="出向 WikiLink">
            <LinkList links={outgoingLinks} emptyText="暂无出链。" />
          </PanelSection>
          <PanelSection title="入向 WikiLink">
            <LinkList links={incomingLinks} emptyText="暂无入链。" />
          </PanelSection>
          <PanelSection title="异常 WikiLink">
            <LinkList links={brokenLinks} emptyText="暂无断链。" />
          </PanelSection>
          </div>
        </TabsContent>
        <TabsContent value="sources" className="mt-0 min-h-0 overflow-y-auto pr-1">
          <SourceRefList sourceRefs={node.sourceRefs} />
        </TabsContent>
        <TabsContent value="index" className="mt-0 min-h-0 overflow-y-auto text-sm">
          <div className="flex flex-col gap-3 pr-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{metadataLabels.indexStatus}</span>
            <IndexStatusBadge status={node.indexStatus} />
          </div>
          <MetaRow label={metadataLabels.indexStatus} value={indexStatusLabels[node.indexStatus]} />
          <MetaRow label={metadataLabels.lastIndexedAt} value={node.lastIndexedAt ?? "尚未索引"} />
          <MetaRow label={metadataLabels.vectorDocId} value={firstVectorDocId ?? commonLabels.none} />
          <MetaRow label={metadataLabels.publishStatus} value={node.publishStatus ? publishStatusLabels[node.publishStatus] : commonLabels.none} />
          <div className="rounded-md border bg-background p-3 text-muted-foreground">
            只有已发布的 WikiNode 可以进入索引流程。
          </div>
          <div className="rounded-md border bg-background p-3">
            <div className="mb-2 text-xs font-medium text-muted-foreground">索引内容预览</div>
            <p className="line-clamp-5 text-sm text-muted-foreground">{node.contentMarkdown || commonLabels.none}</p>
          </div>
          </div>
        </TabsContent>
        <TabsContent value="segments" className="mt-0 min-h-0 overflow-y-auto text-sm">
          <div className="flex flex-col gap-3 pr-1">
          <div className="rounded-md border bg-background p-3 text-muted-foreground">
            Index Segment 是 WikiNode 发布前生成的受控召回片段，不是外部向量库内部自动生成的片段。
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-md border bg-background p-3 text-xs text-muted-foreground">
            <span>{metadataLabels.objectType}：{labelFromMap(objectTypeLabels, node.objectType ?? "Article")}</span>
            <span>{metadataLabels.subtype}：{labelFromMap(subtypeLabels, node.subtype ?? node.nodeType)}</span>
            <span>片段数量：{nodeSegments.length}</span>
            <span>{metadataLabels.indexStatus}：{indexStatusLabels[node.indexStatus]}</span>
            <span className="col-span-2">{metadataLabels.processingProfile}：{node.processingProfile ?? commonLabels.none}</span>
            <span className="col-span-2">来源证据：{node.sourceRefs.map((sourceRef) => sourceRef.id ?? sourceRef.sourceId).join(", ") || commonLabels.none}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="rounded-md border bg-background px-3 py-1 text-xs font-medium hover:bg-muted" to="/index-segments">打开 Index Segment</Link>
            <Link className="rounded-md border bg-background px-3 py-1 text-xs font-medium hover:bg-muted" to="/index-segments/debug">打开片段调试</Link>
            {onGenerateIndexSegments ? (
              <Button size="sm" variant="outline" onClick={onGenerateIndexSegments} disabled={isGeneratingIndexSegments}>
                {isGeneratingIndexSegments ? "生成中..." : "生成本地片段"}
              </Button>
            ) : null}
          </div>
          {segmentGenerationFeedback ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
              {segmentGenerationFeedback}
            </div>
          ) : null}
          {nodeSegments.map((segment) => (
            <div key={segment.segmentId} className="rounded-md border bg-background p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{segment.segmentId}</Badge>
                <Badge variant="secondary">Index Segment</Badge>
                <Badge variant="outline">{labelFromMap(objectTypeLabels, segment.objectType ?? "Article")}</Badge>
                <Badge variant="outline">{labelFromMap(subtypeLabels, segment.subtype ?? commonLabels.none)}</Badge>
                <Badge variant="outline">{segment.segmentType}</Badge>
                {isLocalDeterministicSegment(segment) ? <Badge variant="outline">本地确定性生成</Badge> : null}
                <IndexStatusBadge status={segment.indexStatus} />
              </div>
              <p className="text-muted-foreground">{segment.contentPreview}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>{metadataLabels.tokenCount}：{segment.tokenCount}</span>
                <span>{metadataLabels.enabled}：{segment.enabled ? "是" : "否"}</span>
                <span>{metadataLabels.vectorDocId}：{segment.vectorDocId ?? commonLabels.none}</span>
                <span>{metadataLabels.retrievalHits}：{segment.retrievalHits}</span>
                <span>{metadataLabels.avgScore}：{segment.avgScore?.toFixed(2) ?? commonLabels.none}</span>
                <span>{metadataLabels.lastIndexedAt}：{segment.lastIndexedAt ?? commonLabels.none}</span>
                <span className="col-span-2">{metadataLabels.processingProfile}：{segment.processingProfile ?? commonLabels.none}</span>
                <span className="col-span-2">来源证据 ID：{segment.sourceRefIds?.join(", ") || commonLabels.none}</span>
              </div>
            </div>
          ))}
          {!nodeSegments.length ? <p className="text-sm text-muted-foreground">当前 WikiNode 暂无 Index Segment。</p> : null}
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  )
}

function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {children}
    </section>
  )
}

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  )
}

function RelationSurface({
  node,
  outgoingLinks,
  brokenLinks,
}: {
  node: WikiNode
  outgoingLinks: WikiLink[]
  brokenLinks: WikiLink[]
}) {
  const structuredRelations = node.relations ?? []
  const markdownRelations = outgoingLinks
  const unresolvedRelations = brokenLinks

  return (
    <div className="flex flex-col gap-4 pr-1">
      <PanelSection title="关系总览">
        <div className="grid grid-cols-3 gap-2">
          <RelationCount label="结构化关系" value={structuredRelations.length} />
          <RelationCount label="Markdown 双链" value={markdownRelations.length} />
          <RelationCount label="未解析" value={unresolvedRelations.length} />
        </div>
      </PanelSection>

      <PanelSection title="结构化关系">
        <KnowledgeRelationList relations={structuredRelations} sourceRefs={node.sourceRefs} />
      </PanelSection>

      <PanelSection title="正文双链">
        <WikiLinkRelationList links={markdownRelations} />
      </PanelSection>

      <PanelSection title="断链 / 待确认">
        <WikiLinkRelationList links={unresolvedRelations} emptyText="暂无未解析关系。" />
      </PanelSection>
    </div>
  )
}

function RelationCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}

function KnowledgeRelationList({
  relations,
  sourceRefs,
}: {
  relations: KnowledgeRelation[] | undefined
  sourceRefs: WikiNode["sourceRefs"]
}) {
  if (!relations?.length) {
    return <p className="rounded-md border bg-background p-3 text-sm text-muted-foreground">暂无结构化关系。</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {relations.map((relation) => {
        const target = mockWikiNodes.find((node) => node.nodeId === relation.targetNodeId)
        const relationLabel = labelFromMap(relationTypeLabels, relation.relationType)
        const evidence = sourceRefs.find((sourceRef) => sourceRef.id === relation.evidence?.sourceRefId || sourceRef.sourceId === relation.evidence?.sourceRefId)
        const status = relation.status ?? (target ? "active" : "broken")
        const source = relation.source ?? (relation.createdBy === "user" ? "manual" : "system")
        const group = relationGroupLabel(relation.relationType)

        return (
          <div key={relation.id ?? `${relation.relationType}-${relation.targetNodeId}`} className="rounded-md border bg-background p-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{group}</Badge>
                  <Badge variant={status === "broken" ? "destructive" : "secondary"}>
                    {labelFromMap(relationStatusLabels, status)}
                  </Badge>
                  <Badge variant="outline">{labelFromMap(relationSourceLabels, source)}</Badge>
                </div>
                <div className="mt-2 font-medium">{relationLabel} -&gt; {target?.title ?? relation.targetNodeId}</div>
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
              <span>目标对象：{target ? `${target.title} / ${labelFromMap(objectTypeLabels, target.objectType ?? "Article")}` : relation.targetNodeId}</span>
              <span>方向：{relation.direction === "incoming" ? "入向" : "出向"}</span>
              <span>证据：{evidence?.sourceTitle ?? relation.evidence?.sourceRefId ?? commonLabels.none}</span>
              <span>置信度：{relation.confidence ?? commonLabels.none}</span>
              {relation.anchorText ? <span>上下文：{relation.anchorText}</span> : null}
              {relation.note ? <span>备注：{relation.note}</span> : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function WikiLinkRelationList({ links, emptyText = "暂无正文双链关系。" }: { links: WikiLink[]; emptyText?: string }) {
  if (!links.length) {
    return <p className="rounded-md border bg-background p-3 text-sm text-muted-foreground">{emptyText}</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {links.map((link) => {
        const status = link.resolved ? "active" : "broken"

        return (
          <div key={link.linkId} className="rounded-md border bg-background p-3 text-sm data-[broken=true]:border-destructive/60" data-broken={!link.resolved}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">引用知识</Badge>
                  <Badge variant={link.resolved ? "secondary" : "destructive"}>
                    {labelFromMap(relationStatusLabels, status)}
                  </Badge>
                  <Badge variant="outline">{relationSourceLabels.markdown_link}</Badge>
                </div>
                <div className="mt-2 font-medium">{labelFromMap(relationTypeLabels, link.relationType)} -&gt; {link.toTitle ?? link.targetTitle}</div>
                <div className="mt-1 text-xs text-muted-foreground">来源 WikiNode：{link.fromTitle}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function relationGroupLabel(relationType: string) {
  if (relationType === "applies_to") return "适用范围"
  if (relationType === "references" || relationType === "reference" || relationType === "has_policy") return "引用知识"
  if (relationType === "related_to" || relationType === "explains") return "相关知识"
  if (relationType === "replaces") return "替代关系"
  if (relationType === "conflicts_with") return "冲突关系"
  if (relationType === "derived_from" || relationType === "has_asset" || relationType === "has_manual" || relationType === "has_part_catalog") return "来源依据"
  if (relationType === "broken_wikilink") return "断链 / 待确认"

  return "关联关系"
}

function formatMetadataValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  if (value == null) {
    return commonLabels.none
  }

  return JSON.stringify(value)
}

function isLocalDeterministicSegment(segment: IndexSegment) {
  return segment.metadata?.generationMode === "local_deterministic" ||
    segment.metadataSummary?.some((item) => item.label === "generationMode" && item.value === "local_deterministic")
}
