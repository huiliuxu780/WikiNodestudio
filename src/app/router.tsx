import { createBrowserRouter, Navigate } from "react-router-dom"

import { AppShell } from "@/components/layout/app-shell"
import { BrokenLinksPage } from "@/pages/broken-links-page"
import { IndexStatusPage } from "@/pages/index-status-page"
import { OverviewPage } from "@/pages/overview-page"
import { RetrievalTestPage } from "@/pages/retrieval-test-page"
import { SettingsPage } from "@/pages/settings-page"
import { SourcesPage } from "@/pages/sources-page"
import { WikiGraphPage } from "@/pages/wiki-graph-page"
import { WikiNodeCreatePage } from "@/pages/wiki-node-create-page"
import { WikiNodeEditPage } from "@/pages/wiki-node-edit-page"
import { WikiNodeListPage } from "@/pages/wiki-node-list-page"
import {
  BacklinksPage,
  DraftWikiNodeSuggestionDetailPage,
  DraftWikiNodeSuggestionReviewConsolePage,
  GenericSkeletonPage,
  IndexSegmentListPage,
  KnowledgeBaseDetailPage,
  KnowledgeBaseListPage,
  KnowledgeBaseSettingsPage,
  ParserEnginePage,
  ParsedResultPreviewPage,
  PublishingPage,
  RawMaterialDetailPage,
  RawMaterialListPage,
  SegmentDebugPage,
  SegmentStrategyPage,
  SourceDetailPage,
  SystemVectorStorePage,
  WikiNodeDetailPage,
} from "@/pages/skeleton-pages"

const firstNodeId = "wn-001"

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <OverviewPage /> },
      { path: "/knowledge-bases", element: <KnowledgeBaseListPage /> },
      { path: "/knowledge-bases/:kbId", element: <KnowledgeBaseDetailPage /> },
      { path: "/knowledge-bases/:kbId/settings", element: <KnowledgeBaseSettingsPage /> },
      { path: "/wiki-nodes", element: <WikiNodeListPage /> },
      { path: "/wiki-nodes/create", element: <WikiNodeCreatePage /> },
      { path: "/wiki-nodes/new", element: <WikiNodeCreatePage /> },
      { path: "/wiki-nodes/:nodeId/detail", element: <WikiNodeDetailPage /> },
      { path: "/wiki-nodes/:nodeId", element: <WikiNodeEditPage /> },
      { path: "/wiki-graph", element: <WikiGraphPage /> },
      { path: "/retrieval-test", element: <RetrievalTestPage /> },
      { path: "/sources", element: <SourcesPage /> },
      { path: "/sources/sync-jobs", element: <GenericSkeletonPage title="同步任务" /> },
      { path: "/sources/sync-logs", element: <GenericSkeletonPage title="同步日志" /> },
      { path: "/sources/:sourceId", element: <SourceDetailPage /> },
      { path: "/raw-materials", element: <RawMaterialListPage /> },
      { path: "/raw-materials/:rawMaterialId", element: <RawMaterialDetailPage /> },
      { path: "/raw-materials/:rawMaterialId/parsed-result", element: <ParsedResultPreviewPage /> },
      { path: "/draft-wikinode-suggestions", element: <DraftWikiNodeSuggestionReviewConsolePage /> },
      { path: "/draft-wikinode-suggestions/:suggestionId", element: <DraftWikiNodeSuggestionDetailPage /> },
      { path: "/backlinks", element: <BacklinksPage /> },
      { path: "/impact-analysis", element: <GenericSkeletonPage title="影响分析" /> },
      { path: "/index-segments", element: <IndexSegmentListPage /> },
      { path: "/index-segments/strategy", element: <SegmentStrategyPage /> },
      { path: "/index-segments/debug", element: <SegmentDebugPage /> },
      { path: "/publishing", element: <PublishingPage /> },
      { path: "/index-status", element: <IndexStatusPage /> },
      { path: "/vector-sync", element: <GenericSkeletonPage title="外部向量库同步" /> },
      { path: "/index-jobs", element: <GenericSkeletonPage title="索引任务" /> },
      { path: "/retrieval-debug", element: <GenericSkeletonPage title="召回调试" /> },
      { path: "/retrieval-api-docs", element: <GenericSkeletonPage title="Retrieval API 文档" /> },
      { path: "/query-logs", element: <GenericSkeletonPage title="查询日志" /> },
      { path: "/evaluation-cases", element: <GenericSkeletonPage title="评测用例" /> },
      { path: "/tags", element: <GenericSkeletonPage title="标签与元数据" /> },
      { path: "/node-types", element: <GenericSkeletonPage title="节点类型" /> },
      { path: "/metadata-fields", element: <GenericSkeletonPage title="元数据字段" /> },
      { path: "/quality-issues", element: <GenericSkeletonPage title="质量问题" /> },
      { path: "/retrieval-evaluation", element: <GenericSkeletonPage title="召回评测" /> },
      { path: "/system/parser-engine", element: <ParserEnginePage /> },
      { path: "/system/storage-engine", element: <GenericSkeletonPage title="存储引擎" /> },
      { path: "/system/vector-store", element: <SystemVectorStorePage /> },
      { path: "/system/embedding-config", element: <GenericSkeletonPage title="向量模型配置" /> },
      { path: "/system/health", element: <GenericSkeletonPage title="系统健康" /> },
      { path: "/broken-links", element: <BrokenLinksPage /> },
      { path: "/settings", element: <SettingsPage /> },
      { path: "/admin/users", element: <GenericSkeletonPage title="用户" /> },
      { path: "/admin/roles", element: <GenericSkeletonPage title="角色" /> },
      { path: "/admin/permissions", element: <GenericSkeletonPage title="权限" /> },
      { path: "/admin/audit-logs", element: <GenericSkeletonPage title="审计日志" /> },
      { path: "*", element: <Navigate to={`/wiki-nodes/${firstNodeId}`} replace /> },
    ],
  },
])
