import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { WikiLink } from "@/types/wiki"

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
        <div key={link.linkId} className="flex items-center justify-between gap-3 rounded-md border p-2 text-sm">
          <div className="min-w-0">
            <div className="truncate font-medium">{link.resolved ? link.toTitle : link.targetTitle}</div>
            <div className="truncate text-xs text-muted-foreground">from {link.fromTitle}</div>
          </div>
          <Badge variant={link.resolved ? "secondary" : "destructive"}>
            {link.resolved ? "resolved" : "broken"}
          </Badge>
        </div>
      ))}
    </div>
  )
}

export function BrokenLinkActionList({ links }: { links: WikiLink[] }) {
  if (!links.length) return <p className="text-sm text-muted-foreground">No unresolved links.</p>

  return (
    <div className="flex flex-col gap-2">
      {links.map((link) => (
        <div key={link.linkId} className="rounded-md border p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium">{link.targetTitle}</div>
              <div className="text-xs text-muted-foreground">Referenced by {link.fromTitle}</div>
            </div>
            <Badge variant="destructive">unresolved</Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm">Create WikiNode</Button>
            <Button variant="outline" size="sm">Link to existing node</Button>
            <Button variant="ghost" size="sm">Ignore for now</Button>
          </div>
        </div>
      ))}
    </div>
  )
}

