import type { QualityIssue } from "@/types/quality"

export const mockQualityIssues: QualityIssue[] = [
  { issueId: "qi-001", nodeId: "wn-001", nodeTitle: "保修期内维修服务政策", issueType: "broken_link", severity: "high", status: "open", owner: "Knowledge Ops", createdAt: "2026-06-20" },
  { issueId: "qi-002", nodeId: "wn-010", nodeTitle: "服务预约改约流程", issueType: "broken_link", severity: "medium", status: "open", owner: "Service Content", createdAt: "2026-06-21" },
  { issueId: "qi-003", nodeId: "wn-006", nodeTitle: "洗衣机不脱水排查流程", issueType: "broken_link", severity: "medium", status: "triaged", owner: "Product Docs", createdAt: "2026-06-21" },
  { issueId: "qi-004", nodeId: "wn-012", nodeTitle: "配件价格查询说明", issueType: "broken_link", severity: "medium", status: "open", owner: "Service Finance", createdAt: "2026-06-22" },
  { issueId: "qi-005", nodeId: "wn-004", nodeTitle: "洗碗机上门服务流程", issueType: "low_retrieval_score", severity: "low", status: "triaged", owner: "Knowledge Ops", createdAt: "2026-06-19" },
  { issueId: "qi-006", nodeId: "wn-005", nodeTitle: "延保服务政策", issueType: "missing_source", severity: "low", status: "open", owner: "Rivers", createdAt: "2026-06-18" },
  { issueId: "qi-007", nodeId: "wn-008", nodeTitle: "售后政策术语表", issueType: "expired", severity: "low", status: "open", owner: "Knowledge Ops", createdAt: "2026-06-17" },
  { issueId: "qi-008", nodeId: "wn-002", nodeTitle: "收费政策", issueType: "conflict", severity: "high", status: "triaged", owner: "Service Finance", createdAt: "2026-06-16" },
]
