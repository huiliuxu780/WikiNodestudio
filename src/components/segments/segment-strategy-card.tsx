import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { labelFromMap, objectTypeLabels } from "@/utils/display-labels"

const strategies = [
  ["Article", "文章语义分段", "按标题、摘要和章节生成 Index Segment，保留政策上下文和来源证据。"],
  ["Product", "产品字段分段", "型号、品类、系列和生命周期字段会成为可检索的元数据片段。"],
  ["Procedure", "流程步骤分段", "步骤和分支作为召回证据，返回结果仍保持 WikiNode。"],
  ["DataRecord", "数据记录分段", "结构化记录保留行、表和来源记录证据，用于精确召回。"],
  ["MediaAsset", "媒体资产分段", "资产元数据、页码范围和抽取文本形成可追溯的 Index Segment。"],
  ["Rule", "规则条件分段", "条件、适用范围和结果文本保持为同组规则证据。"],
  ["Collection", "知识集合分段", "知识包汇总成员和关系，但不替代父级 WikiNode。"],
] as const

export function SegmentStrategyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">片段策略</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p>Index Segment 在同步到外部向量库前，由 WikiNode 标题、摘要、正文段落、元数据、来源证据和关系证据生成。</p>
        <p>处理策略说明 Source 或 Raw Material 如何变成 WikiNode / Knowledge Object；片段策略说明该对象如何生成受控 Index Segment。</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">绑定 WikiNode</Badge>
          <Badge variant="outline">识别 Knowledge Object</Badge>
          <Badge variant="outline">可追溯来源证据</Badge>
          <Badge variant="outline">仅作调试证据</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {strategies.map(([objectType, title, description]) => (
            <div key={objectType} className="rounded-md border bg-background p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{labelFromMap(objectTypeLabels, objectType)}</span>
                <Badge variant="secondary">片段策略</Badge>
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
