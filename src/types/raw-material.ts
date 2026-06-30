export type RawMaterial = {
  rawMaterialId: string
  sourceId: string
  knowledgeBaseId?: string | null
  title: string
  rawMaterialType: string
  sourceVersion?: string
  capturedAt?: string
  contentHash?: string
  storageProvider: string
  storageRef?: string
  parseStatus: "not_parsed" | "queued" | "parsing" | "parsed" | "failed" | "skipped"
  parsedDocumentCount: number
  fileType?: string
  parsedDocumentId?: string
  createdAt: string
  updatedAt: string
}

export type ParsedDocumentSourceRef = {
  sourceId: string
  rawMaterialId: string
  parsedDocumentId: string
  locatorType: string
  locator: string
  excerpt: string
  confidence?: number
}

export type ParsedDocument = {
  parsedDocumentId: string
  rawMaterialId: string
  sourceId: string
  knowledgeBaseId?: string | null
  title: string
  contentFormat: string
  normalizedContent: string
  metadata: Record<string, string>
  sourceRefs: ParsedDocumentSourceRef[]
  parserProfile: string
  parseStatus: "not_parsed" | "queued" | "parsing" | "parsed" | "failed" | "skipped"
  parseErrorSummary?: string | null
  createdAt: string
  updatedAt: string
}

export type ParsedDocumentSegment = {
  segmentId: string
  parsedDocumentId: string
  rawMaterialId: string
  sourceId: string
  knowledgeBaseId?: string | null
  position: number
  segmentType: string
  title: string
  content: string
  contentPreview: string
  tokenCount: number
  sourceLocator: string
  createdAt: string
  updatedAt: string
}
