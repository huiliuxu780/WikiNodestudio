import { Link } from "react-router-dom"
import { ExternalLinkIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WikiLink, WikiNode } from "@/types/wiki"
import type { KnowledgeGraphEdge } from "@/utils/knowledge-graph"

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
          <CardTitle className="text-base">Inspector</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Select a WikiNode / Knowledge Object to inspect its relations and evidence.
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
          <Badge variant="secondary">{node.objectType ?? "Article"}</Badge>
          <Badge variant="outline">{node.subtype ?? node.nodeType}</Badge>
          <Badge variant="outline">{node.indexStatus}</Badge>
        </div>
        <InfoGrid
          rows={[
            ["objectType", node.objectType ?? "Article"],
            ["subtype", node.subtype ?? node.nodeType],
            ["nodeType", node.nodeType],
            ["status", node.status],
            ["indexStatus", node.indexStatus],
            ["processingProfile", node.processingProfile ?? "none"],
          ]}
        />
        <PanelSection title="Key metadata">
          <InfoGrid rows={metadataRows(node)} />
        </PanelSection>
        <PanelSection title="Outgoing relations">
          <RelationList edges={outgoingRelations} emptyText="No outgoing semantic relations." />
        </PanelSection>
        <PanelSection title="Incoming relations">
          <RelationList edges={incomingRelations} emptyText="No incoming semantic relations." />
        </PanelSection>
        <PanelSection title="Source evidence">
          <SourceEvidenceList node={node} />
        </PanelSection>
        <PanelSection title="WikiLinks / backlinks / broken links">
          <InfoGrid
            rows={[
              ["outgoing WikiLinks", outgoingWikiLinks.length],
              ["backlinks", incomingWikiLinks.length],
              ["broken links", brokenLinks.length],
            ]}
          />
          <WikiLinkList links={[...outgoingWikiLinks, ...brokenLinks]} />
        </PanelSection>
        <Button asChild data-testid="knowledge-graph-open-node">
          <Link to={`/wiki-nodes/${node.nodeId}`}>
            <ExternalLinkIcon data-icon="inline-start" />
            Open WikiNode
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
    return <p className="text-xs text-muted-foreground">No values.</p>
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
            <Badge variant={edge.resolved ? "outline" : "destructive"}>{edge.relationType}</Badge>
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
  if (!node.sourceRefs.length) return <p className="text-xs text-muted-foreground">No sourceRefs.</p>

  return (
    <div className="flex flex-col gap-2">
      {node.sourceRefs.map((source) => (
        <div key={`${source.sourceId}-${source.id ?? source.sourceRecordId ?? source.paragraphRef}`} className="rounded-md border bg-background px-3 py-2">
          <div className="font-medium">{source.sourceName ?? source.sourceTitle}</div>
          <div className="mt-1 grid gap-1 text-xs text-muted-foreground">
            <span>sourceType: {source.sourceType}</span>
            <span>confidence: {source.confidence ?? "none"}</span>
            <span>sourceRecordId: {source.sourceRecordId ?? "none"}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function WikiLinkList({ links }: { links: WikiLink[] }) {
  if (!links.length) return <p className="text-xs text-muted-foreground">No WikiLinks.</p>

  return (
    <div className="flex flex-col gap-2">
      {links.slice(0, 6).map((link) => (
        <div key={link.linkId} className="flex flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs">
          <Badge variant={link.resolved ? "outline" : "destructive"}>{link.resolved ? "WikiLink" : "broken WikiLink"}</Badge>
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
  if (value == null) return "none"
  return JSON.stringify(value)
}
