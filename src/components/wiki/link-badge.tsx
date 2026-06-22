import { Link } from "react-router-dom"
import { Link2Icon, Link2OffIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { WikiNode } from "@/types/wiki"

export function LinkBadge({
  title,
  resolved,
  node,
}: {
  title: string
  resolved: boolean
  node?: WikiNode
}) {
  const content = (
    <Badge variant={resolved ? "secondary" : "destructive"} className="mx-0.5 align-middle">
      {resolved ? <Link2Icon data-icon="inline-start" /> : <Link2OffIcon data-icon="inline-start" />}
      {title}
    </Badge>
  )

  if (!resolved || !node) return content
  return <Link to={`/wiki-nodes/${node.nodeId}`}>{content}</Link>
}

