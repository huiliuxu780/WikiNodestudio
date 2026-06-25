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

const generatedSuggestion = {
  ...apiSuggestion,
  suggestionId: "sug-api-generated",
  operationId: "op-api-generated",
  title: "API Generated WikiNode 建议",
  contentDraft: "# API Generated WikiNode 建议\n\n这是刚生成的待审核 WikiNode 建议。",
  conflictStatus: "none",
  conflictReasons: [],
  matchedWikiNodeIds: [],
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
    await expect(page.getByText("只读建议，不会创建 WikiNode、发布、索引或批量转换。")).toBeVisible()
  })

  test("generates one Draft WikiNode Suggestion from Parsed Result without review actions", async ({ page }) => {
    let parsedDocumentSuggestions: unknown[] = []
    await page.route("**/api/parsed-documents/pd-api-only/draft-wikinode-suggestions", (route) => {
      return route.fulfill({ json: parsedDocumentSuggestions })
    })
    await page.route("**/api/parsed-documents/pd-api-only/suggest-wikinode", async (route) => {
      expect(route.request().method()).toBe("POST")
      parsedDocumentSuggestions = [generatedSuggestion]
      return route.fulfill({
        json: {
          operationId: "op-api-generated",
          parsedDocumentId: "pd-api-only",
          status: "succeeded",
          summary: "已生成待审核 WikiNode 建议。",
          suggestionId: "sug-api-generated",
        },
      })
    })

    await page.goto("/raw-materials/rm-api-only/parsed-result")

    await expect(page.getByRole("button", { name: "生成 WikiNode 建议" })).toBeVisible()
    await page.getByRole("button", { name: "生成 WikiNode 建议" }).click()

    await expect(page.getByText("已生成待审核 WikiNode 建议。")).toBeVisible()
    await expect(page.getByRole("link", { name: "API Generated WikiNode 建议" })).toBeVisible()
    await expect(page.getByRole("button", { name: "采纳" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "拒绝" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "发布" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "索引" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "批量转换" })).toHaveCount(0)
  })

  test("renders suggestion detail with explicit evidence boundaries and no write actions", async ({ page }) => {
    await page.goto("/draft-wikinode-suggestions/sug-api-only")

    await expect(page.getByRole("heading", { name: "WikiNode 建议详情" })).toBeVisible()
    await expect(page.getByText("只读查看 Draft WikiNode Suggestion")).toBeVisible()
    await expect(page.getByText("API Only WikiNode 建议").first()).toBeVisible()
    await expect(page.getByText("Source src-api-only", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Raw Material rm-api-only", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Parsed Document pd-api-only", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Source Operation op-api-suggest-001")).toBeVisible()
    await expect(page.getByText("来源证据推断")).toBeVisible()
    await expect(page.getByText("不是已采纳的 WikiNode，不影响 Retrieval API 结果。")).toBeVisible()

    await expect(page.getByRole("button", { name: "采纳" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "拒绝" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "生成建议" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "发布" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "索引" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "批量转换" })).toHaveCount(0)
  })
})
