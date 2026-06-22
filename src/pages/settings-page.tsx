import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"

const settings = [
  ["Default Node Status", "Draft"],
  ["Default Node Type", "Term"],
  ["Auto Link Check", "Enabled"],
  ["Broken Link Alerts", "Enabled"],
]

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Settings" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Defaults</CardTitle>
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
