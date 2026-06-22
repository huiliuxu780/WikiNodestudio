import type { SourceItem } from "@/types/source"

export const mockSources: SourceItem[] = [
  {
    sourceId: "src-feishu-cc",
    sourceType: "feishu",
    title: "CC 售后政策飞书空间",
    owner: "Rivers",
    syncStatus: "synced",
    lastSyncedAt: "2026-06-20 10:35",
    generatedNodes: 4,
  },
  {
    sourceId: "src-pdf-dishwasher",
    sourceType: "pdf",
    title: "洗碗机培训 PDF",
    owner: "Training Ops",
    syncStatus: "synced",
    lastSyncedAt: "2026-06-18 15:12",
    generatedNodes: 2,
  },
  {
    sourceId: "src-excel-fee",
    sourceType: "excel",
    title: "维修收费标准 Excel",
    owner: "Service Finance",
    syncStatus: "pending",
    lastSyncedAt: "2026-06-16 09:00",
    generatedNodes: 1,
  },
  {
    sourceId: "src-word-manual",
    sourceType: "word",
    title: "产品说明书 Word",
    owner: "Product Docs",
    syncStatus: "failed",
    lastSyncedAt: "2026-06-12 18:20",
    generatedNodes: 1,
  },
]

