import { expect, test } from "@playwright/test"
import { routeIndexSegmentApi } from "./index-segment-api-fixtures"
import { mockSourceEvidenceApi } from "./source-api-fixtures"
import { routeWikiNodeApiFixtures } from "./wiki-node-api-fixtures"

const forbiddenProductTerms = /Chunk Management|Chat API|Chatbot|Agent Platform|Workflow Builder|Vector DB Management/i

test.describe("Frontend skeleton IA", () => {
  test.beforeEach(async ({ page }) => {
    await mockSourceEvidenceApi(page)
    await routeIndexSegmentApi(page)
    await routeWikiNodeApiFixtures(page)
  })

  test("sidebar exposes the complete product navigation groups", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByText("WikiNode Studio").first()).toBeVisible()
    await expect(page.getByText("平台", { exact: true })).toBeVisible()
    await expect(page.getByText("知识", { exact: true })).toBeVisible()
    await expect(page.getByText("治理", { exact: true })).toBeVisible()
    await expect(page.getByText("系统", { exact: true })).toBeVisible()

    for (const name of [
      "总览",
      "知识库",
      "知识节点",
      "知识图谱",
      "检索测试",
      "知识来源",
      "原始材料",
      "Index Segment",
      "发布与索引",
      "断链检查",
      "标签与元数据",
      "质量问题",
      "评测用例",
      "解析引擎",
      "存储引擎",
      "外部向量库配置",
      "设置",
      "管理",
    ]) {
      await expect(page.locator("a").filter({ hasText: name }).first()).toBeVisible()
    }
  })

  test("all skeleton routes render non-empty product pages", async ({ page }) => {
    test.setTimeout(45_000)

    const routes = [
      ["/", "总览"],
      ["/knowledge-bases", "知识库"],
      ["/knowledge-bases/kb-cc-after-sales", "CC After-sales KB 知识库详情"],
      ["/knowledge-bases/kb-cc-after-sales/settings", "知识库设置"],
      ["/sources", "知识来源"],
      ["/sources/src-feishu-cc", "知识来源详情"],
      ["/sources/sync-jobs", "同步任务"],
      ["/sources/sync-logs", "同步日志"],
      ["/raw-materials", "原始材料"],
      ["/raw-materials/rm-001", "原始材料详情"],
      ["/raw-materials/rm-001/parsed-result", "解析结果预览"],
      ["/wiki-nodes", "知识节点"],
      ["/wiki-nodes/wn-001", "保修期内维修服务政策"],
      ["/wiki-nodes/wn-001/detail", "WikiNode 详情"],
      ["/wiki-graph", "知识图谱"],
      ["/broken-links", "断链检查"],
      ["/backlinks", "反向链接"],
      ["/impact-analysis", "影响分析"],
      ["/index-segments", "Index Segment"],
      ["/index-segments/strategy", "片段策略"],
      ["/index-segments/debug", "片段调试"],
      ["/publishing", "发布与索引"],
      ["/index-status", "索引状态"],
      ["/vector-sync", "外部向量库同步"],
      ["/index-jobs", "索引任务"],
      ["/retrieval-test", "检索测试"],
      ["/retrieval-debug", "召回调试"],
      ["/retrieval-api-docs", "Retrieval API 文档"],
      ["/query-logs", "查询日志"],
      ["/evaluation-cases", "评测用例"],
      ["/tags", "标签与元数据"],
      ["/node-types", "节点类型"],
      ["/metadata-fields", "元数据字段"],
      ["/quality-issues", "质量问题"],
      ["/conflicts", "冲突检测"],
      ["/expired-knowledge", "过期知识"],
      ["/duplicates", "重复知识"],
      ["/retrieval-evaluation", "召回评测"],
      ["/system/parser-engine", "解析引擎"],
      ["/system/storage-engine", "存储引擎"],
      ["/system/vector-store", "外部向量库配置"],
      ["/system/embedding-config", "向量模型配置"],
      ["/system/health", "系统健康"],
      ["/settings", "设置"],
      ["/admin/users", "用户"],
      ["/admin/roles", "角色"],
      ["/admin/permissions", "权限"],
      ["/admin/audit-logs", "审计日志"],
    ] as const

    for (const [route, heading] of routes) {
      await page.goto(route)
      await expect(page.getByRole("heading", { name: heading })).toBeVisible()
      await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
      await expect(page.getByText("Request failed")).toHaveCount(0)
    }
  })

  test("detail and admin skeleton pages render mapped Chinese statuses", async ({ page }) => {
    await page.goto("/sources/src-feishu-cc")
    await expect(page.getByText("来源类型")).toBeVisible()
    await expect(page.getByText("飞书文档")).toBeVisible()
    await expect(page.getByText("同步状态")).toBeVisible()
    await expect(page.getByText("已同步")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/\bsynced\b|\bfeishu\b/i)

    await page.goto("/raw-materials")
    await expect(page.getByText("解析完成").first()).toBeVisible()
    await expect(page.getByText("解析失败")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/\bfailed\b|\bparsing\b|\bnot_parsed\b/i)

    await page.goto("/raw-materials/rm-001")
    await expect(page.getByText("解析状态", { exact: true })).toBeVisible()
    await expect(page.getByText("解析完成")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/\bparseStatus\b|\bnot_parsed\b|\bparsing\b|\bfailed\b/i)

    await page.goto("/raw-materials/rm-002")
    await expect(page.getByText("存储位置")).toBeVisible()
    await expect(page.getByText("对象存储")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/\bobject-storage\b|\bworkspace\b/i)

    await page.goto("/knowledge-bases/kb-cc-after-sales")
    await expect(page.getByText("索引健康度")).toBeVisible()
    await expect(page.getByText("需关注")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/\bhealthy\b|\bwarning\b|\bfailed\b/i)

    await page.goto("/wiki-nodes/wn-001/detail")
    await expect(page.getByText("发布状态")).toBeVisible()
    await expect(page.getByText("已发布")).toBeVisible()
    await expect(page.getByText("索引状态")).toBeVisible()
    await expect(page.getByText("已索引")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/\bpublished\b|\bindexed\b/i)

    await page.goto("/node-types")
    await expect(page.getByText("政策")).toBeVisible()
    await expect(page.getByText("流程")).toBeVisible()
    await expect(page.getByText("指南")).toBeVisible()
    await expect(page.getByText("收费规则")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/\bpolicy\b|\bprocedure\b|\bguide\b|\bfee_rule\b/i)

    await page.goto("/metadata-fields")
    await expect(page.getByText("业务域")).toBeVisible()
    await expect(page.getByText("品牌")).toBeVisible()
    await expect(page.getByText("产品品类")).toBeVisible()
    await expect(page.getByText("密级")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/\bbusinessDomain\b|\bproductCategory\b|\bsecurityLevel\b/)

    await page.goto("/admin/roles")
    await expect(page.getByText("知识负责人")).toBeVisible()
    await expect(page.getByText("编辑者")).toBeVisible()
    await expect(page.getByText("审核员")).toBeVisible()
    await expect(page.getByText("查看者")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/\bOwner\b|\bEditor\b|\bReviewer\b|\bViewer\b/)
  })

  test("Sources and Raw Materials explain current MVP boundaries", async ({ page }) => {
    await page.goto("/sources")
    await expect(page.getByText("Source 是原始知识的来源。")).toBeVisible()
    await expect(page.getByText("当前仅展示本地样例数据，不执行真实同步、上传或解析。")).toBeVisible()
    await expect(page.getByText("真实 Source import、文件上传和解析任务留到后续阶段。")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
    await expect(page.locator("main").last()).not.toContainText(/mock fallback|DTO|repository/i)

    await page.goto("/sources/src-feishu-cc")
    await expect(page.getByText("只读来源验收基线")).toBeVisible()
    await expect(page.getByText("不执行真实同步、授权连接或后台任务。")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)

    await page.goto("/raw-materials")
    await expect(page.getByText("Raw Material 是 Source 同步或上传后的原始快照。", { exact: true })).toBeVisible()
    await expect(page.getByText("当前不提供文件上传或重新解析。", { exact: true })).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)

    await page.goto("/raw-materials/rm-001")
    await expect(page.getByText("仅展示原始材料元数据和解析状态。")).toBeVisible()
    await expect(page.getByText("不提供下载、重新解析或真实存储访问。")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)

    await page.goto("/raw-materials/rm-001/parsed-result")
    await expect(page.getByText("Parsed Document 是解析后的标准化内容预览。", { exact: true })).toBeVisible()
    await expect(page.getByText("当前不运行 PDF / Word / 网页 / 数据库 / API 解析。", { exact: true })).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
  })

  test("index status shows Chinese empty state for groups without nodes", async ({ page }) => {
    await page.goto("/index-status")

    await expect(page.getByText("暂无该状态的知识节点。").first()).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)
  })

  test("Index Segments and Retrieval Test keep WikiNode-centered language", async ({ page }) => {
    await page.goto("/index-segments")

    await expect(page.getByRole("heading", { name: "Index Segment" })).toBeVisible()
    await expect(page.getByText("Index Segment 是从 WikiNode / Knowledge Object 生成的受控索引和召回单元")).toBeVisible()
    await expect(page.getByText("SEG-001")).toBeVisible()
    await expect(page.getByRole("cell", { name: "保修期内维修服务政策" }).first()).toBeVisible()
    await expect(page.getByText(/Chunk Management/i)).toHaveCount(0)

    await page.goto("/retrieval-test")
    await expect(page.getByText("Retrieval API 返回知识节点，调试模式仅展示命中的索引片段证据。")).toBeVisible()
    await page.getByLabel("调试模式").click()
    await page.getByRole("button", { name: "检索" }).click()
    await expect(page.getByText("命中的 Index Segment").first()).toBeVisible()
    await expect(page.getByText("SEG-").first()).toBeVisible()
  })

  test("IM051 back-half pages explain publishing, metadata governance, and admin boundaries", async ({ page }) => {
    await page.goto("/publishing")
    await expect(page.getByRole("heading", { name: "发布与索引" })).toBeVisible()
    await expect(page.getByText("发布前只读检查")).toBeVisible()
    await expect(page.getByText("不会执行发布、审批、回滚、批量发布或外部向量同步。")).toBeVisible()
    await expect(page.getByText("Index Segment 生成状态")).toBeVisible()
    await expect(page.getByText("外部向量库同步边界")).toBeVisible()
    await expect(page.getByRole("button", { name: /发布|审批|回滚|同步|重试|批量/ })).toHaveCount(0)
    await expect(page.locator("main").last()).not.toContainText(forbiddenProductTerms)

    await page.goto("/index-status")
    await expect(page.getByText("索引状态说明")).toBeVisible()
    await expect(page.getByText("索引失败：需要查看失败原因，但本页不执行重试。")).toBeVisible()
    await expect(page.getByText("待更新：WikiNode 已变化，需要重新生成或同步 Index Segment。")).toBeVisible()
    await expect(page.getByText("未索引：尚未进入发布或索引流程。")).toBeVisible()

    await page.goto("/tags")
    await expect(page.getByText("标签治理基线")).toBeVisible()
    await expect(page.getByText("标签用于筛选、检索和 Index Segment metadata。")).toBeVisible()
    await expect(page.getByText("当前不提供创建、合并、删除或批量打标签。")).toBeVisible()

    await page.goto("/metadata-fields")
    await expect(page.getByText("元数据字段治理基线")).toBeVisible()
    await expect(page.getByText("字段意图、校验规则、索引参与和检索参与在这里说明。")).toBeVisible()
    await expect(page.getByText("当前不保存字段配置，不修改 Knowledge Object 模型。")).toBeVisible()

    await page.goto("/admin/roles")
    await expect(page.getByText("角色规划基线")).toBeVisible()
    await expect(page.getByText("角色仅说明协作分工，不做权限 enforcement。")).toBeVisible()

    await page.goto("/admin/permissions")
    await expect(page.getByText("权限维度规划基线")).toBeVisible()
    await expect(page.getByText("当前不做鉴权、授权、审批或后端 RBAC。")).toBeVisible()

    await page.goto("/admin/audit-logs")
    await expect(page.getByText("审计证据规划基线")).toBeVisible()
    await expect(page.getByText("当前不写入真实审计日志，不提供导出或删除操作。")).toBeVisible()
    await expect(page.locator("main").last()).not.toContainText(/auth enforcement|RBAC backend|audit persistence/i)
  })

  test("WikiNode editor inspector includes Segments tab", async ({ page }) => {
    await page.goto("/wiki-nodes/wn-001")

    await expect(page.getByRole("heading", { name: "保修期内维修服务政策" })).toBeVisible()
    await expect(page.getByTestId("wikinode-editor-workspace")).toBeVisible()
    await expect(page.getByTestId("wikinode-explorer")).toBeVisible()
    await expect(page.getByTestId("wikinode-markdown-editor")).toBeVisible()
    await expect(page.getByTestId("wikinode-inspector")).toBeVisible()
    await expect(page.getByRole("tab", { name: "元数据" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "双链" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "来源" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "索引" })).toBeVisible()
    await page.getByRole("tab", { name: "片段" }).click()
    await expect(page.getByText("Index Segment 是 WikiNode 发布前生成的受控召回片段")).toBeVisible()
    await expect(page.getByText("SEG-001")).toBeVisible()
    await expect(page.getByText("Index Segment").nth(1)).toBeVisible()
    await expect(page.getByText(/Chunk Management/i)).toHaveCount(0)
  })

  test("WikiNode editor exposes Knowledge Object model metadata without changing Index Segment language", async ({ page }) => {
    await page.goto("/wiki-nodes/wn-001")

    await expect(page.getByTestId("wikinode-inspector")).toContainText("Knowledge Object")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("文章型知识")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("收费政策")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("web_article_policy_v1")

    await page.getByRole("tab", { name: "来源" }).click()
    await expect(page.getByTestId("wikinode-inspector")).toContainText("web_page")
    await expect(page.getByTestId("wikinode-inspector")).toContainText("可信度")

    await page.goto("/wiki-nodes")
    await expect(page.getByRole("link", { name: "西门子 WM14U 洗衣机" })).toBeVisible()
    await expect(page.getByRole("link", { name: "洗衣机配件目录" })).toBeVisible()

    await expect(page.locator("main").last()).not.toContainText(/Chunk Management/i)
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
