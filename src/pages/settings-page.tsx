import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"

const settings = [
  ["Vector Store Provider", "Mock / Aliyun / Volcano"],
  ["Retrieval Mode", "Mock"],
  ["Return Object Type", "WikiNode"],
  ["Chunk Display", "Disabled"],
  ["Only Published Nodes Are Retrievable", "Enabled"],
]

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Settings" description="Static MVP configuration surface." />
      <Alert>
        <AlertTitle>Boundary</AlertTitle>
        <AlertDescription>
          This system does not implement a vector database. It provides a WikiNode knowledge layer and retrieval gateway over existing vector stores.
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mock Settings</CardTitle>
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

