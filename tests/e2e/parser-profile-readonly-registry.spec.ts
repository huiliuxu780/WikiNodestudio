import { expect, test } from "@playwright/test"

const parserProfiles = [
  {
    parserProfile: "feishu_article_v1",
    displayName: "飞书文章解析 Profile",
    supportedRawMaterialTypes: ["document_snapshot"],
    supportedSourceTypes: ["feishu"],
    contentFormat: "markdown",
    enabled: true,
    version: "v1",
  },
  {
    parserProfile: "excel_fee_table_v1",
    displayName: "Excel 收费表解析 Profile",
    supportedRawMaterialTypes: ["file", "table_extract"],
    supportedSourceTypes: ["excel"],
    contentFormat: "structured_table",
    enabled: true,
    version: "v1",
  },
]

test.describe("Parser Profile read-only registry", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/parser-profiles", (route) => route.fulfill({ json: parserProfiles }))
  })

  test("renders allowlisted parser profiles without execution actions", async ({ page }) => {
    await page.goto("/system/parser-engine")

    await expect(page.getByRole("heading", { name: "解析引擎" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Parser Profile 注册表" })).toBeVisible()
    await expect(page.getByText("按 Profile 查看适用来源类型、输出格式和处理策略。")).toBeVisible()
    await expect(page.getByText("飞书文章解析 Profile")).toBeVisible()
    await expect(page.getByText("Excel 收费表解析 Profile")).toBeVisible()
    await expect(page.getByText("文档快照")).toBeVisible()
    await expect(page.getByText("结构化表格")).toBeVisible()
    await expect(page.getByText("已启用")).toHaveCount(2)

    await expect(page.getByRole("button", { name: "运行解析" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "加载插件" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "上传" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "重试" })).toHaveCount(0)
  })
})
