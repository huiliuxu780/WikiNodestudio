export type SourceItem = {
  sourceId: string
  sourceType: "feishu" | "pdf" | "word" | "excel" | "web" | "manual" | "api" | "database" | "legacy_kb"
  title: string
  owner: string
  syncStatus: "synced" | "pending" | "failed"
  lastSyncedAt: string
  generatedNodes: number
}
