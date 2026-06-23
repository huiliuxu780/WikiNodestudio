import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IndexStatusBadge } from "@/components/wiki/index-status-badge"
import type { IndexSegment } from "@/types/index-segment"
import { toPercent } from "@/utils/formatters"

export function IndexSegmentTable({ segments }: { segments: IndexSegment[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>segmentId</TableHead>
            <TableHead>nodeTitle</TableHead>
            <TableHead>segmentType</TableHead>
            <TableHead>contentPreview</TableHead>
            <TableHead>enabled</TableHead>
            <TableHead>indexStatus</TableHead>
            <TableHead>vectorDocId</TableHead>
            <TableHead>retrievalHits</TableHead>
            <TableHead>avgScore</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {segments.map((segment) => (
            <TableRow key={segment.segmentId}>
              <TableCell className="font-medium">{segment.segmentId}</TableCell>
              <TableCell>{segment.nodeTitle}</TableCell>
              <TableCell><Badge variant="outline">{segment.segmentType}</Badge></TableCell>
              <TableCell className="max-w-sm text-muted-foreground">{segment.contentPreview}</TableCell>
              <TableCell>{segment.enabled ? "enabled" : "disabled"}</TableCell>
              <TableCell><IndexStatusBadge status={segment.indexStatus} /></TableCell>
              <TableCell>{segment.vectorDocId ?? "-"}</TableCell>
              <TableCell>{segment.retrievalHits}</TableCell>
              <TableCell>{segment.avgScore === undefined ? "-" : toPercent(segment.avgScore)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
