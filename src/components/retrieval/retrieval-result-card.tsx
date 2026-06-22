import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndexStatusBadge } from "@/components/wiki/index-status-badge"
import { NodeTypeBadge } from "@/components/wiki/node-type-badge"
import { StatusBadge } from "@/components/wiki/status-badge"
import type { RetrievalResult } from "@/types/retrieval"
import { toPercent } from "@/utils/formatters"

export function RetrievalResultCard({ result }: { result: RetrievalResult }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">{result.node.title}</CardTitle>
          <div className="mt-2 flex flex-wrap gap-2">
            <NodeTypeBadge type={result.node.nodeType} />
            <StatusBadge status={result.node.status} />
            <IndexStatusBadge status={result.node.indexStatus} />
            <Badge variant="outline">score {toPercent(result.score)}</Badge>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to={`/wiki-nodes/${result.node.nodeId}`}>Open WikiNode</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <p className="text-muted-foreground">{result.node.summary}</p>
        <div className="flex flex-wrap gap-1">
          {result.node.tags.map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
        <InfoRow label="matchedReason" value={result.matchedReason} />
        <InfoRow label="matchedFields" value={result.matchedFields.join(", ") || "none"} />
        <InfoRow label="sourceRefs" value={result.node.sourceRefs.map((source) => source.sourceTitle).join(", ")} />
        <InfoRow label="outgoingLinks" value={result.outgoingLinks.map((link) => link.targetTitle).join(", ") || "none"} />
        <InfoRow label="incomingLinks" value={result.incomingLinks.map((link) => link.fromTitle).join(", ") || "none"} />
        <div className="rounded-md border bg-muted/30 p-3">
          <div className="mb-1 text-xs font-medium text-muted-foreground">content preview</div>
          <p className="line-clamp-3 text-muted-foreground">{result.node.contentMarkdown}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 md:grid-cols-[140px_1fr]">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  )
}

