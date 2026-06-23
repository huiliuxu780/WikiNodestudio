import {
  ActivityIcon,
  ArchiveIcon,
  DatabaseIcon,
  FileTextIcon,
  GitBranchIcon,
  HardDriveIcon,
  LibraryIcon,
  LayoutDashboardIcon,
  Link2OffIcon,
  PackageIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  TagsIcon,
  UserCogIcon,
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
      title: "Overview",
      url: "/",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Knowledge Bases",
      url: "/knowledge-bases",
      icon: LibraryIcon,
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
      title: "Raw Materials",
      url: "/raw-materials",
      icon: ArchiveIcon,
    },
    {
      title: "Index Segments",
      url: "/index-segments",
      icon: PackageIcon,
    },
    {
      title: "Publishing & Index",
      url: "/publishing",
      icon: ActivityIcon,
    },
    {
      title: "Broken Links",
      url: "/broken-links",
      icon: Link2OffIcon,
    },
  ],
  governance: [
    {
      title: "Tags & Metadata",
      url: "/tags",
      icon: TagsIcon,
    },
    {
      title: "Quality Issues",
      url: "/quality-issues",
      icon: ShieldCheckIcon,
    },
    {
      title: "Evaluation Cases",
      url: "/evaluation-cases",
      icon: SlidersHorizontalIcon,
    },
  ],
  system: [
    {
      title: "Parser Engine",
      url: "/system/parser-engine",
      icon: SlidersHorizontalIcon,
    },
    {
      title: "Storage Engine",
      url: "/system/storage-engine",
      icon: HardDriveIcon,
    },
    {
      title: "Vector Store",
      url: "/system/vector-store",
      icon: DatabaseIcon,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
    {
      title: "Admin",
      url: "/admin/users",
      icon: UserCogIcon,
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
        <NavMain title="Platform" items={data.platform} />
        <NavKnowledge title="Knowledge" items={data.knowledge} />
        <NavKnowledge title="Governance" items={data.governance} />
        <NavKnowledge title="System" items={data.system} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
