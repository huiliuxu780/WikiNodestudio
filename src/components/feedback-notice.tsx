import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function FeedbackNotice({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <Alert>
      <AlertTitle>{title}</AlertTitle>
      {description ? <AlertDescription>{description}</AlertDescription> : null}
    </Alert>
  )
}
