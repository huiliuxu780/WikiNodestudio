import { useState } from "react"
import { Link, Navigate, useLocation, useParams } from "react-router-dom"
import { SaveIcon, SearchIcon, SendIcon, UploadCloudIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ApiErrorNotice } from "@/components/api-error-notice"
import { FeedbackNotice } from "@/components/feedback-notice"
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
import { actionLabels, commonLabels } from "@/utils/display-labels"

const emptyLinks: WikiNodeLinks = {
  outgoingLinks: [],
  incomingLinks: [],
  brokenLinks: [],
}

export function WikiNodeEditPage() {
  const { nodeId } = useParams()
  const location = useLocation()
  const [explorerQuery, setExplorerQuery] = useState("")
  const [draftNode, setDraftNode] = useState<WikiNode | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [saveError, setSaveError] = useState<Error | null>(null)
  const [feedback, setFeedback] = useState(location.state && typeof location.state === "object" && "feedback" in location.state && location.state.feedback === "created" ? commonLabels.createSuccess : "")
  const [validationError, setValidationError] = useState("")
  const [mockActionState, setMockActionState] = useState("")
  const { data: nodes, error: nodesError, reload: reloadNodes } = useAsyncData(listWikiNodes, [], [reloadVersion])
  const { data: node, isLoading, error: nodeError, reload: reloadNode } = useAsyncData(
    () => nodeId ? getWikiNodeById(nodeId) : Promise.resolve(undefined),
    undefined,
    [nodeId, reloadVersion],
  )
  const { data: links, error: linksError, reload: reloadLinks } = useAsyncData(
    () => nodeId ? getNodeLinks(nodeId) : Promise.resolve(emptyLinks),
    emptyLinks,
    [nodeId, reloadVersion],
  )

  if (isLoading && !node) {
    return <div className="p-6 text-sm text-muted-foreground">知识节点加载中...</div>
  }

  if (nodeError && !node) {
    return <div className="p-6"><ApiErrorNotice error={nodeError} onRetry={reloadNode} /></div>
  }

  if (!node) return <Navigate to="/wiki-nodes" replace />

  const { outgoingLinks, incomingLinks, brokenLinks } = links
  const activeDraft = draftNode?.nodeId === node.nodeId ? draftNode : node

  async function handleSave() {
    const formError = validateDraft(activeDraft)
    if (formError) {
      setValidationError(formError)
      setFeedback("")
      return
    }

    setIsSaving(true)
    setSaveError(null)
    setValidationError("")
    setFeedback("")
    try {
      const savedNode = await updateWikiNode(activeDraft.nodeId, activeDraft)
      setDraftNode(savedNode)
      setFeedback(commonLabels.saveSuccess)
      setMockActionState("")
      setReloadVersion((version) => version + 1)
    } catch (error) {
      setSaveError(error instanceof Error ? error : new Error("保存失败，请稍后重试"))
    } finally {
      setIsSaving(false)
    }
  }

  function handleMockPublish() {
    setDraftNode({
      ...activeDraft,
      status: "published",
      publishStatus: "published",
      reviewStatus: "approved",
      lastPublishedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    })
    setMockActionState("publish")
  }

  function handleMockReindex() {
    setDraftNode({
      ...activeDraft,
      indexStatus: "indexing",
    })
    setMockActionState("reindex")
  }

  return (
    <div className="flex h-[calc(100svh-3rem)] flex-col">
      <div className="border-b p-4">
        <PageHeader
          title={activeDraft.title}
          actions={
            <>
              <NodeTypeBadge type={activeDraft.nodeType} />
              <StatusBadge status={activeDraft.status} />
              <IndexStatusBadge status={activeDraft.indexStatus} />
              <Button size="sm" variant="outline" onClick={handleSave} disabled={isSaving}>
                <SaveIcon data-icon="inline-start" />{isSaving ? actionLabels.saving : actionLabels.save}
              </Button>
              <Button size="sm" variant="outline" onClick={handleMockPublish}>
                <SendIcon data-icon="inline-start" />{actionLabels.publish}
              </Button>
              <Button size="sm" variant="outline" onClick={handleMockReindex}>
                <UploadCloudIcon data-icon="inline-start" />{actionLabels.reindex}
              </Button>
              <Button
                size="sm"
                asChild
              >
                <Link to={`/retrieval-test?q=${encodeURIComponent(activeDraft.title)}`}>
                  <SearchIcon data-icon="inline-start" />{actionLabels.testRetrieval}
                </Link>
              </Button>
            </>
          }
        />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)_380px]" data-testid="wikinode-editor-workspace">
        <WikiNodeExplorer nodes={nodes} currentNodeId={node.nodeId} query={explorerQuery} onQueryChange={setExplorerQuery} />
        <div className="flex min-w-0 flex-col gap-3">
          {feedback ? <FeedbackNotice title={feedback} /> : null}
          {mockActionState === "publish" ? <FeedbackNotice title={commonLabels.publishSuccess} description={commonLabels.localPublishOnly} /> : null}
          {mockActionState === "reindex" ? <FeedbackNotice title={commonLabels.reindexSuccess} description={commonLabels.localReindexOnly} /> : null}
          {validationError ? <p className="px-4 text-sm text-destructive">{validationError}</p> : null}
          <ApiErrorNotice error={saveError} title={commonLabels.saveFailed} />
          <ApiErrorNotice error={nodesError} onRetry={reloadNodes} />
          <ApiErrorNotice error={linksError} onRetry={reloadLinks} />
          <WikiNodeEditor key={node.nodeId} node={activeDraft} nodes={nodes} onDraftChange={setDraftNode} />
        </div>
        <WikiNodeInspector node={activeDraft} outgoingLinks={outgoingLinks} incomingLinks={incomingLinks} brokenLinks={brokenLinks} />
      </div>
    </div>
  )
}

function validateDraft(node: WikiNode) {
  if (!node.title.trim()) return "请填写标题"
  if (!node.summary.trim()) return "请填写摘要"
  if (!node.contentMarkdown.trim()) return "请填写正文内容"

  return ""
}
