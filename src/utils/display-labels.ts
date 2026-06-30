import { ApiError } from "@/services/api-client"
import type { KnowledgeObjectType, WikiIndexStatus, WikiNode, WikiNodeStatus, WikiNodeType } from "@/types/wiki"

export const commonLabels = {
  all: "全部",
  none: "无",
  retry: "重试",
  loading: "加载中...",
  loadingWikiNodes: "正在加载知识节点...",
  loadFailed: "加载失败",
  emptyWikiNodes: "暂无知识节点",
  adjustFilters: "请调整搜索或筛选条件后重试。",
  createSuccess: "创建成功",
  createFailed: "创建失败",
  saveSuccess: "保存成功",
  saveFailed: "保存失败",
  publishSuccess: "发布状态已在本地更新",
  reindexSuccess: "重新索引状态已在本地更新",
  localPublishOnly: "当前任务不调用真实发布服务。",
  localReindexOnly: "当前任务不调用真实索引服务。",
  searchFailed: "检索失败",
  searchComplete: "检索完成",
  noMatchedNodes: "暂无匹配的知识节点，请调整问题、筛选条件或返回数量后重试。",
  backendUnavailable: "后端服务不可用，请确认服务启动后重试",
  unknownError: "未知错误，请稍后重试",
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
  publish: "发布",
  reindex: "重新索引",
  debugMode: "调试模式",
}

export const nodeTypeLabels: Record<WikiNodeType, string> = {
  policy: "政策",
  procedure: "流程",
  faq: "常见问题",
  product: "产品",
  guide: "指南",
  troubleshooting: "故障处理",
  term: "术语",
  fee_rule: "收费规则",
  regulation: "合规制度",
  notice: "通知",
}

export const statusLabels: Record<WikiNodeStatus, string> = {
  draft: "草稿",
  published: "已发布",
  archived: "已归档",
}

export const objectTypeLabels: Record<KnowledgeObjectType, string> = {
  Article: "文章型知识",
  Product: "产品知识",
  Procedure: "流程知识",
  DataRecord: "数据记录",
  MediaAsset: "媒体资产",
  Collection: "知识集合",
  ExternalSource: "外部来源",
  Rule: "规则知识",
}

export const subtypeLabels: Record<string, string> = {
  service_fee_policy: "收费政策",
  fee_policy: "收费政策",
  warranty_policy: "保修政策",
  repair_policy: "维修政策",
  service_script: "服务话术",
  faq: "常见问题",
  procedure: "流程",
  term: "术语",
  product_model: "产品型号",
  product_category: "产品品类",
  troubleshooting_flow: "故障处理流程",
  installation_flow: "安装流程",
  service_operation_process: "服务作业流程",
  spare_part_catalog: "配件目录",
  fee_table: "收费表",
  bom_table: "BOM 表",
  compatibility_table: "兼容性表",
  user_manual_pdf: "用户手册 PDF",
  product_material: "产品素材",
  training_material: "培训素材",
  model_knowledge_pack: "型号知识包",
  category_knowledge_pack: "品类知识包",
  fee_rule: "收费规则",
  applicability_rule: "适用性规则",
}

export const indexStatusLabels: Record<WikiIndexStatus, string> = {
  not_indexed: "未索引",
  indexing: "索引中",
  indexed: "已索引",
  failed: "索引失败",
  outdated: "待更新",
  deleted: "已删除",
}

export const linkStatusLabels: Record<string, string> = {
  resolved: "已解析",
  broken: "异常",
  unresolved: "未解析",
}

export const sourceTypeLabels: Record<string, string> = {
  feishu: "飞书文档",
  pdf: "PDF",
  word: "Word",
  excel: "Excel",
  web: "网页",
  web_page: "网页",
  manual: "手工录入",
  manual_input: "手工录入",
  api: "API",
  database: "数据库",
  legacy_kb: "历史知识库",
  image: "图片",
  video: "视频",
  file: "文件",
  pim: "PIM",
  dam: "DAM",
  crm: "CRM",
}

export const syncStatusLabels: Record<string, string> = {
  not_configured: "未配置",
  synced: "已同步",
  pending: "待同步",
  failed: "同步失败",
  disabled: "已停用",
}

export const parseStatusLabels: Record<string, string> = {
  not_parsed: "未解析",
  queued: "等待解析",
  parsing: "解析中",
  parsed: "解析完成",
  failed: "解析失败",
  skipped: "已跳过",
}

export const sourceOperationTypeLabels: Record<string, string> = {
  source_sync: "来源同步",
  file_upload: "文件上传",
  import_source_file: "文件接入",
  raw_material_capture: "快照采集",
  parse_raw_material: "解析 Raw Material",
  retry_parse: "重新解析",
  suggest_wikinode: "建议 WikiNode",
  source_ingestion_run: "生成 WikiNode 建议",
}

export const sourceOperationStatusLabels: Record<string, string> = {
  queued: "等待中",
  running: "运行中",
  succeeded: "已完成",
  failed: "解析失败",
  cancelled: "已取消",
  skipped: "已跳过",
}

export const draftWikiNodeSuggestionStatusLabels: Record<string, string> = {
  draft: "待审核",
  needs_review: "需要复核",
  accepted: "已采纳",
  rejected: "已拒绝",
  superseded: "已替换",
}

export const draftWikiNodeSuggestionConflictLabels: Record<string, string> = {
  none: "未发现冲突",
  title_match: "标题可能重复",
  source_ref_match: "证据来源可能重复",
  existing_suggestion: "已存在待审核建议",
  accepted_before: "已采纳过相关建议",
}

export const relationCandidateSourceLabels: Record<string, string> = {
  inferred_from_source_ref: "来源证据推断",
  parsed_document_heading: "解析标题推断",
  manual_review_note: "人工复核备注",
}

export const rawMaterialTypeLabels: Record<string, string> = {
  file: "文件",
  document_snapshot: "文档快照",
  html_snapshot: "网页快照",
  table_extract: "表格抽取",
  manual_record: "手工记录",
  api_payload: "API 数据",
  database_rowset: "数据库结果集",
}

export const contentFormatLabels: Record<string, string> = {
  markdown: "Markdown",
  structured_table: "结构化表格",
  json: "JSON",
  plain_text: "纯文本",
  mixed: "混合内容",
}

export const locatorTypeLabels: Record<string, string> = {
  document: "文档",
  paragraph: "段落",
  page: "页码",
  row: "行",
  cell: "单元格",
  heading: "标题",
  range: "范围",
  timestamp: "时间点",
  record: "记录",
}

export const userRoleLabels: Record<string, string> = {
  owner: "知识负责人",
  editor: "编辑者",
  reviewer: "审核员",
  viewer: "查看者",
  admin: "管理员",
}

export const userStatusLabels: Record<string, string> = {
  active: "已启用",
  invited: "已邀请",
  disabled: "已停用",
}

export const healthLabels: Record<string, string> = {
  healthy: "健康",
  warning: "需关注",
  failed: "异常",
}

export const knowledgeBaseStatusLabels: Record<string, string> = {
  active: "已启用",
  disabled: "已停用",
  archived: "已归档",
}

export const knowledgeBaseVisibilityLabels: Record<string, string> = {
  internal: "内部可见",
  private: "私有",
  public: "公开",
}

export const knowledgeBaseTypeLabels: Record<string, string> = {
  wikinode: "WikiNode 知识库",
  document: "文档知识库",
  faq: "问答知识库",
  mixed: "混合知识库",
}

export const knowledgeBaseSettingLabels: Record<string, string> = {
  defaultNodeType: "默认节点类型",
  defaultParserEngine: "默认解析引擎",
  defaultStorageProvider: "默认存储",
  defaultVectorStore: "外部向量库",
  defaultPublishingPolicy: "发布策略",
  defaultRetrievalStrategy: "默认召回策略",
  wikinode_first: "WikiNode 优先",
  manual: "人工发布",
  workspace: "工作区快照",
  object_storage: "对象存储",
  external_vector_store: "外部向量库",
  markdown: "Markdown",
  pdf_manual_article_v1: "PDF 手册解析",
}

export const storageProviderLabels: Record<string, string> = {
  workspace: "工作区快照",
  local_workspace: "本地工作区",
  "object-storage": "对象存储",
  object_storage: "对象存储",
  external_reference: "外部引用",
}

export const retrievalStatusLabels: Record<string, string> = {
  success: "检索完成",
  empty: "没有检索结果",
  failed: "检索失败",
  loading: "检索中",
}

export const reviewStatusLabels: Record<NonNullable<WikiNode["reviewStatus"]>, string> = {
  not_required: "无需审核",
  pending: "待审核",
  approved: "已通过",
  rejected: "已驳回",
}

export const publishStatusLabels: Record<NonNullable<WikiNode["publishStatus"]>, string> = {
  not_published: "未发布",
  published: "已发布",
  unpublished: "已取消发布",
}

export const securityLevelLabels: Record<NonNullable<WikiNode["securityLevel"]>, string> = {
  public: "公开",
  internal: "内部",
  confidential: "机密",
}

export const retrievalFieldLabels: Record<string, string> = {
  title: "标题",
  summary: "摘要",
  tags: "标签",
  contentMarkdown: "正文内容",
}

export const metadataLabels: Record<string, string> = {
  nodeId: "节点 ID",
  slug: "Slug",
  nodeType: "节点类型",
  objectType: "Knowledge Object 类型",
  subtype: "业务子类型",
  processingProfile: "处理策略",
  status: "发布状态",
  reviewStatus: "审核状态",
  publishStatus: "发布状态",
  businessDomain: "业务域",
  brand: "品牌",
  productCategory: "产品品类",
  scenario: "场景",
  owner: "负责人",
  securityLevel: "密级",
  effectiveDate: "生效日期",
  expiredDate: "失效日期",
  createdAt: "创建时间",
  updatedAt: "更新时间",
  indexStatus: "索引状态",
  lastIndexedAt: "最后索引时间",
  paragraphRef: "段落位置",
  version: "版本",
  sourceUrl: "来源链接",
  sourceType: "来源类型",
  sourceRecordId: "来源记录",
  snapshotId: "快照 ID",
  snapshotTime: "快照时间",
  evidenceRange: "证据范围",
  syncJobId: "同步任务",
  confidence: "可信度",
  vectorDocId: "向量文档 ID",
  tokenCount: "Token 数",
  enabled: "是否启用",
  retrievalHits: "召回次数",
  avgScore: "平均分",
}

export const relationTypeLabels: Record<string, string> = {
  references: "引用",
  reference: "引用",
  derived_from: "派生自",
  applies_to: "适用于",
  contains: "包含",
  part_of: "属于",
  replaces: "替代",
  overrides: "覆盖",
  conflicts_with: "冲突",
  depends_on: "依赖",
  excludes: "排除",
  similar_to: "相似",
  parent_of: "父级",
  used_by: "被使用",
  explains: "解释",
  has_manual: "关联手册",
  has_part_catalog: "关联配件目录",
  has_policy: "关联政策",
  has_asset: "关联素材",
  related_to: "相关",
  broken_wikilink: "异常 WikiLink",
}

export const relationStatusLabels: Record<string, string> = {
  active: "有效",
  broken: "断链",
  pending_review: "待确认",
  rejected: "已驳回",
}

export const relationSourceLabels: Record<string, string> = {
  markdown_link: "正文双链",
  manual: "人工添加",
  import: "导入生成",
  system: "系统生成",
  api: "API 写入",
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

  if (
    normalized.includes("failed to load api data") ||
    normalized.includes("failed to fetch") ||
    normalized === "load failed"
  ) {
    return commonLabels.backendUnavailable
  }

  if (error instanceof ApiError && error.status === 404) {
    return "请求的数据不存在，请刷新后重试"
  }

  if (error instanceof ApiError && error.status >= 500) {
    return "服务暂时不可用，请稍后重试"
  }

  return rawMessage || commonLabels.unknownError
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
