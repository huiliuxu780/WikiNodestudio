import { mockKnowledgeBases } from "@/data/mock-knowledge-bases"
import { apiGet, apiPost, apiPut, withMockFallback } from "@/services/api-client"
import type { KnowledgeBase, KnowledgeBaseInput, KnowledgeBaseLifecycleResult } from "@/types/knowledge-base"

export type KnowledgeBaseListFilters = {
  keyword?: string
  status?: string
  visibility?: string
}

export function listKnowledgeBases(filters: KnowledgeBaseListFilters = {}) {
  const params = new URLSearchParams()
  if (filters.keyword?.trim()) params.set("keyword", filters.keyword.trim())
  if (filters.status && filters.status !== "all") params.set("status", filters.status)
  if (filters.visibility && filters.visibility !== "all") params.set("visibility", filters.visibility)
  const query = params.toString()

  return withMockFallback(
    apiGet<KnowledgeBase[]>(`/knowledge-bases${query ? `?${query}` : ""}`),
    () => mockKnowledgeBases.filter((kb) => {
      const keyword = filters.keyword?.trim().toLowerCase() ?? ""
      return (!keyword || kb.name.toLowerCase().includes(keyword) || kb.description.toLowerCase().includes(keyword))
        && (!filters.status || filters.status === "all" || kb.status === filters.status)
        && (!filters.visibility || filters.visibility === "all" || kb.visibility === filters.visibility)
    }),
  )
}

export function getKnowledgeBase(kbId: string) {
  return withMockFallback(
    apiGet<KnowledgeBase>(`/knowledge-bases/${kbId}`),
    () => mockKnowledgeBases.find((kb) => kb.kbId === kbId) ?? mockKnowledgeBases[0],
  )
}

export function createKnowledgeBase(input: KnowledgeBaseInput) {
  return withMockFallback(
    apiPost<KnowledgeBase>("/knowledge-bases", input),
    () => ({
      ...mockKnowledgeBases[0],
      ...input,
      kbId: input.kbId ?? `kb-${Date.now()}`,
      status: input.status ?? "active",
      wikiNodeCount: 0,
      sourceCount: 0,
      archivedAt: null,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    }),
  )
}

export function updateKnowledgeBase(kbId: string, input: KnowledgeBaseInput) {
  return withMockFallback(
    apiPut<KnowledgeBase>(`/knowledge-bases/${kbId}`, input),
    () => ({
      ...mockKnowledgeBases.find((kb) => kb.kbId === kbId) ?? mockKnowledgeBases[0],
      ...input,
      kbId,
      updatedAt: new Date().toISOString().slice(0, 10),
    }),
  )
}

export function disableKnowledgeBase(kbId: string) {
  return transitionKnowledgeBase(kbId, "disable")
}

export function archiveKnowledgeBase(kbId: string) {
  return transitionKnowledgeBase(kbId, "archive")
}

export function restoreKnowledgeBase(kbId: string) {
  return transitionKnowledgeBase(kbId, "restore")
}

function transitionKnowledgeBase(kbId: string, action: "disable" | "archive" | "restore") {
  const status: KnowledgeBase["status"] = action === "restore" ? "active" : action === "archive" ? "archived" : "disabled"
  return withMockFallback(
    apiPost<KnowledgeBaseLifecycleResult>(`/knowledge-bases/${kbId}/${action}`, {}),
    () => ({
      kbId,
      status,
      summary: "已更新知识库状态。",
      archivedAt: action === "archive" ? new Date().toISOString().slice(0, 10) : null,
      updatedAt: new Date().toISOString().slice(0, 10),
    }),
  )
}
