import { expect, test } from "@playwright/test"
import { mockSourceEvidenceApi } from "./source-api-fixtures"

const forbiddenProductTerms = /Chunk Management|Chat API|Chatbot|Agent Platform|Workflow Builder|Vector DB Management/i
const forbiddenBoundaryCopy = /当前只读|当前不|不执行|不会执行|不提供|真实上传|真实存储|验收基线|留到后续/i
const forbiddenActions = /创建 Source|导入 Source|上传文件|开始同步|重新解析|执行解析|下载原文件/i

test.describe("Source / Raw Material / Parsed Document acceptance", () => {
  test.beforeEach(async ({ page }) => {
    await mockSourceEvidenceApi(page)
  })

  test("Sources page exposes Source import actions without explainer cards", async ({ page }) => {
    await page.goto("/sources")

    await expect(page.getByRole("heading", { name: "知识来源" })).toBeVisible()
    await expect(page.getByText("来源清单", { exact: true })).toBeVisible()
    await expect(page.getByText("上游证据链", { exact: true })).toHaveCount(0)
    await expect(page.getByText("Source 是原始知识的来源。", { exact: true })).toHaveCount(0)
    await expect(page.getByText("Raw Material 是来源快照。", { exact: true })).toHaveCount(0)
    await expect(page.getByText("Parsed Document 是标准化预览。", { exact: true })).toHaveCount(0)
    await expect(page.getByRole("link", { name: "导入文件" }).first()).toHaveAttribute("href", "/knowledge-bases/kb-cc-after-sales/import?sourceId=src-feishu-cc")
    await expect(page.getByText("生成的 WikiNode", { exact: true })).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
    await expect(page.locator("main").last()).not.toContainText(forbiddenBoundaryCopy)
    await expect(page.getByRole("button", { name: forbiddenActions })).toHaveCount(0)
  })

  test("Source detail points to related raw material and processing status", async ({ page }) => {
    await page.goto("/sources/src-feishu-cc")

    await expect(page.getByRole("heading", { name: "知识来源详情" })).toBeVisible()
    await expect(page.getByText("Knowledge Base", { exact: true })).toBeVisible()
    await expect(page.getByText("kb-cc-after-sales", { exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: "导入文件" })).toHaveAttribute("href", "/knowledge-bases/kb-cc-after-sales/import?sourceId=src-feishu-cc")
    await expect(page.getByText("文件接入", { exact: true })).toHaveCount(0)
    await expect(page.getByText("关联 Raw Material", { exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: /售后政策空间快照/ })).toBeVisible()
    await expect(page.getByText("来源处理状态", { exact: true })).toHaveCount(0)
    await expect(page.getByText("证据链位置", { exact: true })).toHaveCount(0)
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
    await expect(page.locator("main").last()).not.toContainText(forbiddenBoundaryCopy)
    await expect(page.getByRole("button", { name: forbiddenActions })).toHaveCount(0)
  })

  test("Knowledge Base import page imports a local file as a focused task flow", async ({ page }) => {
    await page.goto("/knowledge-bases/kb-cc-after-sales/import?sourceId=src-feishu-cc")

    await expect(page.getByRole("heading", { name: "导入文件到知识库" })).toBeVisible()
    await expect(page.getByText("CC After-sales KB", { exact: true })).toBeVisible()
    await expect(page.getByLabel("Source")).toContainText("CC 售后政策飞书空间")
    await expect(page.getByText("操作日志", { exact: true })).toHaveCount(0)
    await expect(page.getByText("WikiNode 建议生成", { exact: true })).toHaveCount(0)
    await expect(page.getByText("关联 Raw Material", { exact: true })).toHaveCount(0)

    await page.getByLabel("选择文件").setInputFiles({
      name: "service-policy.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# 服务政策\n\n导入后形成 Parsed Document 和文档片段。"),
    })
    await page.getByRole("button", { name: "导入并解析" }).click()

    await expect(page.getByRole("status").filter({ hasText: "导入完成" })).toContainText("kb-cc-after-sales")
    await expect(page.getByText("导入结果", { exact: true })).toBeVisible()
    await expect(page.getByText("文档片段 2 条", { exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: "打开解析结果" })).toHaveAttribute("href", "/raw-materials/rm-import-playwright/parsed-result")
    await expect(page.getByRole("link", { name: "打开 WikiNode 建议" })).toHaveAttribute("href", "/draft-wikinode-suggestions/sug-pd-import-playwright")
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
  })

  test("Raw Material pages show snapshot and parsed preview evidence", async ({ page }) => {
    await page.goto("/raw-materials")

    await expect(page.getByRole("heading", { name: "原始材料" })).toBeVisible()
    await expect(page.getByText("快照清单", { exact: true })).toBeVisible()
    await expect(page.getByText("Raw Material 是 Source 的原始快照。", { exact: true })).toHaveCount(0)
    await expect(page.getByText("解析状态用于判断是否已形成 Parsed Document。", { exact: true })).toHaveCount(0)
    await expect(page.getByRole("link", { name: /售后政策空间快照/ })).toBeVisible()

    await page.goto("/raw-materials/rm-001")

    await expect(page.getByText("证据链位置", { exact: true })).toHaveCount(0)
    await expect(page.getByText("Raw Material 阶段", { exact: true })).toHaveCount(0)
    await expect(page.getByText("kb-cc-after-sales", { exact: true })).toBeVisible()
    await expect(page.getByText("关联 Source", { exact: true })).toBeVisible()
    await expect(page.getByText("CC 售后政策飞书空间", { exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: "查看解析结果" })).toBeVisible()
    await expect(page.getByText("来源证据范围", { exact: true })).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
    await expect(page.locator("main").last()).not.toContainText(forbiddenBoundaryCopy)
    await expect(page.getByRole("button", { name: forbiddenActions })).toHaveCount(0)
  })

  test("Parsed result preview stays normalized and pre-WikiNode", async ({ page }) => {
    await page.goto("/raw-materials/rm-001/parsed-result")

    await expect(page.getByRole("heading", { name: "解析结果预览" })).toBeVisible()
    await expect(page.getByText("Parsed Document 阶段", { exact: true })).toBeVisible()
    await expect(page.getByText("Knowledge Base -> Source -> Raw Material -> Parsed Document", { exact: true })).toBeVisible()
    await expect(page.getByText("kb-cc-after-sales", { exact: true })).toBeVisible()
    await expect(page.getByText("标准化内容结构", { exact: true })).toBeVisible()
    await expect(page.getByText("可回溯证据", { exact: true })).toBeVisible()
    await expect(page.getByText("文档片段", { exact: true })).toBeVisible()
    await expect(page.getByText("pds-pd-001-001", { exact: true })).toBeVisible()
    await expect(page.getByText("片段归属：kb-cc-after-sales", { exact: true })).toBeVisible()
    await expect(page.getByText("约 35 tokens", { exact: true })).toBeVisible()
    await expect(page.getByText("后续转换为 WikiNode 前仍需人工治理。", { exact: true })).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
    await expect(page.getByRole("button", { name: forbiddenActions })).toHaveCount(0)
  })
})
