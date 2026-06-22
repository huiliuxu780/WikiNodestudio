import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeftIcon, PlusIcon } from "lucide-react"

import { ApiErrorNotice } from "@/components/api-error-notice"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createWikiNode } from "@/services/wiki-node-api-service"

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreating(true)
    setCreateError(null)

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
      navigate(`/wiki-nodes/${node.nodeId}`)
    } catch (error) {
      setCreateError(error instanceof Error ? error : new Error("Failed to create WikiNode"))
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Create WikiNode"
        description="Create a draft WikiNode and let the API recalculate links, backlinks, and broken references."
        actions={
          <Button variant="outline" asChild>
            <Link to="/wiki-nodes">
              <ArrowLeftIcon data-icon="inline-start" />Back to WikiNodes
            </Link>
          </Button>
        }
      />
      <ApiErrorNotice error={createError} />
      <Card>
        <CardHeader>
          <CardTitle>WikiNode fields</CardTitle>
          <CardDescription>Only the product-level WikiNode DTO is submitted. Retrieval still returns WikiNode objects.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="wiki-node-title">title</Label>
                <Input
                  id="wiki-node-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="wiki-node-slug">slug</Label>
                <Input
                  id="wiki-node-slug"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="wiki-node-summary">summary</Label>
              <Textarea
                id="wiki-node-summary"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                className="min-h-20 resize-none"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="wiki-node-content">content</Label>
              <Textarea
                id="wiki-node-content"
                value={contentMarkdown}
                onChange={(event) => setContentMarkdown(event.target.value)}
                className="min-h-48 resize-y font-mono text-sm leading-6"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="wiki-node-tags">tags</Label>
              <Input
                id="wiki-node-tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="test, create"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isCreating}>
                <PlusIcon data-icon="inline-start" />{isCreating ? "Creating" : "Create WikiNode"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
