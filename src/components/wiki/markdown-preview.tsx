import { Fragment } from "react"

import { LinkBadge } from "@/components/wiki/link-badge"
import type { WikiNode } from "@/types/wiki"
import { parseWikiLinks } from "@/utils/link-parser"

export function MarkdownPreview({
  markdown,
  nodes,
}: {
  markdown: string
  nodes: WikiNode[]
}) {
  const referenceMap = new Map(nodes.flatMap((node) => [[node.nodeId, node], [node.slug, node], [node.title, node]]))
  const lines = markdown.split("\n")

  return (
    <div className="prose prose-sm max-w-none text-sm leading-6">
      {lines.map((line, lineIndex) => {
        if (line.startsWith("## ")) {
          return (
            <h3 key={`${line}-${lineIndex}`} className="mt-4 mb-2 text-sm font-semibold">
              {line.replace("## ", "")}
            </h3>
          )
        }

        if (!line.trim()) {
          return <div key={`blank-${lineIndex}`} className="h-2" />
        }

        const links = parseWikiLinks(line)
        if (!links.length) {
          return (
            <p key={`${line}-${lineIndex}`} className="text-muted-foreground">
              {line}
            </p>
          )
        }

        const parts = line.split(/\[\[[^\]]+\]\]/)

        return (
          <p key={`${line}-${lineIndex}`} className="text-muted-foreground">
            {parts.map((part, index) => {
              const link = links[index]
              const node = link ? referenceMap.get(link.targetTitle) : undefined
              return (
                <Fragment key={`${part}-${index}`}>
                  {part}
                  {link ? <LinkBadge title={link.label} resolved={Boolean(node)} node={node} /> : null}
                </Fragment>
              )
            })}
          </p>
        )
      })}
    </div>
  )
}
