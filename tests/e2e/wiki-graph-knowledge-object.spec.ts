import { expect, test } from "@playwright/test"
import { routeWikiNodeApiFixtures } from "./wiki-node-api-fixtures"

test.describe("WikiGraph Knowledge Object workspace", () => {
  test.beforeEach(async ({ page }) => {
    await routeWikiNodeApiFixtures(page)
  })

  test("renders Knowledge Object relationships with selection, filters, source evidence, and safe naming", async ({ page }) => {
    await page.goto("/wiki-graph")

    await expect(page.getByText("Wiki Graph / Knowledge Object 关系")).toBeVisible()
    await expect(page.getByTestId("knowledge-graph-workspace")).toBeVisible()
    await expect(page.getByText("Index Segment 是受控的索引和召回单元。")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management/i)

    const productNode = page.getByTestId("knowledge-graph-node").filter({ hasText: "西门子 WM14U 洗衣机" })
    await expect(productNode).toBeVisible()
    await expect(productNode).toContainText("产品知识")
    await expect(productNode).toContainText("产品型号")
    await expect(page.locator(".react-flow__edge").first()).toBeVisible()
    await expect(page.getByTestId("knowledge-graph-edge")).toHaveCount(0)

    await page.getByLabel("搜索知识对象").fill("WM14U")
    await expect(page.getByTestId("knowledge-graph-node").filter({ hasText: "西门子 WM14U 洗衣机" })).toBeVisible()
    await expect(page.getByTestId("knowledge-graph-node").filter({ hasText: "保修期内维修服务政策" })).toHaveCount(0)

    await page.getByLabel("Knowledge Object 类型").click()
    await page.getByRole("option", { name: "产品知识" }).click()
    await expect(page.getByTestId("knowledge-graph-node").filter({ hasText: "西门子 WM14U 洗衣机" })).toBeVisible()
    await expect(page.getByTestId("knowledge-graph-node").filter({ hasText: "WM14U 用户手册 PDF" })).toHaveCount(0)

    await page
      .getByTestId("knowledge-graph-node")
      .filter({ hasText: "西门子 WM14U 洗衣机" })
      .click()

    await expect(page.getByTestId("knowledge-graph-inspector")).toContainText("产品知识")
    await expect(page.getByTestId("knowledge-graph-inspector")).toContainText("产品型号")
    await expect(page.getByTestId("knowledge-graph-inspector")).toContainText("modelCode")
    await expect(page.getByTestId("knowledge-graph-inspector")).toContainText("database")
    await expect(page.getByTestId("knowledge-graph-inspector")).toContainText("可信度")
    await expect(page.getByTestId("knowledge-graph-inspector")).toContainText("关联手册")
    await expect(page.getByTestId("knowledge-graph-inspector")).toContainText("关联配件目录")

    await page.getByTestId("knowledge-graph-open-node").click()
    await expect(page).toHaveURL(/\/wiki-nodes\/wn-013$/)
    await expect(page.getByTestId("wikinode-editor-workspace")).toBeVisible()
  })
})
