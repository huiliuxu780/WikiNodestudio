export type SourceItem = {
  sourceId: string
  sourceType: "feishu" | "pdf" | "word" | "excel" | "web" | "manual" | "api" | "database" | "legacy_kb"
  title: string
  owner: string
  syncStatus: "not_configured" | "pending" | "synced" | "failed" | "disabled"
  lastSyncedAt: string
  generatedNodes: number
  rawMaterialCount: number
  knowledgeBaseId?: string | null
}
