import { apiGet, withMockFallback } from "@/services/api-client"
import { mockRawMaterials } from "@/data/mock-raw-materials"
import { mockSources } from "@/data/mock-sources"
import { listWikiNodes } from "@/services/wiki-node-api-service"
import type { ParsedDocument, RawMaterial } from "@/types/raw-material"
import type { SourceItem } from "@/types/source"
import type { SourceOperation } from "@/types/source-operation"

export function listSources() {
  return withMockFallback(
    apiGet<SourceItem[]>("/sources"),
    () => mockSources
  )
}

export function getSource(sourceId: string) {
  return withMockFallback(
    apiGet<SourceItem>(`/sources/${sourceId}`),
    () => mockSources.find((source) => source.sourceId === sourceId) ?? mockSources[0]
  )
}

export function listRawMaterials() {
  return withMockFallback(
    apiGet<RawMaterial[]>("/raw-materials"),
    () => mockRawMaterials
  )
}

export function listRawMaterialsForSource(sourceId: string) {
  return withMockFallback(
    apiGet<RawMaterial[]>(`/sources/${sourceId}/raw-materials`),
    () => mockRawMaterials.filter((rawMaterial) => rawMaterial.sourceId === sourceId)
  )
}

export function listSourceOperationsForSource(sourceId: string) {
  return withMockFallback(
    apiGet<SourceOperation[]>(`/sources/${sourceId}/operations`),
    () => mockSourceOperations.filter((operation) => operation.sourceId === sourceId)
  )
}

export function getRawMaterial(rawMaterialId: string) {
  return withMockFallback(
    apiGet<RawMaterial>(`/raw-materials/${rawMaterialId}`),
    () => mockRawMaterials.find((rawMaterial) => rawMaterial.rawMaterialId === rawMaterialId) ?? mockRawMaterials[0]
  )
}

export function listParsedDocumentsForRawMaterial(rawMaterialId: string) {
  return withMockFallback(
    apiGet<ParsedDocument[]>(`/raw-materials/${rawMaterialId}/parsed-documents`),
    () => mockParsedDocuments.filter((parsedDocument) => parsedDocument.rawMaterialId === rawMaterialId)
  )
}

export function listSourceOperationsForRawMaterial(rawMaterialId: string) {
  return withMockFallback(
    apiGet<SourceOperation[]>(`/raw-materials/${rawMaterialId}/operations`),
    () => mockSourceOperations.filter((operation) => operation.rawMaterialId === rawMaterialId)
  )
}

export function getSourceOperation(operationId: string) {
  return withMockFallback(
    apiGet<SourceOperation>(`/source-operations/${operationId}`),
    () => mockSourceOperations.find((operation) => operation.operationId === operationId) ?? mockSourceOperations[0]
  )
}

export function getParsedDocument(parsedDocumentId: string) {
  return withMockFallback(
    apiGet<ParsedDocument>(`/parsed-documents/${parsedDocumentId}`),
    () => mockParsedDocuments.find((parsedDocument) => parsedDocument.parsedDocumentId === parsedDocumentId) ?? mockParsedDocuments[0]
  )
}

export async function getNodesBySourceId(sourceId: string) {
  if (!sourceId) return []

  const nodes = await listWikiNodes()
  return nodes.filter((node) => node.sourceRefs.some((source) => source.sourceId === sourceId))
}

const mockParsedDocuments: ParsedDocument[] = [
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
  {
    parsedDocumentId: "pd-003",
    rawMaterialId: "rm-003",
    sourceId: "src-excel-fee",
    title: "维修收费标准 Excel 解析结果",
    contentFormat: "structured_table",
    normalizedContent: "| 项目 | 费用 |\n| --- | --- |\n| 上门检测 | 按服务单收费 |",
    metadata: {
      language: "zh-CN",
      businessDomain: "service_fee",
    },
    sourceRefs: [{
      sourceId: "src-excel-fee",
      rawMaterialId: "rm-003",
      parsedDocumentId: "pd-003",
      locatorType: "row",
      locator: "Sheet1:R2",
      excerpt: "上门检测按服务单收费",
      confidence: 0.9,
    }],
    parserProfile: "excel_fee_table_v1",
    parseStatus: "parsed",
    parseErrorSummary: null,
    createdAt: "2026-06-16",
    updatedAt: "2026-06-16",
  },
]

const mockSourceOperations: SourceOperation[] = [
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
