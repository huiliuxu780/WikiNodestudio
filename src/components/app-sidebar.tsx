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
      name: "CC After-sales KB",
      logo: FileTextIcon,
      plan: "WikiNode Studio",
    },
    {
      name: "Product Guide KB",
      logo: DatabaseIcon,
      plan: "Workspace",
    },
    {
      name: "Policy Workspace",
      logo: GitBranchIcon,
      plan: "Workspace",
    },
  ],
  platform: [
    {
      title: "Overview",
      url: "/",
      icon: LayoutDashboardIcon,
    },
    {
      title: "WikiNodes",
      url: "/wiki-nodes",
      icon: FileTextIcon,
    },
    {
      title: "Wiki Graph",
      url: "/wiki-graph",
      icon: GitBranchIcon,
    },
    {
      title: "Retrieval Test",
      url: "/retrieval-test",
      icon: SearchIcon,
    },
  ],
  knowledge: [
    {
      title: "Sources",
      url: "/sources",
      icon: DatabaseIcon,
    },
    {
      title: "Index Status",
      url: "/index-status",
      icon: ActivityIcon,
    },
    {
      title: "Broken Links",
      url: "/broken-links",
      icon: Link2OffIcon,
    },
  ],
  system: [
    {
      title: "Settings",
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
        <NavKnowledge title="Knowledge" items={data.knowledge} />
        <NavKnowledge title="System" items={data.system} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
