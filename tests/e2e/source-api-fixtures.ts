import type { Page } from "@playwright/test"

const sources = [
  {
    sourceId: "src-feishu-cc",
    sourceType: "feishu",
    title: "CC 售后政策飞书空间",
    owner: "售后运营",
    syncStatus: "synced",
    lastSyncedAt: "2026-06-18",
    generatedNodes: 4,
    rawMaterialCount: 2,
  },
  {
    sourceId: "src-pdf-dishwasher",
    sourceType: "pdf",
    title: "洗碗机培训 PDF",
    owner: "产品培训",
    syncStatus: "synced",
    lastSyncedAt: "2026-06-17",
    generatedNodes: 2,
    rawMaterialCount: 1,
  },
  {
    sourceId: "src-excel-fee",
    sourceType: "excel",
    title: "维修收费标准 Excel",
    owner: "服务财务",
    syncStatus: "pending",
    lastSyncedAt: "2026-06-16",
    generatedNodes: 1,
    rawMaterialCount: 1,
  },
  {
    sourceId: "src-word-manual",
    sourceType: "word",
    title: "产品说明书 Word",
    owner: "产品资料",
    syncStatus: "failed",
    lastSyncedAt: "2026-06-15",
    generatedNodes: 1,
    rawMaterialCount: 1,
  },
]

const rawMaterials = [
  {
    rawMaterialId: "rm-001",
    sourceId: "src-feishu-cc",
    title: "售后政策空间快照",
    rawMaterialType: "document_snapshot",
    sourceVersion: "2026.06",
    capturedAt: "2026-06-20T10:35:00+08:00",
    contentHash: "sha256:rm001",
    storageProvider: "workspace",
    storageRef: "workspace://snapshots/rm-001",
    parseStatus: "parsed",
    parsedDocumentCount: 1,
    createdAt: "2026-06-20",
    updatedAt: "2026-06-20",
  },
  {
    rawMaterialId: "rm-002",
    sourceId: "src-pdf-dishwasher",
    title: "洗碗机培训 PDF",
    rawMaterialType: "file",
    sourceVersion: "2026.05",
    capturedAt: "2026-06-18T15:12:00+08:00",
    contentHash: "sha256:rm002",
    storageProvider: "object_storage",
    storageRef: "object://training/rm-002.pdf",
    parseStatus: "parsed",
    parsedDocumentCount: 1,
    createdAt: "2026-06-18",
    updatedAt: "2026-06-18",
  },
  {
    rawMaterialId: "rm-004",
    sourceId: "src-word-manual",
    title: "产品说明书 Word",
    rawMaterialType: "file",
    sourceVersion: "2026.05",
    capturedAt: "2026-06-12T18:20:00+08:00",
    contentHash: "sha256:rm004",
    storageProvider: "object_storage",
    storageRef: "object://manuals/rm-004.docx",
    parseStatus: "failed",
    parsedDocumentCount: 0,
    createdAt: "2026-06-12",
    updatedAt: "2026-06-12",
  },
]

const parsedDocuments = [
  {
    parsedDocumentId: "pd-001",
    rawMaterialId: "rm-001",
    sourceId: "src-feishu-cc",
    title: "售后政策空间快照解析结果",
    contentFormat: "markdown",
    normalizedContent: "# 保修政策\n\n保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。",
    metadata: {
      language: "zh-CN",
      businessDomain: "after_sales",
    },
    sourceRefs: [{
      sourceId: "src-feishu-cc",
      rawMaterialId: "rm-001",
      parsedDocumentId: "pd-001",
      locatorType: "heading",
      locator: "保修政策/收费例外",
      excerpt: "保修期内维修不收取人工费",
      confidence: 0.92,
    }],
    parserProfile: "feishu_article_v1",
    parseStatus: "parsed",
    parseErrorSummary: null,
    createdAt: "2026-06-20",
    updatedAt: "2026-06-20",
  },
  {
    parsedDocumentId: "pd-002",
    rawMaterialId: "rm-002",
    sourceId: "src-pdf-dishwasher",
    title: "洗碗机培训 PDF 解析结果",
    contentFormat: "markdown",
    normalizedContent: "# 洗碗机培训\n\n排查时先确认电源、水路和错误码。",
    metadata: {
      language: "zh-CN",
      businessDomain: "product_support",
    },
    sourceRefs: [{
      sourceId: "src-pdf-dishwasher",
      rawMaterialId: "rm-002",
      parsedDocumentId: "pd-002",
      locatorType: "page",
      locator: "P-8",
      excerpt: "先检查电源、水路和错误码",
      confidence: 0.88,
    }],
    parserProfile: "pdf_manual_article_v1",
    parseStatus: "parsed",
    parseErrorSummary: null,
    createdAt: "2026-06-18",
    updatedAt: "2026-06-18",
  },
]

export async function mockSourceEvidenceApi(page: Page) {
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname

    if (path === "/api/sources") {
      return route.fulfill({ json: sources })
    }

    const sourceRawMaterialMatch = path.match(/^\/api\/sources\/([^/]+)\/raw-materials$/)
    if (sourceRawMaterialMatch) {
      const [, sourceId] = sourceRawMaterialMatch
      return route.fulfill({ json: rawMaterials.filter((rawMaterial) => rawMaterial.sourceId === sourceId) })
    }

    const sourceMatch = path.match(/^\/api\/sources\/([^/]+)$/)
    if (sourceMatch) {
      const [, sourceId] = sourceMatch
      const source = sources.find((item) => item.sourceId === sourceId)
      return source ? route.fulfill({ json: source }) : route.fulfill({ status: 404, json: { message: "Source not found" } })
    }

    if (path === "/api/raw-materials") {
      return route.fulfill({ json: rawMaterials })
    }

    const rawParsedDocumentMatch = path.match(/^\/api\/raw-materials\/([^/]+)\/parsed-documents$/)
    if (rawParsedDocumentMatch) {
      const [, rawMaterialId] = rawParsedDocumentMatch
      return route.fulfill({ json: parsedDocuments.filter((parsedDocument) => parsedDocument.rawMaterialId === rawMaterialId) })
    }

    const rawMatch = path.match(/^\/api\/raw-materials\/([^/]+)$/)
    if (rawMatch) {
      const [, rawMaterialId] = rawMatch
      const rawMaterial = rawMaterials.find((item) => item.rawMaterialId === rawMaterialId)
      return rawMaterial ? route.fulfill({ json: rawMaterial }) : route.fulfill({ status: 404, json: { message: "Raw Material not found" } })
    }

    const parsedDocumentMatch = path.match(/^\/api\/parsed-documents\/([^/]+)$/)
    if (parsedDocumentMatch) {
      const [, parsedDocumentId] = parsedDocumentMatch
      const parsedDocument = parsedDocuments.find((item) => item.parsedDocumentId === parsedDocumentId)
      return parsedDocument ? route.fulfill({ json: parsedDocument }) : route.fulfill({ status: 404, json: { message: "Parsed Document not found" } })
    }

    if (path === "/api/wiki-nodes") {
      return route.fulfill({ json: [] })
    }

    return route.fallback()
  })
}
