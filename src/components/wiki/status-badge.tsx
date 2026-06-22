import { Badge } from "@/components/ui/badge"
import type { WikiNodeStatus } from "@/types/wiki"
import { statusLabels } from "@/utils/formatters"

export function StatusBadge({ status }: { status: WikiNodeStatus }) {
  return (
    <Badge variant={status === "published" ? "default" : "outline"}>
      {statusLabels[status]}
    </Badge>
  )
}

