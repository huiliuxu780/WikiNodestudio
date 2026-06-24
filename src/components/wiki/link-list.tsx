import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { WikiLink } from "@/types/wiki"
import { labelFromMap, linkStatusLabels, relationTypeLabels } from "@/utils/display-labels"

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
          <div className="mt-2 flex flex-wrap gap-1">
            <Button variant="ghost" size="sm">打开</Button>
            <Button variant="ghost" size="sm">关联</Button>
            {!link.resolved ? <Button variant="outline" size="sm">创建知识节点</Button> : null}
            <Button variant="ghost" size="sm">忽略</Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function BrokenLinkActionList({ links }: { links: WikiLink[] }) {
  if (!links.length) return <p className="text-sm text-muted-foreground">暂无未解析链接。</p>

  return (
    <div className="flex flex-col gap-2">
      {links.map((link) => (
        <div key={link.linkId} className="rounded-md border p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium">{link.targetTitle}</div>
              <div className="text-xs text-muted-foreground">引用自 {link.fromTitle}</div>
            </div>
            <Badge variant="destructive">未解析</Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm">创建知识节点</Button>
            <Button variant="outline" size="sm">关联已有节点</Button>
            <Button variant="ghost" size="sm">暂时忽略</Button>
          </div>
        </div>
      ))}
    </div>
  )
}
