import { expect, test } from "@playwright/test"

test.describe("MVP browser smoke", () => {
  test("WikiNodes page loads seed WikiNodes without API errors", async ({ page }) => {
    await page.goto("/wiki-nodes")

    await expect(page.getByRole("heading", { name: "WikiNodes" })).toBeVisible()
    await expect(page.getByRole("link", { name: "保修政策" })).toBeVisible()
    await expect(page.getByText("Request failed")).toHaveCount(0)
  })

  test("Retrieval Test returns WikiNode results without chunk or document copy", async ({ page }) => {
    await page.goto("/retrieval-test")

    await expect(page.getByRole("heading", { name: "Knowledge Retrieval Test" })).toBeVisible()
    await page.getByLabel("Query").fill("洗碗机保修期内维修收费吗？")
    await page.getByRole("button", { name: "Search" }).click()

    await expect(page.getByRole("link", { name: "Open WikiNode" }).first()).toBeVisible()
    await expect(page.getByText("保修政策").first()).toBeVisible()
    await expect(page.getByText("Request failed")).toHaveCount(0)
    await expect(page.getByText(/chunk/i)).toHaveCount(0)
    await expect(page.getByText(/document/i)).toHaveCount(0)
  })
})
