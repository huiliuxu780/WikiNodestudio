export type WikiNodeType =
  | "policy"
  | "procedure"
  | "faq"
  | "product"
  | "guide"
  | "troubleshooting"
  | "term"
  | "fee_rule"
  | "regulation"
  | "notice"

export type WikiNodeStatus = "draft" | "published" | "archived"

export type WikiIndexStatus = "not_indexed" | "indexing" | "indexed" | "failed" | "outdated" | "deleted"

export type SourceType = "feishu" | "pdf" | "word" | "excel" | "web" | "manual" | "api" | "database" | "legacy_kb"

export type SourceRef = {
  sourceId: string
  sourceType: SourceType
  sourceTitle: string
  sourceUrl?: string
  paragraphRef?: string
  version?: string
}

export type WikiNode = {
  nodeId: string
  slug: string
  title: string
  nodeType: WikiNodeType
  businessDomain?: string
  brand?: string
  productCategory?: string
  scenario?: string
  summary: string
  contentMarkdown: string
  contentPlainText?: string
  tags: string[]
  status: WikiNodeStatus
  reviewStatus?: "not_required" | "pending" | "approved" | "rejected"
  publishStatus?: "not_published" | "published" | "unpublished"
  sourceRefs: SourceRef[]
  indexStatus: WikiIndexStatus
  owner: string
  incomingCount: number
  outgoingCount: number
  brokenLinkCount: number
  securityLevel?: "public" | "internal" | "confidential"
  effectiveDate?: string
  expiredDate?: string
  version: number
  createdAt: string
  updatedAt: string
  lastPublishedAt?: string
  lastIndexedAt?: string
}

export type WikiNodeCreateInput = {
  title: string
  slug: string
  summary: string
  contentMarkdown: string
  tags: string[]
  nodeType?: WikiNodeType
  status?: WikiNodeStatus
  sourceRefs?: SourceRef[]
  indexStatus?: WikiIndexStatus
}

export type WikiLink = {
  linkId: string
  fromNodeId: string
  fromTitle: string
  toNodeId?: string
  toTitle?: string
  targetTitle: string
  relationType:
    | "reference"
    | "derived_from"
    | "overrides"
    | "conflicts_with"
    | "depends_on"
    | "applies_to"
    | "excludes"
    | "similar_to"
    | "parent_of"
    | "used_by"
  resolved: boolean
}

export type BrokenLink = WikiLink & {
  resolved: false
}

export type GraphNode = {
  nodeId: string
  title: string
  nodeType: WikiNodeType
  status: WikiNodeStatus
  indexStatus: WikiIndexStatus
  incomingCount: number
  outgoingCount: number
  brokenLinkCount: number
}

export type GraphEdge = {
  edgeId: string
  fromNodeId: string
  toNodeId?: string
  targetTitle: string
  relationType: WikiLink["relationType"]
  resolved: boolean
}
