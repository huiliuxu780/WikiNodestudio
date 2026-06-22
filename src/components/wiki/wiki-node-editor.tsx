import { useState } from "react"

import { Input } from "@/components/ui/input"
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
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
      <Input
        value={title}
        onChange={(event) => {
          setTitle(event.target.value)
          emitDraft({ title: event.target.value })
        }}
        className="h-10 text-base font-medium"
      />
      <Textarea
        value={summary}
        onChange={(event) => {
          setSummary(event.target.value)
          emitDraft({ summary: event.target.value })
        }}
        className="min-h-20 resize-none"
      />
      <Tabs defaultValue="edit" className="flex min-h-0 flex-1 flex-col gap-3">
        <TabsList className="w-fit">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="mt-0 min-h-0 flex-1">
          <Textarea
            value={contentMarkdown}
            onChange={(event) => {
              setContentMarkdown(event.target.value)
              emitDraft({ contentMarkdown: event.target.value })
            }}
            className="h-full min-h-96 resize-none border-muted bg-muted/20 font-mono text-sm leading-6"
          />
        </TabsContent>
        <TabsContent value="preview" className="mt-0 min-h-0 flex-1 rounded-md border bg-background p-4">
          <MarkdownPreview markdown={contentMarkdown} nodes={nodes} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
