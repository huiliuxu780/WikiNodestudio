import type { WikiLink, WikiNode } from "@/types/wiki"

export type RetrievalMode = "vector" | "keyword" | "hybrid" | "graph"

export type RetrievalQuery = {
  query: string
  filters: {
    nodeType?: string
    status?: string
    tags?: string[]
  }
  topK: number
  retrievalMode: RetrievalMode
  debug?: boolean
}

export type MatchedSegment = {
  segmentId: string
  segmentType: string
  score: number
  contentPreview: string
  vectorDocId?: string
  whyMatched: string
  nodeId: string
}

export type RetrievalTraceStep = {
  step: string
  detail: string
}

export type RetrievalResult = {
  node: WikiNode
  score: number
  matchedReason: string
  matchedFields: string[]
  incomingLinks: WikiLink[]
  outgoingLinks: WikiLink[]
  matchedSegments?: MatchedSegment[]
}

export type RetrievalLog = {
  logId: string
  query: string
  topNodeTitle: string
  resultCount: number
  latencyMs: number
  createdAt: string
}
