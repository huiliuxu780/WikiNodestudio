# WikiNode Studio 全量功能清单 v0.2

## 1. 产品定位

WikiNode Studio 是一个面向企业知识治理和知识召回的知识资产平台。

它不是 Agent 平台，不是 Chatbot，不是 Workflow，也不是向量数据库。

它位于企业知识源和现有向量知识库之间，负责把多源原始知识整理成标准 WikiNode，并通过双链、Index Segment、发布、索引和 Retrieval API，为外部 Agent、坐席系统或业务系统提供可控、可追溯的知识召回能力。

整体链路：

```text
多源知识
  ↓
知识源接入 / 解析 / 标准化
  ↓
WikiNode 知识资产层
  ↓
双链 / 图谱 / 版本 / 发布 / Index Segment
  ↓
阿里云 / 火山引擎 / 其他向量知识库
  ↓
Retrieval API
  ↓
外部 Agent / 坐席辅助 / 业务系统
```

核心原则：

```text
业务用户管理 WikiNode
系统管理 Index Segment
外部向量库负责底层向量存储和相似度检索
Retrieval API 返回 WikiNode，而不是裸 chunk
```

---

## 2. 核心概念定义

### 2.1 Knowledge Base

知识库，是一组 WikiNode、知识源、索引配置、召回配置和权限范围的集合。

示例：

```text
CC After-sales Knowledge Base
Product Guide Knowledge Base
Policy Sandbox
```

---

### 2.2 Source

知识源，是原始知识的来源。

可以包括：

```text
飞书文档
PDF
Word
Excel
网页
数据库
API
历史知识库
工单
通话文本
VOC 数据
人工录入
```

---

### 2.3 Raw Material

原始材料，是从 Source 中同步或上传后保留下来的原始内容。

例如：

```text
原始 PDF 文件
飞书文档快照
网页 HTML 快照
Excel 原表
Word 文档
```

---

### 2.4 Parsed Document

解析文档，是原始材料经过解析引擎处理后的标准化内容。

例如：

```text
Markdown
结构化表格
图片引用
段落
标题层级
source_refs
```

---

### 2.5 WikiNode

WikiNode 是平台的核心知识资产单元。

它不是原始文档，也不是向量库 chunk，而是企业可管理、可编辑、可发布、可追溯的标准知识节点。

示例：

```text
保修期内维修服务政策
收费政策
人为损坏判定规则
洗碗机上门服务流程
洗衣机不脱水排查流程
```

---

### 2.6 WikiLink

WikiLink 是 WikiNode 之间的双链关系。

例如：

```text
保修期内维修服务政策 → 收费政策
保修期内维修服务政策 → 人为损坏判定规则
洗碗机上门服务流程 → 保修期内维修服务政策
```

Markdown 中可通过以下语法表达：

```markdown
保修期外维修请参考 [[收费政策]]。
如涉及人为损坏，请参考 [[人为损坏判定规则]]。
```

---

### 2.7 Index Segment

Index Segment 是 WikiNode 发布到向量库之前，由平台主动生成的可控索引片段。

重要定义：

```text
本系统不管理外部向量数据库内部自动生成的 chunk。
本系统只管理 WikiNode 发布前生成的 Index Segment。
Index Segment 是可控召回单元，必须保留 nodeId。
Retrieval API 命中 Segment 后，需要回查并返回 WikiNode。
```

关系如下：

```text
WikiNode
  ↓
Index Segment
  ↓
Vector Store
  ↓
Retrieval API
  ↓
WikiNode Result
```

不要叫 Chunk 管理，统一叫：

```text
Index Segment 管理
索引片段管理
召回片段管理
```

---

### 2.8 Retrieval API

Retrieval API 是平台对外提供的知识召回接口。

它不负责生成答案，只负责返回可引用的 WikiNode。

示例：

```http
POST /api/knowledge/retrieve
```

返回结果必须以 WikiNode 为核心对象。

---

## 3. 全量一级功能模块

完整平台包含以下一级模块：

```text
1. Overview 工作台
2. Knowledge Base 知识库
3. Sources 知识源
4. Raw Materials / Parsed Documents 原始材料与解析结果
5. Parser / Storage / Normalization 解析、存储与标准化
6. WikiNode 管理
7. WikiLink / Backlinks / Wiki Graph 双链与图谱
8. Index Segment 管理
9. Publishing / Index / Vector Sync 发布、索引与向量库同步
10. Retrieval API / Retrieval Test 知识召回
11. Tags / Metadata / Classification 标签、元数据与分类体系
12. Quality / Evaluation 知识质量与召回评测
13. System Config 系统配置
14. Users / Roles / Permissions / Audit 用户、权限与审计
```

---

## 4. 页面总清单

```text
WikiNode Studio
├── Overview
│
├── Knowledge Bases
│   ├── Knowledge Base List
│   ├── Knowledge Base Detail
│   ├── Create / Edit Knowledge Base
│   ├── Knowledge Base Settings
│   └── Copy / Move Knowledge Base
│
├── Sources
│   ├── Source List
│   ├── Create Source
│   ├── Source Detail
│   ├── Sync Jobs
│   ├── Sync Logs
│   └── Source Snapshots
│
├── Raw Materials
│   ├── Raw Material List
│   ├── Raw Material Detail
│   ├── File Preview
│   ├── Parsed Result Preview
│   └── Re-parse
│
├── WikiNodes
│   ├── WikiNode List
│   ├── WikiNode Editor
│   ├── WikiNode Detail
│   ├── Markdown Preview
│   ├── Version History
│   ├── Diff View
│   └── Batch Operations
│
├── Links & Graph
│   ├── WikiLink List
│   ├── Backlinks
│   ├── Broken Links
│   ├── Wiki Graph
│   └── Impact Analysis
│
├── Index Segments
│   ├── Index Segment List
│   ├── Segment Preview
│   ├── Segment Strategy
│   ├── Segment Debug
│   └── Segment Sync Status
│
├── Publishing & Index
│   ├── Publishing Center
│   ├── Index Status
│   ├── Vector Store Sync
│   ├── Index Jobs
│   └── Failed Retry
│
├── Retrieval
│   ├── Retrieval Test
│   ├── Retrieval Debug
│   ├── Retrieval API Docs
│   ├── Query Logs
│   ├── Retrieval Strategy
│   └── Evaluation Cases
│
├── Tags & Metadata
│   ├── Tag Management
│   ├── Node Type Management
│   ├── Metadata Field Management
│   ├── Business Classification
│   └── Security Level Management
│
├── Quality
│   ├── Quality Issues
│   ├── Conflict Detection
│   ├── Expired Knowledge
│   ├── Duplicate Knowledge
│   ├── Missing Source
│   ├── Missing Metadata
│   └── Retrieval Evaluation
│
├── System
│   ├── Parser Engine
│   ├── Storage Engine
│   ├── Vector Store
│   ├── Embedding Config
│   ├── Retrieval Gateway Config
│   └── System Health
│
└── Admin
    ├── Users
    ├── Roles
    ├── Permissions
    ├── Audit Logs
    └── Operation Logs
```

---

## 5. Overview 工作台

### 5.1 功能清单

```text
知识库数量
WikiNode 数量
知识源数量
Published / Draft / Archived 状态
Indexed / Outdated / Failed / Not Indexed 状态
Index Segment 数量
Broken Links 数量
最近更新 WikiNode
最近同步 Source
最近发布记录
最近索引任务
被引用最多的 WikiNode
召回健康度
质量问题总览
```

### 5.2 页面形态

```text
Overview
┌────────────────────────────────────────────┐
│ Header / Breadcrumb                         │
├────────────────────────────────────────────┤
│ Metric Cards                                │
│ WikiNodes | Published | Broken Links | Indexed |
├────────────────────────────────────────────┤
│ Recent Updates      | Top Referenced Nodes  │
├────────────────────────────────────────────┤
│ Node Type Chart     | Index Status Chart    │
├────────────────────────────────────────────┤
│ Recent Retrieval Tests / Failed Index Jobs  │
└────────────────────────────────────────────┘
```

---

## 6. Knowledge Base 知识库

### 6.1 知识库列表

功能：

```text
创建知识库
搜索知识库
筛选知识库
置顶知识库
归档知识库
复制知识库
移动知识库
删除知识库
查看知识库详情
展示知识库卡片
展示 WikiNode 数量
展示 Source 数量
展示 Index Health
展示 Retrieval Health
```

### 6.2 创建 / 编辑知识库

配置项：

```text
name
description
businessDomain
knowledgeBaseType
defaultNodeType
defaultParserEngine
defaultStorageProvider
defaultVectorStore
defaultPublishingPolicy
defaultRetrievalStrategy
metadataTemplate
visibilityScope
owner
isTemporary
```

### 6.3 知识库详情

Tabs：

```text
Overview
WikiNodes
Sources
Graph
Index Segments
Retrieval
Quality
Settings
```

---

## 7. Sources 知识源

### 7.1 Source 类型

```text
Feishu
PDF
Word
Excel
Web
Manual
API
Database
Legacy KB
Call Transcript
Work Order
VOC
```

### 7.2 Source 列表功能

```text
创建 Source
搜索 Source
筛选 sourceType
筛选 syncStatus
筛选 owner
查看 lastSyncedAt
查看 generatedNodes
手动同步
禁用 Source
删除 Source
查看同步日志
查看原始快照
```

### 7.3 创建 Source 配置

```text
sourceName
sourceType
owner
authConfig
syncScope
syncMode
syncSchedule
parserEngine
storageProvider
targetKnowledgeBase
targetNodeType
metadataMapping
conflictPolicy
enableAutoCompile
requireReview
```

### 7.4 Source 详情

```text
基本信息
同步配置
最近同步结果
同步日志
原始材料列表
生成的 WikiNode
解析失败记录
权限失败记录
格式失败记录
手动同步
重新解析
启用 / 停用
```

---

## 8. Raw Materials / Parsed Documents

### 8.1 Raw Material 功能

```text
保存原始文件
保存飞书快照
保存网页快照
保存 Excel 原表
保存 Word / PDF 原件
记录 sourceId
记录 version
记录 syncTime
记录 owner
记录 fileHash
```

### 8.2 Parsed Document 功能

```text
Markdown 解析结果
结构化表格
标题层级
段落结构
图片引用
source_refs
页码
段落位置
解析日志
解析错误
重新解析
```

### 8.3 页面

```text
Raw Material List
Raw Material Detail
File Preview
Parsed Result Preview
Raw vs Parsed Diff
Re-parse
```

---

## 9. Parser / Storage / Normalization

### 9.1 Parser Engine

功能：

```text
解析引擎列表
文件类型支持
引擎状态
连通性检查
默认 parser
按文件类型配置 parser
OCR 开关
表格抽取配置
图片抽取配置
公式抽取配置
标题层级修复
重连解析服务
```

### 9.2 Storage Engine

功能：

```text
Local / MinIO / COS / TOS / OSS
连接配置
连通性检查
默认存储
按 source 配置 storage
文件保留策略
解析产物存储策略
存储用量
访问策略
```

### 9.3 Normalization

功能：

```text
Markdown 标准化
图片引用标准化
表格标准化
标题层级修复
页码保留
段落位置保留
去页眉页脚
去重复内容
敏感字段识别
元数据抽取
source_refs 生成
解析结果预览
```

---

## 10. WikiNode 管理

### 10.1 WikiNode 列表

功能：

```text
新建 WikiNode
搜索 WikiNode
按 nodeType 筛选
按 status 筛选
按 indexStatus 筛选
按 source 筛选
按 owner 筛选
按 tags 筛选
批量发布
批量归档
批量打标签
批量重新索引
批量导出
移动到其他知识库
复制 WikiNode
打开编辑器
```

### 10.2 WikiNode 编辑器

页面结构：

```text
WikiNode Editor
┌────────────────────────────────────────────┐
│ Header: title / status / save / publish     │
├──────────────┬────────────────┬────────────┤
│ Node Explorer│ Markdown Editor │ Inspector  │
└──────────────┴────────────────┴────────────┘
```

功能：

```text
标题编辑
Summary 编辑
Markdown 正文编辑
Edit / Preview
[[双链]] 输入
resolved link 渲染
broken link 渲染
元数据编辑
source_refs 查看
incoming links 查看
outgoing links 查看
broken links 查看
index status 查看
index segment preview
版本历史
版本对比
质量检查
发布操作
重新索引
召回测试
```

### 10.3 WikiNode 字段

```text
nodeId
title
slug
nodeType
businessDomain
brand
productCategory
scenario
summary
contentMarkdown
contentPlainText
tags
status
reviewStatus
publishStatus
indexStatus
owner
sourceRefs
incomingCount
outgoingCount
brokenLinkCount
securityLevel
allowedChannels
allowedConsumers
effectiveDate
expiredDate
createdAt
updatedAt
createdBy
updatedBy
lastPublishedAt
lastIndexedAt
version
```

---

## 11. WikiLink / Backlinks / Wiki Graph

### 11.1 WikiLink 功能

```text
解析 [[节点标题]]
生成 outgoing links
生成 incoming links
识别 broken links
手动修复 broken link
将 broken link 创建为 WikiNode
忽略 broken link
删除 link
查看引用上下文
查看影响范围
```

### 11.2 Link 关系类型

```text
reference
derived_from
overrides
conflicts_with
depends_on
applies_to
excludes
similar_to
parent_of
used_by
```

### 11.3 Broken Links 页面

功能：

```text
展示所有 unresolved links
展示 source node
展示 targetTitle
展示 relationType
展示引用上下文
建议创建 WikiNode
建议链接到已有 WikiNode
批量忽略
批量创建草稿节点
```

### 11.4 Backlinks 页面

功能：

```text
查看某节点被谁引用
展示引用上下文
展示 from node
展示 relationType
展示引用次数
展示影响分析
```

### 11.5 Wiki Graph 页面

功能：

```text
节点 = WikiNode
边 = WikiLink
按 nodeType 筛选
按 status 筛选
按 tags 筛选
按 relationType 筛选
搜索节点
查看一跳关系
查看多跳关系
查看孤立节点
查看高引用节点
查看 broken link
查看影响分析
```

---

## 12. Index Segment 管理

### 12.1 定位

Index Segment 是从 WikiNode 生成的、送入向量库的可控召回片段。

它不是外部向量库内部 chunk。

它必须保留：

```text
segmentId
nodeId
nodeTitle
segmentType
content
metadata
sourceRefs
indexStatus
vectorDocId
```

### 12.2 Index Segment 类型

```text
title
summary
body
section
table
qa
metadata
condition
procedure_step
troubleshooting_step
```

### 12.3 Index Segment 列表

字段：

```text
segmentId
nodeId
nodeTitle
segmentType
contentPreview
tokenCount
enabled
indexStatus
vectorDocId
lastIndexedAt
retrievalHits
avgScore
```

### 12.4 WikiNode 编辑页 Segments Tab

展示：

```text
Generated Segments
Segment Type
Content Preview
Enabled
Index Status
Token Count
Last Indexed At
Vector Doc ID
```

### 12.5 Segment Strategy

按 nodeType 配置生成策略：

```text
policy: title + summary + section
faq: question + answer
procedure: step level
troubleshooting: step level
product: parameter block
term: node level
fee_rule: table row / rule block
```

配置项：

```text
segmentMode
maxTokens
overlapTokens
includeTitle
includeSummary
includeTags
includeSourceRefs
parentNodeIdRequired
metadataMapping
```

### 12.6 Segment Debug

功能：

```text
查看某次召回命中的 segment
查看 segment score
查看 segment content preview
查看 segment 所属 WikiNode
查看 matchedFields
查看为什么回查到该 WikiNode
```

### 12.7 Retrieval 返回模式

Normal Mode：

```json
{
  "node": {
    "nodeId": "POLICY_WARRANTY_001",
    "title": "保修期内维修服务政策"
  },
  "score": 0.91
}
```

Debug Mode：

```json
{
  "node": {
    "nodeId": "POLICY_WARRANTY_001",
    "title": "保修期内维修服务政策"
  },
  "score": 0.91,
  "matchedSegments": [
    {
      "segmentId": "SEG_POLICY_WARRANTY_001_SUMMARY",
      "segmentType": "summary",
      "score": 0.91,
      "contentPreview": "保修期内且非人为损坏时……"
    }
  ]
}
```

---

## 13. Publishing / Index / Vector Sync

### 13.1 发布中心

功能：

```text
待发布节点
发布前校验
发布目标选择
单节点发布
批量发布
整库发布
灰度发布
取消发布
回滚发布
发布记录
发布审批
```

### 13.2 发布前校验

```text
必填字段完整
source_refs 存在
无 broken links
未过期
状态允许发布
Index Segment 可生成
目标向量库可连接
密级和渠道匹配
```

### 13.3 索引状态

状态：

```text
not_indexed
indexing
indexed
outdated
failed
deleted
```

功能：

```text
查看索引状态
按状态筛选
查看失败原因
重试索引
批量重建索引
查看 indexed content preview
查看 vector document id
查看 lastIndexedAt
```

### 13.4 向量库同步

功能：

```text
Provider 管理
知识库绑定 provider
Metadata mapping
Content mapping
Segment mapping
删除策略
同步日志
失败重试
连接测试
```

---

## 14. Retrieval API / Retrieval Test

### 14.1 Retrieval Test 页面

功能：

```text
输入 query
选择 nodeType filter
选择 status filter
选择 tags filter
选择 brand / category / scenario filter
设置 topK
选择 retrievalMode
运行检索
展示 WikiNode 结果
展示 score
展示 matchedReason
展示 sourceRefs
展示 incoming / outgoing links
Debug 模式展示 matchedSegments
保存为评测用例
```

### 14.2 Retrieval API

接口：

```http
POST /api/knowledge/retrieve
POST /api/knowledge/retrieve/debug
POST /api/knowledge/retrieve/batch
GET  /api/knowledge/retrieve/logs
POST /api/knowledge/retrieve/cases
POST /api/knowledge/retrieve/evaluate
```

### 14.3 Retrieval Result

标准返回必须以 WikiNode 为核心：

```json
{
  "query": "...",
  "results": [
    {
      "nodeId": "...",
      "title": "...",
      "nodeType": "policy",
      "summary": "...",
      "contentMarkdown": "...",
      "score": 0.91,
      "sourceRefs": [],
      "incomingLinks": [],
      "outgoingLinks": []
    }
  ]
}
```

Debug 模式可以补充 matchedSegments。

### 14.4 Query Logs

功能：

```text
记录 query
记录调用方
记录 filters
记录返回 topK
记录命中 nodeIds
记录命中 segments
记录 latency
记录 error
保存为评测 case
```

### 14.5 Retrieval Strategy

配置：

```text
vector
keyword
hybrid
graph
title weight
summary weight
content weight
tags weight
metadata filter
rerank enabled
graph expansion
min score
fallback
return format
```

---

## 15. Tags / Metadata / Classification

### 15.1 标签管理

功能：

```text
创建标签
编辑标签
删除标签
合并标签
标签颜色
标签排序
标签分组
标签使用统计
批量打标签
```

### 15.2 知识类型管理

类型：

```text
policy
procedure
faq
product
guide
troubleshooting
term
fee_rule
regulation
notice
```

每个 nodeType 可配置：

```text
字段模板
必填字段
默认标签
默认审核规则
默认发布目标
默认召回策略
默认 Segment Strategy
```

### 15.3 元数据字段管理

功能：

```text
字段名
字段类型
是否必填
适用 nodeType
默认值
校验规则
显示顺序
是否参与 filter
是否同步到 vector metadata
是否参与 retrieval score
```

---

## 16. Quality / Evaluation

### 16.1 质量检查项

```text
缺少 summary
缺少 source_refs
缺少 tags
缺少 nodeType
存在 broken links
存在 expired node
draft 被索引
unpublished 被召回
重复标题
重复内容
元数据不完整
高风险未审核
Index Segment 为空
Index Segment 过期
Index Segment 与 WikiNode 不一致
```

### 16.2 冲突检测

功能：

```text
政策冲突
时间冲突
适用范围冲突
覆盖关系缺失
冲突解释
人工 resolved
人工 ignore
```

### 16.3 过期知识

功能：

```text
已过期列表
即将过期列表
无失效日期列表
过期仍索引风险
批量下线
通知 owner
```

### 16.4 召回评测集

功能：

```text
创建评测集
添加测试问题
设置 expected WikiNode
设置 must include
设置 must not include
运行 batch retrieval
Top1 命中率
Top3 命中率
错误召回
无结果
按 nodeType 分析
按 query 分类分析
导出结果
```

---

## 17. System Config

### 17.1 System Info

```text
系统版本
运行环境
数据库版本
Parser 状态
Storage 状态
Vector Store 状态
Graph DB 状态
Keyword Index 状态
Job Queue 状态
健康检查
```

### 17.2 Parser Engine

见第 9 节。

### 17.3 Storage Engine

见第 9 节。

### 17.4 Vector Store

配置：

```text
Provider: Aliyun / Volcano / Milvus / Qdrant / Mock
Connection config
Test connection
Knowledge Base binding
Metadata mapping
Segment sync strategy
```

### 17.5 Embedding / Model Config

```text
Embedding provider
Embedding model
Dimension
Summary model
Compile model
Rerank model
VLM model
ASR model
Connection test
Default model per KB
Usage statistics
```

---

## 18. Users / Roles / Permissions / Audit

### 18.1 用户管理

```text
用户列表
邀请用户
禁用用户
团队
最近登录
```

### 18.2 角色管理

```text
Admin
Knowledge Owner
Editor
Reviewer
Viewer
API Consumer
```

### 18.3 权限维度

```text
知识库权限
Source 权限
Raw Material 权限
WikiNode 权限
WikiLink 权限
发布权限
索引权限
Retrieval API 权限
系统配置权限
审计查看权限
```

### 18.4 审计日志

记录：

```text
创建节点
编辑节点
删除节点
发布节点
取消发布
重新索引
修改 Source
修改 Metadata
修改权限
调用 Retrieval API
登录
导出
删除
```

---

## 19. 全量 API 清单建议

### Knowledge Base

```http
GET    /api/knowledge-bases
POST   /api/knowledge-bases
GET    /api/knowledge-bases/{kbId}
PUT    /api/knowledge-bases/{kbId}
DELETE /api/knowledge-bases/{kbId}
POST   /api/knowledge-bases/{kbId}/copy
POST   /api/knowledge-bases/{kbId}/archive
```

### Source

```http
GET    /api/sources
POST   /api/sources
GET    /api/sources/{sourceId}
PUT    /api/sources/{sourceId}
DELETE /api/sources/{sourceId}
POST   /api/sources/{sourceId}/sync
GET    /api/sources/{sourceId}/sync-logs
GET    /api/sources/{sourceId}/raw-materials
```

### WikiNode

```http
GET    /api/wiki-nodes
POST   /api/wiki-nodes
GET    /api/wiki-nodes/{nodeId}
PUT    /api/wiki-nodes/{nodeId}
DELETE /api/wiki-nodes/{nodeId}
POST   /api/wiki-nodes/{nodeId}/publish
POST   /api/wiki-nodes/{nodeId}/unpublish
POST   /api/wiki-nodes/{nodeId}/archive
POST   /api/wiki-nodes/{nodeId}/reindex
GET    /api/wiki-nodes/{nodeId}/versions
GET    /api/wiki-nodes/{nodeId}/diff
```

### WikiLink

```http
GET  /api/wiki-nodes/{nodeId}/incoming-links
GET  /api/wiki-nodes/{nodeId}/outgoing-links
GET  /api/wiki-links
GET  /api/wiki-links/broken
POST /api/wiki-links/resolve
POST /api/wiki-links/ignore
```

### Index Segment

```http
GET  /api/index-segments
GET  /api/wiki-nodes/{nodeId}/index-segments
POST /api/wiki-nodes/{nodeId}/index-segments/generate
PUT  /api/index-segments/{segmentId}
POST /api/index-segments/{segmentId}/enable
POST /api/index-segments/{segmentId}/disable
POST /api/index-segments/{segmentId}/reindex
GET  /api/index-segments/{segmentId}/debug
```

### Graph

```http
GET /api/wiki-graph
GET /api/wiki-graph/nodes/{nodeId}
GET /api/wiki-graph/impact/{nodeId}
```

### Retrieval

```http
POST /api/knowledge/retrieve
POST /api/knowledge/retrieve/debug
POST /api/knowledge/retrieve/batch
GET  /api/knowledge/retrieve/logs
POST /api/knowledge/retrieve/cases
POST /api/knowledge/retrieve/evaluate
```

### Publishing / Index

```http
GET  /api/index-status
POST /api/index/rebuild
POST /api/index/retry
GET  /api/index/jobs
GET  /api/index/jobs/{jobId}
```

### Quality

```http
GET  /api/quality/issues
POST /api/quality/check
GET  /api/quality/conflicts
GET  /api/quality/expired
GET  /api/quality/duplicates
```

### System

```http
GET  /api/system/info
GET  /api/system/parser-engines
POST /api/system/parser-engines/check
GET  /api/system/storage-engines
POST /api/system/storage-engines/check
GET  /api/system/vector-stores
POST /api/system/vector-stores/test
```

---

## 20. 全量数据对象清单

```text
KnowledgeBase
Source
RawMaterial
ParsedDocument
WikiNode
WikiNodeVersion
WikiLink
WikiGraphNode
WikiGraphEdge
IndexSegment
IndexSegmentStrategy
IndexRecord
PublishRecord
VectorStoreConfig
Tag
MetadataField
RetrievalRequest
RetrievalResult
RetrievalLog
EvaluationCase
EvaluationRun
QualityIssue
ConflictIssue
User
Role
Permission
AuditLog
```

---

## 21. 最终产品边界总结

完整 WikiNode Studio 应该覆盖：

```text
1. 管知识库
2. 管知识源
3. 管原始文档和解析结果
4. 管 WikiNode
5. 管双链和图谱
6. 管 Index Segment
7. 管标签和元数据
8. 管发布和索引
9. 管 Retrieval API
10. 管召回测试和评测
11. 管知识质量
12. 管系统引擎配置
13. 管用户权限和审计
```

关键区别：

```text
不管理外部向量数据库内部 chunk
管理 WikiNode 发布前生成的 Index Segment

不让业务直接维护碎片
让业务维护 WikiNode

不让外部系统直接访问向量库
让外部系统调用 Retrieval API

不返回裸 chunk
默认返回 WikiNode
Debug 模式可展示 matchedSegments
```

一句话：

WikiNode Studio 的核心不是“文档上传到向量库”，而是把企业知识变成 WikiNode，并通过双链、Index Segment 和 Retrieval API，让知识可以被稳定召回、追溯和治理。
