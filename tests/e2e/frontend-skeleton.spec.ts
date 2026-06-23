import { expect, test } from "@playwright/test"

const forbiddenProductTerms = /Chunk Management|Agent|Chatbot|Workflow|MCP/i

test.describe("Frontend skeleton IA", () => {
  test("sidebar exposes the complete product navigation groups", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByText("WikiNode Studio").first()).toBeVisible()
    await expect(page.getByText("Platform", { exact: true })).toBeVisible()
    await expect(page.getByText("Knowledge", { exact: true })).toBeVisible()
    await expect(page.getByText("Governance", { exact: true })).toBeVisible()
    await expect(page.getByText("System", { exact: true })).toBeVisible()

    for (const name of [
      "Overview",
      "Knowledge Bases",
      "WikiNodes",
      "Wiki Graph",
      "Retrieval Test",
      "Sources",
      "Raw Materials",
      "Index Segments",
      "Publishing & Index",
      "Broken Links",
      "Tags & Metadata",
      "Quality Issues",
      "Evaluation Cases",
      "Parser Engine",
      "Storage Engine",
      "Vector Store",
      "Settings",
      "Admin",
    ]) {
      await expect(page.locator("a").filter({ hasText: name }).first()).toBeVisible()
    }
  })

  test("all skeleton routes render non-empty product pages", async ({ page }) => {
    const routes = [
      ["/", "Overview"],
      ["/knowledge-bases", "Knowledge Bases"],
      ["/knowledge-bases/kb-cc-after-sales", "CC After-sales KB"],
      ["/knowledge-bases/kb-cc-after-sales/settings", "Knowledge Base Settings"],
      ["/sources", "Sources"],
      ["/sources/src-feishu-cc", "Source Detail"],
      ["/sources/sync-jobs", "Sync Jobs"],
      ["/sources/sync-logs", "Sync Logs"],
      ["/raw-materials", "Raw Materials"],
      ["/raw-materials/rm-001", "Raw Material Detail"],
      ["/raw-materials/rm-001/parsed-result", "Parsed Result Preview"],
      ["/wiki-nodes", "WikiNodes"],
      ["/wiki-nodes/wn-001", "保修期内维修服务政策"],
      ["/wiki-nodes/wn-001/detail", "WikiNode Detail"],
      ["/wiki-graph", "Wiki Graph"],
      ["/broken-links", "Broken Links"],
      ["/backlinks", "Backlinks"],
      ["/impact-analysis", "Impact Analysis"],
      ["/index-segments", "Index Segments"],
      ["/index-segments/strategy", "Segment Strategy"],
      ["/index-segments/debug", "Segment Debug"],
      ["/publishing", "Publishing & Index"],
      ["/index-status", "Index Status"],
      ["/vector-sync", "Vector Store Sync"],
      ["/index-jobs", "Index Jobs"],
      ["/retrieval-test", "Retrieval Test"],
      ["/retrieval-debug", "Retrieval Debug"],
      ["/retrieval-api-docs", "Retrieval API Docs"],
      ["/query-logs", "Query Logs"],
      ["/evaluation-cases", "Evaluation Cases"],
      ["/tags", "Tags & Metadata"],
      ["/node-types", "Node Types"],
      ["/metadata-fields", "Metadata Fields"],
      ["/quality-issues", "Quality Issues"],
      ["/conflicts", "Conflict Detection"],
      ["/expired-knowledge", "Expired Knowledge"],
      ["/duplicates", "Duplicate Knowledge"],
      ["/retrieval-evaluation", "Retrieval Evaluation"],
      ["/system/parser-engine", "Parser Engine"],
      ["/system/storage-engine", "Storage Engine"],
      ["/system/vector-store", "Vector Store"],
      ["/system/embedding-config", "Embedding Config"],
      ["/system/health", "System Health"],
      ["/settings", "Settings"],
      ["/admin/users", "Users"],
      ["/admin/roles", "Roles"],
      ["/admin/permissions", "Permissions"],
      ["/admin/audit-logs", "Audit Logs"],
    ] as const

    for (const [route, heading] of routes) {
      await page.goto(route)
      await expect(page.getByRole("heading", { name: heading })).toBeVisible()
      await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
      await expect(page.getByText("Request failed")).toHaveCount(0)
    }
  })

  test("Index Segments and Retrieval Test keep WikiNode-centered language", async ({ page }) => {
    await page.goto("/index-segments")

    await expect(page.getByRole("heading", { name: "Index Segments" })).toBeVisible()
    await expect(page.getByText("controlled retrieval units generated from WikiNodes before vector-store sync")).toBeVisible()
    await expect(page.getByText("SEG-001")).toBeVisible()
    await expect(page.getByRole("cell", { name: "保修期内维修服务政策" }).first()).toBeVisible()
    await expect(page.getByText(/Chunk Management/i)).toHaveCount(0)

    await page.goto("/retrieval-test")
    await expect(page.getByText("Retrieval API returns WikiNode objects by default")).toBeVisible()
    await page.getByLabel("Debug mode").click()
    await page.getByRole("button", { name: "检索" }).click()
    await expect(page.getByText("Matched Index Segments").first()).toBeVisible()
    await expect(page.getByText("SEG-").first()).toBeVisible()
  })

  test("Retrieval Test separates normal WikiNode results from debug Index Segment evidence", async ({ page }) => {
    await page.goto("/retrieval-test")

    await expect(page.getByRole("heading", { name: "检索测试" })).toBeVisible()
    await expect(page.getByText("Retrieval API returns WikiNode objects by default, not vector chunks.")).toBeVisible()
    await expect(page.getByText("This platform does not implement a vector database.")).toBeVisible()
    await expect(page.getByText("Index Segments are controlled retrieval units generated from WikiNodes before vector-store sync.")).toBeVisible()
    await page.getByLabel("检索问题").fill("洗碗机保修期内维修收费吗？")
    await page.getByRole("button", { name: "检索" }).click()

    await expect(page.getByTestId("retrieval-result-card").first()).toBeVisible()
    await expect(page.getByTestId("matched-segments")).toHaveCount(0)
    await expect(page.getByText(/Chunk Management/i)).toHaveCount(0)

    await page.getByLabel("Debug mode").click()
    await page.getByRole("button", { name: "检索" }).click()

    await expect(page.getByTestId("matched-segments").first()).toBeVisible()
    await expect(page.getByText("whyMatched:").first()).toBeVisible()
    await expect(page.getByText("nodeId:").first()).toBeVisible()

    await page.getByRole("link", { name: "打开知识节点" }).first().click()
    await expect(page).toHaveURL(/\/wiki-nodes\/wn-/)
    await expect(page.getByTestId("wikinode-editor-workspace")).toBeVisible()
  })

  test("WikiNode editor inspector includes Segments tab", async ({ page }) => {
    await page.goto("/wiki-nodes/wn-001")

    await expect(page.getByRole("heading", { name: "保修期内维修服务政策" })).toBeVisible()
    await expect(page.getByTestId("wikinode-editor-workspace")).toBeVisible()
    await expect(page.getByTestId("wikinode-explorer")).toBeVisible()
    await expect(page.getByTestId("wikinode-markdown-editor")).toBeVisible()
    await expect(page.getByTestId("wikinode-inspector")).toBeVisible()
    await expect(page.getByRole("tab", { name: "Metadata" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Links" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Sources" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Index" })).toBeVisible()
    await page.getByRole("tab", { name: "Segments" }).click()
    await expect(page.getByText("Index Segments are controlled retrieval units generated from WikiNodes before vector-store sync")).toBeVisible()
    await expect(page.getByText("SEG-001")).toBeVisible()
    await expect(page.getByText("Index Segment").nth(1)).toBeVisible()
    await expect(page.getByText(/Chunk Management/i)).toHaveCount(0)
  })

  test("WikiNode editor preview renders resolved and broken WikiLink badges", async ({ page }) => {
    await page.goto("/wiki-nodes/wn-001")

    await page.getByRole("tab", { name: "预览" }).click()
    await expect(page.getByTestId("markdown-preview")).toBeVisible()
    await expect(page.getByTestId("resolved-link-badge").filter({ hasText: "收费政策" })).toBeVisible()

    await page.goto("/wiki-nodes/wn-006")
    await page.getByRole("tab", { name: "预览" }).click()
    await expect(page.getByTestId("broken-link-badge").filter({ hasText: "洗衣机排水规范" })).toBeVisible()
  })
})
