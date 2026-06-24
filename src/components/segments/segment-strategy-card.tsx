import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const strategies = [
  ["Article", "Article semantic section segmentation", "Title, summary, and section-level Index Segments preserve policy context and source evidence."],
  ["Product", "Product field-based metadata-aware segmentation", "Model code, product category, series, and lifecycle fields become searchable metadata segments."],
  ["Procedure", "Procedure step / branch segmentation", "Steps and troubleshooting branches become retrieval evidence while the WikiNode remains the result."],
  ["DataRecord", "DataRecord row / record / table-aware segmentation", "Structured records keep row, table, and source record evidence for precise retrieval."],
  ["MediaAsset", "MediaAsset asset metadata + extracted text segmentation", "Asset metadata, page ranges, and extracted text become traceable Index Segments."],
  ["Rule", "Rule condition / outcome segmentation", "Condition, applicability, and outcome text stay grouped as rule evidence."],
  ["Collection", "Collection member summary / relation-aware segmentation", "Knowledge packs summarize members and relations without replacing the parent WikiNode."],
] as const

export function SegmentStrategyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Segment Strategy</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p>Index Segments are generated from WikiNode title, summary, body sections, metadata, sourceRefs, and relation evidence before vector-store sync.</p>
        <p>Processing Profile describes how a Source or Raw Material becomes a WikiNode / Knowledge Object. Segment Strategy describes how that object becomes controlled Index Segments.</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">WikiNode-bound</Badge>
          <Badge variant="outline">Knowledge Object-aware</Badge>
          <Badge variant="outline">Traceable source refs</Badge>
          <Badge variant="outline">Debug evidence only</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {strategies.map(([objectType, title, description]) => (
            <div key={objectType} className="rounded-md border bg-background p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{objectType}</span>
                <Badge variant="secondary">Segment Strategy</Badge>
              </div>
              <div className="font-medium text-foreground">{title}</div>
              <p className="mt-1">{description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
