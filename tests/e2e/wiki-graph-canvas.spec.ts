import { expect, test } from "@playwright/test"

const forbiddenProductTerms = /Chunk Management|Chat API|Chatbot|Agent Platform|Workflow Builder|Vector DB Management/i

test.describe("WikiGraph canvas visualization", () => {
  test("uses a canvas-first layout with top toolbar and collapsible inspector", async ({ page }) => {
    await page.goto("/wiki-graph")

    await expect(page.getByTestId("wiki-graph-layout")).toBeVisible()
    await expect(page.getByTestId("wiki-graph-toolbar")).toBeVisible()
    await expect(page.getByTestId("wiki-graph-canvas")).toBeVisible()
    await expect(page.getByTestId("wiki-graph-side-filter")).toHaveCount(0)
    await expect(page.getByTestId("wiki-graph-inspector-panel")).toHaveCount(0)
    await expect(page.getByTestId("wiki-graph-fit-view")).toBeVisible()
    await expect(page.getByTestId("wiki-graph-toggle-inspector")).toContainText("显示详情")

    await page.getByTestId("wiki-graph-node").filter({ hasText: "西门子 WM14U 洗衣机" }).click()
    await expect(page.getByTestId("wiki-graph-inspector-panel")).toBeVisible()
    await expect(page.getByTestId("wiki-graph-toggle-inspector")).toContainText("隐藏详情")
    await expect(page.getByTestId("wiki-graph-inspector")).toContainText("西门子 WM14U 洗衣机")

    await page.getByTestId("wiki-graph-toggle-inspector").click()
    await expect(page.getByTestId("wiki-graph-inspector-panel")).toHaveCount(0)
    await page.getByTestId("wiki-graph-fit-view").click()
    await expect(page.getByTestId("wiki-graph-canvas")).toBeVisible()
  })

  test("renders an interactive node-edge graph with filters and inspector details", async ({ page }) => {
    await page.goto("/wiki-graph")

    await expect(page.getByTestId("wiki-graph-page")).toBeVisible()
    await expect(page.getByRole("heading", { name: "知识图谱" })).toBeVisible()
    await expect(page.getByTestId("wiki-graph-canvas")).toBeVisible()
    await expect(page.locator(".react-flow").first()).toBeVisible()
    await expect(page.getByTestId("wiki-graph-node").filter({ hasText: "西门子 WM14U 洗衣机" })).toBeVisible()
    await expect(page.locator(".react-flow__edge").first()).toBeVisible()
    await expect(page.getByTestId("knowledge-graph-edge")).toHaveCount(0)
    await expect(page.locator(".react-flow__minimap").first()).toBeVisible()
    await expect(page.locator(".react-flow__minimap-node").first()).toBeVisible()
    const minimapNodeStyle = await page.locator(".react-flow__minimap-node").first().evaluate((node) => {
      const style = window.getComputedStyle(node)
      return {
        fill: style.fill,
        stroke: style.stroke,
        opacity: style.opacity,
      }
    })
    expect(minimapNodeStyle).toEqual(
      expect.objectContaining({
        fill: expect.not.stringMatching(/transparent|none|rgb\(255, 255, 255\)|rgba\(255, 255, 255, 0\)/i),
        stroke: expect.not.stringMatching(/transparent|none|rgb\(255, 255, 255\)|rgba\(255, 255, 255, 0\)/i),
        opacity: expect.not.stringMatching(/^0$/),
      }),
    )

    await page.getByTestId("wiki-graph-node").filter({ hasText: "西门子 WM14U 洗衣机" }).click()
    await expect(page.getByTestId("wiki-graph-inspector")).toContainText("西门子 WM14U 洗衣机")
    await expect(page.getByTestId("wiki-graph-inspector")).toContainText("产品知识")
    await expect(page.getByTestId("wiki-graph-inspector")).toContainText("产品型号")
    await expect(page.getByTestId("wiki-graph-inspector")).toContainText("modelCode")
    await expect(page.getByTestId("wiki-graph-inspector")).toContainText("来源证据")
    await expect(page.getByTestId("wiki-graph-inspector")).toContainText("出向关系")

    await page.getByTestId("wiki-graph-filter-search").fill("WM14U")
    await expect(page.getByTestId("wiki-graph-node").filter({ hasText: "西门子 WM14U 洗衣机" })).toBeVisible()
    await expect(page.getByTestId("wiki-graph-node").filter({ hasText: "保修期内维修服务政策" })).toHaveCount(0)

    await page.getByTestId("wiki-graph-filter-object-type").click()
    await page.getByRole("option", { name: "产品知识" }).click()
    await expect(page.getByTestId("wiki-graph-node").filter({ hasText: "西门子 WM14U 洗衣机" })).toBeVisible()
    await expect(page.getByTestId("wiki-graph-node").filter({ hasText: "WM14U 用户手册 PDF" })).toHaveCount(0)

    await page.getByTestId("wiki-graph-reset-filters").click()
    await expect(page.getByTestId("wiki-graph-broken-node").first()).toBeVisible()
    await page.getByTestId("wiki-graph-toggle-broken-links").click()
    await expect(page.getByTestId("wiki-graph-broken-node")).toHaveCount(0)

    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
  })
})
