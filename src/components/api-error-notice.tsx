import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { commonLabels, formatApiErrorMessage } from "@/utils/display-labels"

export function ApiErrorNotice({
  error,
  title = commonLabels.loadFailed,
  onRetry,
}: {
  error: Error | null
  title?: string
  onRetry?: () => void
}) {
  if (!error) return null

  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <span>{formatApiErrorMessage(error)}</span>
        {onRetry ? (
          <Button type="button" size="sm" variant="outline" className="w-fit" onClick={onRetry}>
            {commonLabels.retry}
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}
