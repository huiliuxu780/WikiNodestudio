import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { mockIndexSegments } from "@/data/mock-index-segments"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IndexStatusBadge } from "@/components/wiki/index-status-badge"
import { LinkList } from "@/components/wiki/link-list"
import { SourceRefList } from "@/components/wiki/source-ref-list"
import type { WikiLink, WikiNode } from "@/types/wiki"
import { commonLabels, metadataLabels, nodeTypeLabels, statusLabels } from "@/utils/display-labels"

export function WikiNodeInspector({
  node,
  outgoingLinks,
  incomingLinks,
  brokenLinks,
}: {
  node: WikiNode
  outgoingLinks: WikiLink[]
  incomingLinks: WikiLink[]
  brokenLinks: WikiLink[]
}) {
  const nodeSegments = mockIndexSegments.filter((segment) => segment.nodeId === node.nodeId)

  return (
    <aside className="min-h-0 border-l bg-muted/20 p-3">
        <Tabs defaultValue="metadata" className="flex h-full flex-col gap-3">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="index">Index</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
        </TabsList>
        <TabsContent value="metadata" className="mt-0 flex flex-col gap-3 text-sm">
          <MetaRow label={metadataLabels.nodeId} value={node.nodeId} />
          <MetaRow label={metadataLabels.nodeType} value={nodeTypeLabels[node.nodeType]} />
          <MetaRow label={metadataLabels.status} value={statusLabels[node.status]} />
          <div className="flex flex-wrap gap-1">
            {node.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
          <MetaRow label={metadataLabels.createdAt} value={node.createdAt} />
          <MetaRow label={metadataLabels.updatedAt} value={node.updatedAt} />
        </TabsContent>
        <TabsContent value="links" className="mt-0 flex flex-col gap-4">
          <PanelSection title="出链">
            <LinkList links={outgoingLinks} emptyText="暂无出链。" />
          </PanelSection>
          <PanelSection title="入链">
            <LinkList links={incomingLinks} emptyText="暂无入链。" />
          </PanelSection>
          <PanelSection title="断链">
            <LinkList links={brokenLinks} emptyText="暂无断链。" />
          </PanelSection>
        </TabsContent>
        <TabsContent value="sources" className="mt-0">
          <SourceRefList sourceRefs={node.sourceRefs} />
        </TabsContent>
        <TabsContent value="index" className="mt-0 flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{metadataLabels.indexStatus}</span>
            <IndexStatusBadge status={node.indexStatus} />
          </div>
          <MetaRow label={metadataLabels.lastIndexedAt} value={node.lastIndexedAt ?? "尚未索引"} />
          <div className="rounded-md border bg-background p-3">
            <div className="mb-2 text-xs font-medium text-muted-foreground">正文预览</div>
            <p className="line-clamp-5 text-sm text-muted-foreground">{node.contentMarkdown || commonLabels.none}</p>
          </div>
        </TabsContent>
        <TabsContent value="segments" className="mt-0 flex flex-col gap-3 text-sm">
          {nodeSegments.map((segment) => (
            <div key={segment.segmentId} className="rounded-md border bg-background p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{segment.segmentId}</Badge>
                <Badge variant="secondary">Index Segment</Badge>
                <Badge variant="outline">{segment.segmentType}</Badge>
              </div>
              <p className="text-muted-foreground">{segment.contentPreview}</p>
            </div>
          ))}
          {!nodeSegments.length ? <p className="text-sm text-muted-foreground">No Index Segments for this WikiNode yet.</p> : null}
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

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  )
}
