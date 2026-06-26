import { expect, test } from "@playwright/test"

const forbiddenProductTerms = /Chunk Management|Chat API|Chatbot|Agent Platform|Workflow Builder|Vector DB Management/i

test.describe.serial("MVP browser smoke", () => {
  test("WikiNodes page uses product-ready Chinese labels without API errors", async ({ page }) => {
    await page.goto("/wiki-nodes")

    await expect(page.getByRole("heading", { name: "知识节点" })).toBeVisible()
    await expect(page.getByRole("link", { name: "新建知识节点" })).toBeVisible()
    await expect(page.getByLabel("搜索")).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "发布状态" })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "索引状态" })).toBeVisible()
    await expect(page.getByText("已索引").first()).toBeVisible()
    await expect(page.getByRole("link", { name: "保修政策" })).toBeVisible()
    await expect(page.getByText("Request failed")).toHaveCount(0)

    await page.getByLabel("搜索").fill("zzzz-empty-前端验收")
    await expect(page.getByText("暂无知识节点")).toBeVisible()
    await expect(page.getByText("请调整搜索或筛选条件后重试")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
  })

  test("WikiNode create form shows Chinese validation before submit", async ({ page }) => {
    await page.goto("/wiki-nodes/create")

    await page.getByRole("button", { name: "创建知识节点" }).click()
    await expect(page.getByText("请填写标题")).toBeVisible()

    await page.getByLabel("标题").fill("中文校验知识节点")
    await page.getByLabel("Slug").fill("Invalid Slug")
    await page.getByLabel("摘要").fill("用于校验中文字段错误。")
    await page.getByLabel("正文内容").fill("用于校验中文字段错误。")
    await page.getByRole("button", { name: "创建知识节点" }).click()
    await expect(page.getByText("Slug 只能包含小写字母、数字和连字符")).toBeVisible()
  })

  test("WikiNode create flow shows success and duplicate slug failure feedback", async ({ page }) => {
    const slug = `ux-smoke-${Date.now()}`

    await page.goto("/wiki-nodes/create")

    await expect(page.getByRole("heading", { name: "创建知识节点" })).toBeVisible()
    await page.getByLabel("标题").fill("UX Smoke 知识节点")
    await page.getByLabel("Slug").fill(slug)
    await page.getByLabel("摘要").fill("用于前端 UX smoke 的临时知识节点。")
    await page.getByLabel("正文内容").fill("UX smoke 创建内容，可用于验证创建成功反馈。")
    await page.getByLabel("标签").fill("ux-smoke,验收")
    await page.getByRole("button", { name: "创建知识节点" }).click()

    await expect(page.getByRole("alert").getByText("创建成功")).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`/wiki-nodes/${slug}$`))

    await page.goto("/wiki-nodes/create")
    await page.getByLabel("标题").fill("UX Smoke 重复 Slug")
    await page.getByLabel("Slug").fill(slug)
    await page.getByLabel("摘要").fill("重复 slug 应该展示中文错误。")
    await page.getByLabel("正文内容").fill("重复 slug 验证内容。")
    await page.getByRole("button", { name: "创建知识节点" }).click()

    await expect(page.getByText("创建失败")).toBeVisible()
    await expect(page.getByText("Slug 已存在，请更换后重试")).toBeVisible()
  })

  test("WikiNode edit flow shows save success feedback", async ({ page }) => {
    const slug = `ux-edit-${Date.now()}`

    await page.goto("/wiki-nodes/create")
    await page.getByLabel("标题").fill("UX Edit Smoke")
    await page.getByLabel("Slug").fill(slug)
    await page.getByLabel("摘要").fill("用于前端编辑保存 smoke 的临时知识节点。")
    await page.getByLabel("正文内容").fill("编辑保存前的内容。")
    await page.getByLabel("标签").fill("ux-smoke")
    await page.getByRole("button", { name: "创建知识节点" }).click()

    await page.goto(`/wiki-nodes/${slug}`)

    await page.getByLabel("摘要").fill("编辑保存后的中文摘要。")
    await page.getByRole("button", { name: "保存" }).click()

    await expect(page.getByText("保存成功")).toBeVisible()
    await expect(page.getByLabel("摘要")).toHaveValue("编辑保存后的中文摘要。")

    await page.getByRole("button", { name: "发布" }).click()
    await expect(page.getByText("发布状态已在本地更新")).toBeVisible()
    await expect(page.getByText("当前任务不调用真实发布服务")).toBeVisible()
    await page.getByRole("button", { name: "重新索引" }).click()
    await expect(page.getByText("重新索引状态已在本地更新")).toBeVisible()
    await expect(page.getByText("当前任务不调用真实索引服务")).toBeVisible()
  })

  test("Retrieval Test returns WikiNode results and localized no-result state", async ({ page }) => {
    await page.goto("/retrieval-test")

    await expect(page.getByRole("heading", { name: "检索测试" })).toBeVisible()
    await expect(page.getByText("Retrieval API 返回知识节点，调试模式仅展示命中的索引片段证据。")).toBeVisible()
    await expect(page.getByLabel("调试模式")).toBeVisible()
    await page.getByLabel("检索问题").fill("洗碗机保修期内维修收费吗？")
    await page.getByRole("button", { name: "检索" }).click()

    await expect(page.getByRole("link", { name: "打开知识节点" }).first()).toBeVisible()
    await expect(page.getByText("保修政策").first()).toBeVisible()
    await expect(page.getByText("Request failed")).toHaveCount(0)
    await expect(page.getByText(/chunk/i)).toHaveCount(0)
    await expect(page.locator("main").last()).not.toContainText(/raw document|documentId|document":/i)
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)

    await page.getByLabel("检索问题").fill("zzzz-no-result-前端验收")
    await page.getByRole("combobox").nth(1).click()
    await page.getByRole("option", { name: "已归档" }).click()
    await page.getByRole("button", { name: "检索" }).click()

    await expect(page.getByText("暂无匹配的知识节点")).toBeVisible()
  })

  test("Broken links and settings pages use localized product copy", async ({ page }) => {
    await page.goto("/broken-links")

    await expect(page.getByRole("heading", { name: "断链检查" })).toBeVisible()
    await expect(page.getByText("未解析的 WikiLink", { exact: true })).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)

    await page.goto("/settings")

    await expect(page.getByRole("heading", { name: "设置" })).toBeVisible()
    await expect(page.getByText("默认设置")).toBeVisible()
    await expect(page.getByText("系统设置仅展示当前 MVP 的本地配置基线。")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
  })
})
