export type KnowledgeBase = {
  kbId: string
  name: string
  description: string
  businessDomain: string
  type: "wikinode" | "document" | "faq" | "mixed"
  wikiNodeCount: number
  sourceCount: number
  indexHealth: "healthy" | "warning" | "failed"
  retrievalHealth: "healthy" | "warning" | "failed"
  owner: string
  createdAt: string
  updatedAt: string
}
