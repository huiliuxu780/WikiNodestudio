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

test.describe("Source / Raw Material API alignment", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/sources", (route) => route.fulfill({ json: [apiSource] }))
    await page.route("**/api/sources/src-api-only", (route) => route.fulfill({ json: apiSource }))
    await page.route("**/api/sources/src-api-only/raw-materials", (route) => route.fulfill({ json: [apiRawMaterial] }))
    await page.route("**/api/raw-materials", (route) => route.fulfill({ json: [apiRawMaterial] }))
    await page.route("**/api/raw-materials/rm-api-only", (route) => route.fulfill({ json: apiRawMaterial }))
    await page.route("**/api/raw-materials/rm-api-only/parsed-documents", (route) => route.fulfill({ json: [apiParsedDocument] }))
    await page.route("**/api/parsed-documents/pd-api-only", (route) => route.fulfill({ json: apiParsedDocument }))
    await page.route("**/api/wiki-nodes", (route) => route.fulfill({ json: [] }))
  })

  test("renders Source list and Source detail from read-only backend endpoints", async ({ page }) => {
    await page.goto("/sources")

    await expect(page.getByRole("link", { name: "API Only Source" })).toBeVisible()
    await expect(page.getByText("API Owner")).toBeVisible()
    await expect(page.getByText("1 个 Raw Material")).toBeVisible()

    await page.goto("/sources/src-api-only")

    await expect(page.getByText("API Only Source。查看来源配置、快照和生成的 WikiNode。")).toBeVisible()
    await page.getByRole("tab", { name: "Raw Material" }).click()
    await expect(page.getByRole("link", { name: /API Only Raw Material/ })).toBeVisible()
  })

  test("renders Raw Material detail and Parsed Document preview from read-only backend endpoints", async ({ page }) => {
    await page.goto("/raw-materials")

    await expect(page.getByRole("link", { name: /API Only Raw Material/ })).toBeVisible()

    await page.goto("/raw-materials/rm-api-only")

    await expect(page.getByText("API Only Raw Material")).toBeVisible()
    await expect(page.getByText("API Only Source")).toBeVisible()
    await expect(page.getByRole("link", { name: "查看解析结果" })).toBeVisible()

    await page.goto("/raw-materials/rm-api-only/parsed-result")

    await expect(page.getByText("API Only Parsed Document", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("这是来自 API 的标准化内容。")).toBeVisible()
    await expect(page.getByText("来自 API 的来源证据")).toBeVisible()
  })
})
