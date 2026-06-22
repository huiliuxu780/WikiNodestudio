import { Badge } from "@/components/ui/badge"
import type { WikiIndexStatus } from "@/types/wiki"
import { indexStatusLabels } from "@/utils/formatters"

export function IndexStatusBadge({ status }: { status: WikiIndexStatus }) {
  const variant = status === "failed" ? "destructive" : status === "indexed" ? "secondary" : "outline"

  return <Badge variant={variant}>{indexStatusLabels[status]}</Badge>
}

