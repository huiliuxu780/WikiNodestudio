export type KnowledgeBase = {
  kbId: string
  name: string
  description: string
  businessDomain: string
  type: "wikinode" | "document" | "faq" | "mixed"
  status: "active" | "disabled" | "archived"
  visibility: "internal" | "private" | "public"
  settings: KnowledgeBaseSettings
  wikiNodeCount: number
  sourceCount: number
  indexHealth?: "healthy" | "warning" | "failed"
  retrievalHealth?: "healthy" | "warning" | "failed"
  owner: string
  archivedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type KnowledgeBaseSettings = {
  defaultNodeType?: string
  defaultParserEngine?: string
  defaultStorageProvider?: string
  defaultVectorStore?: string
  defaultPublishingPolicy?: string
  defaultRetrievalStrategy?: string
}

export type KnowledgeBaseInput = {
  kbId?: string
  name: string
  description: string
  businessDomain: string
  type: KnowledgeBase["type"]
  status?: KnowledgeBase["status"]
  visibility: KnowledgeBase["visibility"]
  owner: string
  settings: KnowledgeBaseSettings
}

export type KnowledgeBaseLifecycleResult = {
  kbId: string
  status: KnowledgeBase["status"]
  summary: string
  archivedAt?: string | null
  updatedAt: string
}
