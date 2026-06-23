import type { SourceRef, WikiIndexStatus } from "@/types/wiki"

export type IndexSegment = {
  segmentId: string
  nodeId: string
  nodeTitle: string
  segmentType:
    | "title"
    | "summary"
    | "body"
    | "section"
    | "table"
    | "qa"
    | "metadata"
    | "condition"
    | "procedure_step"
    | "troubleshooting_step"
  content: string
  contentPreview: string
  tokenCount: number
  enabled: boolean
  indexStatus: WikiIndexStatus
  vectorDocId?: string
  lastIndexedAt?: string
  retrievalHits: number
  avgScore?: number
  sourceRefs: SourceRef[]
  metadata: {
    nodeType: string
    status: string
    tags: string[]
  }
}
