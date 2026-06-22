import { useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { SaveIcon, SearchIcon, SendIcon, UploadCloudIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ApiErrorNotice } from "@/components/api-error-notice"
import { PageHeader } from "@/components/layout/page-header"
import { IndexStatusBadge } from "@/components/wiki/index-status-badge"
import { NodeTypeBadge } from "@/components/wiki/node-type-badge"
import { StatusBadge } from "@/components/wiki/status-badge"
import { WikiNodeEditor } from "@/components/wiki/wiki-node-editor"
import { WikiNodeExplorer } from "@/components/wiki/wiki-node-explorer"
import { WikiNodeInspector } from "@/components/wiki/wiki-node-inspector"
import { useAsyncData } from "@/hooks/use-async-data"
import { getNodeLinks, getWikiNodeById, listWikiNodes, updateWikiNode, type WikiNodeLinks } from "@/services/wiki-node-api-service"
import type { WikiNode } from "@/types/wiki"

const emptyLinks: WikiNodeLinks = {
  outgoingLinks: [],
  incomingLinks: [],
  brokenLinks: [],
}

export function WikiNodeEditPage() {
  const { nodeId } = useParams()
  const [explorerQuery, setExplorerQuery] = useState("")
  const [draftNode, setDraftNode] = useState<WikiNode | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [saveError, setSaveError] = useState<Error | null>(null)
  const { data: nodes, error: nodesError } = useAsyncData(listWikiNodes, [], [reloadVersion])
  const { data: node, isLoading, error: nodeError } = useAsyncData(
    () => nodeId ? getWikiNodeById(nodeId) : Promise.resolve(undefined),
    undefined,
    [nodeId, reloadVersion],
  )
  const { data: links, error: linksError } = useAsyncData(
    () => nodeId ? getNodeLinks(nodeId) : Promise.resolve(emptyLinks),
    emptyLinks,
    [nodeId, reloadVersion],
  )

  if (isLoading && !node) {
    return <div className="p-6 text-sm text-muted-foreground">Loading WikiNode...</div>
  }

  if (nodeError && !node) {
    return <div className="p-6"><ApiErrorNotice error={nodeError} /></div>
  }

  if (!node) return <Navigate to="/wiki-nodes" replace />

  const { outgoingLinks, incomingLinks, brokenLinks } = links
  const activeDraft = draftNode?.nodeId === node.nodeId ? draftNode : node

  async function handleSave() {
    setIsSaving(true)
    setSaveError(null)
    try {
      const savedNode = await updateWikiNode(activeDraft.nodeId, activeDraft)
      setDraftNode(savedNode)
      setReloadVersion((version) => version + 1)
    } catch (error) {
      setSaveError(error instanceof Error ? error : new Error("Failed to save WikiNode"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex h-[calc(100svh-3rem)] flex-col">
      <div className="border-b p-4">
        <PageHeader
          title={node.title}
          actions={
            <>
              <NodeTypeBadge type={node.nodeType} />
              <StatusBadge status={node.status} />
              <IndexStatusBadge status={node.indexStatus} />
              <Button size="sm" variant="outline" onClick={handleSave} disabled={isSaving}>
                <SaveIcon data-icon="inline-start" />{isSaving ? "Saving" : "Save"}
              </Button>
              <Button size="sm" variant="outline"><SendIcon data-icon="inline-start" />Publish</Button>
              <Button size="sm" variant="outline"><UploadCloudIcon data-icon="inline-start" />Re-index</Button>
              <Button
                size="sm"
                asChild
              >
                <Link to={`/retrieval-test?q=${encodeURIComponent(node.title)}`}>
                  <SearchIcon data-icon="inline-start" />Test Retrieval
                </Link>
              </Button>
            </>
          }
        />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)_340px]">
        <WikiNodeExplorer nodes={nodes} currentNodeId={node.nodeId} query={explorerQuery} onQueryChange={setExplorerQuery} />
        <div className="min-w-0">
          <ApiErrorNotice error={saveError ?? nodesError ?? linksError} />
          <WikiNodeEditor key={node.nodeId} node={node} nodes={nodes} onDraftChange={setDraftNode} />
        </div>
        <WikiNodeInspector node={node} outgoingLinks={outgoingLinks} incomingLinks={incomingLinks} brokenLinks={brokenLinks} />
      </div>
    </div>
  )
}
