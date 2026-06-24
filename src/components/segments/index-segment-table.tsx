import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

export function IndexSegmentTable({ segments }: { segments: IndexSegment[] }) {
  const [query, setQuery] = useState("")
  const [objectType, setObjectType] = useState("all")
  const [indexStatus, setIndexStatus] = useState("all")
  const [segmentType, setSegmentType] = useState("all")
  const [selectedSegmentId, setSelectedSegmentId] = useState(segments[0]?.segmentId)

  const objectTypeOptions = useMemo(() => getUniqueValues(segments.map((segment) => segment.objectType)), [segments])
  const indexStatusOptions = useMemo(() => getUniqueValues(segments.map((segment) => segment.indexStatus)), [segments])
  const segmentTypeOptions = useMemo(() => getUniqueValues(segments.map((segment) => segment.segmentType)), [segments])

  const filteredSegments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return segments.filter((segment) => {
      const searchable = [
        segment.segmentId,
        segment.title,
        segment.content,
        segment.contentPreview,
        segment.nodeTitle,
        segment.objectType,
        segment.subtype,
        segment.processingProfile,
        segment.vectorDocId,
        ...segment.metadataSummary?.flatMap((item) => [item.label, item.value]) ?? [],
      ].filter(Boolean).join(" ").toLowerCase()

      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (objectType === "all" || segment.objectType === objectType) &&
        (indexStatus === "all" || segment.indexStatus === indexStatus) &&
        (segmentType === "all" || segment.segmentType === segmentType)
      )
    })
  }, [indexStatus, objectType, query, segmentType, segments])

  const selectedSegment =
    filteredSegments.find((segment) => segment.segmentId === selectedSegmentId) ?? filteredSegments[0]

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="grid gap-3 rounded-lg border bg-background p-3 md:grid-cols-[minmax(220px,1fr)_180px_180px_180px_auto]">
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Search Index Segments
            <Input
              aria-label="Search Index Segments"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, content, WikiNode, objectType, subtype, metadata"
            />
          </label>
          <FilterSelect label="Object Type" value={objectType} values={objectTypeOptions} onChange={setObjectType} />
          <FilterSelect label="Index Status" value={indexStatus} values={indexStatusOptions} onChange={setIndexStatus} />
          <FilterSelect label="Segment Type" value={segmentType} values={segmentTypeOptions} onChange={setSegmentType} />
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQuery("")
                setObjectType("all")
                setIndexStatus("all")
                setSegmentType("all")
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>segmentId</TableHead>
                <TableHead>nodeTitle</TableHead>
                <TableHead>objectType</TableHead>
                <TableHead>subtype</TableHead>
                <TableHead>segmentType</TableHead>
                <TableHead>contentPreview</TableHead>
                <TableHead>indexStatus</TableHead>
                <TableHead>vectorDocId</TableHead>
                <TableHead>retrievalHits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSegments.map((segment) => (
                <TableRow
                  key={segment.segmentId}
                  data-testid="index-segment-row"
                  className="cursor-pointer"
                  onClick={() => setSelectedSegmentId(segment.segmentId)}
                >
                  <TableCell className="font-medium">{segment.segmentId}</TableCell>
                  <TableCell>{segment.nodeTitle}</TableCell>
                  <TableCell>{segment.objectType ?? "Article"}</TableCell>
                  <TableCell>{segment.subtype ?? "-"}</TableCell>
                  <TableCell><Badge variant="outline">{segment.segmentType}</Badge></TableCell>
                  <TableCell className="max-w-sm text-muted-foreground">{segment.contentPreview}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <IndexStatusBadge status={segment.indexStatus} />
                      <span className="text-xs text-muted-foreground">{segment.indexStatus}</span>
                    </div>
                  </TableCell>
                  <TableCell>{segment.vectorDocId ?? "-"}</TableCell>
                  <TableCell>{segment.retrievalHits}</TableCell>
                </TableRow>
              ))}
              {!filteredSegments.length ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                    No Index Segment matched the current filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>

      <SegmentPreview segment={selectedSegment} />
    </div>
  )
}

function SegmentPreview({ segment }: { segment?: IndexSegment }) {
  if (!segment) {
    return (
      <Card data-testid="index-segment-preview">
        <CardContent className="p-4 text-sm text-muted-foreground">Select an Index Segment to inspect retrieval evidence.</CardContent>
      </Card>
    )
  }

  return (
    <Card data-testid="index-segment-preview" className="h-fit">
      <CardHeader>
        <CardTitle className="text-base">Segment Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div className="rounded-md border bg-muted/20 p-3 text-muted-foreground">
          Parent WikiNode / Knowledge Object is the managed product object. This preview shows Index Segment evidence before vector-store sync.
        </div>
        <InfoRow label="Segment title" value={segment.title ?? segment.segmentId} />
        <InfoRow label="Parent WikiNode / Knowledge Object" value={segment.nodeTitle} />
        <InfoRow label="objectType" value={segment.objectType ?? "Article"} />
        <InfoRow label="subtype" value={segment.subtype ?? "-"} />
        <InfoRow label="segmentType" value={segment.segmentType} />
        <InfoRow label="indexStatus" value={segment.indexStatus} />
        <InfoRow label="vectorDocId" value={segment.vectorDocId ?? "-"} />
        <InfoRow label="processingProfile" value={segment.processingProfile ?? "-"} />
        <InfoRow label="createdAt" value={segment.createdAt ?? "-"} />
        <InfoRow label="updatedAt" value={segment.updatedAt ?? "-"} />
        <div className="rounded-md border bg-background p-3">
          <div className="mb-1 text-xs font-medium text-muted-foreground">Content preview</div>
          <p className="text-muted-foreground">{segment.contentPreview}</p>
        </div>
        <div className="rounded-md border bg-background p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">Metadata summary</div>
          <div className="flex flex-wrap gap-1">
            {segment.metadataSummary?.map((item) => (
              <Badge key={`${item.label}-${item.value}`} variant="outline">{item.label}: {item.value}</Badge>
            ))}
          </div>
        </div>
        <div className="rounded-md border bg-background p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">sourceRef summary</div>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {segment.sourceRefs.map((sourceRef) => (
              <span key={sourceRef.id ?? sourceRef.sourceId}>
                sourceType {sourceRef.sourceType} · {sourceRef.sourceName ?? sourceRef.sourceTitle} · {sourceRef.evidenceRange ?? sourceRef.paragraphRef ?? sourceRef.sourceRecordId ?? "evidence range pending"}
              </span>
            ))}
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to={`/wiki-nodes/${segment.nodeId}`}>Open WikiNode</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function FilterSelect({
  label,
  value,
  values,
  onChange,
}: {
  label: string
  value: string
  values: string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      {label}
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="all">All</option>
        {values.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    </label>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  )
}

function getUniqueValues(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort()
}
