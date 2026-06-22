import type { WikiLink, WikiNode } from "@/types/wiki"

export type RetrievalQuery = {
  query: string
  filters: {
    nodeType?: string
    status?: string
    tags?: string[]
  }
  topK: number
}

export type RetrievalResult = {
  node: WikiNode
  score: number
  matchedReason: string
  matchedFields: string[]
  incomingLinks: WikiLink[]
  outgoingLinks: WikiLink[]
}

