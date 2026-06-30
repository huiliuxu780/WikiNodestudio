import { expect, test } from "@playwright/test"
import { routeRetrievalApiFixtures } from "./retrieval-api-fixtures"

const forbiddenProductTerms = /Chunk Management|Chat API|Chatbot|Agent Platform|Workflow Builder|Vector DB Management/i

test.describe("Retrieval Test debug experience", () => {
  test.beforeEach(async ({ page }) => {
    await routeRetrievalApiFixtures(page)
  })

  test("keeps normal results WikiNode-first and shows matchedSegments only in debug mode", async ({ page }) => {
    await page.goto("/retrieval-test")

    await expect(page.getByText("普通模式：返回 WikiNode 结果，不展示 Index Segment 调试证据。")).toBeVisible()
    await expect(page.getByText("示例问题只会填入输入框，点击检索后返回 WikiNode 结果。")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/matchedSegments/)

    await page.getByLabel("检索问题").fill("洗碗机保修期内维修收费吗？")
    await page.getByRole("button", { name: "检索" }).click()

    await expect(page.getByText("召回结果类型").first()).toBeVisible()
    await expect(page.getByText("WikiNode（业务知识节点）").first()).toBeVisible()
    await expect(page.getByText("为什么命中").first()).toBeVisible()
    await expect(page.getByText("命中字段").first()).toBeVisible()
    await expect(page.getByText("来源证据").first()).toBeVisible()
    await expect(page.getByText("WikiLink 上下文").first()).toBeVisible()
    await expect(page.getByText("命中的 Index Segment")).toHaveCount(0)

    await page.getByLabel("调试模式").click()
    await expect(page.getByText("调试模式已开启：下方仅补充 matchedSegments / Index Segment 证据，不改变主结果。")).toBeVisible()
    await page.getByRole("button", { name: "检索" }).click()

    await expect(page.getByText("命中的 Index Segment").first()).toBeVisible()
    await expect(page.getByText("SEG-").first()).toBeVisible()
    await expect(page.getByText("命中的 Knowledge Relation").first()).toBeVisible()
    await expect(page.getByText("适用于").first()).toBeVisible()
    await expect(page.getByText("替代").first()).toBeVisible()
    await expect(page.getByText("冲突").first()).toBeVisible()
    await expect(page.getByText("来源关系用于解释 WikiNode 的证据出处。").first()).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
  })

  test("sends Knowledge Base scope through Retrieval API filters", async ({ page }) => {
    let submittedKnowledgeBaseId = ""
    await page.route("**/api/retrieval-test", async (route) => {
      if (route.request().method() !== "POST") return route.fallback()
      const request = route.request().postDataJSON() as { filters?: { knowledgeBaseId?: string } }
      submittedKnowledgeBaseId = request.filters?.knowledgeBaseId ?? ""
      return route.fulfill({
        json: [{
          node: {
            nodeId: "wn-013",
            knowledgeBaseId: "kb-product-guide",
            slug: "wn-013",
            title: "西门子 WM14U 洗衣机",
            nodeType: "product",
            objectType: "Product",
            subtype: "product_model",
            metadata: { businessDomain: "product_support" },
            relations: [],
            processingProfile: "product_master_v1",
            summary: "西门子 WM14U 洗衣机产品主数据。",
            contentMarkdown: "WM14U 产品知识。",
            tags: ["产品知识"],
            status: "published",
            sourceRefs: [],
            indexStatus: "indexed",
            incomingCount: 0,
            outgoingCount: 0,
            brokenLinkCount: 0,
            owner: "Product Docs",
            version: 1,
            createdAt: "2026-06-26",
            updatedAt: "2026-06-26",
          },
          score: 0.9,
          matchedReason: "Matched Knowledge Base scoped WikiNode.",
          matchedFields: ["title"],
        }],
      })
    })

    await page.goto("/retrieval-test")
    await page.getByLabel("Knowledge Base").click()
    await page.getByRole("option", { name: "Product Guide KB" }).click()
    await page.getByLabel("检索问题").fill("WM14U")
    await page.getByRole("button", { name: "检索" }).click()

    await expect(page.getByText("西门子 WM14U 洗衣机", { exact: true }).first()).toBeVisible()
    expect(submittedKnowledgeBaseId).toBe("kb-product-guide")
  })

  test("shows actionable no-result guidance without changing product language", async ({ page }) => {
    await page.goto("/retrieval-test")

    await page.getByLabel("检索问题").fill("zzzz-no-result-前端验收")
    await page.getByLabel("发布状态").click()
    await page.getByRole("option", { name: "已归档" }).click()
    await page.getByRole("button", { name: "检索" }).click()

    await expect(page.getByText("暂无匹配的知识节点，请调整问题、筛选条件或返回数量后重试。")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
    await expect(page.locator("main").last()).not.toContainText(/raw chunk|Chat API/i)
  })

  test("renders query log and evaluation case evidence from Retrieval API", async ({ page }) => {
    await page.route("**/api/retrieval-test", async (route) => {
      if (route.request().method() !== "POST") return route.fallback()

      return route.fulfill({
        json: [
          {
            node: {
              nodeId: "wn-001",
              slug: "wn-001",
              title: "保修政策",
              nodeType: "policy",
              objectType: "Article",
              subtype: "service_fee_policy",
              metadata: { businessDomain: "after_sales" },
              relations: [],
              processingProfile: "web_article_policy_v1",
              summary: "保修期内产品故障的维修原则和例外条件。",
              contentMarkdown: "保修期内维修原则上免费。",
              tags: ["保修", "售后"],
              status: "published",
              sourceRefs: [{ sourceId: "src-feishu-cc", sourceType: "feishu", sourceTitle: "CC 售后政策飞书空间" }],
              indexStatus: "indexed",
              incomingCount: 0,
              outgoingCount: 0,
              brokenLinkCount: 0,
              createdAt: "2026-06-10",
              updatedAt: "2026-06-18",
              lastIndexedAt: "2026-06-18",
            },
            score: 0.91,
            matchedReason: "Matched relevant WikiNode content.",
            matchedFields: ["title", "summary"],
            incomingLinks: [],
            outgoingLinks: [],
            matchedSegments: [
              {
                segmentId: "seg-001",
                nodeId: "wn-001",
                segmentType: "body",
                score: 0.86,
                contentPreview: "保修期内维修不收取人工费。",
                sourceRefIds: ["src-feishu-cc"],
              },
            ],
          },
        ],
      })
    })
    await page.route("**/api/retrieval-test/logs", (route) => route.fulfill({
      json: [
        {
          logId: "rlog-ui-001",
          query: "保修期内维修",
          returnedNodeIds: ["wn-001"],
          matchedSegmentIds: ["seg-001"],
          latencyMs: 18,
          status: "succeeded",
          createdAt: "2026-06-26",
        },
      ],
    }))
    await page.route("**/api/retrieval-test/evaluation-cases", async (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({
          json: {
            caseId: "eval-ui-warranty",
            query: "保修期内维修",
            filters: {},
            topK: 5,
            expectedNodeIds: ["wn-001"],
            runResult: {
              returnedNodeIds: ["wn-001"],
              matchedSegmentIds: ["seg-001"],
              status: "passed",
              summary: "命中预期 WikiNode。",
            },
            createdAt: "2026-06-26",
            updatedAt: "2026-06-26",
          },
        })
      }
      return route.fulfill({ json: [] })
    })

    await page.goto("/retrieval-test")
    await page.getByLabel("检索问题").fill("保修期内维修")
    await page.getByLabel("调试模式").click()
    await page.getByRole("button", { name: "检索" }).click()

    await expect(page.getByText("命中的 Index Segment").first()).toBeVisible()
    await expect(page.getByText("最近查询日志")).toBeVisible()
    await expect(page.getByText("rlog-ui-001")).toBeVisible()
    await expect(page.getByText("返回 WikiNode：wn-001")).toBeVisible()
    await expect(page.getByText("命中片段：seg-001")).toBeVisible()

    await page.getByRole("button", { name: "保存为评测用例" }).click()
    await expect(page.getByText("评测用例证据")).toBeVisible()
    await expect(page.getByText("eval-ui-warranty")).toBeVisible()
    await expect(page.getByText("命中预期 WikiNode。")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
  })

  test("IM053 renders retrieval evaluation console pages from existing evidence", async ({ page }) => {
    await page.route("**/api/retrieval-test/logs", (route) => route.fulfill({
      json: [
        {
          logId: "rlog-console-001",
          query: "保修期内维修",
          filters: { nodeType: "policy", status: "published" },
          returnedNodeIds: ["wn-001"],
          matchedSegmentIds: ["seg-001", "seg-002"],
          latencyMs: 24,
          status: "succeeded",
          createdAt: "2026-06-26",
        },
        {
          logId: "rlog-console-002",
          query: "未知问题",
          filters: {},
          returnedNodeIds: [],
          matchedSegmentIds: [],
          latencyMs: 15,
          status: "failed",
          errorSummary: "没有可用的 WikiNode 结果。",
          createdAt: "2026-06-26",
        },
      ],
    }))
    await page.route("**/api/retrieval-test/evaluation-cases", (route) => route.fulfill({
      json: [
        {
          caseId: "eval-console-001",
          query: "保修期内维修",
          filters: { nodeType: "policy" },
          topK: 5,
          expectedNodeIds: ["wn-001"],
          runResult: {
            returnedNodeIds: ["wn-001"],
            matchedSegmentIds: ["seg-001"],
            status: "passed",
            summary: "命中预期 WikiNode。",
          },
          createdAt: "2026-06-26",
          updatedAt: "2026-06-26",
        },
        {
          caseId: "eval-console-002",
          query: "延保范围",
          filters: {},
          topK: 3,
          expectedNodeIds: ["wn-004"],
          runResult: {
            returnedNodeIds: ["wn-002"],
            matchedSegmentIds: ["seg-009"],
            status: "failed",
            summary: "返回 WikiNode 与预期不一致。",
          },
          createdAt: "2026-06-26",
          updatedAt: "2026-06-26",
        },
      ],
    }))

    await page.goto("/query-logs")
    await expect(page.getByRole("heading", { name: "查询日志" })).toBeVisible()
    await expect(page.getByText("Retrieval API 查询日志证据")).toBeVisible()
    await expect(page.getByText("rlog-console-001")).toBeVisible()
    await expect(page.getByText("返回 WikiNode：wn-001")).toBeVisible()
    await expect(page.getByText("命中 Index Segment：seg-001、seg-002")).toBeVisible()
    await expect(page.getByText("状态：成功 · 24ms")).toBeVisible()
    await expect(page.getByText("没有可用的 WikiNode 结果。")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)

    await page.goto("/evaluation-cases")
    await expect(page.getByRole("heading", { name: "评测用例" })).toBeVisible()
    await expect(page.getByText("Retrieval Evaluation Case 证据")).toBeVisible()
    await expect(page.getByText("eval-console-001")).toBeVisible()
    await expect(page.getByText("预期 WikiNode：wn-001")).toBeVisible()
    await expect(page.getByText("返回 WikiNode：wn-001")).toBeVisible()
    await expect(page.getByText("运行结果：通过")).toBeVisible()
    await expect(page.getByText("返回 WikiNode 与预期不一致。")).toBeVisible()

    await page.goto("/retrieval-evaluation")
    await expect(page.getByRole("heading", { name: "召回评测" })).toBeVisible()
    await expect(page.getByText("召回评测基线")).toBeVisible()
    await expect(page.getByText("评测用例数")).toBeVisible()
    await expect(page.getByText("通过 1 / 失败 1")).toBeVisible()
    await expect(page.getByText("最近查询日志 2 条")).toBeVisible()
    await expect(page.getByText("评测用例用于对比查询、期望 WikiNode 和实际返回结果。")).toBeVisible()
    await expect(page.getByRole("button", { name: /运行评测|批量|导出|评分|同步/ })).toHaveCount(0)
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
  })
})
