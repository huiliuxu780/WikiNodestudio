import { expect, test } from "@playwright/test"
import { routeIndexSegmentApi } from "./index-segment-api-fixtures"
import { routeWikiNodeApiFixtures } from "./wiki-node-api-fixtures"

test.describe("Index Segment Knowledge Object experience", () => {
  test("renders API-backed Index Segments with WikiNode evidence", async ({ page }) => {
    let indexSegmentListRequested = false
    await page.route("**/api/index-segments", async (route) => {
      indexSegmentListRequested = true
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify([
          {
            segmentId: "seg-api-001",
            nodeId: "wn-api-001",
            nodeTitle: "API 保修政策",
            objectType: "Article",
            subtype: "service_fee_policy",
            segmentType: "body",
            title: "API 保修政策 / Body section segment",
            content: "保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。",
            contentPreview: "保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。",
            tokenCount: 28,
            enabled: true,
            indexStatus: "indexed",
            vectorDocId: "vec-api-wn-001-body",
            lastIndexedAt: "2026-06-20",
            retrievalHits: 7,
            avgScore: 0.88,
            sourceRefs: [
              {
                sourceId: "src-feishu-cc",
                sourceType: "feishu",
                sourceTitle: "CC 售后政策飞书空间",
                sourceUrl: "https://feishu.example.com/wiki/after-sales",
                paragraphRef: "P-12",
                version: "2026.06",
              },
            ],
            sourceRefIds: ["src-feishu-cc"],
            processingProfile: "feishu_article_v1",
            metadataSummary: [
              { label: "objectType", value: "Article" },
              { label: "subtype", value: "service_fee_policy" },
            ],
            createdAt: "2026-06-20",
            updatedAt: "2026-06-20",
            metadata: {
              nodeType: "policy",
              status: "published",
              tags: ["保修", "售后"],
              objectType: "Article",
              subtype: "service_fee_policy",
            },
          },
        ]),
      })
    })

    await page.goto("/index-segments")

    await expect(page.getByTestId("index-segment-row").filter({ hasText: "API 保修政策" })).toBeVisible()
    await page.getByRole("button", { name: "查看 seg-api-001" }).click()
    await expect(page.getByRole("dialog", { name: "片段详情" })).toBeVisible()
    await expect(page.getByTestId("index-segment-preview")).toContainText("API 保修政策")
    await expect(page.getByTestId("index-segment-preview")).toContainText("vec-api-wn-001-body")
    await expect(page.getByTestId("index-segment-preview")).toContainText("CC 售后政策飞书空间")
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management|Vector DB Management|raw chunk/i)
    expect(indexSegmentListRequested).toBe(true)
  })

  test("preview and debug explain controlled segment boundaries", async ({ page }) => {
    await routeIndexSegmentApi(page)
    await page.goto("/index-segments")

    await expect(page.getByText("平台管理的是 WikiNode 发布前的 Index Segment，不管理外部向量库内部片段。")).toBeVisible()
    await expect(page.getByTestId("index-segment-preview")).toHaveCount(0)
    await expect(page.locator("main").last()).not.toContainText("当前只展示本地验收数据")

    await page.getByRole("button", { name: "查看 SEG-001" }).click()
    await expect(page.getByRole("dialog", { name: "片段详情" })).toBeVisible()
    await expect(page.getByTestId("index-segment-preview")).toContainText("Index Segment 来源 WikiNode")
    await expect(page.getByTestId("index-segment-preview")).toContainText("内容证据")
    await expect(page.getByTestId("index-segment-preview")).toContainText("来源证据范围")
    await expect(page.getByTestId("index-segment-preview")).not.toContainText("当前只展示本地验收数据")
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
    await routeIndexSegmentApi(page)
    await page.goto("/index-segments")

    await expect(page.getByRole("heading", { name: "Index Segment" })).toBeVisible()
    await expect(page.getByText("Index Segment 是从 WikiNode / Knowledge Object 生成的受控索引和召回单元")).toBeVisible()

    await page.getByLabel("搜索 Index Segment").fill("WM14U")
    await expect(page.getByTestId("index-segment-row").filter({ hasText: "西门子 WM14U 洗衣机" }).first()).toBeVisible()
    await expect(page.getByTestId("index-segment-preview")).toHaveCount(0)

    await page.getByTestId("index-segment-row").filter({ hasText: "西门子 WM14U 洗衣机" }).first().getByRole("button", { name: /查看 SEG-/ }).click()
    await expect(page.getByTestId("index-segment-preview")).toContainText("父级 WikiNode / Knowledge Object")
    await expect(page.getByTestId("index-segment-preview")).toContainText("产品知识")
    await expect(page.getByTestId("index-segment-preview")).toContainText("产品型号")
    await expect(page.getByTestId("index-segment-preview")).toContainText("db_product_master_v1")
    await expect(page.getByTestId("index-segment-preview")).toContainText("来源类型 数据库")
    await page.keyboard.press("Escape")

    await page.getByLabel("Knowledge Object 类型").selectOption("Product")
    await expect(page.getByTestId("index-segment-row").filter({ hasText: "西门子 WM14U 洗衣机" }).first()).toBeVisible()
    await expect(page.getByTestId("index-segment-row").filter({ hasText: "保修期内维修服务政策" })).toHaveCount(0)

    await page.getByLabel("索引状态").selectOption("indexed")
    await expect(page.getByTestId("index-segment-row").filter({ hasText: "已索引" }).first()).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management/i)
  })

  test("strategy and debug pages explain objectType-aware segmentation", async ({ page }) => {
    await routeIndexSegmentApi(page)
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
    await routeWikiNodeApiFixtures(page)
    await routeIndexSegmentApi(page)
    await page.goto("/wiki-nodes/wn-013")

    await page.getByRole("tab", { name: "片段" }).click()
    await expect(page.getByTestId("wikinode-inspector")).toContainText("Knowledge Object 类型：产品知识")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("业务子类型：产品型号")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("片段数量")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("来源证据")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("vec-wn-013")
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management/i)
  })

  test("WikiNode Inspector can trigger local deterministic segment generation", async ({ page }) => {
    await routeWikiNodeApiFixtures(page)
    await routeIndexSegmentApi(page, [])
    await page.route("**/api/wiki-nodes/wn-013/index-segments/generate", (route) => {
      return route.fulfill({
        json: [
          {
            segmentId: "seg-wn-013-title",
            nodeId: "wn-013",
            nodeTitle: "西门子 WM14U 洗衣机",
            objectType: "Product",
            subtype: "product_model",
            segmentType: "title",
            title: "西门子 WM14U 洗衣机 / Title segment",
            content: "西门子 WM14U 洗衣机",
            contentPreview: "西门子 WM14U 洗衣机",
            tokenCount: 12,
            enabled: true,
            indexStatus: "not_indexed",
            vectorDocId: null,
            retrievalHits: 0,
            sourceRefs: [
              {
                sourceId: "src-db-product-master",
                sourceType: "database",
                sourceTitle: "PIM 产品主数据表",
              },
            ],
            sourceRefIds: ["src-db-product-master"],
            processingProfile: "db_product_master_v1",
            metadataSummary: [
              { label: "generationMode", value: "local_deterministic" },
              { label: "traceSource", value: "wiki_node" },
            ],
            createdAt: "2026-06-26",
            updatedAt: "2026-06-26",
            metadata: {
              generationMode: "local_deterministic",
              traceSource: "wiki_node",
              parentNodeId: "wn-013",
              nodeType: "product",
              status: "published",
              tags: ["WM14U"],
            },
          },
          {
            segmentId: "seg-wn-013-summary",
            nodeId: "wn-013",
            nodeTitle: "西门子 WM14U 洗衣机",
            objectType: "Product",
            subtype: "product_model",
            segmentType: "summary",
            title: "西门子 WM14U 洗衣机 / Summary segment",
            content: "西门子 WM14U 洗衣机产品主数据，连接手册、配件目录和服务知识包。",
            contentPreview: "西门子 WM14U 洗衣机产品主数据，连接手册、配件目录和服务知识包。",
            tokenCount: 28,
            enabled: true,
            indexStatus: "not_indexed",
            vectorDocId: null,
            retrievalHits: 0,
            sourceRefs: [],
            sourceRefIds: ["src-db-product-master"],
            processingProfile: "db_product_master_v1",
            metadataSummary: [{ label: "traceSource", value: "wiki_node" }],
            createdAt: "2026-06-26",
            updatedAt: "2026-06-26",
            metadata: { generationMode: "local_deterministic", traceSource: "wiki_node", parentNodeId: "wn-013" },
          },
          {
            segmentId: "seg-wn-013-body",
            nodeId: "wn-013",
            nodeTitle: "西门子 WM14U 洗衣机",
            objectType: "Product",
            subtype: "product_model",
            segmentType: "body",
            title: "西门子 WM14U 洗衣机 / Body segment",
            content: "WM14U 属于西门子 iQ500 洗衣机系列。",
            contentPreview: "WM14U 属于西门子 iQ500 洗衣机系列。",
            tokenCount: 20,
            enabled: true,
            indexStatus: "not_indexed",
            vectorDocId: null,
            retrievalHits: 0,
            sourceRefs: [],
            sourceRefIds: ["src-db-product-master"],
            processingProfile: "db_product_master_v1",
            metadataSummary: [{ label: "traceSource", value: "wiki_node" }],
            createdAt: "2026-06-26",
            updatedAt: "2026-06-26",
            metadata: { generationMode: "local_deterministic", traceSource: "wiki_node", parentNodeId: "wn-013" },
          },
        ],
      })
    })

    await page.goto("/wiki-nodes/wn-013")
    await page.getByRole("tab", { name: "片段" }).click()
    await expect(page.getByTestId("wikinode-inspector")).toContainText("当前 WikiNode 暂无 Index Segment")

    await page.getByRole("button", { name: "生成本地片段" }).click()

    await expect(page.getByTestId("wikinode-inspector")).toContainText("seg-wn-013-title")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("本地确定性生成")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("未索引")
    await expect(page.locator("main").last()).not.toContainText(/Chunk Management|embedding/i)
  })
})
