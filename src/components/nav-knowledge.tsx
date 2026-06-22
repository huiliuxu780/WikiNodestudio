import type { LucideIcon } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}

function isActivePath(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`)
}

export function NavKnowledge({ title, items }: { title: string; items: NavItem[] }) {
  const { pathname } = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
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

