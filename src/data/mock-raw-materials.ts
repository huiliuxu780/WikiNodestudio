import type { RawMaterial } from "@/types/raw-material"

export const mockRawMaterials: RawMaterial[] = [
  { rawMaterialId: "rm-001", sourceId: "src-feishu-cc", title: "售后政策空间快照", fileType: "Feishu Wiki", storageProvider: "workspace", parseStatus: "parsed", parsedDocumentId: "pd-001", createdAt: "2026-06-01", updatedAt: "2026-06-20" },
  { rawMaterialId: "rm-002", sourceId: "src-pdf-dishwasher", title: "洗碗机培训 PDF", fileType: "PDF", storageProvider: "object-storage", parseStatus: "parsed", parsedDocumentId: "pd-002", createdAt: "2026-06-04", updatedAt: "2026-06-18" },
  { rawMaterialId: "rm-003", sourceId: "src-excel-fee", title: "维修收费标准 Excel", fileType: "Excel", storageProvider: "object-storage", parseStatus: "parsed", parsedDocumentId: "pd-003", createdAt: "2026-06-06", updatedAt: "2026-06-16" },
  { rawMaterialId: "rm-004", sourceId: "src-word-manual", title: "产品说明书 Word", fileType: "Word", storageProvider: "object-storage", parseStatus: "failed", createdAt: "2026-06-08", updatedAt: "2026-06-12" },
  { rawMaterialId: "rm-005", sourceId: "src-web-faq", title: "官网售后 FAQ 快照", fileType: "HTML", storageProvider: "workspace", parseStatus: "parsed", parsedDocumentId: "pd-005", createdAt: "2026-06-14", updatedAt: "2026-06-21" },
  { rawMaterialId: "rm-006", sourceId: "src-legacy-kb", title: "历史客服知识库导出", fileType: "CSV", storageProvider: "object-storage", parseStatus: "parsed", parsedDocumentId: "pd-006", createdAt: "2026-06-15", updatedAt: "2026-06-19" },
  { rawMaterialId: "rm-007", sourceId: "src-feishu-cc", title: "投诉升级案例补充", fileType: "Feishu Doc", storageProvider: "workspace", parseStatus: "parsing", createdAt: "2026-06-22", updatedAt: "2026-06-22" },
  { rawMaterialId: "rm-008", sourceId: "src-web-faq", title: "服务预约 FAQ 增量", fileType: "HTML", storageProvider: "workspace", parseStatus: "not_parsed", createdAt: "2026-06-22", updatedAt: "2026-06-22" },
]
