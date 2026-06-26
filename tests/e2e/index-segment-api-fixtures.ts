import type { Page } from "@playwright/test"

export const defaultIndexSegments = [
  {
    segmentId: "SEG-001",
    nodeId: "wn-001",
    nodeTitle: "保修期内维修服务政策",
    objectType: "Article",
    subtype: "service_fee_policy",
    segmentType: "body",
    title: "保修期内维修服务政策 / Body section segment",
    content: "保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。",
    contentPreview: "保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。",
    tokenCount: 28,
    enabled: true,
    indexStatus: "indexed",
    vectorDocId: "vec-wn-001-body",
    lastIndexedAt: "2026-06-18",
    retrievalHits: 23,
    avgScore: 0.88,
    sourceRefs: [
      {
        sourceId: "src-feishu-cc",
        sourceType: "feishu",
        sourceTitle: "CC 售后政策飞书空间",
        sourceUrl: "https://feishu.example.com/wiki/after-sales",
        paragraphRef: "P-12",
        version: "2026.06",
      },
    ],
    sourceRefIds: ["src-feishu-cc"],
    processingProfile: "feishu_article_v1",
    metadataSummary: [
      { label: "objectType", value: "Article" },
      { label: "subtype", value: "service_fee_policy" },
      { label: "businessDomain", value: "after_sales" },
    ],
    createdAt: "2026-06-18",
    updatedAt: "2026-06-18",
    metadata: {
      nodeType: "policy",
      status: "published",
      tags: ["保修", "售后", "政策"],
      objectType: "Article",
      subtype: "service_fee_policy",
    },
  },
  {
    segmentId: "SEG-037",
    nodeId: "wn-013",
    nodeTitle: "西门子 WM14U 洗衣机",
    objectType: "Product",
    subtype: "product_model",
    segmentType: "metadata",
    title: "西门子 WM14U 洗衣机 / Metadata segment",
    content: "objectType: Product; subtype: product_model; brand: Siemens; productCategory: washing_machine; modelCode: WM14U",
    contentPreview: "objectType: Product; subtype: product_model; brand: Siemens; productCategory: washing_machine; modelCode: WM14U",
    tokenCount: 42,
    enabled: true,
    indexStatus: "indexed",
    vectorDocId: "vec-wn-013-metadata",
    lastIndexedAt: "2026-06-18",
    retrievalHits: 0,
    avgScore: 0.82,
    sourceRefs: [
      {
        sourceId: "src-db-product",
        sourceType: "database",
        sourceTitle: "PIM 产品主数据",
        sourceRecordId: "WM14U",
        evidenceRange: "product.master.WM14U",
        version: "2026.06",
      },
    ],
    sourceRefIds: ["src-db-product"],
    processingProfile: "db_product_master_v1",
    metadataSummary: [
      { label: "objectType", value: "Product" },
      { label: "subtype", value: "product_model" },
      { label: "brand", value: "Siemens" },
      { label: "productCategory", value: "washing_machine" },
    ],
    createdAt: "2026-06-18",
    updatedAt: "2026-06-18",
    metadata: {
      nodeType: "product",
      status: "published",
      tags: ["西门子", "洗衣机", "WM14U"],
      objectType: "Product",
      subtype: "product_model",
    },
  },
]

export async function routeIndexSegmentApi(page: Page, segments = defaultIndexSegments) {
  await page.route("**/api/index-segments**", (route) => {
    const pathname = new URL(route.request().url()).pathname
    const segmentId = pathname.split("/").pop()

    if (pathname === "/api/index-segments") {
      return route.fulfill({ json: segments })
    }

    const segment = segments.find((item) => item.segmentId === segmentId)
    return segment
      ? route.fulfill({ json: segment })
      : route.fulfill({ status: 404, json: { message: "Index Segment not found" } })
  })

  await page.route("**/api/wiki-nodes/*/index-segments", (route) => {
    const parts = new URL(route.request().url()).pathname.split("/")
    const nodeId = parts[3]
    return route.fulfill({ json: segments.filter((segment) => segment.nodeId === nodeId) })
  })
}
