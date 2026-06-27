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

const parsedDocumentSegments = [
  {
    segmentId: "pds-pd-001-001",
    parsedDocumentId: "pd-001",
    rawMaterialId: "rm-001",
    sourceId: "src-feishu-cc",
    position: 0,
    segmentType: "section",
    title: "保修政策",
    content: "# 保修政策\n\n保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。",
    contentPreview: "# 保修政策 保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。",
    tokenCount: 35,
    sourceLocator: "section:1",
    createdAt: "2026-06-20",
    updatedAt: "2026-06-20",
  },
]

const sourceOperations = [
  {
    operationId: "op-src-feishu-sync-001",
    operationType: "source_sync",
    sourceId: "src-feishu-cc",
    rawMaterialId: null,
    parsedDocumentId: null,
    status: "succeeded",
    requestedBy: "system",
    startedAt: "2026-06-20T10:30:00+08:00",
    finishedAt: "2026-06-20T10:35:00+08:00",
    summary: "Completed read-only Source sync evidence capture for 2 Raw Materials.",
    errorSummary: null,
  },
  {
    operationId: "op-src-feishu-parse-001",
    operationType: "parse_raw_material",
    sourceId: "src-feishu-cc",
    rawMaterialId: "rm-001",
    parsedDocumentId: "pd-001",
    status: "succeeded",
    requestedBy: "system",
    startedAt: "2026-06-20T10:36:00+08:00",
    finishedAt: "2026-06-20T10:37:00+08:00",
    summary: "Completed read-only Parsed Document evidence preview.",
    errorSummary: null,
  },
  {
    operationId: "op-word-parse-001",
    operationType: "parse_raw_material",
    sourceId: "src-word-manual",
    rawMaterialId: "rm-004",
    parsedDocumentId: null,
    status: "failed",
    requestedBy: "system",
    startedAt: "2026-06-12T18:21:00+08:00",
    finishedAt: "2026-06-12T18:22:00+08:00",
    summary: "Parser profile rejected this Raw Material in the read-only seed baseline.",
    errorSummary: "Unsupported document structure in seed evidence.",
  },
]

const parserProfiles = [
  {
    parserProfile: "feishu_article_v1",
    displayName: "飞书文章解析 Profile",
    supportedRawMaterialTypes: ["document_snapshot"],
    supportedSourceTypes: ["feishu"],
    contentFormat: "markdown",
    enabled: true,
    version: "v1",
  },
  {
    parserProfile: "pdf_manual_article_v1",
    displayName: "PDF 手册解析 Profile",
    supportedRawMaterialTypes: ["file"],
    supportedSourceTypes: ["pdf"],
    contentFormat: "markdown",
    enabled: true,
    version: "v1",
  },
  {
    parserProfile: "excel_fee_table_v1",
    displayName: "Excel 收费表解析 Profile",
    supportedRawMaterialTypes: ["file", "table_extract"],
    supportedSourceTypes: ["excel"],
    contentFormat: "structured_table",
    enabled: true,
    version: "v1",
  },
]

export async function mockSourceEvidenceApi(page: Page) {
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname

    if (path === "/api/parser-profiles") {
      return route.fulfill({ json: parserProfiles })
    }

    if (path === "/api/sources") {
      return route.fulfill({ json: sources })
    }

    const sourceImportMatch = path.match(/^\/api\/sources\/([^/]+)\/raw-materials\/import$/)
    if (sourceImportMatch && route.request().method() === "POST") {
      const [, sourceId] = sourceImportMatch
      return route.fulfill({
        json: {
          operationId: "op-import-playwright",
          sourceId,
          rawMaterialId: "rm-import-playwright",
          parsedDocumentId: "pd-import-playwright",
          status: "succeeded",
          summary: "已导入文件、生成 Parsed Document 和文档片段。",
          segmentCount: 2,
          segmentIds: ["pds-pd-import-playwright-001", "pds-pd-import-playwright-002"],
        },
      })
    }

    const sourceOperationMatch = path.match(/^\/api\/sources\/([^/]+)\/operations$/)
    if (sourceOperationMatch) {
      const [, sourceId] = sourceOperationMatch
      return route.fulfill({ json: sourceOperations.filter((operation) => operation.sourceId === sourceId) })
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

    const rawOperationMatch = path.match(/^\/api\/raw-materials\/([^/]+)\/operations$/)
    if (rawOperationMatch) {
      const [, rawMaterialId] = rawOperationMatch
      return route.fulfill({ json: sourceOperations.filter((operation) => operation.rawMaterialId === rawMaterialId) })
    }

    const rawSuggestionMatch = path.match(/^\/api\/raw-materials\/([^/]+)\/draft-wikinode-suggestions$/)
    if (rawSuggestionMatch) {
      return route.fulfill({ json: [] })
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

    const parsedDocumentSegmentMatch = path.match(/^\/api\/parsed-documents\/([^/]+)\/segments$/)
    if (parsedDocumentSegmentMatch) {
      const [, parsedDocumentId] = parsedDocumentSegmentMatch
      return route.fulfill({ json: parsedDocumentSegments.filter((segment) => segment.parsedDocumentId === parsedDocumentId) })
    }

    const parsedSuggestionMatch = path.match(/^\/api\/parsed-documents\/([^/]+)\/draft-wikinode-suggestions$/)
    if (parsedSuggestionMatch) {
      return route.fulfill({ json: [] })
    }

    const sourceOperationDetailMatch = path.match(/^\/api\/source-operations\/([^/]+)$/)
    if (sourceOperationDetailMatch) {
      const [, operationId] = sourceOperationDetailMatch
      const operation = sourceOperations.find((item) => item.operationId === operationId)
      return operation ? route.fulfill({ json: operation }) : route.fulfill({ status: 404, json: { message: "Source Operation not found" } })
    }

    if (path === "/api/wiki-nodes") {
      return route.fulfill({ json: [] })
    }

    return route.fallback()
  })
}
