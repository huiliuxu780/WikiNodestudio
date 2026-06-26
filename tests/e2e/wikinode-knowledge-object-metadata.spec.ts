import { expect, test } from "@playwright/test"

const forbiddenProductTerms = /Chunk Management|Chat API|Chatbot|Agent Platform|Workflow Builder|Vector DB Management/i

test.describe("WikiNode Knowledge Object metadata surface", () => {
  test("detail page reads Knowledge Object fields from WikiNode API", async ({ page }) => {
    await page.route("**/api/wiki-nodes/api-only-node", (route) => route.fulfill({
      json: {
        nodeId: "api-only-node",
        slug: "api-only-node",
        title: "API Only Knowledge Object",
        nodeType: "product",
        objectType: "Product",
        subtype: "product_model",
        metadata: {
          brand: "Siemens",
          productCategory: "washing_machine",
          businessDomain: "after_sales",
        },
        relations: [{
          id: "rel-api-only-wn-001",
          sourceNodeId: "api-only-node",
          targetNodeId: "wn-001",
          relationType: "has_policy",
          direction: "outgoing",
          confidence: 0.91,
          createdBy: "system",
          evidence: { sourceRefId: "ref-api-only" },
        }],
        processingProfile: "db_product_master_v1",
        summary: "API 返回的 Knowledge Object 节点。",
        contentMarkdown: "## API 节点",
        tags: ["API"],
        status: "draft",
        sourceRefs: [{
          id: "ref-api-only",
          sourceId: "src-api-only",
          sourceType: "database",
          sourceTitle: "API only source",
        }],
        indexStatus: "not_indexed",
        incomingCount: 0,
        outgoingCount: 1,
        brokenLinkCount: 0,
        owner: "Rivers",
        version: 1,
        createdAt: "2026-06-26",
        updatedAt: "2026-06-26",
      },
    }))

    await page.goto("/wiki-nodes/api-only-node/detail")

    await expect(page.getByRole("heading", { name: "WikiNode 详情" })).toBeVisible()
    await expect(page.getByText("API Only Knowledge Object", { exact: true })).toBeVisible()
    await expect(page.getByText("产品知识")).toBeVisible()
    await expect(page.getByText("产品型号")).toBeVisible()
    await expect(page.getByText("db_product_master_v1")).toBeVisible()
    await expect(page.getByText(/brand=Siemens/)).toBeVisible()
    await expect(page.getByText(/来源证据：API only source \/ ref-api-only/)).toBeVisible()
    await expect(page.getByText(/语义关系：关联政策 -> 保修期内维修服务政策/)).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
  })

  test("detail page explains how WikiNode carries Knowledge Object fields", async ({ page }) => {
    await routeDefaultWikiNodeApi(page)
    await page.goto("/wiki-nodes/wn-001/detail")

    await expect(page.getByRole("heading", { name: "WikiNode 详情" })).toBeVisible()
    await expect(page.getByText("Knowledge Object 承载字段")).toBeVisible()
    await expect(page.getByText("objectType / subtype / metadata / sourceRefs / relations / processingProfile")).toBeVisible()
    await expect(page.getByText("Knowledge Object 类型")).toBeVisible()
    await expect(page.getByText("文章型知识")).toBeVisible()
    await expect(page.getByText("业务子类型")).toBeVisible()
    await expect(page.getByText("收费政策", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("处理策略")).toBeVisible()
    await expect(page.getByText("web_article_policy_v1")).toBeVisible()
    await expect(page.getByText("来源证据：Siemens service fee web page / ref-web-service-fee")).toBeVisible()
    await expect(page.getByText("语义关系：关联政策 -> 收费政策；引用 -> 人为损坏判定规则")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
  })

  test("editor inspector shows Knowledge Object relations as read-only metadata", async ({ page }) => {
    await routeDefaultWikiNodeApi(page)
    await page.goto("/wiki-nodes/wn-001")

    const inspector = page.getByTestId("wikinode-inspector")
    await expect(inspector).toContainText("Knowledge Object 字段用于扩展 WikiNode")
    await expect(inspector).toContainText("Knowledge Object 承载字段")
    await expect(inspector).toContainText("objectType")
    await expect(inspector).toContainText("sourceRefs")
    await expect(inspector).toContainText("relations")
    await expect(inspector).toContainText("Knowledge Object 关系")
    await expect(inspector).toContainText("关联政策 -> 收费政策")
    await expect(inspector).toContainText("引用 -> 人为损坏判定规则")
    await expect(inspector).toContainText("证据 ref-web-service-fee")
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
  })
})

async function routeDefaultWikiNodeApi(page: import("@playwright/test").Page) {
  const defaultNode = {
    nodeId: "wn-001",
    slug: "wn-001",
    title: "保修期内维修服务政策",
    nodeType: "policy",
    objectType: "Article",
    subtype: "service_fee_policy",
    metadata: {
      brand: "Siemens",
      productCategory: "washing_machine",
      businessDomain: "after_sales",
      scenario: "warranty_service_fee",
      language: "zh-CN",
      lifecycleStatus: "published",
    },
    relations: [
      {
        id: "rel-wn001-wn002",
        sourceNodeId: "wn-001",
        targetNodeId: "wn-002",
        relationType: "has_policy",
        direction: "outgoing",
        confidence: 0.92,
        createdBy: "system",
        evidence: { sourceRefId: "ref-web-service-fee" },
      },
      {
        id: "rel-wn001-wn003",
        sourceNodeId: "wn-001",
        targetNodeId: "wn-003",
        relationType: "references",
        direction: "outgoing",
        confidence: 0.88,
        createdBy: "system",
        evidence: { sourceRefId: "ref-web-service-fee" },
      },
    ],
    processingProfile: "web_article_policy_v1",
    summary: "定义保修期内维修免费范围、收费例外和凭证要求。",
    contentMarkdown: "## 适用范围\n\n保修期内的产品故障原则上提供免费维修。",
    tags: ["保修", "售后", "政策"],
    status: "published",
    sourceRefs: [{
      id: "ref-web-service-fee",
      sourceId: "src-web-service-fee",
      sourceType: "web_page",
      sourceTitle: "Siemens service fee web page",
      sourceName: "Siemens service fee web page",
      paragraphRef: "P-12",
      confidence: 0.96,
    }],
    indexStatus: "indexed",
    incomingCount: 1,
    outgoingCount: 2,
    brokenLinkCount: 0,
    owner: "Knowledge Ops",
    version: 1,
    createdAt: "2026-06-10",
    updatedAt: "2026-06-18",
    lastIndexedAt: "2026-06-18",
  }
  const relatedNodes = [
    defaultNode,
    { ...defaultNode, nodeId: "wn-002", slug: "wn-002", title: "收费政策", relations: [] },
    { ...defaultNode, nodeId: "wn-003", slug: "wn-003", title: "人为损坏判定规则", relations: [] },
  ]

  await page.route("**/api/wiki-nodes", (route) => route.fulfill({ json: relatedNodes }))
  await page.route("**/api/wiki-nodes/wn-001", (route) => route.fulfill({ json: defaultNode }))
  await page.route("**/api/wiki-nodes/wn-001/links", (route) => route.fulfill({
    json: [
      {
        linkId: "link-wn001-wn002",
        fromNodeId: "wn-001",
        fromTitle: "保修期内维修服务政策",
        toNodeId: "wn-002",
        toTitle: "收费政策",
        targetTitle: "收费政策",
        relationType: "reference",
        resolved: true,
      },
    ],
  }))
  await page.route("**/api/wiki-nodes/wn-001/backlinks", (route) => route.fulfill({ json: [] }))
}
