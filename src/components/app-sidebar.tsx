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
      title: "总览",
      url: "/",
      icon: LayoutDashboardIcon,
    },
    {
      title: "知识库",
      url: "/knowledge-bases",
      icon: LibraryIcon,
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
      title: "知识来源",
      url: "/sources",
      icon: DatabaseIcon,
    },
    {
      title: "原始材料",
      url: "/raw-materials",
      icon: ArchiveIcon,
    },
    {
      title: "Index Segment",
      url: "/index-segments",
      icon: PackageIcon,
    },
    {
      title: "发布与索引",
      url: "/publishing",
      icon: ActivityIcon,
    },
    {
      title: "断链检查",
      url: "/broken-links",
      icon: Link2OffIcon,
    },
  ],
  governance: [
    {
      title: "标签与元数据",
      url: "/tags",
      icon: TagsIcon,
    },
    {
      title: "质量问题",
      url: "/quality-issues",
      icon: ShieldCheckIcon,
    },
    {
      title: "评测用例",
      url: "/evaluation-cases",
      icon: SlidersHorizontalIcon,
    },
  ],
  system: [
    {
      title: "解析引擎",
      url: "/system/parser-engine",
      icon: SlidersHorizontalIcon,
    },
    {
      title: "存储引擎",
      url: "/system/storage-engine",
      icon: HardDriveIcon,
    },
    {
      title: "外部向量库配置",
      url: "/system/vector-store",
      icon: DatabaseIcon,
    },
    {
      title: "设置",
      url: "/settings",
      icon: SettingsIcon,
    },
    {
      title: "管理",
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
        <NavMain title="平台" items={data.platform} />
        <NavKnowledge title="知识" items={data.knowledge} />
        <NavKnowledge title="治理" items={data.governance} />
        <NavKnowledge title="系统" items={data.system} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
