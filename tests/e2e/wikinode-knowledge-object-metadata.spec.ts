import { expect, test } from "@playwright/test"

const forbiddenProductTerms = /Chunk Management|Chat API|Chatbot|Agent Platform|Workflow Builder|Vector DB Management/i

test.describe("WikiNode Knowledge Object metadata surface", () => {
  test("detail page explains how WikiNode carries Knowledge Object fields", async ({ page }) => {
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
