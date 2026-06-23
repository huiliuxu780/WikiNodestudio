import {
  ActivityIcon,
  DatabaseIcon,
  FileTextIcon,
  GitBranchIcon,
  LayoutDashboardIcon,
  Link2OffIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react"

import { NavKnowledge } from "@/components/nav-knowledge"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Rivers",
    email: "rivers@example.com",
    avatar: "",
  },
  teams: [
    {
      name: "售后知识库",
      logo: FileTextIcon,
      plan: "WikiNode Studio",
    },
    {
      name: "产品指南库",
      logo: DatabaseIcon,
      plan: "工作区",
    },
    {
      name: "政策工作区",
      logo: GitBranchIcon,
      plan: "工作区",
    },
  ],
  platform: [
    {
      title: "总览",
      url: "/",
      icon: LayoutDashboardIcon,
    },
    {
      title: "知识节点",
      url: "/wiki-nodes",
      icon: FileTextIcon,
    },
    {
      title: "知识图谱",
      url: "/wiki-graph",
      icon: GitBranchIcon,
    },
    {
      title: "检索测试",
      url: "/retrieval-test",
      icon: SearchIcon,
    },
  ],
  knowledge: [
    {
      title: "来源",
      url: "/sources",
      icon: DatabaseIcon,
    },
    {
      title: "索引状态",
      url: "/index-status",
      icon: ActivityIcon,
    },
    {
      title: "断链检查",
      url: "/broken-links",
      icon: Link2OffIcon,
    },
  ],
  system: [
    {
      title: "设置",
      url: "/settings",
      icon: SettingsIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.platform} />
        <NavKnowledge title="知识管理" items={data.knowledge} />
        <NavKnowledge title="系统" items={data.system} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
