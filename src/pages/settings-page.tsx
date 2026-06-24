import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"

const settings = [
  ["默认节点状态", "草稿"],
  ["默认节点类型", "术语"],
  ["自动链路检查", "已启用"],
  ["断链提醒", "已启用"],
]

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="设置" description="系统设置仅展示当前 MVP 的本地配置基线。" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">默认设置</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {settings.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 rounded-md border p-3">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Badge variant="outline">{value}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
