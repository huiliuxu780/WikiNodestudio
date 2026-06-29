import { useMemo, useState, type ReactNode } from "react"
import { Link, useParams } from "react-router-dom"

import { ApiErrorNotice } from "@/components/api-error-notice"
import { PageHeader } from "@/components/layout/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import type { KnowledgeBase, KnowledgeBaseInput } from "@/types/knowledge-base"
import {
  commonLabels,
  knowledgeBaseSettingLabels,
  knowledgeBaseStatusLabels,
  knowledgeBaseTypeLabels,
  knowledgeBaseVisibilityLabels,
  labelFromMap,
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
      <PageHeader title="知识库" description="管理 Knowledge Base 范围、状态、WikiNode 数量和 Source 数量。" />
      <ApiErrorNotice error={error} onRetry={reload} />
      <ApiErrorNotice error={createError} title={commonLabels.createFailed} />
      {feedback ? <Feedback title={feedback} /> : null}

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
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [actionError, setActionError] = useState<Error | null>(null)
  const activeKb = knowledgeBase ?? data

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
      <ApiErrorNotice error={actionError} title="状态更新失败" />
      {activeKb ? (
        <>
          <PageHeader
            title={activeKb.name}
            description={activeKb.description}
            actions={
              <>
                <Button variant="outline" asChild><Link to={`/knowledge-bases/${activeKb.kbId}/settings`}>设置</Link></Button>
                <Button variant="outline" onClick={() => void handleLifecycle("disable")}>停用</Button>
                <Button variant="outline" onClick={() => void handleLifecycle("archive")}>归档</Button>
                <Button onClick={() => void handleLifecycle("restore")}>恢复</Button>
              </>
            }
          />
          {feedback ? <Feedback title={feedback} /> : null}
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">范围概览</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 text-sm md:grid-cols-2">
                  <KeyValue label="状态" value={labelFromMap(knowledgeBaseStatusLabels, activeKb.status)} />
                  <KeyValue label="可见范围" value={labelFromMap(knowledgeBaseVisibilityLabels, activeKb.visibility)} />
                  <KeyValue label="业务域" value={activeKb.businessDomain} />
                  <KeyValue label="负责人" value={activeKb.owner} />
                  <KeyValue label="WikiNode" value={`${activeKb.wikiNodeCount} 个`} />
                  <KeyValue label="Source" value={`${activeKb.sourceCount} 个`} />
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">设置摘要</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                {settingRows(activeKb).map(([label, value]) => (
                  <KeyValue key={label} label={label} value={value} />
                ))}
              </CardContent>
            </Card>
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
  const [form, setForm] = useState<KnowledgeBaseInput | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<Error | null>(null)

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

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="知识库设置" description="维护 Knowledge Base 基础信息和默认策略。" />
      <ApiErrorNotice error={error} onRetry={reload} />
      <ApiErrorNotice error={saveError} title={commonLabels.saveFailed} />
      {feedback ? <Feedback title={feedback} /> : null}
      {isLoading && !activeForm ? <p className="text-sm text-muted-foreground">正在加载知识库设置...</p> : null}
      {activeForm ? (
        <section className="rounded-md border bg-card p-4">
          <KnowledgeBaseEditForm
            value={activeForm}
            onChange={(next) => setForm(next)}
            onSubmit={() => void handleSave()}
            isSubmitting={isSaving}
          />
        </section>
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
        <SelectField label="可见范围" value={value.visibility} onChange={(visibility) => onChange({ ...value, visibility: visibility as KnowledgeBase["visibility"] })} labels={knowledgeBaseVisibilityLabels} items={["internal", "private", "public"]} />
      </div>
      <Field label="描述"><Textarea aria-label="描述" value={value.description} onChange={(event) => onChange({ ...value, description: event.target.value })} /></Field>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="默认节点类型"><Input value={value.settings.defaultNodeType ?? ""} onChange={(event) => onChange({ ...value, settings: { ...value.settings, defaultNodeType: event.target.value } })} /></Field>
        <Field label="默认解析引擎"><Input value={value.settings.defaultParserEngine ?? ""} onChange={(event) => onChange({ ...value, settings: { ...value.settings, defaultParserEngine: event.target.value } })} /></Field>
        <Field label="默认召回策略"><Input value={value.settings.defaultRetrievalStrategy ?? ""} onChange={(event) => onChange({ ...value, settings: { ...value.settings, defaultRetrievalStrategy: event.target.value } })} /></Field>
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

function SelectField({ label, value, onChange, labels, items }: { label: string; value: string; onChange: (value: string) => void; labels: Record<string, string>; items: string[] }) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">全部</SelectItem>
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
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}

function Feedback({ title }: { title: string }) {
  return (
    <Alert>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>操作结果已更新。</AlertDescription>
    </Alert>
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
