import type { WikiLink, WikiNode } from "@/types/wiki"

export type RetrievalQuery = {
  query: string
  filters: {
    nodeType?: string
    status?: string
    tags?: string[]
  }
  topK: number
  debug?: boolean
}

export type RetrievalResult = {
  node: WikiNode
  score: number
  matchedReason: string
  matchedFields: string[]
  incomingLinks: WikiLink[]
  outgoingLinks: WikiLink[]
  matchedSegments?: {
    segmentId: string
    segmentType: string
    score: number
    contentPreview: string
  }[]
}

export type RetrievalLog = {
  logId: string
  query: string
  topNodeTitle: string
  resultCount: number
  latencyMs: number
  createdAt: string
}
