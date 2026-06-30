import { expect, test } from "@playwright/test"

type SourceImportResult = {
  suggestionId: string | null
}

type SuggestionDetail = {
  title: string
}

const backendUrl = process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:8080"

test.describe("Imported knowledge live acceptance loop", () => {
  test("imports a document and verifies the accepted WikiNode in editor, graph, and retrieval", async ({ page, request }) => {
    test.setTimeout(60_000)
    const suffix = Date.now()
    const title = `运营验收安装政策-${suffix}`
    const body = [
      `# ${title}`,
      "",
      "这是一条面向运营验收的安装政策，说明洗碗机安装前需要确认水路、电源和橱柜尺寸。",
      "如果客户涉及上门收费，需要参考 [[收费政策]] 并保留 SourceRef 证据。",
    ].join("\n")

    const importResponse = await request.post(`${backendUrl}/api/sources/src-feishu-cc/raw-materials/import`, {
      multipart: {
        file: {
          name: `${title}.md`,
          mimeType: "text/markdown",
          buffer: Buffer.from(body),
        },
        requestedBy: "playwright-live-loop",
      },
    })
    expect(importResponse.ok()).toBeTruthy()
    const importResult = await importResponse.json() as SourceImportResult
    expect(importResult.suggestionId).toBeTruthy()

    const suggestionResponse = await request.get(`${backendUrl}/api/draft-wikinode-suggestions/${importResult.suggestionId}`)
    expect(suggestionResponse.ok()).toBeTruthy()
    const suggestion = await suggestionResponse.json() as SuggestionDetail
    expect(suggestion.title).toBe(title)

    await page.goto(`/draft-wikinode-suggestions/${importResult.suggestionId}`)
    await expect(page.getByRole("heading", { name: "WikiNode 建议详情" })).toBeVisible()
    await expect(page.getByText(title, { exact: true })).toBeVisible()
    await expect(page.locator("pre").filter({ hasText: "水路、电源和橱柜尺寸" })).toBeVisible()
    await page.getByLabel("采纳说明").fill("验收通过，进入草稿 WikiNode。")
    await page.getByRole("button", { name: "采纳为草稿 WikiNode" }).click()
    await expect(page.getByText(/已采纳为草稿 WikiNode/)).toBeVisible()

    const acceptResponse = await request.get(`${backendUrl}/api/draft-wikinode-suggestions/${importResult.suggestionId}`)
    expect(acceptResponse.ok()).toBeTruthy()
    const acceptedSuggestion = await acceptResponse.json() as { matchedWikiNodeIds: string[] }
    const nodeId = acceptedSuggestion.matchedWikiNodeIds[0]
    expect(nodeId).toBeTruthy()

    await page.getByRole("link", { name: "打开草稿 WikiNode" }).click()
    await expect(page).toHaveURL(new RegExp(`/wiki-nodes/${nodeId}$`))
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible()
    await expect(page.getByLabel("正文内容")).toContainText("水路、电源和橱柜尺寸")
    await page.getByRole("button", { name: "发布" }).click()
    await expect(page.getByText("本地 Index Segment 已准备，外部向量库尚未同步")).toBeVisible()

    await page.goto(`/wiki-graph?knowledgeBaseId=kb-cc-after-sales`)
    await expect(page.getByTestId("wiki-graph-canvas")).toBeVisible()
    await page.getByTestId("wiki-graph-filter-search").fill(title)
    await expect(page.getByTestId("wiki-graph-node").filter({ hasText: title })).toBeVisible()

    await page.goto(`/retrieval-test?knowledgeBaseId=kb-cc-after-sales&q=${encodeURIComponent(title)}`)
    await page.getByRole("button", { name: "检索" }).click()
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible()
    await expect(page.getByText("召回结果类型").first()).toBeVisible()
    await expect(page.getByText("WikiNode（业务知识节点）").first()).toBeVisible()
  })
})
