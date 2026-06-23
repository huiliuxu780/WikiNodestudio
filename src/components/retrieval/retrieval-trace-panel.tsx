import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RetrievalTraceStep } from "@/types/retrieval"

export function RetrievalTracePanel({ steps }: { steps: RetrievalTraceStep[] }) {
  return (
    <Card data-testid="retrieval-trace-panel">
      <CardHeader>
        <CardTitle className="text-base">Retrieval Trace</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <div key={step.step} className="grid gap-2 rounded-md border bg-background p-3 text-sm md:grid-cols-[40px_180px_1fr]">
            <Badge variant="outline">{index + 1}</Badge>
            <div className="font-medium">{step.step}</div>
            <div className="text-muted-foreground">{step.detail}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
