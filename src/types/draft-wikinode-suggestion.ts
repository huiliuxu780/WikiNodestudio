import type { ParsedDocumentSourceRef } from "@/types/raw-material"
import type { KnowledgeObjectType } from "@/types/wiki"

export type DraftWikiNodeRelationCandidate = {
  targetTitle: string
  relationType: string
  source: string
  confidence?: number
}

export type DraftWikiNodeSuggestion = {
  suggestionId: string
  parsedDocumentId: string
  rawMaterialId: string
  sourceId: string
  operationId: string
  title: string
  objectType: KnowledgeObjectType
  subtype?: string
  contentDraft: string
  metadataDraft: Record<string, string>
  sourceRefs: ParsedDocumentSourceRef[]
  relationCandidates: DraftWikiNodeRelationCandidate[]
  confidence?: number
  status: "draft" | "needs_review" | "accepted" | "rejected" | "superseded"
  reviewNote?: string | null
  conflictStatus: "none" | "title_match" | "source_ref_match" | "existing_suggestion" | "accepted_before"
  conflictReasons: string[]
  matchedWikiNodeIds: string[]
  matchedSuggestionIds: string[]
  sourceRefCount: number
  relationCandidateCount: number
  createdAt: string
  updatedAt: string
}
