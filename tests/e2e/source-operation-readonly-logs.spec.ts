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
  parsedDocumentCount: 0,
  createdAt: "2026-06-25",
  updatedAt: "2026-06-25",
}

const sourceOperations = [
  {
    operationId: "op-api-sync-001",
    operationType: "source_sync",
    sourceId: "src-api-only",
    rawMaterialId: null,
    parsedDocumentId: null,
    status: "succeeded",
    requestedBy: "system",
    startedAt: "2026-06-25T10:00:00+08:00",
    finishedAt: "2026-06-25T10:05:00+08:00",
    summary: "Read-only Source sync evidence captured for acceptance.",
    errorSummary: null,
  },
  {
    operationId: "op-api-parse-001",
    operationType: "parse_raw_material",
    sourceId: "src-api-only",
    rawMaterialId: "rm-api-only",
    parsedDocumentId: null,
    status: "failed",
    requestedBy: "system",
    startedAt: "2026-06-25T10:06:00+08:00",
    finishedAt: "2026-06-25T10:07:00+08:00",
    summary: "Read-only parse evidence captured without running a parser.",
    errorSummary: "解析器未在当前阶段启用。",
  },
]

test.describe("Source Operation read-only logs", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/sources/src-api-only/operations", (route) => route.fulfill({ json: sourceOperations }))
    await page.route("**/api/raw-materials/rm-api-only/operations", (route) => route.fulfill({ json: sourceOperations.filter((operation) => operation.rawMaterialId === "rm-api-only") }))
    await page.route("**/api/source-operations/op-api-sync-001", (route) => route.fulfill({ json: sourceOperations[0] }))
    await page.route("**/api/sources/src-api-only/raw-materials", (route) => route.fulfill({ json: [apiRawMaterial] }))
    await page.route("**/api/sources/src-api-only", (route) => route.fulfill({ json: apiSource }))
    await page.route("**/api/raw-materials/rm-api-only/parsed-documents", (route) => route.fulfill({ json: [] }))
    await page.route("**/api/raw-materials/rm-api-only", (route) => route.fulfill({ json: apiRawMaterial }))
    await page.route("**/api/wiki-nodes", (route) => route.fulfill({ json: [] }))
  })

  test("renders Source Operation logs without exposing execution actions", async ({ page }) => {
    await page.goto("/sources/src-api-only")

    await expect(page.getByRole("heading", { name: "操作日志" })).toBeVisible()
    await expect(page.getByText("只读操作日志，不会启动同步、上传、解析或重试。")).toBeVisible()
    await expect(page.getByText("来源同步")).toBeVisible()
    await expect(page.getByText("解析 Raw Material")).toBeVisible()
    await expect(page.getByText("执行人 system")).toHaveCount(2)

    await expect(page.getByRole("button", { name: "同步" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "上传" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "解析" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "重试" })).toHaveCount(0)
  })

  test("renders Raw Material Operation logs as read-only parser evidence", async ({ page }) => {
    await page.goto("/raw-materials/rm-api-only")

    await expect(page.getByRole("heading", { name: "操作日志" })).toBeVisible()
    await expect(page.getByText("解析 Raw Material")).toBeVisible()
    await expect(page.getByText("解析失败")).toBeVisible()
    await expect(page.getByText("解析器未在当前阶段启用。")).toBeVisible()
    await expect(page.getByText("不会启动同步、上传、解析或重试。")).toBeVisible()
  })
})
