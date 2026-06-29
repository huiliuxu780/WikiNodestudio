import { expect, test } from "@playwright/test"
import { routeRetrievalApiFixtures } from "./retrieval-api-fixtures"
import { wikiNodeApiFixtureNodes } from "./wiki-node-api-fixtures"

const forbiddenProductTerms = /Chunk Management|Chat API|Chatbot|Agent Platform|Workflow Builder|Vector DB Management/i

test.describe.serial("MVP browser smoke", () => {
  test.beforeEach(async ({ page }) => {
    await routeMutableWikiNodeApiFixture(page)
    await routeRetrievalApiFixtures(page)
  })

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
    await expect(page.getByText(/已发布 WikiNode，并准备 \d+ 条 Index Segment/)).toBeVisible()
    await expect(page.getByText("外部向量库同步待后续执行")).toBeVisible()
    await page.getByRole("button", { name: "重新索引" }).click()
    await expect(page.getByText(/已重新准备 \d+ 条本地 Index Segment/)).toBeVisible()
    await expect(page.getByText("外部向量库同步待后续执行")).toBeVisible()
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
    await page.getByLabel("发布状态").click()
    await page.getByRole("option", { name: "已归档" }).click()
    await page.getByRole("button", { name: "检索" }).click()

    await expect(page.getByText("暂无匹配的知识节点")).toBeVisible()
  })

  test("Broken links and settings pages use localized product copy", async ({ page }) => {
    await page.goto("/broken-links")

    await expect(page.getByRole("heading", { name: "断链检查" })).toBeVisible()
    await expect(page.getByText("未解析关系", { exact: true })).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)

    await page.goto("/settings")

    await expect(page.getByRole("heading", { name: "设置" })).toBeVisible()
    await expect(page.getByText("默认设置")).toBeVisible()
    await expect(page.getByText("查看知识库默认状态、链路检查和断链提醒配置。")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
  })
})

async function routeMutableWikiNodeApiFixture(page: Parameters<typeof routeRetrievalApiFixtures>[0]) {
  const nodes = wikiNodeApiFixtureNodes.map((node, index) => ({
    ...node,
    title: index === 0 ? "保修政策" : node.title,
    tags: [...node.tags],
    sourceRefs: node.sourceRefs.map((sourceRef) => ({ ...sourceRef })),
    relations: node.relations?.map((relation) => ({ ...relation })),
  }))

  await page.route("**/api/wiki-nodes**", async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const parts = url.pathname.split("/").filter(Boolean)
    const wikiNodesIndex = parts.indexOf("wiki-nodes")
    const nodeId = parts[wikiNodesIndex + 1]
    const childResource = parts[wikiNodesIndex + 2]

    if (url.pathname === "/api/wiki-nodes" && request.method() === "GET") {
      return route.fulfill({ json: nodes })
    }

    if (url.pathname === "/api/wiki-nodes" && request.method() === "POST") {
      const input = request.postDataJSON() as {
        title: string
        slug: string
        summary: string
        contentMarkdown: string
        tags: string[]
        nodeType: string
        status: string
        indexStatus: string
      }
      if (nodes.some((node) => node.slug === input.slug || node.nodeId === input.slug)) {
        return route.fulfill({ status: 409, json: { message: "Slug already exists" } })
      }

      const created = {
        ...nodes[0],
        nodeId: input.slug,
        slug: input.slug,
        title: input.title,
        summary: input.summary,
        contentMarkdown: input.contentMarkdown,
        tags: input.tags,
        nodeType: input.nodeType,
        status: input.status,
        indexStatus: input.indexStatus,
        objectType: "Article",
        subtype: "term",
        metadata: {},
        relations: [],
        sourceRefs: [],
        incomingCount: 0,
        outgoingCount: 0,
        brokenLinkCount: 0,
      }
      nodes.unshift(created)
      return route.fulfill({ json: created })
    }

    if (!nodeId) return route.fallback()

    const matchIndex = nodes.findIndex((node) => node.nodeId === nodeId || node.slug === nodeId)
    const match = matchIndex >= 0 ? nodes[matchIndex] : null

    if (childResource === "publish" && request.method() === "POST") {
      if (!match) return route.fulfill({ status: 404, json: { message: "WikiNode not found" } })
      const published = {
        ...match,
        status: "published",
        publishStatus: "published",
        reviewStatus: "approved",
        indexStatus: "outdated",
        metadata: {
          ...match.metadata,
          lifecycleStatus: "published",
          lastPublishedAt: "2026-06-28",
        },
      }
      nodes[matchIndex] = published
      return route.fulfill({
        json: {
          nodeId: published.nodeId,
          status: "published",
          indexStatus: "outdated",
          summary: "已发布 WikiNode，并准备 3 条 Index Segment；外部向量库同步待后续执行。",
          indexSegmentCount: 3,
          lastPublishedAt: "2026-06-28",
          lastIndexedAt: null,
        },
      })
    }

    if (childResource === "reindex" && request.method() === "POST") {
      if (!match) return route.fulfill({ status: 404, json: { message: "WikiNode not found" } })
      const prepared = {
        ...match,
        indexStatus: match.status === "published" ? "outdated" : "not_indexed",
        lastIndexedAt: undefined,
      }
      nodes[matchIndex] = prepared
      return route.fulfill({
        json: {
          nodeId: prepared.nodeId,
          status: prepared.status,
          indexStatus: prepared.indexStatus,
          summary: "已重新准备 3 条本地 Index Segment；外部向量库同步待后续执行。",
          indexSegmentCount: 3,
          lastPublishedAt: null,
          lastIndexedAt: null,
        },
      })
    }

    if (childResource === "links" || childResource === "backlinks" || childResource === "index-segments") {
      return route.fulfill({ json: [] })
    }

    if (childResource === "relations") {
      return route.fulfill({ json: match?.relations ?? [] })
    }

    if (request.method() === "GET") {
      return match
        ? route.fulfill({ json: match })
        : route.fulfill({ status: 404, json: { message: "WikiNode not found" } })
    }

    if (request.method() === "PUT") {
      if (!match) return route.fulfill({ status: 404, json: { message: "WikiNode not found" } })
      const nextNode = request.postDataJSON()
      nodes[matchIndex] = nextNode
      return route.fulfill({ json: nextNode })
    }

    return route.fallback()
  })
}
