import { expect, test } from "@playwright/test"

test.describe("Index Segment Knowledge Object experience", () => {
  test("list search and filters expose Knowledge Object context", async ({ page }) => {
    await page.goto("/index-segments")

    await expect(page.getByRole("heading", { name: "Index Segments" })).toBeVisible()
    await expect(page.getByText("Index Segment is the controlled retrieval/indexing unit derived from a WikiNode / Knowledge Object.")).toBeVisible()

    await page.getByLabel("Search Index Segments").fill("WM14U")
    await expect(page.getByTestId("index-segment-row").filter({ hasText: "西门子 WM14U 洗衣机" }).first()).toBeVisible()
    await expect(page.getByTestId("index-segment-preview")).toContainText("Parent WikiNode / Knowledge Object")
    await expect(page.getByTestId("index-segment-preview")).toContainText("Product")
    await expect(page.getByTestId("index-segment-preview")).toContainText("product_model")
    await expect(page.getByTestId("index-segment-preview")).toContainText("db_product_master_v1")
    await expect(page.getByTestId("index-segment-preview")).toContainText("sourceType database")

    await page.getByLabel("Object Type").selectOption("Product")
    await expect(page.getByTestId("index-segment-row").filter({ hasText: "西门子 WM14U 洗衣机" }).first()).toBeVisible()
    await expect(page.getByTestId("index-segment-row").filter({ hasText: "保修期内维修服务政策" })).toHaveCount(0)

    await page.getByLabel("Index Status").selectOption("indexed")
    await expect(page.getByTestId("index-segment-row").filter({ hasText: "indexed" }).first()).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management/i)
  })

  test("strategy and debug pages explain objectType-aware segmentation", async ({ page }) => {
    await page.goto("/index-segments/strategy")

    await expect(page.getByText("Article semantic section segmentation")).toBeVisible()
    await expect(page.getByText("Product field-based metadata-aware segmentation")).toBeVisible()
    await expect(page.getByText("DataRecord row / record / table-aware segmentation")).toBeVisible()
    await expect(page.getByText("Collection member summary / relation-aware segmentation")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management/i)

    await page.goto("/index-segments/debug")
    await expect(page.getByText("Knowledge Object -> Processing Profile -> Segment Strategy -> Index Segments -> Retrieval evidence")).toBeVisible()
    await expect(page.getByText("Retrieval result remains WikiNode-centered.")).toBeVisible()
    await expect(page.getByTestId("segment-debug-panel")).toContainText("Parent WikiNode / Knowledge Object")
    await expect(page.getByTestId("segment-debug-panel")).toContainText("Retrieval evidence")
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management/i)
  })

  test("WikiNode Inspector Segments tab carries object and source evidence", async ({ page }) => {
    await page.goto("/wiki-nodes/wn-013")

    await page.getByRole("tab", { name: "Segments" }).click()
    await expect(page.getByTestId("wikinode-inspector")).toContainText("objectType: Product")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("subtype: product_model")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("segment count")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("sourceRef evidence")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("vec-wn-013")
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management/i)
  })
})
