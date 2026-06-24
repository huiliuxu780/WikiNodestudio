import { expect, test } from "@playwright/test"

test.describe("Index Segment Knowledge Object experience", () => {
  test("preview and debug explain controlled segment boundaries", async ({ page }) => {
    await page.goto("/index-segments")

    await expect(page.getByText("平台管理的是 WikiNode 发布前的 Index Segment，不管理外部向量库内部片段。")).toBeVisible()
    await expect(page.getByTestId("index-segment-preview")).toContainText("Index Segment 来源 WikiNode")
    await expect(page.getByTestId("index-segment-preview")).toContainText("内容证据")
    await expect(page.getByTestId("index-segment-preview")).toContainText("来源证据范围")
    await expect(page.getByTestId("index-segment-preview")).toContainText("当前只展示本地验收数据，不执行 embedding 或真实向量库同步。")
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management|Vector DB Management|raw chunk/i)

    await page.goto("/index-segments/strategy")
    await expect(page.getByText("生成链路：WikiNode / Knowledge Object -> Index Segment -> 外部向量库同步证据。")).toBeVisible()
    await expect(page.getByText("本页只说明受控片段策略，不运行 embedding、不写入外部向量库。")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management|Vector DB Management|raw chunk/i)

    await page.goto("/index-segments/debug")
    await expect(page.getByText("调试只解释召回证据，不调用 embedding、不写入外部向量库。")).toBeVisible()
    await expect(page.getByTestId("segment-debug-panel")).toContainText("当前调试对象来自本地样例 Index Segment")
    await expect(page.getByTestId("segment-debug-panel")).toContainText("来源证据范围")
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management|Vector DB Management|raw chunk/i)
  })

  test("list search and filters expose Knowledge Object context", async ({ page }) => {
    await page.goto("/index-segments")

    await expect(page.getByRole("heading", { name: "Index Segment" })).toBeVisible()
    await expect(page.getByText("Index Segment 是从 WikiNode / Knowledge Object 生成的受控索引和召回单元")).toBeVisible()

    await page.getByLabel("搜索 Index Segment").fill("WM14U")
    await expect(page.getByTestId("index-segment-row").filter({ hasText: "西门子 WM14U 洗衣机" }).first()).toBeVisible()
    await expect(page.getByTestId("index-segment-preview")).toContainText("父级 WikiNode / Knowledge Object")
    await expect(page.getByTestId("index-segment-preview")).toContainText("产品知识")
    await expect(page.getByTestId("index-segment-preview")).toContainText("产品型号")
    await expect(page.getByTestId("index-segment-preview")).toContainText("db_product_master_v1")
    await expect(page.getByTestId("index-segment-preview")).toContainText("来源类型 数据库")

    await page.getByLabel("Knowledge Object 类型").selectOption("Product")
    await expect(page.getByTestId("index-segment-row").filter({ hasText: "西门子 WM14U 洗衣机" }).first()).toBeVisible()
    await expect(page.getByTestId("index-segment-row").filter({ hasText: "保修期内维修服务政策" })).toHaveCount(0)

    await page.getByLabel("索引状态").selectOption("indexed")
    await expect(page.getByTestId("index-segment-row").filter({ hasText: "已索引" }).first()).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management/i)
  })

  test("strategy and debug pages explain objectType-aware segmentation", async ({ page }) => {
    await page.goto("/index-segments/strategy")

    await expect(page.getByText("文章语义分段")).toBeVisible()
    await expect(page.getByText("产品字段分段")).toBeVisible()
    await expect(page.getByText("数据记录分段")).toBeVisible()
    await expect(page.getByText("知识集合分段")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management/i)

    await page.goto("/index-segments/debug")
    await expect(page.getByText("Knowledge Object -> 处理策略 -> 片段策略 -> Index Segment -> 召回证据")).toBeVisible()
    await expect(page.getByText("召回结果仍以 WikiNode 为中心。")).toBeVisible()
    await expect(page.getByTestId("segment-debug-panel")).toContainText("父级 WikiNode / Knowledge Object")
    await expect(page.getByTestId("segment-debug-panel")).toContainText("召回证据")
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management/i)
  })

  test("WikiNode Inspector Segments tab carries object and source evidence", async ({ page }) => {
    await page.goto("/wiki-nodes/wn-013")

    await page.getByRole("tab", { name: "片段" }).click()
    await expect(page.getByTestId("wikinode-inspector")).toContainText("Knowledge Object 类型：产品知识")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("业务子类型：产品型号")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("片段数量")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("来源证据")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("vec-wn-013")
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management/i)
  })
})
