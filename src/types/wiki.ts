export type WikiNodeType =
  | "policy"
  | "procedure"
  | "faq"
  | "product"
  | "guide"
  | "troubleshooting"
  | "term"

export type WikiNodeStatus = "draft" | "published" | "archived"

export type WikiIndexStatus = "not_indexed" | "indexed" | "failed" | "outdated"

export type SourceType = "feishu" | "pdf" | "word" | "excel" | "web" | "manual"

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
  summary: string
  contentMarkdown: string
  tags: string[]
  status: WikiNodeStatus
  sourceRefs: SourceRef[]
  indexStatus: WikiIndexStatus
  incomingCount: number
  outgoingCount: number
  brokenLinkCount: number
  createdAt: string
  updatedAt: string
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
  relationType: "reference"
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
  relationType: "reference"
  resolved: boolean
}
