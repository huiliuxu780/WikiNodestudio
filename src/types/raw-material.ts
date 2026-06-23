export type RawMaterial = {
  rawMaterialId: string
  sourceId: string
  title: string
  fileType: string
  storageProvider: string
  parseStatus: "not_parsed" | "parsing" | "parsed" | "failed"
  parsedDocumentId?: string
  createdAt: string
  updatedAt: string
}
