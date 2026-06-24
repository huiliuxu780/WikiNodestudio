import { Outlet, useLocation } from "react-router-dom"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

const routeLabels: Record<string, string> = {
  "": "总览",
  "knowledge-bases": "知识库",
  "wiki-nodes": "知识节点",
  "wiki-graph": "知识图谱",
  "retrieval-test": "检索测试",
  sources: "知识来源",
  "raw-materials": "原始材料",
  "index-segments": "Index Segment",
  publishing: "发布与索引",
  "index-status": "索引状态",
  "broken-links": "断链检查",
  backlinks: "反向链接",
  "impact-analysis": "影响分析",
  settings: "设置",
  admin: "管理",
  system: "系统",
}

function AppBreadcrumb() {
  const { pathname } = useLocation()
  const parts = pathname.split("/").filter(Boolean)
  const section = parts[0] ?? ""
  const current = parts.length > 1 ? "编辑" : routeLabels[section]

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/">WikiNode Studio</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{current}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function AppShell() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <AppBreadcrumb />
          </header>
          <main className="min-h-[calc(100svh-3rem)] bg-background">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
