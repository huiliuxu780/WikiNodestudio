import type { RetrievalLog } from "@/types/retrieval"

export const mockRetrievalLogs: RetrievalLog[] = [
  { logId: "rl-001", query: "洗碗机保修期内维修收费吗？", returnedNodeIds: ["wn-001"], matchedSegmentIds: ["seg-001"], latencyMs: 86, status: "succeeded", createdAt: "2026-06-22 10:10" },
  { logId: "rl-002", query: "人为损坏是否免费", returnedNodeIds: ["wn-003"], matchedSegmentIds: [], latencyMs: 74, status: "succeeded", createdAt: "2026-06-22 10:18" },
  { logId: "rl-003", query: "上门安装怎么收费", returnedNodeIds: ["wn-004"], matchedSegmentIds: [], latencyMs: 91, status: "succeeded", createdAt: "2026-06-22 11:05" },
  { logId: "rl-004", query: "延保覆盖什么", returnedNodeIds: ["wn-001"], matchedSegmentIds: [], latencyMs: 69, status: "succeeded", createdAt: "2026-06-22 11:36" },
  { logId: "rl-005", query: "没有发票怎么办", returnedNodeIds: ["wn-001"], matchedSegmentIds: [], latencyMs: 78, status: "succeeded", createdAt: "2026-06-22 13:20" },
  { logId: "rl-006", query: "改约流程", returnedNodeIds: ["wn-004"], matchedSegmentIds: [], latencyMs: 58, status: "succeeded", createdAt: "2026-06-22 14:44" },
  { logId: "rl-007", query: "投诉升级条件", returnedNodeIds: ["wn-001"], matchedSegmentIds: [], latencyMs: 88, status: "succeeded", createdAt: "2026-06-22 15:12" },
  { logId: "rl-008", query: "配件价格", returnedNodeIds: ["wn-005"], matchedSegmentIds: [], latencyMs: 83, status: "succeeded", createdAt: "2026-06-22 16:03" },
  { logId: "rl-009", query: "洗衣机不脱水", returnedNodeIds: ["wn-004"], matchedSegmentIds: [], latencyMs: 76, status: "succeeded", createdAt: "2026-06-22 16:28" },
  { logId: "rl-010", query: "售后术语", returnedNodeIds: ["wn-001"], matchedSegmentIds: [], latencyMs: 61, status: "succeeded", createdAt: "2026-06-22 17:02" },
]
