import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockIndexSegments } from "@/data/mock-index-segments"
import { IndexStatusBadge } from "@/components/wiki/index-status-badge"
import { LinkList } from "@/components/wiki/link-list"
import { SourceRefList } from "@/components/wiki/source-ref-list"
import type { WikiLink, WikiNode } from "@/types/wiki"
import { commonLabels, indexStatusLabels, metadataLabels, nodeTypeLabels, statusLabels } from "@/utils/display-labels"

const reviewStatusLabels: Record<NonNullable<WikiNode["reviewStatus"]>, string> = {
  not_required: "Not required",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
}

const publishStatusLabels: Record<NonNullable<WikiNode["publishStatus"]>, string> = {
  not_published: "Not published",
  published: "Published",
  unpublished: "Unpublished",
}

const securityLevelLabels: Record<NonNullable<WikiNode["securityLevel"]>, string> = {
  public: "Public",
  internal: "Internal",
  confidential: "Confidential",
}

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
  const firstVectorDocId = nodeSegments.find((segment) => segment.vectorDocId)?.vectorDocId

  return (
    <aside className="min-h-0 border-l bg-muted/20 p-3" data-testid="wikinode-inspector">
      <Tabs defaultValue="metadata" className="flex h-full flex-col gap-3">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="index">Index</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
        </TabsList>
        <TabsContent value="metadata" className="mt-0 min-h-0 overflow-y-auto text-sm">
          <div className="flex flex-col gap-2 pr-1">
          <div className="rounded-md border bg-background p-3 text-muted-foreground">
            Knowledge Object fields extend WikiNode without replacing the existing nodeType filters.
          </div>
          <MetaRow label={metadataLabels.nodeId} value={node.nodeId} />
          <MetaRow label="Slug" value={node.slug} />
          <MetaRow label="Knowledge Object" value={node.objectType ?? commonLabels.none} />
          <MetaRow label="Subtype" value={node.subtype ?? commonLabels.none} />
          <MetaRow label="Processing Profile" value={node.processingProfile ?? commonLabels.none} />
          <MetaRow label={metadataLabels.nodeType} value={nodeTypeLabels[node.nodeType]} />
          <MetaRow label="Business Domain" value={node.businessDomain ?? commonLabels.none} />
          <MetaRow label="Brand" value={node.brand ?? commonLabels.none} />
          <MetaRow label="Product Category" value={node.productCategory ?? commonLabels.none} />
          <MetaRow label="Scenario" value={node.scenario ?? commonLabels.none} />
          <MetaRow label={metadataLabels.status} value={statusLabels[node.status]} />
          <MetaRow label="Review Status" value={node.reviewStatus ? reviewStatusLabels[node.reviewStatus] : commonLabels.none} />
          <MetaRow label="Publish Status" value={node.publishStatus ? publishStatusLabels[node.publishStatus] : commonLabels.none} />
          <div className="flex flex-wrap gap-1 rounded-md border bg-background px-3 py-2">
            {node.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
          <MetaRow label="Owner" value={node.owner} />
          <MetaRow label="Security Level" value={node.securityLevel ? securityLevelLabels[node.securityLevel] : commonLabels.none} />
          <MetaRow label="Effective Date" value={node.effectiveDate ?? commonLabels.none} />
          <MetaRow label="Expired Date" value={node.expiredDate ?? commonLabels.none} />
          <MetaRow label={metadataLabels.version} value={`v${node.version}`} />
          <MetaRow label={metadataLabels.createdAt} value={node.createdAt} />
          <MetaRow label={metadataLabels.updatedAt} value={node.updatedAt} />
          {node.metadata ? (
            <PanelSection title="Extensible metadata">
              <div className="flex flex-col gap-2">
                {Object.entries(node.metadata).map(([key, value]) => (
                  <MetaRow key={key} label={key} value={formatMetadataValue(value)} />
                ))}
              </div>
            </PanelSection>
          ) : null}
          </div>
        </TabsContent>
        <TabsContent value="links" className="mt-0 min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-4 pr-1">
          <PanelSection title="Outgoing Links">
            <LinkList links={outgoingLinks} emptyText="暂无出链。" />
          </PanelSection>
          <PanelSection title="Incoming Links">
            <LinkList links={incomingLinks} emptyText="暂无入链。" />
          </PanelSection>
          <PanelSection title="Broken Links">
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
          <MetaRow label="Index Status" value={indexStatusLabels[node.indexStatus]} />
          <MetaRow label={metadataLabels.lastIndexedAt} value={node.lastIndexedAt ?? "尚未索引"} />
          <MetaRow label="Vector Doc ID" value={firstVectorDocId ?? commonLabels.none} />
          <MetaRow label="Publish Status" value={node.publishStatus ? publishStatusLabels[node.publishStatus] : commonLabels.none} />
          <div className="rounded-md border bg-background p-3 text-muted-foreground">
            Only published WikiNodes can be indexed.
          </div>
          <div className="rounded-md border bg-background p-3">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Indexed content preview</div>
            <p className="line-clamp-5 text-sm text-muted-foreground">{node.contentMarkdown || commonLabels.none}</p>
          </div>
          </div>
        </TabsContent>
        <TabsContent value="segments" className="mt-0 min-h-0 overflow-y-auto text-sm">
          <div className="flex flex-col gap-3 pr-1">
          <div className="rounded-md border bg-background p-3 text-muted-foreground">
            Index Segments are controlled retrieval units generated from WikiNodes before vector-store sync. They are not internal chunks generated by external vector databases.
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-md border bg-background p-3 text-xs text-muted-foreground">
            <span>objectType: {node.objectType ?? "Article"}</span>
            <span>subtype: {node.subtype ?? node.nodeType}</span>
            <span>segment count: {nodeSegments.length}</span>
            <span>indexStatus: {node.indexStatus}</span>
            <span className="col-span-2">processingProfile: {node.processingProfile ?? commonLabels.none}</span>
            <span className="col-span-2">sourceRef evidence: {node.sourceRefs.map((sourceRef) => sourceRef.id ?? sourceRef.sourceId).join(", ") || commonLabels.none}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="rounded-md border bg-background px-3 py-1 text-xs font-medium hover:bg-muted" to="/index-segments">Open Index Segments</Link>
            <Link className="rounded-md border bg-background px-3 py-1 text-xs font-medium hover:bg-muted" to="/index-segments/debug">Open Segment Debug</Link>
          </div>
          {nodeSegments.map((segment) => (
            <div key={segment.segmentId} className="rounded-md border bg-background p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{segment.segmentId}</Badge>
                <Badge variant="secondary">Index Segment</Badge>
                <Badge variant="outline">{segment.objectType ?? "Article"}</Badge>
                <Badge variant="outline">{segment.subtype ?? commonLabels.none}</Badge>
                <Badge variant="outline">{segment.segmentType}</Badge>
                <IndexStatusBadge status={segment.indexStatus} />
              </div>
              <p className="text-muted-foreground">{segment.contentPreview}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>tokenCount: {segment.tokenCount}</span>
                <span>enabled: {segment.enabled ? "true" : "false"}</span>
                <span>vectorDocId: {segment.vectorDocId ?? commonLabels.none}</span>
                <span>retrievalHits: {segment.retrievalHits}</span>
                <span>avgScore: {segment.avgScore?.toFixed(2) ?? commonLabels.none}</span>
                <span>lastIndexedAt: {segment.lastIndexedAt ?? commonLabels.none}</span>
                <span className="col-span-2">processingProfile: {segment.processingProfile ?? commonLabels.none}</span>
                <span className="col-span-2">sourceRefIds: {segment.sourceRefIds?.join(", ") ?? commonLabels.none}</span>
              </div>
            </div>
          ))}
          {!nodeSegments.length ? <p className="text-sm text-muted-foreground">No Index Segments for this WikiNode yet.</p> : null}
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

function formatMetadataValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  if (value == null) {
    return commonLabels.none
  }

  return JSON.stringify(value)
}
