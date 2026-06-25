import { expect, test } from "@playwright/test"

const forbiddenProductTerms = /Chunk Management|Chat API|Chatbot|Agent Platform|Workflow Builder|Vector DB Management/i
const forbiddenActions = /创建 Source|导入 Source|上传文件|开始同步|重新解析|执行解析|下载原文件/i

test.describe("Source / Raw Material / Parsed Document acceptance", () => {
  test("Sources page explains the upstream read-only evidence chain", async ({ page }) => {
    await page.goto("/sources")

    await expect(page.getByRole("heading", { name: "知识来源" })).toBeVisible()
    await expect(page.getByText("上游证据链", { exact: true })).toBeVisible()
    await expect(page.getByText("Source -> Raw Material -> Parsed Document -> WikiNode", { exact: true })).toBeVisible()
    await expect(page.getByText("当前只读：不会执行真实同步、上传、解析或导入。", { exact: true })).toBeVisible()
    await expect(page.getByText("生成的 WikiNode", { exact: true })).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
    await expect(page.getByRole("button", { name: forbiddenActions })).toHaveCount(0)
  })

  test("Source detail points to related raw material without implying sync execution", async ({ page }) => {
    await page.goto("/sources/src-feishu-cc")

    await expect(page.getByRole("heading", { name: "知识来源详情" })).toBeVisible()
    await expect(page.getByText("证据链位置", { exact: true })).toBeVisible()
    await expect(page.getByText("Source 阶段", { exact: true })).toBeVisible()
    await expect(page.getByText("关联 Raw Material", { exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: /售后政策空间快照/ })).toBeVisible()
    await expect(page.getByText("下一步只读检查", { exact: true })).toBeVisible()
    await expect(page.getByText("不执行真实同步、授权连接或后台任务。", { exact: true })).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
    await expect(page.getByRole("button", { name: forbiddenActions })).toHaveCount(0)
  })

  test("Raw Material pages make snapshot and parsed preview boundaries explicit", async ({ page }) => {
    await page.goto("/raw-materials")

    await expect(page.getByRole("heading", { name: "原始材料" })).toBeVisible()
    await expect(page.getByText("快照清单", { exact: true })).toBeVisible()
    await expect(page.getByText("Source -> Raw Material -> Parsed Document", { exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: /售后政策空间快照/ })).toBeVisible()

    await page.goto("/raw-materials/rm-001")

    await expect(page.getByText("证据链位置", { exact: true })).toBeVisible()
    await expect(page.getByText("Raw Material 阶段", { exact: true })).toBeVisible()
    await expect(page.getByText("关联 Source", { exact: true })).toBeVisible()
    await expect(page.getByText("CC 售后政策飞书空间", { exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: "查看解析结果" })).toBeVisible()
    await expect(page.getByText("当前不提供下载、重新解析或真实存储访问。", { exact: true })).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
    await expect(page.getByRole("button", { name: forbiddenActions })).toHaveCount(0)
  })

  test("Parsed result preview stays normalized and pre-WikiNode", async ({ page }) => {
    await page.goto("/raw-materials/rm-001/parsed-result")

    await expect(page.getByRole("heading", { name: "解析结果预览" })).toBeVisible()
    await expect(page.getByText("Parsed Document 阶段", { exact: true })).toBeVisible()
    await expect(page.getByText("标准化内容结构", { exact: true })).toBeVisible()
    await expect(page.getByText("可回溯证据", { exact: true })).toBeVisible()
    await expect(page.getByText("后续转换为 WikiNode 前仍需人工治理。", { exact: true })).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
    await expect(page.getByRole("button", { name: forbiddenActions })).toHaveCount(0)
  })
})
