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

export type SourceIngestionRunRequest = {
  conversionProfile?: string
  requestedBy?: string
}

export type SourceIngestionRunResult = {
  operationId: string
  sourceId: string
  status: "succeeded" | "skipped" | "failed"
  summary: string
  rawMaterialCount: number
  parsedDocumentCount: number
  generatedSuggestionIds: string[]
  skippedParsedDocumentIds: string[]
}

export type SourceImportResult = {
  operationId: string
  sourceId: string
  rawMaterialId: string
  parsedDocumentId: string
  status: "succeeded" | "skipped" | "failed"
  summary: string
  segmentCount: number
  segmentIds: string[]
  suggestionId?: string | null
}
