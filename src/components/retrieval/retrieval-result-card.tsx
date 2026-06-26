import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndexStatusBadge } from "@/components/wiki/index-status-badge"
import { MatchedSegmentList } from "@/components/retrieval/matched-segment-list"
import { NodeTypeBadge } from "@/components/wiki/node-type-badge"
import { StatusBadge } from "@/components/wiki/status-badge"
import type { RetrievalResult } from "@/types/retrieval"
import { toPercent } from "@/utils/formatters"
import { actionLabels, commonLabels, formatMatchedFields, formatMatchedReason } from "@/utils/display-labels"

export function RetrievalResultCard({ result }: { result: RetrievalResult }) {
  const tags = result.node.tags ?? []
  const sourceRefs = result.node.sourceRefs ?? []
  const outgoingLinks = result.outgoingLinks ?? []
  const incomingLinks = result.incomingLinks ?? []
  const matchedSegments = result.matchedSegments ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">{result.node.title}</CardTitle>
          <div className="mt-2 flex flex-wrap gap-2">
            <NodeTypeBadge type={result.node.nodeType} />
            <StatusBadge status={result.node.status} />
            <IndexStatusBadge status={result.node.indexStatus} />
            <Badge variant="outline">置信度 {toPercent(result.score)}</Badge>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to={`/wiki-nodes/${result.node.nodeId}`}>{actionLabels.openWikiNode}</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <p className="text-muted-foreground">{result.node.summary}</p>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
        <InfoRow label="召回结果类型" value="WikiNode（业务知识节点）" />
        <InfoRow label="为什么命中" value={formatMatchedReason(result.matchedReason)} />
        <InfoRow label="命中字段" value={formatMatchedFields(result.matchedFields)} />
        <InfoRow label="来源证据" value={sourceRefs.map((source) => source.sourceTitle).join("、") || commonLabels.none} />
        <InfoRow
          label="WikiLink 上下文"
          value={`出链：${outgoingLinks.map((link) => link.targetTitle).join("、") || commonLabels.none}；入链：${incomingLinks.map((link) => link.fromTitle).join("、") || commonLabels.none}`}
        />
        {matchedSegments.length ? <MatchedSegmentList segments={matchedSegments} /> : null}
        <div className="rounded-md border bg-muted/30 p-3">
          <div className="mb-1 text-xs font-medium text-muted-foreground">正文摘录</div>
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
