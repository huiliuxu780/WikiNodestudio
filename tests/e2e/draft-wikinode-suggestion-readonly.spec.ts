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

const acceptedSuggestion = {
  ...apiSuggestion,
  suggestionId: "sug-api-accepted",
  title: "API Accepted WikiNode 建议",
  status: "accepted",
  reviewNote: "确认进入草稿 WikiNode，后续人工编辑。",
  conflictStatus: "none",
  conflictReasons: [],
  matchedWikiNodeIds: ["wn-from-sug-api-accepted"],
}

const rejectedSuggestion = {
  ...apiSuggestion,
  suggestionId: "sug-api-rejected",
  title: "API Rejected WikiNode 建议",
  status: "rejected",
  reviewNote: "证据不足，暂不进入 WikiNode。",
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
    await expect(page.getByText("这里展示 Draft WikiNode Suggestion 与审核结果；采纳或拒绝请进入建议详情。")).toBeVisible()
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
    await expect(page.getByText("这里展示 Draft WikiNode Suggestion 与审核结果；采纳或拒绝请进入建议详情。")).toBeVisible()
  })

  test("surfaces accepted and rejected review outcomes in linked suggestion lists", async ({ page }) => {
    await page.route("**/api/raw-materials/rm-api-only/draft-wikinode-suggestions", (route) => {
      return route.fulfill({ json: [acceptedSuggestion, rejectedSuggestion] })
    })

    await page.goto("/raw-materials/rm-api-only")

    await expect(page.getByText("已采纳为草稿 WikiNode")).toBeVisible()
    await expect(page.getByRole("link", { name: "打开草稿 WikiNode" })).toHaveAttribute("href", "/wiki-nodes/wn-from-sug-api-accepted")
    await expect(page.getByText("已拒绝：证据不足，暂不进入 WikiNode。")).toBeVisible()
    await expect(page.getByRole("button", { name: "发布" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "索引" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "批量转换" })).toHaveCount(0)
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

  test("renders suggestion detail with explicit evidence boundaries and conflict-aware review actions", async ({ page }) => {
    await page.goto("/draft-wikinode-suggestions/sug-api-only")

    await expect(page.getByRole("heading", { name: "WikiNode 建议详情" })).toBeVisible()
    await expect(page.getByText(/查看 Draft WikiNode Suggestion，并允许单条采纳或拒绝/)).toBeVisible()
    await expect(page.getByText("API Only WikiNode 建议").first()).toBeVisible()
    await expect(page.getByText("Source src-api-only", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Raw Material rm-api-only", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Parsed Document pd-api-only", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Source Operation op-api-suggest-001")).toBeVisible()
    await expect(page.getByText("来源证据推断")).toBeVisible()
    await expect(page.getByText("采纳只会创建草稿 WikiNode，并保留来源证据；拒绝只会更新当前建议的审核状态。")).toBeVisible()

    await expect(page.getByText("存在冲突，不能直接采纳为 WikiNode。")).toBeVisible()
    await expect(page.getByRole("button", { name: "采纳为草稿 WikiNode" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "拒绝建议" })).toBeVisible()
    await expect(page.getByRole("button", { name: "生成建议" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "发布" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "索引" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "批量转换" })).toHaveCount(0)
  })

  test("rejects one suggestion with a review note without creating WikiNode", async ({ page }) => {
    let activeSuggestion = { ...apiSuggestion }
    await page.route("**/api/draft-wikinode-suggestions/sug-api-only/reject", async (route) => {
      expect(route.request().method()).toBe("POST")
      const payload = await route.request().postDataJSON()
      activeSuggestion = {
        ...activeSuggestion,
        status: "rejected",
        reviewNote: payload.reviewNote,
        updatedAt: "2026-06-25",
      }
      return route.fulfill({
        json: {
          suggestionId: "sug-api-only",
          status: "rejected",
          summary: "已拒绝 WikiNode 建议。",
          reviewNote: payload.reviewNote,
        },
      })
    })
    await page.route("**/api/draft-wikinode-suggestions/sug-api-only", async (route) => {
      return route.fulfill({ json: activeSuggestion })
    })

    await page.goto("/draft-wikinode-suggestions/sug-api-only")

    await page.getByLabel("拒绝原因").fill("证据不足，暂不进入 WikiNode。")
    await page.getByRole("button", { name: "拒绝建议" }).click()

    await expect(page.getByText("已拒绝 WikiNode 建议。")).toBeVisible()
    await expect(page.getByText("当前状态为已拒绝，不能继续采纳或拒绝。")).toBeVisible()
    await expect(page.getByText("证据不足，暂不进入 WikiNode。")).toBeVisible()
    await expect(page.getByText("采纳只会创建草稿 WikiNode，并保留来源证据；拒绝只会更新当前建议的审核状态。")).toBeVisible()
    await expect(page.getByRole("button", { name: "采纳" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "发布" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "索引" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "批量转换" })).toHaveCount(0)
  })

  test("accepts one suggestion as draft WikiNode without publishing or indexing", async ({ page }) => {
    let activeSuggestion = {
      ...apiSuggestion,
      conflictStatus: "none",
      conflictReasons: [],
      matchedWikiNodeIds: [],
    }
    await page.route("**/api/draft-wikinode-suggestions/sug-api-only/accept", async (route) => {
      expect(route.request().method()).toBe("POST")
      const payload = await route.request().postDataJSON()
      activeSuggestion = {
        ...activeSuggestion,
        status: "accepted",
        reviewNote: payload.reviewNote,
        matchedWikiNodeIds: ["wn-from-sug-api-only"],
        updatedAt: "2026-06-25",
      }
      return route.fulfill({
        json: {
          suggestionId: "sug-api-only",
          status: "accepted",
          summary: "已采纳为草稿 WikiNode。",
          reviewNote: payload.reviewNote,
          nodeId: "wn-from-sug-api-only",
          nodeStatus: "draft",
        },
      })
    })
    await page.route("**/api/draft-wikinode-suggestions/sug-api-only", async (route) => {
      return route.fulfill({ json: activeSuggestion })
    })

    await page.goto("/draft-wikinode-suggestions/sug-api-only")

    await page.getByLabel("采纳说明").fill("确认进入草稿 WikiNode，后续人工编辑。")
    await page.getByRole("button", { name: "采纳为草稿 WikiNode" }).click()

    await expect(page.getByText("已采纳为草稿 WikiNode。")).toBeVisible()
    await expect(page.getByText("当前状态为已采纳，不能继续采纳或拒绝。")).toBeVisible()
    await expect(page.getByText("确认进入草稿 WikiNode，后续人工编辑。")).toBeVisible()
    await expect(page.getByRole("link", { name: "打开草稿 WikiNode" })).toHaveAttribute("href", "/wiki-nodes/wn-from-sug-api-only")
    await expect(page.getByRole("button", { name: "发布" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "索引" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "批量转换" })).toHaveCount(0)
  })

  test("renders accepted suggestion detail with persistent draft WikiNode link", async ({ page }) => {
    await page.route("**/api/draft-wikinode-suggestions/sug-api-accepted", (route) => {
      return route.fulfill({ json: acceptedSuggestion })
    })

    await page.goto("/draft-wikinode-suggestions/sug-api-accepted")

    await expect(page.getByText("当前状态为已采纳，不能继续采纳或拒绝。")).toBeVisible()
    await expect(page.getByText("确认进入草稿 WikiNode，后续人工编辑。")).toBeVisible()
    await expect(page.getByRole("link", { name: "打开草稿 WikiNode" })).toHaveAttribute("href", "/wiki-nodes/wn-from-sug-api-accepted")
    await expect(page.getByRole("button", { name: "采纳为草稿 WikiNode" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "拒绝建议" })).toHaveCount(0)
  })
})
