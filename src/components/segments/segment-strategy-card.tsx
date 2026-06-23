import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SegmentStrategyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Segment Strategy</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p>Index Segments are generated from WikiNode title, summary, body sections, metadata, and procedure steps before vector-store sync.</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">WikiNode-bound</Badge>
          <Badge variant="outline">Traceable source refs</Badge>
          <Badge variant="outline">Debug evidence only</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
