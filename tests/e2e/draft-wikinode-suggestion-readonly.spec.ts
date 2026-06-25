import { expect, test } from "@playwright/test"

const apiSource = {
  sourceId: "src-api-only",
  sourceType: "feishu",
  title: "API Only Source",
  owner: "API Owner",
  syncStatus: "synced",
  lastSyncedAt: "2026-06-25",
  generatedNodes: 0,
  rawMaterialCount: 1,
}

const apiRawMaterial = {
  rawMaterialId: "rm-api-only",
  sourceId: "src-api-only",
  title: "API Only Raw Material",
  rawMaterialType: "document_snapshot",
  sourceVersion: "2026.06",
  capturedAt: "2026-06-25T10:00:00+08:00",
  contentHash: "sha256:api-only",
  storageProvider: "workspace",
  storageRef: "workspace://snapshots/rm-api-only",
  parseStatus: "parsed",
  parsedDocumentCount: 1,
  createdAt: "2026-06-25",
  updatedAt: "2026-06-25",
}

const apiParsedDocument = {
  parsedDocumentId: "pd-api-only",
  rawMaterialId: "rm-api-only",
  sourceId: "src-api-only",
  title: "API Only Parsed Document",
  contentFormat: "markdown",
  normalizedContent: "# API Only Parsed Document\n\n这是来自 API 的标准化内容。",
  metadata: {
    language: "zh-CN",
    businessDomain: "api_alignment",
  },
  sourceRefs: [
    {
      sourceId: "src-api-only",
      rawMaterialId: "rm-api-only",
      parsedDocumentId: "pd-api-only",
      locatorType: "heading",
      locator: "API Only",
      excerpt: "来自 API 的来源证据",
      confidence: 0.93,
    },
  ],
  parserProfile: "api_alignment_v1",
  parseStatus: "parsed",
  parseErrorSummary: null,
  createdAt: "2026-06-25",
  updatedAt: "2026-06-25",
}

const apiSuggestion = {
  suggestionId: "sug-api-only",
  parsedDocumentId: "pd-api-only",
  rawMaterialId: "rm-api-only",
  sourceId: "src-api-only",
  operationId: "op-api-suggest-001",
  title: "API Only WikiNode 建议",
  objectType: "Article",
  subtype: "service_fee_policy",
  contentDraft: "# API Only WikiNode 建议\n\n这是待审核的 WikiNode 建议。",
  metadataDraft: {
    businessDomain: "api_alignment",
    language: "zh-CN",
  },
  sourceRefs: apiParsedDocument.sourceRefs,
  relationCandidates: [
    {
      targetTitle: "收费政策",
      relationType: "references",
      source: "inferred_from_source_ref",
      confidence: 0.72,
    },
  ],
  confidence: 0.86,
  status: "draft",
  reviewNote: null,
  conflictStatus: "title_match",
  conflictReasons: ["标题可能重复"],
  matchedWikiNodeIds: ["wn-001"],
  matchedSuggestionIds: [],
  sourceRefCount: 1,
  relationCandidateCount: 1,
  createdAt: "2026-06-25",
  updatedAt: "2026-06-25",
}

test.describe("Draft WikiNode Suggestion read-only review", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/sources/src-api-only", (route) => route.fulfill({ json: apiSource }))
    await page.route("**/api/raw-materials/rm-api-only", (route) => route.fulfill({ json: apiRawMaterial }))
    await page.route("**/api/raw-materials/rm-api-only/parsed-documents", (route) => route.fulfill({ json: [apiParsedDocument] }))
    await page.route("**/api/raw-materials/rm-api-only/draft-wikinode-suggestions", (route) => route.fulfill({ json: [apiSuggestion] }))
    await page.route("**/api/parsed-documents/pd-api-only/draft-wikinode-suggestions", (route) => route.fulfill({ json: [apiSuggestion] }))
    await page.route("**/api/draft-wikinode-suggestions/sug-api-only", (route) => route.fulfill({ json: apiSuggestion }))
    await page.route("**/api/raw-materials/rm-api-only/operations", (route) => route.fulfill({ json: [] }))
    await page.route("**/api/wiki-nodes", (route) => route.fulfill({ json: [] }))
  })

  test("renders Raw Material linked suggestions without write actions", async ({ page }) => {
    await page.goto("/raw-materials/rm-api-only")

    await expect(page.getByRole("heading", { name: "WikiNode 建议" })).toBeVisible()
    await expect(page.getByText("只读建议，不会创建 WikiNode、发布、索引或批量转换。")).toBeVisible()
    await expect(page.getByRole("link", { name: /API Only WikiNode 建议/ })).toBeVisible()
    await expect(page.getByText("待审核")).toBeVisible()
    await expect(page.getByText("标题可能重复").first()).toBeVisible()

    await expect(page.getByRole("button", { name: "采纳" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "拒绝" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "发布" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "索引" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "批量转换" })).toHaveCount(0)
  })

  test("renders Parsed Document suggestion evidence as review-only content", async ({ page }) => {
    await page.goto("/raw-materials/rm-api-only/parsed-result")

    await expect(page.getByRole("heading", { name: "WikiNode 建议" })).toBeVisible()
    await expect(page.getByRole("link", { name: "API Only WikiNode 建议" })).toBeVisible()
    await expect(page.getByText("这是待审核的 WikiNode 建议。")).toBeVisible()
    await expect(page.getByText("来自 API 的来源证据").first()).toBeVisible()
    await expect(page.getByText("收费政策")).toBeVisible()
    await expect(page.getByText("不会创建 WikiNode、发布、索引或批量转换")).toBeVisible()
  })
})
