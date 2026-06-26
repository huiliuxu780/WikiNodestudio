import type { QualityIssue } from "@/types/quality"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type QualityIssueGroup = {
  title: string
  description: string
  issueTypes: QualityIssue["issueType"][]
}

const qualityIssueGroups: QualityIssueGroup[] = [
  {
    title: "断链与关系风险",
    description: "关注 WikiLink、关系候选和冲突解释，不自动创建或修复关系。",
    issueTypes: ["broken_link", "conflict"],
  },
  {
    title: "来源与元数据风险",
    description: "关注 sourceRefs、metadata、tags、nodeType 等发布前证据完整性。",
    issueTypes: ["missing_source"],
  },
  {
    title: "Index Segment 风险",
    description: "关注 Index Segment 是否过期、为空或与 WikiNode 内容不一致。",
    issueTypes: ["low_retrieval_score"],
  },
  {
    title: "召回质量风险",
    description: "关注 Retrieval API 命中质量、无结果、错误召回和评测证据。",
    issueTypes: ["low_retrieval_score", "expired"],
  },
]

const severityLabels: Record<QualityIssue["severity"], string> = {
  high: "高",
  medium: "中",
  low: "低",
}

const severityVariants: Record<QualityIssue["severity"], "default" | "secondary" | "destructive" | "outline"> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
}

const statusLabels: Record<QualityIssue["status"], string> = {
  open: "待处理",
  triaged: "已分诊",
  resolved: "已解决",
}

const issueTypeLabels: Record<QualityIssue["issueType"], string> = {
  broken_link: "断链风险",
  missing_source: "缺少来源证据",
  expired: "过期知识风险",
  conflict: "知识冲突风险",
  low_retrieval_score: "召回质量偏低",
}

export function QualityIssueConsole({ issues }: { issues: QualityIssue[] }) {
  const openIssueCount = issues.filter((issue) => issue.status !== "resolved").length
  const highIssueCount = issues.filter((issue) => issue.severity === "high").length
  const affectedNodeCount = new Set(issues.map((issue) => issue.nodeId)).size

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">质量问题证据控制台</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <QualityMetric label="待处理问题" value={`${openIssueCount} 个`} />
          <QualityMetric label="高风险" value={`${highIssueCount} 个`} />
          <QualityMetric label="影响 WikiNode" value={`${affectedNodeCount} 个`} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">执行边界</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>当前只展示质量风险证据，不运行自动检查、自动修复、批量处理或导出。</p>
          <p>质量问题以 WikiNode / Knowledge Object 为中心，WikiLink、sourceRefs、Index Segment 和 Retrieval API 只作为证据。</p>
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-4">
        {qualityIssueGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle className="text-sm">{group.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{group.description}</p>
              <Badge variant="outline">{countIssuesByTypes(issues, group.issueTypes)} 条证据</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3">
        {issues.map((issue) => (
          <QualityIssueCard key={issue.issueId} issue={issue} />
        ))}
      </div>
    </div>
  )
}

function QualityMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm">
      <div className="text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  )
}

function QualityIssueCard({ issue }: { issue: QualityIssue }) {
  return (
    <Card>
      <CardContent className="grid gap-3 p-4 lg:grid-cols-[1.2fr_1fr_1.4fr]">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{issue.nodeTitle}</span>
            <Badge variant={severityVariants[issue.severity]}>风险：{severityLabels[issue.severity]}</Badge>
            <Badge variant="outline">{statusLabels[issue.status]}</Badge>
          </div>
          <div className="text-sm text-muted-foreground">影响 WikiNode：{issue.nodeId}</div>
          <div className="text-sm text-muted-foreground">负责人：{issue.owner}</div>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>问题 ID：{issue.issueId}</div>
          <div>问题类型：{issueTypeLabels[issue.issueType]}</div>
          <div>创建时间：{issue.createdAt}</div>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">证据：{qualityIssueEvidence(issue)}</p>
          <p className="text-muted-foreground">安全下一步：{qualityIssueNextStep(issue)}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function countIssuesByTypes(issues: QualityIssue[], issueTypes: QualityIssue["issueType"][]) {
  return issues.filter((issue) => issueTypes.includes(issue.issueType)).length
}

function qualityIssueEvidence(issue: QualityIssue) {
  const evidence: Record<QualityIssue["issueType"], string> = {
    broken_link: "存在未解析 WikiLink，需要在断链检查中确认目标 WikiNode。",
    missing_source: "sourceRefs 证据不足，发布前需要补充 Source / Raw Material 引用。",
    expired: "知识可能过期或缺少失效日期，需要人工确认生命周期状态。",
    conflict: "存在政策口径冲突，需要人工比较适用范围和时间条件。",
    low_retrieval_score: "Retrieval API 命中弱，需要检查摘要、标签和 Index Segment 证据。",
  }

  return evidence[issue.issueType]
}

function qualityIssueNextStep(issue: QualityIssue) {
  const nextSteps: Record<QualityIssue["issueType"], string> = {
    broken_link: "人工确认 WikiLink 指向，不自动创建或修复关系。",
    missing_source: "补充来源证据后再进入发布检查，不自动抓取或解析 Source。",
    expired: "由知识负责人确认是否更新、下线或继续保留，不执行批量下线。",
    conflict: "由业务负责人裁定口径，不自动覆盖 WikiNode 内容。",
    low_retrieval_score: "人工检查 WikiNode 摘要、标签和 Index Segment，不执行外部向量同步。",
  }

  return nextSteps[issue.issueType]
}
