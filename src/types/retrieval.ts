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
  incomingLinks?: WikiLink[]
  outgoingLinks?: WikiLink[]
  matchedSegments?: {
    segmentId: string
    nodeId?: string
    segmentType: string
    score: number
    contentPreview: string
    sourceRefIds?: string[]
    metadataSummary?: Array<{
      label: string
      value: string
    }>
  }[]
}

export type RetrievalLog = {
  logId: string
  query: string
  filters?: RetrievalQuery["filters"]
  returnedNodeIds: string[]
  matchedSegmentIds: string[]
  latencyMs: number
  status: "succeeded" | "failed"
  errorSummary?: string
  createdAt: string
}

export type RetrievalEvaluationRunResult = {
  returnedNodeIds: string[]
  matchedSegmentIds: string[]
  status: "passed" | "failed"
  summary: string
}

export type RetrievalEvaluationCase = {
  caseId: string
  query: string
  filters: RetrievalQuery["filters"]
  topK: number
  expectedNodeIds: string[]
  runResult: RetrievalEvaluationRunResult
  createdAt: string
  updatedAt: string
}

export type RetrievalEvaluationCaseRequest = {
  caseId?: string
  query: string
  filters: RetrievalQuery["filters"]
  topK: number
  expectedNodeIds: string[]
}
