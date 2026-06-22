export type SourceItem = {
  sourceId: string
  sourceType: string
  title: string
  owner: string
  syncStatus: "synced" | "pending" | "failed"
  lastSyncedAt: string
  generatedNodes: number
}

