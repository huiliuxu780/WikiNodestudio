import type { LucideIcon } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export type ProductNavItem = {
  title: string
  url: string
  icon: LucideIcon
}

function isActivePath(pathname: string, url: string) {
  if (url === "/") return pathname === "/"
  return pathname === url || pathname.startsWith(`${url}/`)
}

export function NavMain({ items }: { items: ProductNavItem[] }) {
  const { pathname } = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>工作台</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} isActive={isActivePath(pathname, item.url)}>
                <NavLink to={item.url}>
                  <Icon />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
