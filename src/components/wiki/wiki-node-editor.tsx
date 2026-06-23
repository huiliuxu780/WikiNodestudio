import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownPreview } from "@/components/wiki/markdown-preview"
import type { WikiNode } from "@/types/wiki"

export function WikiNodeEditor({
  node,
  nodes,
  onDraftChange,
}: {
  node: WikiNode
  nodes: WikiNode[]
  onDraftChange?: (node: WikiNode) => void
}) {
  const [title, setTitle] = useState(node.title)
  const [summary, setSummary] = useState(node.summary)
  const [contentMarkdown, setContentMarkdown] = useState(node.contentMarkdown)

  function emitDraft(updates: Partial<Pick<WikiNode, "title" | "summary" | "contentMarkdown">>) {
    onDraftChange?.({
      ...node,
      title,
      summary,
      contentMarkdown,
      ...updates,
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-4" data-testid="wikinode-markdown-editor">
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-node-title">标题</Label>
        <Input
          id="edit-node-title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            emitDraft({ title: event.target.value })
          }}
          className="h-10 text-base font-medium"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-node-summary">摘要</Label>
        <Textarea
          id="edit-node-summary"
          value={summary}
          onChange={(event) => {
            setSummary(event.target.value)
            emitDraft({ summary: event.target.value })
          }}
          className="min-h-20 resize-none"
        />
      </div>
      <Tabs defaultValue="edit" className="flex min-h-0 flex-1 flex-col gap-3">
        <TabsList className="w-fit">
          <TabsTrigger value="edit">编辑</TabsTrigger>
          <TabsTrigger value="preview">预览</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="mt-0 min-h-0 flex-1">
          <Textarea
            aria-label="正文内容"
            value={contentMarkdown}
            onChange={(event) => {
              setContentMarkdown(event.target.value)
              emitDraft({ contentMarkdown: event.target.value })
            }}
            className="h-full min-h-96 resize-none border-muted bg-muted/20 font-mono text-sm leading-6"
          />
        </TabsContent>
        <TabsContent value="preview" className="mt-0 min-h-0 flex-1 rounded-md border bg-background p-4">
          <MarkdownPreview title={title} summary={summary} markdown={contentMarkdown} nodes={nodes} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
