import { expect, test } from "@playwright/test"

test.describe("WikiGraph Knowledge Object workspace", () => {
  test("renders Knowledge Object relationships with selection, filters, source evidence, and safe naming", async ({ page }) => {
    await page.goto("/wiki-graph")

    await expect(page.getByText("Wiki Graph / Knowledge Object Relationships")).toBeVisible()
    await expect(page.getByTestId("knowledge-graph-workspace")).toBeVisible()
    await expect(page.getByText("Index Segment remains the controlled retrieval and indexing unit.")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management/i)

    await expect(page.getByTestId("knowledge-graph-node").filter({ hasText: "西门子 WM14U 洗衣机" })).toBeVisible()
    await expect(page.getByTestId("knowledge-graph-node").filter({ hasText: "Product" })).toBeVisible()
    await expect(page.getByTestId("knowledge-graph-node").filter({ hasText: "product_model" })).toBeVisible()
    await expect(page.getByTestId("knowledge-graph-edge").filter({ hasText: "has_manual" })).toBeVisible()
    await expect(page.getByTestId("knowledge-graph-edge").filter({ hasText: "has_part_catalog" })).toBeVisible()

    await page.getByLabel("Search Knowledge Objects").fill("WM14U")
    await expect(page.getByTestId("knowledge-graph-node").filter({ hasText: "西门子 WM14U 洗衣机" })).toBeVisible()
    await expect(page.getByTestId("knowledge-graph-node").filter({ hasText: "保修期内维修服务政策" })).toHaveCount(0)

    await page.getByLabel("Object Type").click()
    await page.getByRole("option", { name: "Product" }).click()
    await expect(page.getByTestId("knowledge-graph-node").filter({ hasText: "西门子 WM14U 洗衣机" })).toBeVisible()
    await expect(page.getByTestId("knowledge-graph-node").filter({ hasText: "WM14U 用户手册 PDF" })).toHaveCount(0)

    await page
      .getByTestId("knowledge-graph-node")
      .filter({ hasText: "西门子 WM14U 洗衣机" })
      .click()

    await expect(page.getByTestId("knowledge-graph-inspector")).toContainText("Product")
    await expect(page.getByTestId("knowledge-graph-inspector")).toContainText("product_model")
    await expect(page.getByTestId("knowledge-graph-inspector")).toContainText("modelCode")
    await expect(page.getByTestId("knowledge-graph-inspector")).toContainText("database")
    await expect(page.getByTestId("knowledge-graph-inspector")).toContainText("confidence")
    await expect(page.getByTestId("knowledge-graph-inspector")).toContainText("has_manual")
    await expect(page.getByTestId("knowledge-graph-inspector")).toContainText("has_part_catalog")

    await page.getByTestId("knowledge-graph-open-node").click()
    await expect(page).toHaveURL(/\/wiki-nodes\/wn-013$/)
    await expect(page.getByTestId("wikinode-editor-workspace")).toBeVisible()
  })
})
