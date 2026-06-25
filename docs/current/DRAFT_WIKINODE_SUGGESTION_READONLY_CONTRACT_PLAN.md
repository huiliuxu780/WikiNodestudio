# Draft WikiNode Suggestion Read-only Contract Plan

Task: `IM035 Draft WikiNode Suggestion Read-only Contract Planning`

Date: 2026-06-25

Status: planning baseline only.

## 1. Purpose

This document defines the minimum read-only contract for Draft WikiNode Suggestions before any executable suggestion, accept, reject, or WikiNode creation workflow exists.

IM035 does not implement Java models, database migrations, repositories, API routes, frontend routes, frontend action buttons, suggestion generation, accept/reject workflow, WikiNode creation, publishing, indexing, vector sync, parser execution, batch conversion, permissions, dependencies, or external AI integration. It only defines the safest contract shape for a future read-only implementation review.

## 2. Product Position

Draft WikiNode Suggestion is a reviewable proposal derived from Parsed Document evidence.

It sits between Parsed Document and curated WikiNode:

```text
Source
  -> Raw Material
  -> Parsed Document
  -> Draft WikiNode Suggestion
  -> reviewed Draft WikiNode after a later approved write task
  -> published WikiNode after a later approved publish task
  -> Index Segment after a later approved index task
  -> Retrieval API returns WikiNodes
```

Product invariants:

- A suggestion is not a WikiNode.
- A suggestion is not a published knowledge asset.
- A suggestion must not affect Retrieval API results.
- A suggestion must retain evidence back to Source, Raw Material, and Parsed Document.
- A suggestion may be read and reviewed before any write action exists.
- Index Segments are generated only from curated WikiNode content, not directly from suggestions.

## 3. First-class Model Decision

Recommendation: treat Draft WikiNode Suggestion as a first-class future read-only model before adding write actions.

Reasons:

- It creates a visible review boundary between parser output and curated WikiNode content.
- It prevents parser output from being mistaken for an accepted WikiNode.
- It gives PM and engineers a stable contract to inspect before accept/reject is implemented.
- It preserves SourceRef evidence and Source Operation history without requiring publish or index behavior.
- It keeps duplicate/conflict review separate from WikiNode creation.

Rejected alternatives:

| Alternative | Rejection reason |
|---|---|
| Store suggestion only inside Parsed Document metadata | Hides review state and makes duplicate/conflict handling unclear. |
| Create draft WikiNodes directly from Parsed Documents | Crosses the WikiNode write boundary too early. |
| Treat Source Operation summary as the suggestion body | Operation logs are audit evidence, not reviewable knowledge proposals. |
| Use Index Segment preview as suggestion | Index Segments belong after curated WikiNode content, not before. |

## 4. Candidate Entity Contract

This is a planning candidate, not implemented by IM035.

Recommended entity name:

```text
DraftWikiNodeSuggestion
```

Recommended fields:

| Field | Type direction | Required | Notes |
|---|---|---|---|
| `suggestionId` | string | yes | Stable product ID, e.g. `sug-001`. |
| `parsedDocumentId` | string | yes | Parent Parsed Document evidence. |
| `rawMaterialId` | string | yes | Copied from Parsed Document. |
| `sourceId` | string | yes | Copied from Parsed Document. |
| `operationId` | string | yes | Source Operation that produced or imported the suggestion. |
| `title` | string | yes | Proposed WikiNode title. |
| `objectType` | enum string | yes | Existing Knowledge Object category only. |
| `subtype` | string | no | Existing or configured business subtype only. |
| `contentDraft` | text | yes | Proposed editable content. |
| `metadataDraft` | JSON object | no | Proposed metadata, not applied to WikiNode yet. |
| `sourceRefs` | JSON array | yes | Evidence copied from Parsed Document. |
| `relationCandidates` | JSON array | no | Proposed relations, not WikiLinks. |
| `confidence` | number | no | Advisory score only. |
| `status` | enum string | yes | Review state. |
| `reviewNote` | string | no | Future reviewer note; read-only seed may show examples. |
| `createdAt` | timestamp | yes | System timestamp. |
| `updatedAt` | timestamp | yes | System timestamp. |

Required status values for the future read-only contract:

| Value | Display meaning | Notes |
|---|---|---|
| `draft` | 待审核 | Suggestion is ready for human review. |
| `needs_review` | 需要复核 | Suggestion has low confidence or incomplete optional fields. |
| `accepted` | 已采纳 | Historical state after a future accept task exists. |
| `rejected` | 已拒绝 | Historical state after a future reject task exists. |
| `superseded` | 已替换 | A newer suggestion replaced this one. |

Read-only implementation may seed these statuses for display, but must not implement transitions.

## 5. Relationship Contract

Minimum relationship direction:

```text
Source 1 -> N Raw Material
Raw Material 1 -> N Parsed Document
Parsed Document 1 -> N Draft WikiNode Suggestion
Draft WikiNode Suggestion N -> 0..1 WikiNode after a future accept task
WikiNode 1 -> N Index Segment after publish/index flow
```

Constraints:

- A suggestion must reference exactly one Parsed Document.
- A suggestion must reference exactly one Raw Material through the Parsed Document.
- A suggestion must reference exactly one Source through the Parsed Document.
- A Parsed Document may have multiple suggestions over time only if supersession rules are explicit.
- A suggestion may reference zero WikiNodes until a future accept task exists.
- A suggestion must never be treated as an Index Segment source of truth.

## 6. Read-only API Contract Candidates

These endpoints are candidates for a future approved read-only implementation task only.

```http
GET /api/draft-wikinode-suggestions
GET /api/draft-wikinode-suggestions/{suggestionId}
GET /api/parsed-documents/{parsedDocumentId}/draft-wikinode-suggestions
GET /api/raw-materials/{rawMaterialId}/draft-wikinode-suggestions
```

### 6.1 Suggestion List Response

Candidate shape:

```json
{
  "items": [
    {
      "suggestionId": "sug-001",
      "parsedDocumentId": "pd-001",
      "rawMaterialId": "rm-001",
      "sourceId": "src-feishu-cc",
      "title": "保修期内维修服务政策",
      "objectType": "article",
      "subtype": "service_policy",
      "status": "draft",
      "confidence": 0.88,
      "sourceRefCount": 3,
      "relationCandidateCount": 2,
      "createdAt": "2026-06-25T10:00:00+08:00",
      "updatedAt": "2026-06-25T10:00:00+08:00"
    }
  ]
}
```

### 6.2 Suggestion Detail Response

Candidate shape:

```json
{
  "suggestionId": "sug-001",
  "parsedDocumentId": "pd-001",
  "rawMaterialId": "rm-001",
  "sourceId": "src-feishu-cc",
  "operationId": "op-parse-suggest-001",
  "title": "保修期内维修服务政策",
  "objectType": "article",
  "subtype": "service_policy",
  "contentDraft": "# 保修期内维修服务政策\n\n...",
  "metadataDraft": {
    "businessDomain": "after_sales",
    "language": "zh-CN"
  },
  "sourceRefs": [
    {
      "sourceId": "src-feishu-cc",
      "rawMaterialId": "rm-001",
      "parsedDocumentId": "pd-001",
      "locatorType": "heading",
      "locator": "保修政策/免费范围",
      "excerpt": "保修期内维修不收取人工费...",
      "confidence": 0.92
    }
  ],
  "relationCandidates": [
    {
      "targetTitle": "收费政策",
      "relationType": "references",
      "source": "inferred_from_source_ref",
      "confidence": 0.74
    }
  ],
  "confidence": 0.88,
  "status": "draft",
  "reviewNote": null,
  "createdAt": "2026-06-25T10:00:00+08:00",
  "updatedAt": "2026-06-25T10:00:00+08:00"
}
```

Forbidden response properties:

- Published WikiNode content as if accepted.
- Auto-created WikiNode IDs for draft suggestions.
- Auto-created WikiLink IDs.
- Auto-created Index Segment IDs.
- Raw vector chunks.
- Storage credentials.
- Signed URLs.
- Parser stack traces or internal exception names.

## 7. Read-only Review Surface

Future read-only frontend work may add or extend review surfaces only after approval.

Recommended first UI surfaces:

- Parsed Document detail panel: list linked Draft WikiNode Suggestions.
- Raw Material detail panel: show suggestion count and latest suggestion status.
- Suggestion detail page or panel: show proposed title, objectType, subtype, contentDraft, sourceRefs, relationCandidates, confidence, and Source Operation evidence.

Read-only UI rules:

- Buttons for accept, reject, publish, index, sync, and batch conversion must not exist.
- If future disabled buttons are shown for roadmap clarity, they must have explicit copy such as `暂未开放`.
- Status labels must be Chinese-readable.
- Product copy should say `WikiNode 建议` or `Draft WikiNode Suggestion`, not `已导入 WikiNode`.
- Evidence blocks must clearly distinguish Source, Raw Material, Parsed Document, and suggestion content.

## 8. Source Operation Coupling

A suggestion should be traceable to the Source Operation that produced it.

Read-only contract rules:

- Suggestion detail may include `operationId`.
- Source Operation detail may show the linked `suggestionId` only when the suggestion exists.
- Source Operation summaries remain audit evidence, not the suggestion content itself.
- Failed `suggest_wikinode` operations may be visible without a suggestion record.
- Read-only views must not trigger retry or regeneration.

## 9. Duplicate And Conflict Visibility

Read-only contract should make duplicate and conflict risks visible before write actions exist.

Recommended fields:

- `conflictStatus`
- `conflictReasons`
- `matchedWikiNodeIds`
- `matchedSuggestionIds`

Recommended values:

| Value | Display meaning |
|---|---|
| `none` | 未发现冲突 |
| `title_match` | 标题可能重复 |
| `source_ref_match` | 证据来源可能重复 |
| `existing_suggestion` | 已存在待审核建议 |
| `accepted_before` | 已采纳过相关建议 |

First implementation can defer these fields if no conflict scanner exists, but it must not imply conflict checks are complete unless they are actually computed.

## 10. Deferred Write APIs

These endpoints are explicitly out of IM035 and any first read-only implementation unless separately approved:

```http
POST /api/parsed-documents/{parsedDocumentId}/suggest-wikinode
POST /api/draft-wikinode-suggestions/{suggestionId}/accept
POST /api/draft-wikinode-suggestions/{suggestionId}/reject
POST /api/draft-wikinode-suggestions/{suggestionId}/retry
POST /api/draft-wikinode-suggestions/batch
```

Reasons:

- They create or mutate business data.
- They may require permission, approval, audit, and duplicate resolution.
- Accept can create or update WikiNodes.
- Retry can execute parser or suggestion generation logic.
- Batch conversion can create large review and rollback risks.

## 11. Migration Direction For Future Approval

If a future IM036 implementation is approved, the smallest persistence direction should be:

1. Add `draft_wikinode_suggestions`.
2. Link each suggestion to `parsed_documents`, `raw_materials`, `sources`, and `source_operations`.
3. Store `content_draft`, `metadata_draft`, `source_refs`, and `relation_candidates`.
4. Keep existing WikiNode tables unchanged.
5. Keep existing Index Segment tables unchanged.
6. Add seed data that mirrors current Source / Raw Material / Parsed Document examples.
7. Add read-only API tests before frontend wiring.

Do not add suggestion generation, accept/reject, publish, index, vector sync, permissions, or batch conversion in the same first read-only slice.

## 12. Acceptance Requirements For Future Read-only Implementation

Any future read-only implementation must add:

- API contract tests for list/detail and Parsed Document scoped suggestions.
- Repository or integration tests for suggestion read-only persistence if a table is approved.
- Playwright coverage for read-only suggestion review surfaces.
- Browser coverage that accept/reject/publish/index/batch actions are absent.
- Product language checks for WikiNode-centered copy and forbidden drift terms.

Required verification for implementation:

```bash
mvn test
pnpm lint
pnpm build
bash scripts/check.sh
./scripts/reset-db.sh
./scripts/api-smoke.sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 pnpm exec playwright test
git diff --check origin/main..HEAD
```

## 13. Stop Conditions For Implementation

Stop for explicit approval if implementation needs:

- Java model changes.
- Database migrations.
- API routes.
- Frontend routes or action buttons.
- Suggestion generation.
- Accept or reject workflow.
- WikiNode creation or update.
- Publishing or indexing.
- Vector sync.
- Parser execution.
- External AI or LLM integration.
- Authentication or permission checks.
- Approval or audit workflow.
- Batch conversion.
- Package or lockfile changes.

## 14. Recommended Next Task

```text
IM036 Draft WikiNode Suggestion Read-only Model Implementation
```

IM036 should only start after explicit approval because it would cross Java, database, migration, API, and frontend read-only implementation boundaries. It must remain read-only and must not add suggestion generation, accept/reject, WikiNode creation, publishing, indexing, vector sync, parser execution, external AI, permissions, or batch conversion.
