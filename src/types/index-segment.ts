import type { KnowledgeMetadata, KnowledgeObjectType, SourceRef, WikiIndexStatus } from "@/types/wiki"

export type IndexSegment = {
  segmentId: string
  nodeId: string
  nodeTitle: string
  objectType?: KnowledgeObjectType
  subtype?: string
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
  title?: string
  contentPreview: string
  tokenCount: number
  enabled: boolean
  indexStatus: WikiIndexStatus
  vectorDocId?: string
  lastIndexedAt?: string
  retrievalHits: number
  avgScore?: number
  sourceRefs: SourceRef[]
  sourceRefIds?: string[]
  processingProfile?: string
  metadataSummary?: Array<{
    label: string
    value: string
  }>
  createdAt?: string
  updatedAt?: string
  metadata: {
    nodeType: string
    status: string
    tags: string[]
  } & KnowledgeMetadata
}
