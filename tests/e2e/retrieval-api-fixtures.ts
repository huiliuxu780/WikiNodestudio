import type { Page } from "@playwright/test"

const retrievalNode = {
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
  contentMarkdown: "保修期内维修原则上免费，收费例外需参考服务收费标准。",
  tags: ["保修", "售后"],
  status: "published",
  sourceRefs: [{ sourceId: "src-feishu-cc", sourceType: "feishu", sourceTitle: "CC 售后政策飞书空间" }],
  indexStatus: "indexed",
  incomingCount: 0,
  outgoingCount: 1,
  brokenLinkCount: 0,
  owner: "Knowledge Ops",
  version: 1,
  createdAt: "2026-06-26",
  updatedAt: "2026-06-26",
}

export async function routeRetrievalApiFixtures(page: Page) {
  await page.route("**/api/retrieval-test", async (route) => {
    if (route.request().method() !== "POST") return route.fallback()

    const request = route.request().postDataJSON() as { query?: string; filters?: { status?: string }; debug?: boolean }
    if (request.query?.includes("zzzz-no-result") || request.filters?.status === "archived") {
      return route.fulfill({ json: [] })
    }

    return route.fulfill({
      json: [{
        node: retrievalNode,
        score: 0.92,
        matchedReason: "Matched relevant WikiNode content.",
        matchedFields: ["title", "summary"],
        incomingLinks: [],
        outgoingLinks: [{
          linkId: "fixture-link-001",
          fromNodeId: "wn-001",
          fromTitle: "保修政策",
          toNodeId: "wn-002",
          toTitle: "收费政策",
          targetTitle: "收费政策",
          relationType: "reference",
          resolved: true,
        }],
        matchedSegments: request.debug ? [{
          segmentId: "SEG-001",
          nodeId: "wn-001",
          segmentType: "summary",
          score: 0.87,
          contentPreview: "保修期内产品故障的维修原则和例外条件。",
          sourceRefIds: ["src-feishu-cc"],
          metadataSummary: [{ label: "objectType", value: "Article" }],
        }] : undefined,
      }],
    })
  })

  await page.route("**/api/retrieval-test/logs", (route) => route.fulfill({
    json: [{
      logId: "log-fixture-001",
      query: "洗碗机保修期内维修收费吗？",
      filters: {},
      returnedNodeIds: ["wn-001"],
      matchedSegmentIds: ["SEG-001"],
      latencyMs: 42,
      status: "succeeded",
      createdAt: "2026-06-27",
    }],
  }))

  await page.route("**/api/retrieval-test/evaluation-cases", async (route) => {
    if (route.request().method() === "POST") {
      const request = route.request().postDataJSON() as { caseId?: string; query: string; filters: Record<string, unknown>; topK: number; expectedNodeIds: string[] }

      return route.fulfill({
        json: {
          caseId: request.caseId ?? "eval-fixture-001",
          query: request.query,
          filters: request.filters,
          topK: request.topK,
          expectedNodeIds: request.expectedNodeIds,
          runResult: {
            returnedNodeIds: request.expectedNodeIds,
            matchedSegmentIds: ["SEG-001"],
            status: "passed",
            summary: "命中预期 WikiNode。",
          },
          createdAt: "2026-06-27",
          updatedAt: "2026-06-27",
        },
      })
    }

    return route.fulfill({ json: [] })
  })
}
