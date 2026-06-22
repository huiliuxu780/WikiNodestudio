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
  "": "Overview",
  "wiki-nodes": "WikiNodes",
  "wiki-graph": "Wiki Graph",
  "retrieval-test": "Retrieval Test",
  sources: "Sources",
  "index-status": "Index Status",
  "broken-links": "Broken Links",
  settings: "Settings",
}

function AppBreadcrumb() {
  const { pathname } = useLocation()
  const parts = pathname.split("/").filter(Boolean)
  const section = parts[0] ?? ""
  const current = parts.length > 1 ? "Editor" : routeLabels[section]

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

