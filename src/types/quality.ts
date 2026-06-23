export type QualityIssue = {
  issueId: string
  nodeId: string
  nodeTitle: string
  issueType: "broken_link" | "missing_source" | "expired" | "conflict" | "low_retrieval_score"
  severity: "low" | "medium" | "high"
  status: "open" | "triaged" | "resolved"
  owner: string
  createdAt: string
}
