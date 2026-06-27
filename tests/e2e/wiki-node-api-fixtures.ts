import type { Page } from "@playwright/test"

type FixtureWikiNode = {
  nodeId: string
  slug: string
  title: string
  nodeType: string
  objectType: string
  subtype: string
  metadata: Record<string, unknown>
  relations?: Array<{
    id: string
    targetNodeId: string
    relationType: string
    status?: string
    source?: string
    direction: string
    confidence: number
    createdBy: string
    evidence?: { sourceRefId: string }
  }>
  processingProfile: string
  summary: string
  contentMarkdown: string
  tags: string[]
  status: string
  sourceRefs: Array<Record<string, unknown>>
  indexStatus: string
  owner: string
  incomingCount: number
  outgoingCount: number
  brokenLinkCount: number
  securityLevel: string
  version: number
  createdAt: string
  updatedAt: string
  lastIndexedAt?: string
}

type FixtureWikiLink = {
  linkId: string
  fromNodeId: string
  fromTitle: string
  toNodeId?: string
  toTitle?: string
  targetTitle: string
  relationType: "reference"
  resolved: boolean
}

const webPolicyRef = {
  id: "ref-web-service-fee",
  sourceId: "src-web-service-fee",
  sourceType: "web_page",
  sourceTitle: "Siemens service fee web page",
  sourceName: "Siemens service fee web page",
  sourceUrl: "https://www.siemens-home.example/service-fee",
  sourceRecordId: "WEB-SVC-FEE-2026",
  evidenceRange: "section#warranty-fee",
  confidence: 0.96,
  version: "2026.06",
}

const feishuPolicyRef = {
  id: "ref-feishu-policy",
  sourceId: "src-feishu-cc",
  sourceType: "feishu",
  sourceTitle: "CC 售后政策飞书空间",
  sourceName: "CC 售后政策飞书空间",
  sourceUrl: "https://feishu.example.com/wiki/after-sales",
  paragraphRef: "P-26",
  confidence: 0.93,
  version: "2026.06",
}

const productMasterRef = {
  id: "ref-db-product-master",
  sourceId: "src-db-product-master",
  sourceType: "database",
  sourceTitle: "PIM 产品主数据表",
  sourceName: "PIM 产品主数据表",
  sourceRecordId: "PIM-WM14U",
  evidenceRange: "product_master.model_code=WM14U",
  confidence: 0.98,
  version: "2026.06",
}

const manualRef = {
  id: "ref-manual-wm14u",
  sourceId: "src-pdf-wm14u-manual",
  sourceType: "pdf",
  sourceTitle: "WM14U 用户手册 PDF",
  sourceName: "WM14U 用户手册 PDF",
  sourceUrl: "https://assets.example.com/manuals/wm14u.pdf",
  evidenceRange: "p.1-p.48",
  confidence: 0.97,
  version: "2026.06",
}

const partCatalogRef = {
  id: "ref-api-part-catalog",
  sourceId: "src-api-part-catalog",
  sourceType: "api",
  sourceTitle: "Spare Part Catalog API",
  sourceName: "Spare Part Catalog API",
  sourceUrl: "https://api.example.com/parts/catalog",
  sourceRecordId: "parts:model=WM14U",
  evidenceRange: "items[0..42]",
  confidence: 0.94,
  version: "2026.06",
}

function node(input: Omit<FixtureWikiNode, "owner" | "securityLevel" | "version" | "createdAt" | "updatedAt"> & Partial<Pick<FixtureWikiNode, "owner" | "securityLevel" | "version" | "createdAt" | "updatedAt">>): FixtureWikiNode {
  return {
    owner: "Knowledge Ops",
    securityLevel: "internal",
    version: 1,
    createdAt: "2026-06-01",
    updatedAt: "2026-06-22",
    ...input,
  }
}

export const wikiNodeApiFixtureNodes: FixtureWikiNode[] = [
  node({
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
      lifecycleStatus: "published",
    },
    relations: [
      { id: "rel-wn001-wn002", targetNodeId: "wn-002", relationType: "has_policy", direction: "outgoing", confidence: 0.92, createdBy: "system", evidence: { sourceRefId: "ref-web-service-fee" } },
      { id: "rel-wn001-wn003", targetNodeId: "wn-003", relationType: "references", direction: "outgoing", confidence: 0.88, createdBy: "system", evidence: { sourceRefId: "ref-web-service-fee" } },
    ],
    processingProfile: "web_article_policy_v1",
    summary: "定义保修期内维修免费范围、收费例外和凭证要求。",
    contentMarkdown: "## 适用范围\n\n保修期内的产品故障原则上提供免费维修。\n\n保修期外维修请参考 [[收费政策]]。\n如涉及人为损坏，请参考 [[人为损坏判定规则]]。\n如客户无法提供购买凭证，请参考 [[购买凭证规则]]。",
    tags: ["保修", "售后", "收费", "凭证"],
    status: "published",
    sourceRefs: [{ ...webPolicyRef, paragraphRef: "P-12" }],
    indexStatus: "indexed",
    incomingCount: 1,
    outgoingCount: 3,
    brokenLinkCount: 0,
    lastIndexedAt: "2026-06-20 10:42",
  }),
  node({
    nodeId: "wn-002",
    slug: "wn-002",
    title: "收费政策",
    nodeType: "policy",
    objectType: "Article",
    subtype: "policy",
    metadata: { brand: "Siemens", businessDomain: "after_sales", lifecycleStatus: "published" },
    processingProfile: "web_article_policy_v1",
    summary: "说明上门、检测、维修材料、保外维修等收费规则。",
    contentMarkdown: "## 收费场景\n\n保外维修、非质量问题、客户原因导致的二次上门可能产生费用。",
    tags: ["收费", "保外"],
    status: "published",
    sourceRefs: [{ sourceId: "src-excel-fee", sourceType: "excel", sourceTitle: "维修收费标准 Excel" }],
    indexStatus: "indexed",
    incomingCount: 3,
    outgoingCount: 0,
    brokenLinkCount: 0,
  }),
  node({
    nodeId: "wn-003",
    slug: "wn-003",
    title: "人为损坏判定规则",
    nodeType: "procedure",
    objectType: "Article",
    subtype: "procedure",
    metadata: { brand: "Siemens", businessDomain: "after_sales", lifecycleStatus: "published" },
    processingProfile: "feishu_article_v1",
    summary: "定义人为损坏的常见证据、判定口径和升级路径。",
    contentMarkdown: "## 判定依据\n\n外观破损、非正常使用痕迹、第三方拆修记录都可能影响免费维修资格。",
    tags: ["人为损坏", "判定"],
    status: "published",
    sourceRefs: [feishuPolicyRef],
    indexStatus: "indexed",
    incomingCount: 2,
    outgoingCount: 0,
    brokenLinkCount: 0,
  }),
  node({
    nodeId: "wn-006",
    slug: "wn-006",
    title: "洗衣机不脱水排查流程",
    nodeType: "troubleshooting",
    objectType: "Procedure",
    subtype: "troubleshooting_flow",
    metadata: { brand: "Siemens", productCategory: "washing_machine", scenario: "no_spin_troubleshooting" },
    processingProfile: "doc_troubleshooting_procedure_v1",
    summary: "面向客服的一线排查路径，覆盖负载、排水和人为因素。",
    contentMarkdown: "## 排查步骤\n\n先确认衣物负载是否过量，再确认排水管状态。\n\n若发现异常使用痕迹，请参考 [[人为损坏判定规则]]。\n排水异常还需参考 [[洗衣机排水规范]]。",
    tags: ["洗衣机", "不脱水", "排查"],
    status: "published",
    sourceRefs: [{ sourceId: "src-word-manual", sourceType: "word", sourceTitle: "产品说明书 Word" }],
    indexStatus: "failed",
    incomingCount: 0,
    outgoingCount: 2,
    brokenLinkCount: 1,
  }),
  node({
    nodeId: "wn-013",
    slug: "wn-013",
    title: "西门子 WM14U 洗衣机",
    nodeType: "product",
    objectType: "Product",
    subtype: "product_model",
    metadata: { brand: "Siemens", productCategory: "washing_machine", productSeries: "iQ500", modelCode: "WM14U", sourceKind: "database" },
    relations: [
      { id: "rel-wn013-wn015", targetNodeId: "wn-015", relationType: "has_manual", direction: "outgoing", confidence: 0.95, createdBy: "system", evidence: { sourceRefId: "ref-manual-wm14u" } },
      { id: "rel-wn013-wn014", targetNodeId: "wn-014", relationType: "has_part_catalog", direction: "outgoing", confidence: 0.91, createdBy: "system", evidence: { sourceRefId: "ref-api-part-catalog" } },
    ],
    processingProfile: "db_product_master_v1",
    summary: "西门子 WM14U 洗衣机产品主数据，连接手册、配件目录和服务知识包。",
    contentMarkdown: "## 产品主数据\n\nWM14U 属于西门子 iQ500 洗衣机系列。\n\n关联资料包括 [[WM14U 用户手册 PDF]]、[[洗衣机配件目录]] 和 [[WM14U 知识包]]。",
    tags: ["Siemens", "洗衣机", "产品型号", "WM14U"],
    status: "published",
    sourceRefs: [productMasterRef],
    indexStatus: "indexed",
    incomingCount: 1,
    outgoingCount: 3,
    brokenLinkCount: 0,
    lastIndexedAt: "2026-06-22 10:15",
  }),
  node({
    nodeId: "wn-014",
    slug: "wn-014",
    title: "洗衣机配件目录",
    nodeType: "product",
    objectType: "DataRecord",
    subtype: "spare_part_catalog",
    metadata: { brand: "Siemens", productCategory: "washing_machine", modelCode: "WM14U", sourceKind: "api" },
    relations: [
      { id: "rel-wn014-wn013", targetNodeId: "wn-013", relationType: "applies_to", direction: "outgoing", confidence: 0.91, createdBy: "system", evidence: { sourceRefId: "ref-api-part-catalog" } },
    ],
    processingProfile: "api_part_catalog_v1",
    summary: "用于客服和服务工程师查询 WM14U 相关备件、兼容关系和价格边界。",
    contentMarkdown: "## 配件目录\n\n配件目录来自服务系统 API。\n\n报价口径仍需参考 [[收费政策]]。",
    tags: ["配件", "目录", "WM14U"],
    status: "published",
    sourceRefs: [partCatalogRef],
    indexStatus: "indexed",
    incomingCount: 1,
    outgoingCount: 1,
    brokenLinkCount: 0,
    lastIndexedAt: "2026-06-22 10:16",
  }),
  node({
    nodeId: "wn-015",
    slug: "wn-015",
    title: "WM14U 用户手册 PDF",
    nodeType: "guide",
    objectType: "MediaAsset",
    subtype: "user_manual_pdf",
    metadata: { brand: "Siemens", productCategory: "washing_machine", modelCode: "WM14U", sourceKind: "pdf" },
    relations: [
      { id: "rel-wn015-wn013", targetNodeId: "wn-013", relationType: "applies_to", direction: "outgoing", confidence: 0.95, createdBy: "system", evidence: { sourceRefId: "ref-manual-wm14u" } },
    ],
    processingProfile: "pdf_manual_asset_v1",
    summary: "WM14U 用户手册 PDF 资产，作为产品知识和故障排查的证据来源。",
    contentMarkdown: "## 手册资产\n\n该 PDF 包含安装、使用、维护和故障提示。\n\n适用产品为 [[西门子 WM14U 洗衣机]]。",
    tags: ["PDF", "手册", "洗衣机", "WM14U"],
    status: "published",
    sourceRefs: [manualRef],
    indexStatus: "indexed",
    incomingCount: 2,
    outgoingCount: 1,
    brokenLinkCount: 0,
    lastIndexedAt: "2026-06-22 10:17",
  }),
  node({
    nodeId: "wn-016",
    slug: "wn-016",
    title: "WM14U 知识包",
    nodeType: "guide",
    objectType: "Collection",
    subtype: "model_knowledge_pack",
    metadata: { brand: "Siemens", productCategory: "washing_machine", modelCode: "WM14U", businessDomain: "knowledge_package" },
    relations: [
      { id: "rel-wn016-wn013", targetNodeId: "wn-013", relationType: "contains", direction: "outgoing", confidence: 0.9, createdBy: "user" },
      { id: "rel-wn016-wn015", targetNodeId: "wn-015", relationType: "contains", direction: "outgoing", confidence: 0.9, createdBy: "user" },
      { id: "rel-wn016-wn014", targetNodeId: "wn-014", relationType: "contains", direction: "outgoing", confidence: 0.9, createdBy: "user" },
    ],
    processingProfile: "manual_collection_v1",
    summary: "面向 WM14U 型号的知识包，聚合产品主数据、手册、配件目录和售后口径。",
    contentMarkdown: "## 知识包范围\n\n该知识包包含 [[西门子 WM14U 洗衣机]]、[[WM14U 用户手册 PDF]]、[[洗衣机配件目录]] 和售后服务口径。",
    tags: ["知识包", "WM14U", "产品知识"],
    status: "published",
    sourceRefs: [{ sourceId: "src-manual-package", sourceType: "manual_input", sourceTitle: "知识运营手工编排" }],
    indexStatus: "indexed",
    incomingCount: 1,
    outgoingCount: 3,
    brokenLinkCount: 0,
    lastIndexedAt: "2026-06-22 10:18",
  }),
]

export async function routeWikiNodeApiFixtures(page: Page, nodes = wikiNodeApiFixtureNodes) {
  await page.route("**/api/wiki-nodes", (route) => route.fulfill({ json: nodes }))

  await page.route("**/api/wiki-nodes/*/links", (route) => {
    const nodeId = routeParam(route.request().url(), 3)
    return route.fulfill({ json: buildOutgoingLinks(nodeId, nodes) })
  })

  await page.route("**/api/wiki-nodes/*/backlinks", (route) => {
    const nodeId = routeParam(route.request().url(), 3)
    return route.fulfill({ json: buildAllLinks(nodes).filter((link) => link.toNodeId === nodeId) })
  })

  await page.route("**/api/wiki-nodes/*", (route) => {
    const nodeId = routeParam(route.request().url(), 3)
    const match = nodes.find((item) => item.nodeId === nodeId || item.slug === nodeId)
    return match
      ? route.fulfill({ json: match })
      : route.fulfill({ status: 404, json: { message: "WikiNode not found" } })
  })

  await page.route("**/api/broken-links", (route) => {
    return route.fulfill({ json: buildAllLinks(nodes).filter((link) => !link.resolved) })
  })

  await page.route("**/api/wiki-graph/overview", (route) => route.fulfill({ json: graphOverview(nodes) }))

  await page.route("**/api/wiki-graph/ego/*", (route) => {
    const nodeId = routeParam(route.request().url(), 4)
    const egoNodes = nodes.filter((node) => node.nodeId === nodeId)
    return route.fulfill({ json: graphOverview(egoNodes.length ? egoNodes : nodes) })
  })
}

function routeParam(url: string, index: number) {
  return new URL(url).pathname.split("/")[index]
}

function buildAllLinks(nodes: FixtureWikiNode[]) {
  return nodes.flatMap((node) => buildOutgoingLinks(node.nodeId, nodes))
}

function buildOutgoingLinks(nodeId: string, nodes: FixtureWikiNode[]): FixtureWikiLink[] {
  const node = nodes.find((item) => item.nodeId === nodeId || item.slug === nodeId)
  if (!node) return []

  const referenceMap = new Map<string, FixtureWikiNode>()
  nodes.forEach((item) => {
    referenceMap.set(item.nodeId, item)
    referenceMap.set(item.slug, item)
    referenceMap.set(item.title, item)
  })

  return Array.from(node.contentMarkdown.matchAll(/\[\[([^\]]+)\]\]/g), (match, index) => {
    const targetTitle = match[1].split("|")[0].trim()
    const target = referenceMap.get(targetTitle)

    return {
      linkId: `${node.nodeId}-${index}-${targetTitle}`,
      fromNodeId: node.nodeId,
      fromTitle: node.title,
      toNodeId: target?.nodeId,
      toTitle: target?.title,
      targetTitle,
      relationType: "reference",
      resolved: Boolean(target),
    }
  })
}

function graphOverview(nodes: FixtureWikiNode[]) {
  const wikiLinks = buildAllLinks(nodes)
  return {
    nodes: nodes.map((node) => ({
      nodeId: node.nodeId,
      title: node.title,
      nodeType: node.nodeType,
      status: node.status,
      indexStatus: node.indexStatus,
      incomingCount: node.incomingCount,
      outgoingCount: node.outgoingCount,
      brokenLinkCount: node.brokenLinkCount,
    })),
    edges: wikiLinks.map((link) => ({
      edgeId: `edge-${link.linkId}`,
      fromNodeId: link.fromNodeId,
      toNodeId: link.toNodeId,
      targetTitle: link.targetTitle,
      relationType: link.relationType,
      resolved: link.resolved,
    })),
  }
}
