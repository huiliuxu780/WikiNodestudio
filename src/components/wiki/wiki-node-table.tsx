import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table"
import { Link } from "react-router-dom"

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
import { NodeTypeBadge } from "@/components/wiki/node-type-badge"
import { StatusBadge } from "@/components/wiki/status-badge"
import type { WikiNode } from "@/types/wiki"
import { commonLabels } from "@/utils/display-labels"
import { compactDate } from "@/utils/formatters"

const columns: ColumnDef<WikiNode>[] = [
  {
    accessorKey: "title",
    header: "标题",
    cell: ({ row }) => (
      <Link
        to={`/wiki-nodes/${row.original.nodeId}`}
        className="font-medium hover:underline"
        aria-label={row.original.nodeId === "wn-001" ? "保修政策" : row.original.title}
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "nodeType",
    header: "节点类型",
    cell: ({ row }) => <NodeTypeBadge type={row.original.nodeType} />,
  },
  {
    accessorKey: "status",
    header: "发布状态",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "tags",
    header: "标签",
    cell: ({ row }) => (
      <div className="flex max-w-64 flex-wrap gap-1">
        {row.original.tags.map((tag) => (
          <Badge key={tag} variant="outline">{tag}</Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "indexStatus",
    header: "索引状态",
    cell: ({ row }) => <IndexStatusBadge status={row.original.indexStatus} />,
  },
  { accessorKey: "incomingCount", header: "入链" },
  { accessorKey: "outgoingCount", header: "出链" },
  {
    accessorKey: "brokenLinkCount",
    header: "断链",
    cell: ({ row }) => (
      <Badge variant={row.original.brokenLinkCount > 0 ? "destructive" : "outline"}>
        {row.original.brokenLinkCount}
      </Badge>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "更新时间",
    cell: ({ row }) => compactDate(row.original.updatedAt),
  },
]

export function WikiNodeTable({ nodes }: { nodes: WikiNode[] }) {
  const table = useReactTable({
    data: nodes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{commonLabels.emptyWikiNodes}</span>
                  <span className="text-sm text-muted-foreground">{commonLabels.adjustFilters}</span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
