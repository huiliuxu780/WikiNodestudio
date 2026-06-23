import { ApiError } from "@/services/api-client"
import type { WikiIndexStatus, WikiNodeStatus, WikiNodeType } from "@/types/wiki"

export const commonLabels = {
  all: "全部",
  none: "无",
  retry: "重试",
  loading: "加载中...",
  loadFailed: "加载失败",
  createSuccess: "创建成功",
  createFailed: "创建失败",
  saveSuccess: "保存成功",
  saveFailed: "保存失败",
  searchFailed: "检索失败",
  noMatchedNodes: "暂无匹配的知识节点",
}

export const actionLabels = {
  createWikiNode: "创建知识节点",
  creatingWikiNode: "创建中...",
  save: "保存",
  saving: "保存中...",
  search: "检索",
  searching: "检索中...",
  reset: "重置",
  backToWikiNodes: "返回知识节点",
  openWikiNode: "打开知识节点",
  testRetrieval: "测试检索",
}

export const nodeTypeLabels: Record<WikiNodeType, string> = {
  policy: "政策",
  procedure: "流程",
  faq: "常见问题",
  product: "产品",
  guide: "指南",
  troubleshooting: "故障处理",
  term: "术语",
}

export const statusLabels: Record<WikiNodeStatus, string> = {
  draft: "草稿",
  published: "已发布",
  archived: "已归档",
}

export const indexStatusLabels: Record<WikiIndexStatus, string> = {
  not_indexed: "未索引",
  indexed: "已索引",
  failed: "失败",
  outdated: "需更新",
}

export const sourceTypeLabels: Record<string, string> = {
  feishu: "飞书文档",
  pdf: "PDF",
  word: "Word",
  excel: "Excel",
  web: "网页",
  manual: "手工录入",
}

export const syncStatusLabels: Record<string, string> = {
  synced: "已同步",
  pending: "待同步",
  failed: "同步失败",
}

export const retrievalFieldLabels: Record<string, string> = {
  title: "标题",
  summary: "摘要",
  tags: "标签",
  contentMarkdown: "正文内容",
}

export const metadataLabels: Record<string, string> = {
  nodeId: "节点 ID",
  nodeType: "节点类型",
  status: "发布状态",
  createdAt: "创建时间",
  updatedAt: "更新时间",
  indexStatus: "索引状态",
  lastIndexedAt: "最后索引时间",
  paragraphRef: "段落位置",
  version: "版本",
  sourceUrl: "来源链接",
}

export function labelFromMap(labels: Record<string, string>, value: string) {
  return labels[value] ?? value
}

export function formatMatchedFields(fields: string[]) {
  return fields.map((field) => labelFromMap(retrievalFieldLabels, field)).join("、") || commonLabels.none
}

export function formatMatchedReason(reason: string) {
  const normalized = reason.trim().toLowerCase()
  if (normalized === "matched relevant wikinode content.") {
    return "命中相关知识节点内容。"
  }
  if (normalized === "returned as a related wikinode.") {
    return "作为相关知识节点返回。"
  }

  return reason
}

export function formatApiErrorMessage(error: Error) {
  const rawMessage = extractErrorMessage(error)
  const normalized = rawMessage.toLowerCase()

  if (normalized.includes("slug already exists")) {
    return "Slug 已存在，请更换后重试"
  }

  if (normalized.includes("failed to load api data") || normalized.includes("failed to fetch")) {
    return "加载失败，请确认后端服务可用后重试"
  }

  if (error instanceof ApiError && error.status === 404) {
    return "请求的数据不存在，请刷新后重试"
  }

  if (error instanceof ApiError && error.status >= 500) {
    return "服务暂时不可用，请稍后重试"
  }

  return rawMessage
}

export function formatOperationError(action: "create" | "save" | "search" | "load", error: Error) {
  const prefix = {
    create: commonLabels.createFailed,
    save: commonLabels.saveFailed,
    search: commonLabels.searchFailed,
    load: commonLabels.loadFailed,
  }[action]

  return `${prefix}：${formatApiErrorMessage(error)}`
}

function extractErrorMessage(error: Error) {
  if (error instanceof ApiError) {
    const bodyMessage = extractApiMessage(error.body)
    return bodyMessage ?? error.message
  }

  return error.message
}

function extractApiMessage(body: unknown) {
  if (!body || typeof body !== "object" || !("message" in body)) {
    return null
  }

  const message = body.message
  return typeof message === "string" ? message : null
}
