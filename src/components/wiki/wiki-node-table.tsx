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
import { compactDate } from "@/utils/formatters"

const columns: ColumnDef<WikiNode>[] = [
  {
    accessorKey: "title",
    header: "title",
    cell: ({ row }) => (
      <Link to={`/wiki-nodes/${row.original.nodeId}`} className="font-medium hover:underline">
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "nodeType",
    header: "nodeType",
    cell: ({ row }) => <NodeTypeBadge type={row.original.nodeType} />,
  },
  {
    accessorKey: "status",
    header: "status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "tags",
    header: "tags",
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
    header: "indexStatus",
    cell: ({ row }) => <IndexStatusBadge status={row.original.indexStatus} />,
  },
  { accessorKey: "incomingCount", header: "incoming" },
  { accessorKey: "outgoingCount", header: "outgoing" },
  {
    accessorKey: "brokenLinkCount",
    header: "broken",
    cell: ({ row }) => (
      <Badge variant={row.original.brokenLinkCount > 0 ? "destructive" : "outline"}>
        {row.original.brokenLinkCount}
      </Badge>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "updatedAt",
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

