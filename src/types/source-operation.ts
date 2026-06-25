export type SourceOperation = {
  operationId: string
  operationType: string
  sourceId: string
  rawMaterialId?: string | null
  parsedDocumentId?: string | null
  status: string
  requestedBy: string
  startedAt: string
  finishedAt?: string | null
  summary: string
  errorSummary?: string | null
}
