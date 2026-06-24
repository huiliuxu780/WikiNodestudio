import { expect, test } from "@playwright/test"

const forbiddenProductTerms = /Chunk Management|Chat API|Chatbot|Agent Platform|Workflow Builder|Vector DB Management/i

test.describe("Retrieval Test debug experience", () => {
  test("keeps normal results WikiNode-first and shows matchedSegments only in debug mode", async ({ page }) => {
    await page.goto("/retrieval-test")

    await expect(page.getByText("普通模式：返回 WikiNode 结果，不展示 Index Segment 调试证据。")).toBeVisible()
    await expect(page.getByText("示例问题只会填入输入框，点击检索后返回 WikiNode 结果。")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/matchedSegments/)

    await page.getByLabel("检索问题").fill("洗碗机保修期内维修收费吗？")
    await page.getByRole("button", { name: "检索" }).click()

    await expect(page.getByText("召回结果类型").first()).toBeVisible()
    await expect(page.getByText("WikiNode（业务知识节点）").first()).toBeVisible()
    await expect(page.getByText("为什么命中").first()).toBeVisible()
    await expect(page.getByText("命中字段").first()).toBeVisible()
    await expect(page.getByText("来源证据").first()).toBeVisible()
    await expect(page.getByText("WikiLink 上下文").first()).toBeVisible()
    await expect(page.getByText("命中的 Index Segment")).toHaveCount(0)

    await page.getByLabel("调试模式").click()
    await expect(page.getByText("调试模式已开启：下方仅补充 matchedSegments / Index Segment 证据，不改变主结果。")).toBeVisible()
    await page.getByRole("button", { name: "检索" }).click()

    await expect(page.getByText("命中的 Index Segment").first()).toBeVisible()
    await expect(page.getByText("SEG-").first()).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
  })

  test("shows actionable no-result guidance without changing product language", async ({ page }) => {
    await page.goto("/retrieval-test")

    await page.getByLabel("检索问题").fill("zzzz-no-result-前端验收")
    await page.getByRole("combobox").nth(1).click()
    await page.getByRole("option", { name: "已归档" }).click()
    await page.getByRole("button", { name: "检索" }).click()

    await expect(page.getByText("暂无匹配的知识节点，请调整问题、筛选条件或返回数量后重试。")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
    await expect(page.locator("main").last()).not.toContainText(/raw chunk|Chat API/i)
  })
})
