import { expect, test } from "@playwright/test"

const forbiddenProductTerms = /Chunk Management|Chat API|Chatbot|Agent Platform|Workflow Builder|Vector DB Management/i

test.describe("Knowledge Base administration", () => {
  test.beforeEach(async ({ page }) => {
    const knowledgeBases = [
      {
        kbId: "kb-cc-after-sales",
        name: "CC After-sales KB",
        description: "客服售后政策、流程、收费和升级处理知识库。",
        businessDomain: "after_sales",
        type: "wikinode",
        status: "active",
        visibility: "internal",
        owner: "Rivers",
        settings: {
          defaultNodeType: "policy",
          defaultParserEngine: "markdown",
          defaultStorageProvider: "workspace",
          defaultVectorStore: "external_vector_store",
          defaultPublishingPolicy: "manual",
          defaultRetrievalStrategy: "wikinode_first",
        },
        wikiNodeCount: 3,
        sourceCount: 2,
        archivedAt: null,
        createdAt: "2026-06-01",
        updatedAt: "2026-06-22",
      },
      {
        kbId: "kb-product-guide",
        name: "Product Guide KB",
        description: "产品说明、安装指导和常见故障处理知识库。",
        businessDomain: "product_support",
        type: "mixed",
        status: "active",
        visibility: "internal",
        owner: "Product Docs",
        settings: {
          defaultNodeType: "guide",
          defaultParserEngine: "pdf_manual_article_v1",
          defaultStorageProvider: "object_storage",
          defaultVectorStore: "external_vector_store",
          defaultPublishingPolicy: "manual",
          defaultRetrievalStrategy: "wikinode_first",
        },
        wikiNodeCount: 1,
        sourceCount: 2,
        archivedAt: null,
        createdAt: "2026-05-18",
        updatedAt: "2026-06-20",
      },
    ]

    await page.route("**/api/knowledge-bases**", async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      const parts = url.pathname.split("/").filter(Boolean)
      const kbId = parts[2]
      const action = parts[3]

      if (url.pathname === "/api/knowledge-bases" && request.method() === "GET") {
        const keyword = url.searchParams.get("keyword")?.toLowerCase() ?? ""
        const status = url.searchParams.get("status") ?? ""
        const visibility = url.searchParams.get("visibility") ?? ""
        return route.fulfill({
          json: knowledgeBases.filter((kb) =>
            (!keyword || kb.name.toLowerCase().includes(keyword) || kb.description.toLowerCase().includes(keyword))
            && (!status || kb.status === status)
            && (!visibility || kb.visibility === visibility)
          ),
        })
      }

      if (url.pathname === "/api/knowledge-bases" && request.method() === "POST") {
        const input = request.postDataJSON() as Record<string, unknown>
        const created = {
          ...knowledgeBases[0],
          ...input,
          status: "active",
          wikiNodeCount: 0,
          sourceCount: 0,
          archivedAt: null,
          createdAt: "2026-06-29",
          updatedAt: "2026-06-29",
        }
        knowledgeBases.unshift(created as typeof knowledgeBases[number])
        return route.fulfill({ json: created })
      }

      const activeKb = knowledgeBases.find((kb) => kb.kbId === kbId)
      if (!activeKb) return route.fulfill({ status: 404, json: { message: "Knowledge Base not found" } })

      if (request.method() === "GET" && !action) {
        return route.fulfill({ json: activeKb })
      }

      if (request.method() === "PUT" && !action) {
        const input = request.postDataJSON() as Record<string, unknown>
        Object.assign(activeKb, input, { updatedAt: "2026-06-29" })
        return route.fulfill({ json: activeKb })
      }

      if (request.method() === "POST" && action) {
        const status = action === "restore" ? "active" : action === "archive" ? "archived" : "disabled"
        activeKb.status = status
        activeKb.archivedAt = action === "archive" ? "2026-06-29" : null
        activeKb.updatedAt = "2026-06-29"
        return route.fulfill({
          json: {
            kbId,
            status,
            summary: action === "archive" ? "已归档知识库，现有关联 WikiNode 和 Source 保留为只读范围。" : "已更新知识库状态。",
            archivedAt: activeKb.archivedAt,
            updatedAt: activeKb.updatedAt,
          },
        })
      }

      return route.fallback()
    })

    await page.route("**/api/wiki-nodes", async (route) => {
      return route.fulfill({
        json: [
          {
            nodeId: "wn-001",
            knowledgeBaseId: "kb-cc-after-sales",
            title: "保修期内维修服务政策",
            nodeType: "policy",
            objectType: "Article",
            subtype: "service_fee_policy",
            status: "published",
            indexStatus: "indexed",
            owner: "Rivers",
            updatedAt: "2026-06-20",
          },
          {
            nodeId: "wn-013",
            knowledgeBaseId: "kb-product-guide",
            title: "西门子 WM14U 洗衣机",
            nodeType: "product",
            objectType: "Product",
            subtype: "product_model",
            status: "published",
            indexStatus: "indexed",
            owner: "Product Docs",
            updatedAt: "2026-06-19",
          },
        ],
      })
    })

    await page.route("**/api/sources", async (route) => {
      return route.fulfill({
        json: [
          {
            sourceId: "src-feishu-cc",
            knowledgeBaseId: "kb-cc-after-sales",
            title: "售后政策飞书空间",
            sourceType: "feishu",
            owner: "Rivers",
            ingestionMode: "manual_import",
            connectionStatus: "available",
            syncStatus: "synced",
            lastSyncedAt: "2026-06-20",
            generatedNodes: 3,
            rawMaterialCount: 4,
          },
          {
            sourceId: "src-pdf-dishwasher",
            knowledgeBaseId: "kb-product-guide",
            title: "洗碗机培训 PDF",
            sourceType: "pdf",
            owner: "Product Docs",
            ingestionMode: "manual_import",
            connectionStatus: "available",
            syncStatus: "synced",
            lastSyncedAt: "2026-06-17",
            generatedNodes: 1,
            rawMaterialCount: 2,
          },
        ],
      })
    })
  })

  test("list page supports dense search and status lifecycle actions", async ({ page }) => {
    await page.goto("/knowledge-bases")

    await expect(page.getByRole("heading", { name: "知识库" })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "知识库" })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "WikiNode" })).toBeVisible()
    await expect(page.getByRole("link", { name: "CC After-sales KB" })).toBeVisible()
    await expect(page.getByText("已启用").first()).toBeVisible()

    await page.getByLabel("搜索知识库").fill("Product")
    await expect(page.getByRole("link", { name: "Product Guide KB" })).toBeVisible()
    await expect(page.getByRole("link", { name: "CC After-sales KB" })).toHaveCount(0)

    await page.getByLabel("搜索知识库").fill("")
    await page.getByRole("button", { name: "新建知识库" }).click()
    await page.getByLabel("知识库名称").fill("API Service KB")
    await page.getByLabel("知识库 ID").fill("kb-api-service")
    await page.getByLabel("业务域").fill("api_service")
    await page.getByLabel("描述").fill("API 服务知识库，用于验证 Knowledge Base 管理。")
    await page.getByRole("button", { name: "创建" }).click()
    await expect(page.getByText("创建成功")).toBeVisible()
    await expect(page.getByRole("link", { name: "API Service KB" })).toBeVisible()

    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
    await expect(page.locator("main").last()).not.toContainText(/执行边界|当前只|不会执行|不提供/)
  })

  test("detail and settings pages are API backed management surfaces", async ({ page }) => {
    await page.goto("/knowledge-bases/kb-cc-after-sales")

    await expect(page.getByRole("heading", { name: "CC After-sales KB" })).toBeVisible()
    await expect(page.getByLabel("breadcrumb")).toContainText("知识库详情")
    await expect(page.getByLabel("breadcrumb")).not.toContainText("编辑")
    await expect(page.getByText("客服售后政策、流程、收费和升级处理知识库。")).toBeVisible()
    await expect(page.getByText("知识资产")).toBeVisible()
    await expect(page.getByText("数据来源")).toBeVisible()
    await expect(page.getByText("召回范围", { exact: true }).first()).toBeVisible()
    await expect(page.getByRole("tab", { name: "WikiNode" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Source" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "召回范围" })).toBeVisible()
    await expect(page.getByRole("row", { name: /保修期内维修服务政策/ })).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/\bfee_policy\b|\bprocedure\b|\bterm\b/)
    await page.getByRole("tab", { name: "Source" }).click()
    const sourceRow = page.getByRole("row", { name: /售后政策飞书空间/ })
    await expect(sourceRow).toBeVisible()
    await expect(sourceRow).toContainText("手动导入")
    await expect(sourceRow).toContainText("连接可用")
    await expect(sourceRow).toContainText("已同步")
    await expect(sourceRow.getByRole("link", { name: "查看 Source" })).toHaveAttribute("href", "/sources/src-feishu-cc")
    await expect(page.getByRole("link", { name: "导入文件" }).first()).toHaveAttribute("href", "/knowledge-bases/kb-cc-after-sales/import?sourceId=src-feishu-cc")
    await page.getByRole("tab", { name: "召回范围" }).click()
    await expect(page.getByText("filters.knowledgeBaseId = kb-cc-after-sales")).toBeVisible()
    await expect(page.getByText("默认召回策略")).toBeVisible()
    await expect(page.getByText("WikiNode 优先")).toBeVisible()
    await expect(page.getByText("范围概览")).toHaveCount(0)
    await expect(page.locator("main").last()).not.toContainText(/执行边界|当前只|不会执行|不提供|不执行/)

    await page.getByRole("button", { name: "停用" }).click()
    await expect(page.getByRole("status").filter({ hasText: "状态已更新" })).toBeVisible()
    await expect(page.getByText("已停用")).toBeVisible()
    await expect(page.getByRole("button", { name: "停用" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "恢复" })).toBeVisible()
    await expect(page.getByText("操作结果已更新")).toHaveCount(0)

    await page.goto("/knowledge-bases/kb-cc-after-sales/settings")
    await expect(page.getByRole("heading", { name: "知识库设置" })).toBeVisible()
    await expect(page.getByLabel("breadcrumb")).toContainText("知识库设置")
    await expect(page.getByLabel("知识库名称")).toHaveValue("CC After-sales KB")
    await expect(page.getByRole("link", { name: "导入文件" })).toHaveAttribute("href", "/knowledge-bases/kb-cc-after-sales/import?sourceId=src-feishu-cc")
    await expect(page.getByText("危险操作")).toBeVisible()
    await expect(page.getByText("当前状态：已停用")).toBeVisible()
    await expect(page.getByRole("button", { name: "停用" })).toHaveCount(0)
    await page.getByRole("button", { name: "恢复" }).click()
    await expect(page.getByRole("status").filter({ hasText: "状态已更新" })).toBeVisible()
    await expect(page.getByText("当前状态：已启用")).toBeVisible()
    await expect(page.getByRole("button", { name: "停用" })).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/\bwikinode_first\b|\bpdf_manual_article_v1\b/)
    await page.getByLabel("知识库名称").fill("CC After-sales Knowledge Base")
    await page.getByRole("button", { name: "保存设置" }).click()
    await expect(page.getByRole("status").filter({ hasText: "保存成功" })).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
  })
})
