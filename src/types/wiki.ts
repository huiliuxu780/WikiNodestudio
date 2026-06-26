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

export type KnowledgeObjectType =
  | "Article"
  | "Product"
  | "Procedure"
  | "DataRecord"
  | "MediaAsset"
  | "Collection"
  | "ExternalSource"
  | "Rule"

export type KnowledgeMetadata = Record<string, unknown>

export type SourceType =
  | "feishu"
  | "pdf"
  | "word"
  | "excel"
  | "web"
  | "web_page"
  | "manual"
  | "manual_input"
  | "api"
  | "database"
  | "legacy_kb"
  | "image"
  | "video"
  | "file"
  | "pim"
  | "dam"
  | "crm"

export type SourceRef = {
  id?: string
  sourceId: string
  sourceType: SourceType
  sourceTitle: string
  sourceName?: string
  sourceUrl?: string
  sourceRecordId?: string
  snapshotId?: string
  snapshotTime?: string
  evidenceRange?: string
  syncJobId?: string
  confidence?: number
  paragraphRef?: string
  version?: string
}

export type KnowledgeRelationType =
  | "references"
  | "derived_from"
  | "applies_to"
  | "contains"
  | "part_of"
  | "replaces"
  | "conflicts_with"
  | "explains"
  | "has_manual"
  | "has_part_catalog"
  | "has_policy"
  | "has_asset"
  | "related_to"

export type KnowledgeRelation = {
  id?: string
  sourceNodeId?: string
  targetNodeId: string
  relationType: KnowledgeRelationType
  status?: "active" | "broken" | "pending_review" | "rejected"
  source?: "markdown_link" | "manual" | "import" | "system" | "api"
  direction?: "outgoing" | "incoming"
  confidence?: number
  createdBy?: "system" | "user"
  anchorText?: string
  note?: string
  evidence?: {
    sourceRefId?: string
  }
}

export type WikiNode = {
  nodeId: string
  slug: string
  title: string
  /**
   * Legacy MVP-era UI classification. Keep it for existing filters and routes.
   * Commercial knowledge modeling should use objectType + subtype + metadata.
   */
  nodeType: WikiNodeType
  objectType?: KnowledgeObjectType
  subtype?: string
  metadata?: KnowledgeMetadata
  relations?: KnowledgeRelation[]
  processingProfile?: string
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
    | "references"
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
