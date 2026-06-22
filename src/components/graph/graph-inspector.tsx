import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WikiLink, WikiNode } from "@/types/wiki"

export function GraphInspector({
  node,
  incomingLinks,
  outgoingLinks,
  brokenLinks,
}: {
  node: WikiNode
  incomingLinks: WikiLink[]
  outgoingLinks: WikiLink[]
  brokenLinks: WikiLink[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{node.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <p className="text-muted-foreground">{node.summary}</p>
        <Metric label="incoming" value={incomingLinks.length} />
        <Metric label="outgoing" value={outgoingLinks.length} />
        <Metric label="broken" value={brokenLinks.length} />
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

