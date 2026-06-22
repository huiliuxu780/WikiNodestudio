import { Badge } from "@/components/ui/badge"
import type { WikiNodeType } from "@/types/wiki"
import { nodeTypeLabels } from "@/utils/formatters"

export function NodeTypeBadge({ type }: { type: WikiNodeType }) {
  return <Badge variant="secondary">{nodeTypeLabels[type]}</Badge>
}

