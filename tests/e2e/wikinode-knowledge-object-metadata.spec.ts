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

  test("editor inspector treats relations as a first-class WikiNode surface", async ({ page }) => {
    await routeDefaultWikiNodeApi(page)
    await page.goto("/wiki-nodes/wn-001")

    const inspector = page.getByTestId("wikinode-inspector")
    await expect(inspector.getByRole("tab", { name: "关联关系" })).toBeVisible()
    await inspector.getByRole("tab", { name: "关联关系" }).click()

    await expect(inspector).toContainText("关系总览")
    await expect(inspector).toContainText("结构化关系")
    await expect(inspector).toContainText("Markdown 双链")
    await expect(inspector).toContainText("未解析")
    await expect(inspector).toContainText("关联政策")
    await expect(inspector).toContainText("收费政策")
    await expect(inspector).toContainText("引用知识")
    await expect(inspector).toContainText("人为损坏判定规则")
    await expect(inspector).toContainText("系统生成")
    await expect(inspector).toContainText("证据：Siemens service fee web page")
    await expect(inspector.getByRole("button", { name: "添加关系" })).toBeVisible()
    await expect(inspector.getByRole("button", { name: "编辑关系" }).first()).toBeVisible()
    await expect(inspector).not.toContainText(/批量|审批|智能推荐|自动修复/)
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
  })

  test("editor inspector can add, update, and delete one Knowledge Relation", async ({ page }) => {
    await routeDefaultWikiNodeApi(page)
    await page.goto("/wiki-nodes/wn-001")

    const inspector = page.getByTestId("wikinode-inspector")
    await inspector.getByRole("tab", { name: "关联关系" }).click()
    await inspector.getByRole("button", { name: "添加关系" }).click()
    const relationPanel = page.getByRole("dialog", { name: "添加知识关系" })
    await expect(relationPanel).toBeVisible()
    await expect(relationPanel).toContainText("目标对象类型")
    await expect(relationPanel).toContainText("WikiNode")
    await relationPanel.getByLabel("搜索目标 WikiNode").fill("收费")
    await relationPanel.getByRole("button", { name: "收费政策" }).click()
    await relationPanel.getByLabel("关系类型").selectOption("applies_to")
    await relationPanel.getByLabel("关系状态").selectOption("pending_review")
    await relationPanel.getByLabel("关系说明").fill("适用于收费政策。")
    await relationPanel.getByRole("button", { name: "保存关系" }).click()

    await expect(inspector).toContainText("适用于")
    await expect(inspector).toContainText("待确认")
    await expect(inspector).toContainText("适用于收费政策。")

    const createdRelation = inspector
      .getByTestId("knowledge-relation-card")
      .filter({ hasText: "适用于收费政策。" })
    await createdRelation.getByRole("button", { name: "编辑关系" }).click()
    const editPanel = page.getByRole("dialog", { name: "编辑知识关系" })
    await expect(editPanel).toBeVisible()
    await editPanel.getByLabel("关系类型").selectOption("conflicts_with")
    await editPanel.getByLabel("关系状态").selectOption("active")
    await editPanel.getByLabel("关系说明").fill("冲突关系需要复核。")
    await editPanel.getByRole("button", { name: "保存关系" }).click()

    await expect(page.getByText("关系已更新")).toBeVisible()
    await expect(inspector).toContainText("冲突")
    await expect(inspector).toContainText("冲突关系需要复核。")
    await expect(inspector).toContainText("风险关系")

    const updatedRelation = inspector
      .getByTestId("knowledge-relation-card")
      .filter({ hasText: "冲突关系需要复核。" })
    await updatedRelation.getByRole("button", { name: "删除关系" }).click()

    await expect(inspector).not.toContainText("冲突关系需要复核。")
    await expect(page.getByText("关系已删除")).toBeVisible()
  })

  test("editor inspector groups structured Knowledge Relations by semantic section", async ({ page }) => {
    await routeDefaultWikiNodeApi(page)
    await page.goto("/wiki-nodes/wn-001")

    const inspector = page.getByTestId("wikinode-inspector")
    await inspector.getByRole("tab", { name: "关联关系" }).click()

    await inspector.getByRole("button", { name: "添加关系" }).click()
    const relationPanel = page.getByRole("dialog", { name: "添加知识关系" })
    await relationPanel.getByRole("button", { name: "收费政策" }).click()
    await relationPanel.getByLabel("关系类型").selectOption("applies_to")
    await relationPanel.getByRole("button", { name: "保存关系" }).click()

    await expect(inspector.getByRole("heading", { name: "适用范围" })).toBeVisible()
    await expect(inspector.getByRole("heading", { name: "引用知识" })).toBeVisible()
    await expect(inspector.getByRole("heading", { name: "正文双链" })).toBeVisible()
    await expect(inspector.getByText("收费政策").first()).toBeVisible()
  })

  test("editor inspector maps saved Markdown WikiLinks into relation evidence", async ({ page }) => {
    await routeDefaultWikiNodeApi(page)
    await page.goto("/wiki-nodes/wn-001")

    await page.getByLabel("正文内容").fill("## 关系\n\n参考 [[wn-002|收费政策别名]]，另见 [[missing-policy|缺失政策别名]]。")
    await page.getByRole("button", { name: "保存" }).click()
    await expect(page.getByText("保存成功")).toBeVisible()

    const inspector = page.getByTestId("wikinode-inspector")
    await inspector.getByRole("tab", { name: "关联关系" }).click()

    await expect(inspector.getByRole("heading", { name: "正文双链" })).toBeVisible()
    await expect(inspector).toContainText("锚文本：收费政策别名")
    await expect(inspector).toContainText("目标标识：wn-002")
    await expect(inspector).toContainText("解析目标：收费政策")
    await expect(inspector).toContainText("关系来源：正文双链")
    await expect(inspector).toContainText("关系状态：有效")

    await expect(inspector.getByRole("heading", { name: "断链 / 待确认" })).toBeVisible()
    await expect(inspector).toContainText("锚文本：缺失政策别名")
    await expect(inspector).toContainText("目标标识：missing-policy")
    await expect(inspector).toContainText("解析目标：未解析")
    await expect(inspector).toContainText("关系状态：断链")
  })

  test("editor inspector can review pending conflict Knowledge Relations", async ({ page }) => {
    await routeDefaultWikiNodeApi(page)
    await page.goto("/wiki-nodes/wn-001")

    const inspector = page.getByTestId("wikinode-inspector")
    await inspector.getByRole("tab", { name: "关联关系" }).click()
    await inspector.getByRole("button", { name: "添加关系" }).click()
    const relationPanel = page.getByRole("dialog", { name: "添加知识关系" })
    await relationPanel.getByRole("button", { name: "收费政策" }).click()
    await relationPanel.getByLabel("关系类型").selectOption("conflicts_with")
    await relationPanel.getByLabel("关系状态").selectOption("pending_review")
    await relationPanel.getByLabel("关系说明").fill("收费政策存在口径冲突，需要复核。")
    await relationPanel.getByRole("button", { name: "保存关系" }).click()

    const conflictRelation = inspector
      .getByTestId("knowledge-relation-card")
      .filter({ hasText: "收费政策存在口径冲突，需要复核。" })
    await expect(conflictRelation).toContainText("风险关系")
    await expect(conflictRelation).toContainText("待确认")
    await conflictRelation.getByLabel("关系评审备注").fill("评审结论：当前口径不成立。")
    await conflictRelation.getByRole("button", { name: "驳回关系" }).click()

    await expect(page.getByText("关系已更新")).toBeVisible()
    const rejectedRelation = inspector
      .getByTestId("knowledge-relation-card")
      .filter({ hasText: "评审结论：当前口径不成立。" })
    await expect(rejectedRelation).toContainText("已驳回")
    await expect(rejectedRelation).toContainText("评审结论：当前口径不成立。")
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
  let currentNode = { ...defaultNode, relations: [...defaultNode.relations] }
  const relatedNodes = [
    currentNode,
    { ...defaultNode, nodeId: "wn-002", slug: "wn-002", title: "收费政策", relations: [] },
    { ...defaultNode, nodeId: "wn-003", slug: "wn-003", title: "人为损坏判定规则", relations: [] },
  ]

  await page.route("**/api/wiki-nodes", (route) => route.fulfill({ json: [currentNode, ...relatedNodes.slice(1)] }))
  await page.route("**/api/wiki-nodes/wn-001", async (route) => {
    if (route.request().method() === "PUT") {
      const input = route.request().postDataJSON() as typeof currentNode
      currentNode = { ...currentNode, ...input }
    }
    return route.fulfill({ json: currentNode })
  })
  await page.route("**/api/wiki-nodes/wn-001/relations", async (route) => {
    if (route.request().method() === "POST") {
      const input = route.request().postDataJSON() as {
        targetNodeId: string
        relationType: string
        status?: string
        source?: string
        confidence?: number
        anchorText?: string
        note?: string
        evidenceSourceRefId?: string
      }
      const relation = {
        id: `rel-test-${Date.now()}`,
        sourceNodeId: "wn-001",
        targetNodeId: input.targetNodeId,
        relationType: input.relationType,
        status: input.status ?? "active",
        source: input.source ?? "manual",
        direction: "outgoing",
        confidence: input.confidence ?? 0.8,
        createdBy: "user",
        anchorText: input.anchorText,
        note: input.note,
        evidence: input.evidenceSourceRefId ? { sourceRefId: input.evidenceSourceRefId } : undefined,
      }
      currentNode = { ...currentNode, relations: [...currentNode.relations, relation] }
      return route.fulfill({ json: relation })
    }
    return route.fulfill({ json: currentNode.relations })
  })
  await page.route("**/api/wiki-nodes/wn-001/relations/*", async (route) => {
    const relationId = route.request().url().split("/").pop()
    if (route.request().method() === "PATCH") {
      const input = route.request().postDataJSON() as {
        targetNodeId: string
        relationType: string
        status?: string
        source?: string
        confidence?: number
        anchorText?: string
        note?: string
        evidenceSourceRefId?: string
      }
      const relation = {
        id: relationId,
        sourceNodeId: "wn-001",
        targetNodeId: input.targetNodeId,
        relationType: input.relationType,
        status: input.status ?? "active",
        source: input.source ?? "manual",
        direction: "outgoing",
        confidence: input.confidence ?? 0.8,
        createdBy: "user",
        anchorText: input.anchorText,
        note: input.note,
        evidence: input.evidenceSourceRefId ? { sourceRefId: input.evidenceSourceRefId } : undefined,
      }
      currentNode = {
        ...currentNode,
        relations: currentNode.relations.map((item) => item.id === relationId ? relation : item),
      }
      return route.fulfill({ json: relation })
    }
    if (route.request().method() === "DELETE") {
      currentNode = { ...currentNode, relations: currentNode.relations.filter((item) => item.id !== relationId) }
      return route.fulfill({ status: 204, body: "" })
    }
    return route.fulfill({ status: 404, json: { message: "not found" } })
  })
  await page.route("**/api/wiki-nodes/wn-001/links", (route) => route.fulfill({ json: buildWikiLinkFixtures(currentNode, relatedNodes) }))
  await page.route("**/api/wiki-nodes/wn-001/backlinks", (route) => route.fulfill({ json: [] }))
}

function buildWikiLinkFixtures(node: {
  nodeId: string
  title: string
  contentMarkdown: string
}, nodes: Array<{ nodeId: string; slug: string; title: string }>) {
  return Array.from(node.contentMarkdown.matchAll(/\[\[([^\]]+)\]\]/g), (match, index) => {
    const [rawTarget, rawLabel] = match[1].split("|", 2).map((part) => part.trim())
    const targetKey = rawTarget || rawLabel || match[1].trim()
    const anchorText = rawLabel || rawTarget || match[1].trim()
    const target = nodes.find((item) => item.nodeId === targetKey || item.slug === targetKey || item.title === targetKey)

    return {
      linkId: `link-${node.nodeId}-${index}`,
      fromNodeId: node.nodeId,
      fromTitle: node.title,
      toNodeId: target?.nodeId,
      toTitle: target?.title,
      targetTitle: targetKey,
      targetSlug: target?.slug ?? targetKey,
      anchorText,
      relationType: "reference",
      source: "markdown_link",
      status: target ? "active" : "broken",
      resolved: Boolean(target),
    }
  })
}
