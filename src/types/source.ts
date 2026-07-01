export type SourceItem = {
  sourceId: string
  sourceType: "feishu" | "pdf" | "word" | "excel" | "web" | "manual" | "api" | "database" | "legacy_kb"
  title: string
  owner: string
  ingestionMode?: "manual_import" | "scheduled_sync" | "external_push" | "not_configured"
  credentialProfile?: string | null
  credentialStatus?: "not_required" | "missing" | "configured" | "expired" | "revoked"
  credentialScope?: string | null
  credentialOwner?: string | null
  lastCredentialCheckedAt?: string | null
  connectionStatus?: "not_configured" | "available" | "failed" | "disabled"
  syncPolicy?: "manual" | "daily" | "weekly" | "paused"
  defaultParserProfile?: string | null
  lastCheckedAt?: string | null
  lastFailureReason?: string | null
  syncStatus: "not_configured" | "pending" | "synced" | "failed" | "disabled"
  lastSyncedAt: string
  generatedNodes: number
  rawMaterialCount: number
  knowledgeBaseId?: string | null
}
