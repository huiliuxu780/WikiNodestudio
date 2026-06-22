import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IndexStatusBadge } from "@/components/wiki/index-status-badge"
import { LinkList } from "@/components/wiki/link-list"
import { SourceRefList } from "@/components/wiki/source-ref-list"
import type { WikiLink, WikiNode } from "@/types/wiki"

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
  return (
    <aside className="min-h-0 border-l bg-muted/20 p-3">
      <Tabs defaultValue="metadata" className="flex h-full flex-col gap-3">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metadata">Meta</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="index">Index</TabsTrigger>
        </TabsList>
        <TabsContent value="metadata" className="mt-0 flex flex-col gap-3 text-sm">
          <MetaRow label="nodeId" value={node.nodeId} />
          <MetaRow label="nodeType" value={node.nodeType} />
          <MetaRow label="status" value={node.status} />
          <div className="flex flex-wrap gap-1">
            {node.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
          <MetaRow label="createdAt" value={node.createdAt} />
          <MetaRow label="updatedAt" value={node.updatedAt} />
        </TabsContent>
        <TabsContent value="links" className="mt-0 flex flex-col gap-4">
          <PanelSection title="Outgoing Links">
            <LinkList links={outgoingLinks} emptyText="No outgoing links." />
          </PanelSection>
          <PanelSection title="Incoming Links">
            <LinkList links={incomingLinks} emptyText="No incoming links." />
          </PanelSection>
          <PanelSection title="Broken Links">
            <LinkList links={brokenLinks} emptyText="No broken links." />
          </PanelSection>
        </TabsContent>
        <TabsContent value="sources" className="mt-0">
          <SourceRefList sourceRefs={node.sourceRefs} />
        </TabsContent>
        <TabsContent value="index" className="mt-0 flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">indexStatus</span>
            <IndexStatusBadge status={node.indexStatus} />
          </div>
          <MetaRow label="lastIndexedAt" value={node.lastIndexedAt ?? "not indexed"} />
          <MetaRow label="vector document id" value={`mock-vector-doc-${node.nodeId}`} />
          <div className="rounded-md border bg-background p-3">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Indexed content preview</div>
            <p className="line-clamp-5 text-sm text-muted-foreground">{node.contentMarkdown}</p>
          </div>
          <p className="text-xs text-muted-foreground">Only published nodes can be indexed.</p>
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
