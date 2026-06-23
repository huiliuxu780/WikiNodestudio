import type { RetrievalLog } from "@/types/retrieval"

export const mockRetrievalLogs: RetrievalLog[] = [
  { logId: "rl-001", query: "洗碗机保修期内维修收费吗？", topNodeTitle: "保修期内维修服务政策", resultCount: 5, latencyMs: 86, createdAt: "2026-06-22 10:10" },
  { logId: "rl-002", query: "人为损坏是否免费", topNodeTitle: "人为损坏判定规则", resultCount: 4, latencyMs: 74, createdAt: "2026-06-22 10:18" },
  { logId: "rl-003", query: "上门安装怎么收费", topNodeTitle: "洗碗机安装注意事项", resultCount: 5, latencyMs: 91, createdAt: "2026-06-22 11:05" },
  { logId: "rl-004", query: "延保覆盖什么", topNodeTitle: "延保服务政策", resultCount: 3, latencyMs: 69, createdAt: "2026-06-22 11:36" },
  { logId: "rl-005", query: "没有发票怎么办", topNodeTitle: "购买凭证规则", resultCount: 4, latencyMs: 78, createdAt: "2026-06-22 13:20" },
  { logId: "rl-006", query: "改约流程", topNodeTitle: "服务预约改约流程", resultCount: 2, latencyMs: 58, createdAt: "2026-06-22 14:44" },
  { logId: "rl-007", query: "投诉升级条件", topNodeTitle: "投诉升级处理流程", resultCount: 3, latencyMs: 88, createdAt: "2026-06-22 15:12" },
  { logId: "rl-008", query: "配件价格", topNodeTitle: "配件价格查询说明", resultCount: 4, latencyMs: 83, createdAt: "2026-06-22 16:03" },
  { logId: "rl-009", query: "洗衣机不脱水", topNodeTitle: "洗衣机不脱水排查流程", resultCount: 3, latencyMs: 76, createdAt: "2026-06-22 16:28" },
  { logId: "rl-010", query: "售后术语", topNodeTitle: "售后政策术语表", resultCount: 2, latencyMs: 61, createdAt: "2026-06-22 17:02" },
]
