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
import { generateIndexSegmentsForWikiNode, listIndexSegmentsForWikiNode } from "@/services/index-segment-api-service"
import {
  createKnowledgeRelation,
  deleteKnowledgeRelation,
  getNodeLinks,
  getWikiNodeById,
  listWikiNodes,
  publishWikiNode,
  reindexWikiNode,
  updateKnowledgeRelation,
  updateWikiNode,
  type WikiNodeLinks,
} from "@/services/wiki-node-api-service"
import type { IndexSegment } from "@/types/index-segment"
import type { KnowledgeRelation, KnowledgeRelationInput, WikiNode } from "@/types/wiki"
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
  const [isPublishing, setIsPublishing] = useState(false)
  const [isReindexing, setIsReindexing] = useState(false)
  const [lifecycleError, setLifecycleError] = useState<Error | null>(null)
  const [generatedSegmentsNodeId, setGeneratedSegmentsNodeId] = useState("")
  const [generatedSegments, setGeneratedSegments] = useState<IndexSegment[] | null>(null)
  const [isGeneratingSegments, setIsGeneratingSegments] = useState(false)
  const [segmentGenerationError, setSegmentGenerationError] = useState<Error | null>(null)
  const [segmentGenerationFeedback, setSegmentGenerationFeedback] = useState("")
  const [relationMutationError, setRelationMutationError] = useState<Error | null>(null)
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
  const { data: indexSegments, error: indexSegmentsError, reload: reloadIndexSegments } = useAsyncData(
    () => nodeId ? listIndexSegmentsForWikiNode(nodeId) : Promise.resolve([]),
    [],
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
  const activeIndexSegments = generatedSegmentsNodeId === activeDraft.nodeId && generatedSegments ? generatedSegments : indexSegments

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
      setReloadVersion((version) => version + 1)
    } catch (error) {
      setSaveError(error instanceof Error ? error : new Error("保存失败，请稍后重试"))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleGenerateIndexSegments() {
    setIsGeneratingSegments(true)
    setSegmentGenerationError(null)
    setSegmentGenerationFeedback("")
    try {
      const generated = await generateIndexSegmentsForWikiNode(activeDraft.nodeId)
      setGeneratedSegmentsNodeId(activeDraft.nodeId)
      setGeneratedSegments(generated)
      setSegmentGenerationFeedback("已生成本地 Index Segment，尚未执行外部向量库同步。")
      reloadIndexSegments()
    } catch (error) {
      setSegmentGenerationError(error instanceof Error ? error : new Error("生成本地 Index Segment 失败，请稍后重试"))
    } finally {
      setIsGeneratingSegments(false)
    }
  }

  async function handleCreateRelation(input: KnowledgeRelationInput) {
    setRelationMutationError(null)
    try {
      const relation = await createKnowledgeRelation(activeDraft.nodeId, input)
      patchDraftRelations((relations) => [...relations, relation])
      setFeedback("关系已添加")
      setReloadVersion((version) => version + 1)
    } catch (error) {
      setRelationMutationError(error instanceof Error ? error : new Error("添加关系失败，请稍后重试"))
    }
  }

  async function handleUpdateRelation(relationId: string, input: KnowledgeRelationInput) {
    setRelationMutationError(null)
    try {
      const relation = await updateKnowledgeRelation(activeDraft.nodeId, relationId, input)
      patchDraftRelations((relations) => relations.map((item) => item.id === relationId ? relation : item))
      setFeedback("关系已更新")
      setReloadVersion((version) => version + 1)
    } catch (error) {
      setRelationMutationError(error instanceof Error ? error : new Error("更新关系失败，请稍后重试"))
    }
  }

  async function handleDeleteRelation(relationId: string) {
    setRelationMutationError(null)
    try {
      await deleteKnowledgeRelation(activeDraft.nodeId, relationId)
      patchDraftRelations((relations) => relations.filter((item) => item.id !== relationId))
      setFeedback("关系已删除")
      setReloadVersion((version) => version + 1)
    } catch (error) {
      setRelationMutationError(error instanceof Error ? error : new Error("删除关系失败，请稍后重试"))
    }
  }

  function patchDraftRelations(updater: (relations: KnowledgeRelation[]) => KnowledgeRelation[]) {
    setDraftNode({
      ...activeDraft,
      relations: updater(activeDraft.relations ?? []),
    })
  }

  async function handlePublish() {
    setIsPublishing(true)
    setLifecycleError(null)
    setFeedback("")
    try {
      const result = await publishWikiNode(activeDraft.nodeId)
      setDraftNode({
        ...activeDraft,
        status: result.status,
        indexStatus: result.indexStatus,
        publishStatus: "published",
        reviewStatus: "approved",
        lastPublishedAt: result.lastPublishedAt ?? activeDraft.lastPublishedAt,
        lastIndexedAt: result.lastIndexedAt ?? undefined,
      })
      setFeedback(result.summary)
      setGeneratedSegmentsNodeId("")
      setGeneratedSegments(null)
      setReloadVersion((version) => version + 1)
      reloadIndexSegments()
    } catch (error) {
      setLifecycleError(error instanceof Error ? error : new Error("发布 WikiNode 失败，请稍后重试"))
    } finally {
      setIsPublishing(false)
    }
  }

  async function handleReindex() {
    setIsReindexing(true)
    setLifecycleError(null)
    setFeedback("")
    try {
      const result = await reindexWikiNode(activeDraft.nodeId)
      setDraftNode({
        ...activeDraft,
        status: result.status,
        indexStatus: result.indexStatus,
        lastIndexedAt: result.lastIndexedAt ?? undefined,
      })
      setFeedback(result.summary)
      setGeneratedSegmentsNodeId("")
      setGeneratedSegments(null)
      setReloadVersion((version) => version + 1)
      reloadIndexSegments()
    } catch (error) {
      setLifecycleError(error instanceof Error ? error : new Error("重新准备 Index Segment 失败，请稍后重试"))
    } finally {
      setIsReindexing(false)
    }
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
              <Button size="sm" variant="outline" onClick={handlePublish} disabled={isPublishing || activeDraft.status === "archived"}>
                <SendIcon data-icon="inline-start" />{isPublishing ? "发布中" : actionLabels.publish}
              </Button>
              <Button size="sm" variant="outline" onClick={handleReindex} disabled={isReindexing}>
                <UploadCloudIcon data-icon="inline-start" />{isReindexing ? "准备中" : actionLabels.reindex}
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
          {validationError ? <p className="px-4 text-sm text-destructive">{validationError}</p> : null}
          <ApiErrorNotice error={saveError} title={commonLabels.saveFailed} />
          <ApiErrorNotice error={lifecycleError} title="发布与索引准备失败" />
          <ApiErrorNotice error={nodesError} onRetry={reloadNodes} />
          <ApiErrorNotice error={linksError} onRetry={reloadLinks} />
          <ApiErrorNotice error={indexSegmentsError} onRetry={reloadIndexSegments} />
          <ApiErrorNotice error={segmentGenerationError} title="生成本地 Index Segment 失败" />
          <ApiErrorNotice error={relationMutationError} title="关系操作失败" />
          <WikiNodeEditor key={node.nodeId} node={activeDraft} nodes={nodes} onDraftChange={setDraftNode} />
        </div>
        <WikiNodeInspector
          node={activeDraft}
          availableNodes={nodes}
          outgoingLinks={outgoingLinks}
          incomingLinks={incomingLinks}
          brokenLinks={brokenLinks}
          indexSegments={activeIndexSegments}
          onCreateRelation={handleCreateRelation}
          onUpdateRelation={handleUpdateRelation}
          onDeleteRelation={handleDeleteRelation}
          onGenerateIndexSegments={handleGenerateIndexSegments}
          isGeneratingIndexSegments={isGeneratingSegments}
          segmentGenerationFeedback={segmentGenerationFeedback}
        />
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
