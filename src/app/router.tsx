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
  GenericSkeletonPage,
  IndexSegmentListPage,
  KnowledgeBaseDetailPage,
  KnowledgeBaseListPage,
  KnowledgeBaseSettingsPage,
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
      { path: "/sources/sync-jobs", element: <GenericSkeletonPage title="Sync Jobs" /> },
      { path: "/sources/sync-logs", element: <GenericSkeletonPage title="Sync Logs" /> },
      { path: "/sources/:sourceId", element: <SourceDetailPage /> },
      { path: "/raw-materials", element: <RawMaterialListPage /> },
      { path: "/raw-materials/:rawMaterialId", element: <RawMaterialDetailPage /> },
      { path: "/raw-materials/:rawMaterialId/parsed-result", element: <ParsedResultPreviewPage /> },
      { path: "/backlinks", element: <BacklinksPage /> },
      { path: "/impact-analysis", element: <GenericSkeletonPage title="Impact Analysis" /> },
      { path: "/index-segments", element: <IndexSegmentListPage /> },
      { path: "/index-segments/strategy", element: <SegmentStrategyPage /> },
      { path: "/index-segments/debug", element: <SegmentDebugPage /> },
      { path: "/publishing", element: <PublishingPage /> },
      { path: "/index-status", element: <IndexStatusPage /> },
      { path: "/vector-sync", element: <GenericSkeletonPage title="Vector Store Sync" /> },
      { path: "/index-jobs", element: <GenericSkeletonPage title="Index Jobs" /> },
      { path: "/retrieval-debug", element: <GenericSkeletonPage title="Retrieval Debug" /> },
      { path: "/retrieval-api-docs", element: <GenericSkeletonPage title="Retrieval API Docs" /> },
      { path: "/query-logs", element: <GenericSkeletonPage title="Query Logs" /> },
      { path: "/evaluation-cases", element: <GenericSkeletonPage title="Evaluation Cases" /> },
      { path: "/tags", element: <GenericSkeletonPage title="Tags & Metadata" /> },
      { path: "/node-types", element: <GenericSkeletonPage title="Node Types" /> },
      { path: "/metadata-fields", element: <GenericSkeletonPage title="Metadata Fields" /> },
      { path: "/quality-issues", element: <GenericSkeletonPage title="Quality Issues" /> },
      { path: "/conflicts", element: <GenericSkeletonPage title="Conflict Detection" /> },
      { path: "/expired-knowledge", element: <GenericSkeletonPage title="Expired Knowledge" /> },
      { path: "/duplicates", element: <GenericSkeletonPage title="Duplicate Knowledge" /> },
      { path: "/retrieval-evaluation", element: <GenericSkeletonPage title="Retrieval Evaluation" /> },
      { path: "/system/parser-engine", element: <GenericSkeletonPage title="Parser Engine" /> },
      { path: "/system/storage-engine", element: <GenericSkeletonPage title="Storage Engine" /> },
      { path: "/system/vector-store", element: <SystemVectorStorePage /> },
      { path: "/system/embedding-config", element: <GenericSkeletonPage title="Embedding Config" /> },
      { path: "/system/health", element: <GenericSkeletonPage title="System Health" /> },
      { path: "/broken-links", element: <BrokenLinksPage /> },
      { path: "/settings", element: <SettingsPage /> },
      { path: "/admin/users", element: <GenericSkeletonPage title="Users" /> },
      { path: "/admin/roles", element: <GenericSkeletonPage title="Roles" /> },
      { path: "/admin/permissions", element: <GenericSkeletonPage title="Permissions" /> },
      { path: "/admin/audit-logs", element: <GenericSkeletonPage title="Audit Logs" /> },
      { path: "*", element: <Navigate to={`/wiki-nodes/${firstNodeId}`} replace /> },
    ],
  },
])
