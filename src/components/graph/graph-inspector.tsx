import { Link } from "react-router-dom"
import { ExternalLinkIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WikiLink, WikiNode } from "@/types/wiki"
import type { KnowledgeGraphEdge } from "@/utils/knowledge-graph"
import { commonLabels, indexStatusLabels, labelFromMap, metadataLabels, objectTypeLabels, relationTypeLabels, statusLabels, subtypeLabels } from "@/utils/display-labels"

export function GraphInspector({
  node,
  incomingRelations,
  outgoingRelations,
  incomingWikiLinks,
  outgoingWikiLinks,
  brokenLinks,
}: {
  node?: WikiNode
  incomingRelations: KnowledgeGraphEdge[]
  outgoingRelations: KnowledgeGraphEdge[]
  incomingWikiLinks: WikiLink[]
  outgoingWikiLinks: WikiLink[]
  brokenLinks: WikiLink[]
}) {
  if (!node) {
    return (
      <Card data-testid="knowledge-graph-inspector" className="min-h-0">
        <CardHeader>
          <CardTitle className="text-base">图谱详情</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          请选择一个 WikiNode / Knowledge Object 查看关系和来源证据。
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-testid="knowledge-graph-inspector" className="min-h-0">
      <CardHeader>
        <CardTitle className="text-base">{node.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex max-h-[calc(100svh-13rem)] flex-col gap-4 overflow-y-auto text-sm">
        <p className="text-muted-foreground">{node.summary}</p>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary">{labelFromMap(objectTypeLabels, node.objectType ?? "Article")}</Badge>
          <Badge variant="outline">{labelFromMap(subtypeLabels, node.subtype ?? node.nodeType)}</Badge>
          <Badge variant="outline">{indexStatusLabels[node.indexStatus]}</Badge>
        </div>
        <InfoGrid
          rows={[
            [metadataLabels.objectType, labelFromMap(objectTypeLabels, node.objectType ?? "Article")],
            [metadataLabels.subtype, labelFromMap(subtypeLabels, node.subtype ?? node.nodeType)],
            [metadataLabels.nodeType, node.nodeType],
            [metadataLabels.status, statusLabels[node.status]],
            [metadataLabels.indexStatus, indexStatusLabels[node.indexStatus]],
            [metadataLabels.processingProfile, node.processingProfile ?? commonLabels.none],
          ]}
        />
        <PanelSection title="关键元数据">
          <InfoGrid rows={metadataRows(node)} />
        </PanelSection>
        <PanelSection title="出向关系">
          <RelationList edges={outgoingRelations} emptyText="暂无出向语义关系。" />
        </PanelSection>
        <PanelSection title="入向关系">
          <RelationList edges={incomingRelations} emptyText="暂无入向语义关系。" />
        </PanelSection>
        <PanelSection title="来源证据">
          <SourceEvidenceList node={node} />
        </PanelSection>
        <PanelSection title="WikiLink / 反向链接 / 断链">
          <InfoGrid
            rows={[
              ["出向 WikiLink", outgoingWikiLinks.length],
              ["反向链接", incomingWikiLinks.length],
              ["断链", brokenLinks.length],
            ]}
          />
          <WikiLinkList links={[...outgoingWikiLinks, ...brokenLinks]} />
        </PanelSection>
        <Button asChild data-testid="knowledge-graph-open-node">
          <Link to={`/wiki-nodes/${node.nodeId}`}>
            <ExternalLinkIcon data-icon="inline-start" />
            打开 WikiNode
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {children}
    </section>
  )
}

function InfoGrid({ rows }: { rows: Array<[string, string | number]> }) {
  if (!rows.length) {
    return <p className="text-xs text-muted-foreground">暂无字段值。</p>
  }

  return (
    <div className="grid gap-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2">
          <span className="text-muted-foreground">{label}</span>
          <span className="truncate font-medium">{String(value)}</span>
        </div>
      ))}
    </div>
  )
}

function RelationList({ edges, emptyText }: { edges: KnowledgeGraphEdge[]; emptyText: string }) {
  if (!edges.length) return <p className="text-xs text-muted-foreground">{emptyText}</p>

  return (
    <div className="flex flex-col gap-2">
      {edges.map((edge) => (
        <div key={edge.edgeId} className="rounded-md border bg-background px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={edge.resolved ? "outline" : "destructive"}>{labelFromMap(relationTypeLabels, edge.relationType)}</Badge>
            <span className="truncate text-xs text-muted-foreground">
              {edge.sourceTitle} {"->"} {edge.targetTitle}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function SourceEvidenceList({ node }: { node: WikiNode }) {
  if (!node.sourceRefs.length) return <p className="text-xs text-muted-foreground">暂无来源证据。</p>

  return (
    <div className="flex flex-col gap-2">
      {node.sourceRefs.map((source) => (
        <div key={`${source.sourceId}-${source.id ?? source.sourceRecordId ?? source.paragraphRef}`} className="rounded-md border bg-background px-3 py-2">
          <div className="font-medium">{source.sourceName ?? source.sourceTitle}</div>
          <div className="mt-1 grid gap-1 text-xs text-muted-foreground">
            <span>{metadataLabels.sourceType}：{source.sourceType}</span>
            <span>{metadataLabels.confidence}：{source.confidence ?? commonLabels.none}</span>
            <span>{metadataLabels.sourceRecordId}：{source.sourceRecordId ?? commonLabels.none}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function WikiLinkList({ links }: { links: WikiLink[] }) {
  if (!links.length) return <p className="text-xs text-muted-foreground">暂无 WikiLink。</p>

  return (
    <div className="flex flex-col gap-2">
      {links.slice(0, 6).map((link) => (
        <div key={link.linkId} className="flex flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs">
          <Badge variant={link.resolved ? "outline" : "destructive"}>{link.resolved ? "WikiLink" : "异常 WikiLink"}</Badge>
          <span className="truncate text-muted-foreground">{link.fromTitle} {"->"} {link.targetTitle}</span>
        </div>
      ))}
    </div>
  )
}

function metadataRows(node: WikiNode): Array<[string, string | number]> {
  return Object.entries(node.metadata ?? {})
    .slice(0, 8)
    .map(([key, value]) => [key, formatMetadataValue(value)])
}

function formatMetadataValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value)
  if (value == null) return commonLabels.none
  return JSON.stringify(value)
}
