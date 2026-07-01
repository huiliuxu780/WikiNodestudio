import { useMemo, useState, type ReactNode } from "react"
import { Link, useParams } from "react-router-dom"

import { ApiErrorNotice } from "@/components/api-error-notice"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useAsyncData } from "@/hooks/use-async-data"
import {
  archiveKnowledgeBase,
  createKnowledgeBase,
  disableKnowledgeBase,
  getKnowledgeBase,
  listKnowledgeBases,
  restoreKnowledgeBase,
  updateKnowledgeBase,
} from "@/services/knowledge-base-api-service"
import { listSources } from "@/services/source-api-service"
import { listWikiNodes } from "@/services/wiki-node-api-service"
import type { SourceItem } from "@/types/source"
import type { KnowledgeBase, KnowledgeBaseInput } from "@/types/knowledge-base"
import type { WikiNode } from "@/types/wiki"
import {
  commonLabels,
  indexStatusLabels,
  knowledgeBaseSettingLabels,
  knowledgeBaseStatusLabels,
  knowledgeBaseTypeLabels,
  knowledgeBaseVisibilityLabels,
  labelFromMap,
  nodeTypeLabels,
  objectTypeLabels,
  sourceConnectionStatusLabels,
  sourceCredentialStatusLabels,
  sourceIngestionModeLabels,
  sourceTypeLabels,
  statusLabels,
  subtypeLabels,
  syncStatusLabels,
} from "@/utils/display-labels"

const emptyInput: KnowledgeBaseInput = {
  kbId: "",
  name: "",
  description: "",
  businessDomain: "",
  type: "mixed",
  visibility: "internal",
  owner: "Knowledge Ops",
  settings: {
    defaultNodeType: "policy",
    defaultParserEngine: "markdown",
    defaultStorageProvider: "workspace",
    defaultVectorStore: "external_vector_store",
    defaultPublishingPolicy: "manual",
    defaultRetrievalStrategy: "wikinode_first",
  },
}

export function KnowledgeBaseListPage() {
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState("all")
  const [visibility, setVisibility] = useState("all")
  const [isCreating, setIsCreating] = useState(false)
  const [createInput, setCreateInput] = useState<KnowledgeBaseInput>(emptyInput)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [createError, setCreateError] = useState<Error | null>(null)
  const { data: knowledgeBases, isLoading, error, reload } = useAsyncData(
    () => listKnowledgeBases({ keyword, status, visibility }),
    [],
    [keyword, status, visibility],
  )

  async function handleCreate() {
    setCreateError(null)
    setFeedback(null)
    setIsCreating(true)
    try {
      await createKnowledgeBase(createInput)
      setFeedback(commonLabels.createSuccess)
      setCreateInput(emptyInput)
      reload()
    } catch (error) {
      setCreateError(error instanceof Error ? error : new Error("创建知识库失败"))
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="知识库" description="管理知识库范围、状态、WikiNode 数量和 Source 数量。" />
      <ApiErrorNotice error={error} onRetry={reload} />
      <ApiErrorNotice error={createError} title={commonLabels.createFailed} />
      <ToastMessage message={feedback} onClose={() => setFeedback(null)} />

      <section className="rounded-md border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-end">
          <Field label="搜索知识库" className="min-w-64 flex-1">
            <Input
              aria-label="搜索知识库"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="名称、描述或业务域"
            />
          </Field>
          <SelectField label="状态" value={status} onChange={setStatus} labels={knowledgeBaseStatusLabels} items={["active", "disabled", "archived"]} />
          <SelectField label="可见范围" value={visibility} onChange={setVisibility} labels={knowledgeBaseVisibilityLabels} items={["internal", "private", "public"]} />
          <Button
            variant="outline"
            onClick={() => {
              setKeyword("")
              setStatus("all")
              setVisibility("all")
            }}
          >
            重置
          </Button>
          <Button onClick={() => setFeedback(null)}>新建知识库</Button>
        </div>
        <div className="border-b p-4">
          <KnowledgeBaseCreateForm
            value={createInput}
            onChange={setCreateInput}
            onSubmit={() => void handleCreate()}
            isSubmitting={isCreating}
          />
        </div>
        <KnowledgeBaseTable knowledgeBases={knowledgeBases} isLoading={isLoading} />
      </section>
    </div>
  )
}

export function KnowledgeBaseDetailPage() {
  const { kbId = "" } = useParams()
  const { data, isLoading, error, reload } = useAsyncData(() => getKnowledgeBase(kbId), null as KnowledgeBase | null, [kbId])
  const { data: wikiNodes, isLoading: isLoadingWikiNodes, error: wikiNodeError, reload: reloadWikiNodes } = useAsyncData(() => listWikiNodes(), [] as WikiNode[], [kbId])
  const { data: sources, isLoading: isLoadingSources, error: sourceError, reload: reloadSources } = useAsyncData(() => listSources(), [] as SourceItem[], [kbId])
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [actionError, setActionError] = useState<Error | null>(null)
  const activeKb = knowledgeBase ?? data
  const scopedWikiNodes = wikiNodes.filter((node) => node.knowledgeBaseId === kbId)
  const scopedSources = sources.filter((source) => source.knowledgeBaseId === kbId)

  async function handleLifecycle(action: "disable" | "archive" | "restore") {
    if (!activeKb) return
    setFeedback(null)
    setActionError(null)
    try {
      const result = action === "disable"
        ? await disableKnowledgeBase(activeKb.kbId)
        : action === "archive"
          ? await archiveKnowledgeBase(activeKb.kbId)
          : await restoreKnowledgeBase(activeKb.kbId)
      setKnowledgeBase({ ...activeKb, status: result.status, archivedAt: result.archivedAt, updatedAt: result.updatedAt })
      setFeedback("状态已更新")
    } catch (error) {
      setActionError(error instanceof Error ? error : new Error("状态更新失败"))
    }
  }

  if (isLoading && !activeKb) {
    return <div className="p-6 text-sm text-muted-foreground">正在加载知识库...</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <ApiErrorNotice error={error} onRetry={reload} />
      <ApiErrorNotice error={wikiNodeError} title="知识节点归属加载失败" onRetry={reloadWikiNodes} />
      <ApiErrorNotice error={sourceError} title="知识来源归属加载失败" onRetry={reloadSources} />
      <ApiErrorNotice error={actionError} title="状态更新失败" />
      {activeKb ? (
        <>
          <PageHeader
            title={activeKb.name}
            description={activeKb.description}
            actions={
              <>
                <Button variant="outline" asChild><Link to={`/knowledge-bases/${activeKb.kbId}/settings`}>设置</Link></Button>
                <LifecycleActions status={activeKb.status} onAction={(action) => void handleLifecycle(action)} />
              </>
            }
          />
          <ToastMessage message={feedback} onClose={() => setFeedback(null)} />
          <section className="rounded-md border bg-card">
            <div className="grid gap-0 border-b md:grid-cols-4">
              <Metric label="知识资产" value={`${scopedWikiNodes.length || activeKb.wikiNodeCount} 个 WikiNode`} />
              <Metric label="数据来源" value={`${scopedSources.length || activeKb.sourceCount} 个 Source`} />
              <Metric label="召回范围" value={activeKb.kbId} />
              <Metric label="负责人" value={activeKb.owner} />
            </div>
            <div className="grid gap-0 border-b md:grid-cols-4">
              <SummaryCell label="状态" value={labelFromMap(knowledgeBaseStatusLabels, activeKb.status)} />
              <SummaryCell label="可见范围" value={labelFromMap(knowledgeBaseVisibilityLabels, activeKb.visibility)} />
              <SummaryCell label="业务域" value={activeKb.businessDomain} />
              <SummaryCell label="更新时间" value={activeKb.updatedAt} />
            </div>
            <Tabs defaultValue="wikinodes" className="gap-0">
              <div className="border-b px-4 py-3">
                <TabsList variant="line">
                  <TabsTrigger value="wikinodes">WikiNode</TabsTrigger>
                  <TabsTrigger value="sources">Source</TabsTrigger>
                  <TabsTrigger value="retrieval">召回范围</TabsTrigger>
                  <TabsTrigger value="settings">设置摘要</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="wikinodes" className="m-0">
                <ScopedWikiNodeTable wikiNodes={scopedWikiNodes} isLoading={isLoadingWikiNodes} />
              </TabsContent>
              <TabsContent value="sources" className="m-0">
                <ScopedSourceTable sources={scopedSources} isLoading={isLoadingSources} />
              </TabsContent>
              <TabsContent value="retrieval" className="m-0">
                <RetrievalScopePanel knowledgeBase={activeKb} />
              </TabsContent>
              <TabsContent value="settings" className="m-0">
                <SettingsSummaryTable knowledgeBase={activeKb} />
              </TabsContent>
            </Tabs>
          </section>
        </>
      ) : (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">知识库不存在或尚未加载。</p>
      )}
    </div>
  )
}

export function KnowledgeBaseSettingsPage() {
  const { kbId = "" } = useParams()
  const { data, isLoading, error, reload } = useAsyncData(() => getKnowledgeBase(kbId), null as KnowledgeBase | null, [kbId])
  const { data: sources } = useAsyncData(() => listSources(), [] as SourceItem[], [kbId])
  const [form, setForm] = useState<KnowledgeBaseInput | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<Error | null>(null)
  const firstSource = sources.find((source) => source.knowledgeBaseId === kbId)

  const activeForm = useMemo(() => {
    if (form) return form
    if (!data) return null
    return inputFromKnowledgeBase(data)
  }, [data, form])

  async function handleSave() {
    if (!activeForm) return
    setIsSaving(true)
    setSaveError(null)
    setFeedback(null)
    try {
      const saved = await updateKnowledgeBase(kbId, activeForm)
      setForm(inputFromKnowledgeBase(saved))
      setFeedback(commonLabels.saveSuccess)
    } catch (error) {
      setSaveError(error instanceof Error ? error : new Error("保存知识库设置失败"))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSettingsLifecycle(action: "disable" | "archive" | "restore") {
    if (!activeForm) return
    setSaveError(null)
    setFeedback(null)
    try {
      const result = action === "disable"
        ? await disableKnowledgeBase(kbId)
        : action === "archive"
          ? await archiveKnowledgeBase(kbId)
          : await restoreKnowledgeBase(kbId)
      setForm({ ...activeForm, status: result.status })
      setFeedback("状态已更新")
    } catch (error) {
      setSaveError(error instanceof Error ? error : new Error("状态更新失败"))
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="知识库设置"
        description="维护知识库基础信息和默认策略。"
        actions={firstSource ? (
          <Button asChild variant="outline">
            <Link to={`/knowledge-bases/${kbId}/import?sourceId=${firstSource.sourceId}`}>导入文件</Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to={`/knowledge-bases/${kbId}`}>查看 Source</Link>
          </Button>
        )}
      />
      <ApiErrorNotice error={error} onRetry={reload} />
      <ApiErrorNotice error={saveError} title={commonLabels.saveFailed} />
      <ToastMessage message={feedback} onClose={() => setFeedback(null)} />
      {isLoading && !activeForm ? <p className="text-sm text-muted-foreground">正在加载知识库设置...</p> : null}
      {activeForm ? (
        <div className="grid gap-4">
          <section className="rounded-md border bg-card p-4">
            <KnowledgeBaseEditForm
              value={activeForm}
              onChange={(next) => setForm(next)}
              onSubmit={() => void handleSave()}
              isSubmitting={isSaving}
            />
          </section>
          <section className="rounded-md border border-destructive/30 bg-card">
            <div className="border-b p-4">
              <h2 className="text-base font-semibold">危险操作</h2>
              <p className="mt-1 text-sm text-muted-foreground">状态变更会影响知识库范围内 WikiNode、Source 和召回范围的可用性。</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium">当前状态：{labelFromMap(knowledgeBaseStatusLabels, activeForm.status ?? data?.status ?? "active")}</p>
                <p className="text-xs text-muted-foreground">高风险动作集中在这里处理，避免和日常编辑混在一起。</p>
              </div>
              <LifecycleActions status={activeForm.status ?? data?.status ?? "active"} onAction={(action) => void handleSettingsLifecycle(action)} />
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

function KnowledgeBaseTable({ knowledgeBases, isLoading }: { knowledgeBases: KnowledgeBase[]; isLoading: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>知识库</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>可见范围</TableHead>
          <TableHead>业务域</TableHead>
          <TableHead>WikiNode</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>负责人</TableHead>
          <TableHead>更新时间</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow><TableCell colSpan={8} className="text-muted-foreground">正在加载知识库...</TableCell></TableRow>
        ) : null}
        {!isLoading && knowledgeBases.length === 0 ? (
          <TableRow><TableCell colSpan={8} className="text-muted-foreground">暂无知识库，请调整筛选条件或创建新的 Knowledge Base。</TableCell></TableRow>
        ) : null}
        {knowledgeBases.map((kb) => (
          <TableRow key={kb.kbId}>
            <TableCell>
              <Link to={`/knowledge-bases/${kb.kbId}`} className="font-medium hover:underline">{kb.name}</Link>
              <div className="max-w-[360px] truncate text-xs text-muted-foreground">{kb.description}</div>
            </TableCell>
            <TableCell><Badge variant={kb.status === "archived" ? "outline" : "secondary"}>{labelFromMap(knowledgeBaseStatusLabels, kb.status)}</Badge></TableCell>
            <TableCell>{labelFromMap(knowledgeBaseVisibilityLabels, kb.visibility)}</TableCell>
            <TableCell>{kb.businessDomain}</TableCell>
            <TableCell>{kb.wikiNodeCount}</TableCell>
            <TableCell>{kb.sourceCount}</TableCell>
            <TableCell>{kb.owner}</TableCell>
            <TableCell>{kb.updatedAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function KnowledgeBaseCreateForm({
  value,
  onChange,
  onSubmit,
  isSubmitting,
}: {
  value: KnowledgeBaseInput
  onChange: (value: KnowledgeBaseInput) => void
  onSubmit: () => void
  isSubmitting: boolean
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1.5fr_auto] lg:items-end">
      <Field label="知识库名称"><Input aria-label="知识库名称" value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} /></Field>
      <Field label="知识库 ID"><Input aria-label="知识库 ID" value={value.kbId} onChange={(event) => onChange({ ...value, kbId: event.target.value })} /></Field>
      <Field label="业务域"><Input aria-label="业务域" value={value.businessDomain} onChange={(event) => onChange({ ...value, businessDomain: event.target.value })} /></Field>
      <Field label="描述"><Input aria-label="描述" value={value.description} onChange={(event) => onChange({ ...value, description: event.target.value })} /></Field>
      <Button onClick={onSubmit} disabled={isSubmitting || !value.name.trim() || !value.kbId?.trim()}>{isSubmitting ? "创建中..." : "创建"}</Button>
    </div>
  )
}

function KnowledgeBaseEditForm({
  value,
  onChange,
  onSubmit,
  isSubmitting,
}: {
  value: KnowledgeBaseInput
  onChange: (value: KnowledgeBaseInput) => void
  onSubmit: () => void
  isSubmitting: boolean
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="知识库名称"><Input aria-label="知识库名称" value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} /></Field>
        <Field label="业务域"><Input aria-label="业务域" value={value.businessDomain} onChange={(event) => onChange({ ...value, businessDomain: event.target.value })} /></Field>
        <Field label="负责人"><Input aria-label="负责人" value={value.owner} onChange={(event) => onChange({ ...value, owner: event.target.value })} /></Field>
        <SelectField label="可见范围" value={value.visibility} onChange={(visibility) => onChange({ ...value, visibility: visibility as KnowledgeBase["visibility"] })} labels={knowledgeBaseVisibilityLabels} items={["internal", "private", "public"]} includeAll={false} />
      </div>
      <Field label="描述"><Textarea aria-label="描述" value={value.description} onChange={(event) => onChange({ ...value, description: event.target.value })} /></Field>
      <div className="grid gap-3 md:grid-cols-3">
        <SelectField label="默认节点类型" value={value.settings.defaultNodeType ?? "policy"} onChange={(defaultNodeType) => onChange({ ...value, settings: { ...value.settings, defaultNodeType } })} labels={nodeTypeLabels} items={["policy", "procedure", "guide", "product", "troubleshooting", "term", "fee_rule"]} includeAll={false} />
        <SelectField label="默认解析引擎" value={value.settings.defaultParserEngine ?? "markdown"} onChange={(defaultParserEngine) => onChange({ ...value, settings: { ...value.settings, defaultParserEngine } })} labels={knowledgeBaseSettingLabels} items={["markdown", "pdf_manual_article_v1"]} includeAll={false} />
        <SelectField label="默认召回策略" value={value.settings.defaultRetrievalStrategy ?? "wikinode_first"} onChange={(defaultRetrievalStrategy) => onChange({ ...value, settings: { ...value.settings, defaultRetrievalStrategy } })} labels={knowledgeBaseSettingLabels} items={["wikinode_first"]} includeAll={false} />
      </div>
      <Button className="w-fit" onClick={onSubmit} disabled={isSubmitting || !value.name.trim()}>{isSubmitting ? "保存中..." : "保存设置"}</Button>
    </div>
  )
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  labels,
  items,
  includeAll = true,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  labels: Record<string, string>
  items: string[]
  includeAll?: boolean
}) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full" aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {includeAll ? <SelectItem value="all">全部</SelectItem> : null}
            {items.map((item) => <SelectItem key={item} value={item}>{labelFromMap(labels, item)}</SelectItem>)}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  )
}

function ToastMessage({ message, onClose }: { message: string | null; onClose: () => void }) {
  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-6 top-6 z-50 flex min-w-64 items-center justify-between gap-4 rounded-md border bg-popover px-4 py-3 text-sm shadow-md"
    >
      <span className="font-medium">{message}</span>
      <Button type="button" variant="ghost" size="sm" onClick={onClose}>关闭</Button>
    </div>
  )
}

function LifecycleActions({
  status,
  onAction,
  disabled = false,
}: {
  status: KnowledgeBase["status"]
  onAction: (action: "disable" | "archive" | "restore") => void
  disabled?: boolean
}) {
  if (status === "archived") {
    return <Button disabled={disabled} onClick={() => onAction("restore")}>恢复</Button>
  }

  if (status === "disabled") {
    return (
      <>
        <Button variant="outline" disabled={disabled} onClick={() => onAction("archive")}>归档</Button>
        <Button disabled={disabled} onClick={() => onAction("restore")}>恢复</Button>
      </>
    )
  }

  return (
    <>
      <Button variant="outline" disabled={disabled} onClick={() => onAction("disable")}>停用</Button>
      <Button variant="outline" disabled={disabled} onClick={() => onAction("archive")}>归档</Button>
    </>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-b p-4 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-base font-semibold">{value}</div>
    </div>
  )
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-b px-4 py-3 text-sm md:border-b-0 md:border-r md:last:border-r-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-3 font-medium">{value}</span>
    </div>
  )
}

function ScopedWikiNodeTable({ wikiNodes, isLoading }: { wikiNodes: WikiNode[]; isLoading: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>WikiNode</TableHead>
          <TableHead>Knowledge Object</TableHead>
          <TableHead>发布状态</TableHead>
          <TableHead>索引状态</TableHead>
          <TableHead>负责人</TableHead>
          <TableHead>更新时间</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow><TableCell colSpan={6} className="text-muted-foreground">正在加载 WikiNode 归属...</TableCell></TableRow>
        ) : null}
        {!isLoading && wikiNodes.length === 0 ? (
          <TableRow><TableCell colSpan={6} className="text-muted-foreground">该知识库下暂无 WikiNode。</TableCell></TableRow>
        ) : null}
        {wikiNodes.map((node) => (
          <TableRow key={node.nodeId}>
            <TableCell>
              <Link to={`/wiki-nodes/${node.nodeId}`} className="font-medium hover:underline">{node.title}</Link>
              <div className="text-xs text-muted-foreground">{node.nodeId}</div>
            </TableCell>
            <TableCell>{labelFromMap(objectTypeLabels, node.objectType ?? "")} / {labelFromMap(subtypeLabels, node.subtype ?? "")}</TableCell>
            <TableCell><Badge variant="secondary">{labelFromMap(statusLabels, node.status)}</Badge></TableCell>
            <TableCell><Badge variant={node.indexStatus === "failed" ? "destructive" : "outline"}>{labelFromMap(indexStatusLabels, node.indexStatus)}</Badge></TableCell>
            <TableCell>{node.owner}</TableCell>
            <TableCell>{node.updatedAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ScopedSourceTable({ sources, isLoading }: { sources: SourceItem[]; isLoading: boolean }) {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[1160px]">
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>来源类型</TableHead>
            <TableHead>接入模式</TableHead>
            <TableHead>凭据状态</TableHead>
            <TableHead>连接状态</TableHead>
            <TableHead>同步状态</TableHead>
            <TableHead>Raw Material</TableHead>
            <TableHead>WikiNode 建议</TableHead>
            <TableHead>处理记录</TableHead>
            <TableHead>负责人</TableHead>
            <TableHead>最近检查</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={12} className="text-muted-foreground">正在加载 Source 归属...</TableCell></TableRow>
          ) : null}
          {!isLoading && sources.length === 0 ? (
            <TableRow><TableCell colSpan={12} className="text-muted-foreground">该知识库下暂无 Source。</TableCell></TableRow>
          ) : null}
          {sources.map((source) => (
            <TableRow key={source.sourceId}>
              <TableCell>
                <Link to={`/sources/${source.sourceId}`} className="font-medium hover:underline">{source.title}</Link>
                <div className="text-xs text-muted-foreground">{source.sourceId}</div>
              </TableCell>
              <TableCell>{labelFromMap(sourceTypeLabels, source.sourceType)}</TableCell>
              <TableCell>{labelFromMap(sourceIngestionModeLabels, source.ingestionMode ?? "not_configured")}</TableCell>
              <TableCell>
                <Badge variant={source.credentialStatus === "missing" || source.credentialStatus === "expired" || source.credentialStatus === "revoked" ? "destructive" : "outline"}>
                  {labelFromMap(sourceCredentialStatusLabels, source.credentialStatus ?? "missing")}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={source.connectionStatus === "failed" ? "destructive" : "outline"}>
                  {labelFromMap(sourceConnectionStatusLabels, source.connectionStatus ?? "not_configured")}
                </Badge>
              </TableCell>
              <TableCell><Badge variant={source.syncStatus === "failed" ? "destructive" : "outline"}>{labelFromMap(syncStatusLabels, source.syncStatus)}</Badge></TableCell>
              <TableCell>{source.rawMaterialCount}</TableCell>
              <TableCell>{source.generatedNodes}</TableCell>
              <TableCell>{source.generatedNodes + source.rawMaterialCount}</TableCell>
              <TableCell>{source.owner}</TableCell>
              <TableCell>{source.lastCredentialCheckedAt ?? source.lastCheckedAt ?? source.lastSyncedAt}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/sources/${source.sourceId}`}>查看 Source</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to={`/knowledge-bases/${source.knowledgeBaseId ?? ""}/import?sourceId=${source.sourceId}`}>导入文件</Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function RetrievalScopePanel({ knowledgeBase }: { knowledgeBase: KnowledgeBase }) {
  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-md border bg-background">
        <div className="border-b px-4 py-3 text-sm font-medium">知识召回接口范围</div>
        <div className="grid gap-3 p-4 text-sm">
          <KeyValue label="范围过滤" value={`filters.knowledgeBaseId = ${knowledgeBase.kbId}`} />
          <KeyValue label="默认召回策略" value={labelFromMap(knowledgeBaseSettingLabels, knowledgeBase.settings.defaultRetrievalStrategy ?? "")} />
          <KeyValue label="返回对象" value="WikiNode 结果，Index Segment 只作为调试证据" />
        </div>
      </div>
      <div className="rounded-md border bg-background p-4 text-sm">
        <div className="font-medium">归属规则</div>
        <ul className="mt-3 grid gap-2 text-muted-foreground">
          <li>WikiNode 和 Source 通过 knowledgeBaseId 归入当前知识库。</li>
          <li>检索请求携带相同 knowledgeBaseId 时，只返回该范围内的 WikiNode。</li>
          <li>调试模式可展示 Index Segment 证据，默认结果仍以 WikiNode 为中心。</li>
        </ul>
      </div>
    </div>
  )
}

function SettingsSummaryTable({ knowledgeBase }: { knowledgeBase: KnowledgeBase }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>配置项</TableHead>
          <TableHead>当前值</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {settingRows(knowledgeBase).map(([label, value]) => (
          <TableRow key={label}>
            <TableCell>{label}</TableCell>
            <TableCell className="font-medium">{value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function inputFromKnowledgeBase(kb: KnowledgeBase): KnowledgeBaseInput {
  return {
    kbId: kb.kbId,
    name: kb.name,
    description: kb.description,
    businessDomain: kb.businessDomain,
    type: kb.type,
    status: kb.status,
    visibility: kb.visibility,
    owner: kb.owner,
    settings: kb.settings,
  }
}

function settingRows(kb: KnowledgeBase) {
  return [
    ["默认节点类型", labelFromMap(knowledgeBaseSettingLabels, kb.settings.defaultNodeType ?? "")],
    ["默认解析引擎", labelFromMap(knowledgeBaseSettingLabels, kb.settings.defaultParserEngine ?? "")],
    ["默认存储", labelFromMap(knowledgeBaseSettingLabels, kb.settings.defaultStorageProvider ?? "")],
    ["默认召回策略", labelFromMap(knowledgeBaseSettingLabels, kb.settings.defaultRetrievalStrategy ?? "")],
    ["知识库类型", labelFromMap(knowledgeBaseTypeLabels, kb.type)],
  ]
}
