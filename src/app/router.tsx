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

const firstNodeId = "wn-001"

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <OverviewPage /> },
      { path: "/wiki-nodes", element: <WikiNodeListPage /> },
      { path: "/wiki-nodes/new", element: <WikiNodeCreatePage /> },
      { path: "/wiki-nodes/:nodeId", element: <WikiNodeEditPage /> },
      { path: "/wiki-graph", element: <WikiGraphPage /> },
      { path: "/retrieval-test", element: <RetrievalTestPage /> },
      { path: "/sources", element: <SourcesPage /> },
      { path: "/index-status", element: <IndexStatusPage /> },
      { path: "/broken-links", element: <BrokenLinksPage /> },
      { path: "/settings", element: <SettingsPage /> },
      { path: "*", element: <Navigate to={`/wiki-nodes/${firstNodeId}`} replace /> },
    ],
  },
])
