import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ApiError } from "@/services/api-client"

export function ApiErrorNotice({ error }: { error: Error | null }) {
  if (!error) return null

  return (
    <Alert variant="destructive">
      <AlertTitle>API request failed</AlertTitle>
      <AlertDescription>{formatApiError(error)}</AlertDescription>
    </Alert>
  )
}

function formatApiError(error: Error) {
  if (error instanceof ApiError) {
    const apiMessage = extractApiMessage(error.body)
    return `${apiMessage ?? error.message}. Disable mock fallback only when the Spring Boot API is running and DTOs match src/types/*.`
  }

  return error.message
}

function extractApiMessage(body: unknown) {
  if (!body || typeof body !== "object" || !("message" in body)) {
    return null
  }

  const message = body.message
  return typeof message === "string" ? message : null
}
