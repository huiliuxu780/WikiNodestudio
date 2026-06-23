import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeftIcon, PlusIcon } from "lucide-react"

import { ApiErrorNotice } from "@/components/api-error-notice"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createWikiNode } from "@/services/wiki-node-api-service"
import { actionLabels, commonLabels } from "@/utils/display-labels"

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function WikiNodeCreatePage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [summary, setSummary] = useState("")
  const [contentMarkdown, setContentMarkdown] = useState("")
  const [tags, setTags] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<Error | null>(null)
  const [validationError, setValidationError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formError = validateForm({ title, slug, summary, contentMarkdown })
    if (formError) {
      setValidationError(formError)
      return
    }

    setIsCreating(true)
    setCreateError(null)
    setValidationError("")

    try {
      const node = await createWikiNode({
        title,
        slug,
        summary,
        contentMarkdown,
        tags: parseTags(tags),
        nodeType: "term",
        status: "draft",
        sourceRefs: [],
        indexStatus: "not_indexed",
      })
      navigate(`/wiki-nodes/${node.nodeId}`, { state: { feedback: "created" } })
    } catch (error) {
      setCreateError(error instanceof Error ? error : new Error("创建失败，请稍后重试"))
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="创建知识节点"
        actions={
          <Button variant="outline" asChild>
            <Link to="/wiki-nodes">
              <ArrowLeftIcon data-icon="inline-start" />{actionLabels.backToWikiNodes}
            </Link>
          </Button>
        }
      />
      {validationError ? <p className="text-sm text-destructive">{validationError}</p> : null}
      <ApiErrorNotice error={createError} title={commonLabels.createFailed} />
      <Card>
        <CardHeader>
          <CardTitle>知识节点字段</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="wiki-node-title">标题</Label>
                <Input
                  id="wiki-node-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="wiki-node-slug">Slug</Label>
                <Input
                  id="wiki-node-slug"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="customer-warranty-policy"
                  required
                />
                <p className="text-xs text-muted-foreground">仅支持小写字母、数字和连字符，例如：customer-warranty-policy。</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="wiki-node-summary">摘要</Label>
              <Textarea
                id="wiki-node-summary"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                className="min-h-20 resize-none"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="wiki-node-content">正文内容</Label>
              <Textarea
                id="wiki-node-content"
                value={contentMarkdown}
                onChange={(event) => setContentMarkdown(event.target.value)}
                className="min-h-48 resize-y font-mono text-sm leading-6"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="wiki-node-tags">标签</Label>
              <Input
                id="wiki-node-tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="保修,洗碗机"
              />
              <p className="text-xs text-muted-foreground">多个标签用英文逗号分隔。</p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isCreating}>
                <PlusIcon data-icon="inline-start" />{isCreating ? actionLabels.creatingWikiNode : actionLabels.createWikiNode}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function validateForm({
  title,
  slug,
  summary,
  contentMarkdown,
}: {
  title: string
  slug: string
  summary: string
  contentMarkdown: string
}) {
  if (!title.trim()) return "请填写标题"
  if (!slug.trim()) return "请填写 Slug"
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
    return "Slug 只能包含小写字母、数字和连字符，且不能以连字符开头或结尾"
  }
  if (!summary.trim()) return "请填写摘要"
  if (!contentMarkdown.trim()) return "请填写正文内容"

  return ""
}
