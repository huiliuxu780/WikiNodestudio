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
import { commonLabels, indexStatusLabels, labelFromMap, metadataLabels, objectTypeLabels, sourceTypeLabels, subtypeLabels } from "@/utils/display-labels"

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
            搜索 Index Segment
            <Input
              aria-label="搜索 Index Segment"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="标题、内容、WikiNode、objectType、subtype、元数据"
            />
          </label>
          <FilterSelect label="Knowledge Object 类型" value={objectType} values={objectTypeOptions} labels={objectTypeLabels} onChange={setObjectType} />
          <FilterSelect label="索引状态" value={indexStatus} values={indexStatusOptions} labels={indexStatusLabels} onChange={setIndexStatus} />
          <FilterSelect label="片段类型" value={segmentType} values={segmentTypeOptions} onChange={setSegmentType} />
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
              重置
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>片段 ID</TableHead>
                <TableHead>父级 WikiNode</TableHead>
                <TableHead>Knowledge Object 类型</TableHead>
                <TableHead>业务子类型</TableHead>
                <TableHead>片段类型</TableHead>
                <TableHead>内容预览</TableHead>
                <TableHead>索引状态</TableHead>
                <TableHead>向量文档 ID</TableHead>
                <TableHead>召回次数</TableHead>
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
                  <TableCell>{labelFromMap(objectTypeLabels, segment.objectType ?? "Article")}</TableCell>
                  <TableCell>{labelFromMap(subtypeLabels, segment.subtype ?? commonLabels.none)}</TableCell>
                  <TableCell><Badge variant="outline">{segment.segmentType}</Badge></TableCell>
                  <TableCell className="max-w-sm text-muted-foreground">{segment.contentPreview}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <IndexStatusBadge status={segment.indexStatus} />
                      <span className="text-xs text-muted-foreground">{indexStatusLabels[segment.indexStatus]}</span>
                    </div>
                  </TableCell>
                  <TableCell>{segment.vectorDocId ?? "-"}</TableCell>
                  <TableCell>{segment.retrievalHits}</TableCell>
                </TableRow>
              ))}
              {!filteredSegments.length ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                    暂无符合当前筛选条件的 Index Segment。
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
        <CardContent className="p-4 text-sm text-muted-foreground">请选择一个 Index Segment 查看召回证据。</CardContent>
      </Card>
    )
  }

  return (
    <Card data-testid="index-segment-preview" className="h-fit">
      <CardHeader>
        <CardTitle className="text-base">片段预览</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div className="rounded-md border bg-muted/20 p-3 text-muted-foreground">
          父级 WikiNode / Knowledge Object 是业务可管理对象；这里展示进入同步前的 Index Segment 证据。
        </div>
        <div className="rounded-md border bg-muted/20 p-3 text-muted-foreground">
          当前只展示本地验收数据，不执行 embedding 或真实向量库同步。
        </div>
        <InfoRow label="片段标题" value={segment.title ?? segment.segmentId} />
        <InfoRow label="Index Segment 来源 WikiNode" value={segment.nodeTitle} />
        <InfoRow label="父级 WikiNode / Knowledge Object" value={segment.nodeTitle} />
        <InfoRow label={metadataLabels.objectType} value={labelFromMap(objectTypeLabels, segment.objectType ?? "Article")} />
        <InfoRow label={metadataLabels.subtype} value={labelFromMap(subtypeLabels, segment.subtype ?? commonLabels.none)} />
        <InfoRow label="片段类型" value={segment.segmentType} />
        <InfoRow label={metadataLabels.indexStatus} value={indexStatusLabels[segment.indexStatus]} />
        <InfoRow label={metadataLabels.vectorDocId} value={segment.vectorDocId ?? commonLabels.none} />
        <InfoRow label={metadataLabels.processingProfile} value={segment.processingProfile ?? commonLabels.none} />
        <InfoRow label={metadataLabels.createdAt} value={segment.createdAt ?? commonLabels.none} />
        <InfoRow label={metadataLabels.updatedAt} value={segment.updatedAt ?? commonLabels.none} />
        <div className="rounded-md border bg-background p-3">
          <div className="mb-1 text-xs font-medium text-muted-foreground">内容证据</div>
          <p className="text-muted-foreground">{segment.contentPreview}</p>
        </div>
        <div className="rounded-md border bg-background p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">元数据摘要</div>
          <div className="flex flex-wrap gap-1">
            {segment.metadataSummary?.map((item) => (
              <Badge key={`${item.label}-${item.value}`} variant="outline">{item.label}：{item.value}</Badge>
            ))}
          </div>
        </div>
        <div className="rounded-md border bg-background p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">来源证据范围</div>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {segment.sourceRefs.map((sourceRef) => (
              <span key={sourceRef.id ?? sourceRef.sourceId}>
                {metadataLabels.sourceType} {labelFromMap(sourceTypeLabels, sourceRef.sourceType)} · {sourceRef.sourceName ?? sourceRef.sourceTitle} · {sourceRef.evidenceRange ?? sourceRef.paragraphRef ?? sourceRef.sourceRecordId ?? "待补充证据范围"}
              </span>
            ))}
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to={`/wiki-nodes/${segment.nodeId}`}>打开 WikiNode</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function FilterSelect({
  label,
  value,
  values,
  labels = {},
  onChange,
}: {
  label: string
  value: string
  values: string[]
  labels?: Record<string, string>
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
        <option value="all">全部</option>
        {values.map((item) => (
          <option key={item} value={item}>{labelFromMap(labels, item)}</option>
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
