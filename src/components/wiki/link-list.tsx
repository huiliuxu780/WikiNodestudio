import { Link } from "react-router-dom"
import { ExternalLinkIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { WikiLink } from "@/types/wiki"
import { labelFromMap, linkStatusLabels, relationSourceLabels, relationStatusLabels, relationTypeLabels } from "@/utils/display-labels"

export function LinkList({
  links,
  emptyText,
}: {
  links: WikiLink[]
  emptyText: string
}) {
  if (!links.length) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {links.map((link) => (
        <div key={link.linkId} className="rounded-md border bg-background p-2 text-sm data-[broken=true]:border-destructive/60" data-broken={!link.resolved}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate font-medium">{link.resolved ? link.toTitle : link.targetTitle}</div>
              <div className="truncate text-xs text-muted-foreground">引用来源：{link.fromTitle}</div>
              <div className="truncate text-xs text-muted-foreground">关系类型：{labelFromMap(relationTypeLabels, link.relationType)}</div>
            </div>
            <Badge variant={link.resolved ? "secondary" : "destructive"}>
              {link.resolved ? linkStatusLabels.resolved : linkStatusLabels.broken}
            </Badge>
          </div>
          <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
            <span>关系来源：{relationSourceLabels.markdown_link}</span>
            <span>关系状态：{link.resolved ? relationStatusLabels.active : relationStatusLabels.broken}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function BrokenLinkActionList({ links }: { links: WikiLink[] }) {
  if (!links.length) return <p className="text-sm text-muted-foreground">暂无未解析关系。</p>

  return (
    <div className="flex flex-col gap-2">
      {links.map((link) => (
        <div key={link.linkId} className="rounded-md border p-3" data-testid="broken-link-card">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium">{link.targetTitle}</div>
              <div className="text-xs text-muted-foreground">来源 WikiNode：{link.fromTitle}</div>
            </div>
            <Badge variant="destructive">{relationStatusLabels.broken}</Badge>
          </div>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <InfoCell label="关系类型" value={labelFromMap(relationTypeLabels, link.relationType)} />
            <InfoCell label="关系来源" value={relationSourceLabels.markdown_link} />
            <InfoCell label="关系状态" value={relationStatusLabels.broken} />
            <InfoCell label="锚文本" value={link.anchorText ?? link.targetTitle} />
            <InfoCell label="目标标识" value={link.targetSlug ?? link.targetTitle} />
            <InfoCell label="解析目标" value={link.toTitle ?? "未解析"} />
          </div>
          <div className="mt-3 flex justify-end">
            <Button asChild size="sm" variant="outline">
              <Link to={`/wiki-nodes/${link.fromNodeId}`}>
                <ExternalLinkIcon data-icon="inline-start" />
                打开来源 WikiNode
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/20 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  )
}
