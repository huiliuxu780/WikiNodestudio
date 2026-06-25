# Draft WikiNode Suggestion Plan

Task: `IM034 Draft WikiNode Suggestion Planning`

Date: 2026-06-25

Status: planning baseline only.

## 1. Purpose

This document defines how a future approved task may turn one Parsed Document into a reviewable draft WikiNode suggestion.

IM034 does not implement WikiNode creation, suggestion generation, parser execution, API endpoints, database migrations, frontend action buttons, approval workflow, publishing, indexing, Index Segment generation, vector sync, batch conversion, permissions, or external AI integration. It only fixes the product and engineering boundaries required before implementation.

## 2. Product Position

Draft WikiNode suggestion is the review layer between normalized evidence and curated knowledge.

The intended future chain is:

```text
Source
  -> Raw Material
  -> Source Operation: parse_raw_material
  -> Parsed Document
  -> Source Operation: suggest_wikinode
  -> Draft WikiNode suggestion
  -> Manually accepted WikiNode after a later approved task
  -> Index Segment after publish/index flow
  -> Retrieval API returns WikiNodes
```

Product invariants:

- Parsed Document remains evidence, not final managed knowledge.
- A suggestion is not a WikiNode until a future approved accept action creates or updates one.
- Suggested content must remain reviewable before it affects Retrieval API results.
- No suggestion may auto-publish a WikiNode.
- No suggestion may auto-generate or auto-sync Index Segments.
- Retrieval API remains WikiNode-centered.

## 3. Eligibility Rules

Future suggestion generation must validate the Parsed Document before any work starts.

Required eligibility:

- `parsedDocumentId` exists.
- `parseStatus` is `parsed`.
- `normalizedContent` is not empty.
- `sourceRefs` contains at least one Source / Raw Material / Parsed Document locator.
- The Parsed Document belongs to exactly one Raw Material.
- The Raw Material belongs to exactly one Source.
- The requested conversion profile is allowlisted by server-side configuration.

Required rejection cases:

| Case | Message |
|---|---|
| Parsed Document missing | `未找到可用于生成建议的 Parsed Document。` |
| Not parsed | `Parsed Document 尚未解析完成，不能生成 WikiNode 建议。` |
| Empty content | `解析内容为空，不能生成 WikiNode 建议。` |
| Missing evidence | `缺少 SourceRef 证据，不能生成 WikiNode 建议。` |
| Unsupported profile | `当前内容没有可用的 WikiNode 建议规则。` |

Rejected requests must not create WikiNode records, Index Segments, or partial suggestion records unless a future implementation explicitly stores failed Source Operation evidence.

## 4. Suggestion Generation Boundary

The first future implementation should use deterministic, reviewable mapping rules.

Allowed first behavior:

- Generate exactly one suggestion from one Parsed Document.
- Map title from Parsed Document title or the first top-level heading.
- Map content from normalized Parsed Document content.
- Map `objectType` to an existing allowlisted Knowledge Object category.
- Map `subtype` to an existing business subtype only when confidently inferred from metadata or parser profile.
- Copy Source / Raw Material / Parsed Document locators into `sourceRefs`.
- Produce relation candidates only as reviewable suggestions.
- Store confidence and rule names as metadata when useful for review.

Forbidden first behavior:

- No free-form creation of new `objectType` values.
- No automatic creation of WikiLinks.
- No automatic publish.
- No automatic index or vector sync.
- No batch conversion.
- No LLM or external AI generation unless explicitly approved as a separate integration boundary.
- No hidden conversion from raw vector chunks or external vector database content.

If a future implementation uses AI-assisted suggestion, it must be a separate approved task because it may introduce model providers, prompts, credentials, audit, cost, and data-sharing constraints.

## 5. Suggested Draft Shape

This is a planning candidate, not implemented by IM034.

Recommended first suggestion fields:

- `suggestionId`
- `parsedDocumentId`
- `rawMaterialId`
- `sourceId`
- `operationId`
- `title`
- `objectType`
- `subtype`
- `contentDraft`
- `metadataDraft`
- `sourceRefs`
- `relationCandidates`
- `confidence`
- `status`
- `createdAt`
- `updatedAt`

Initial suggestion statuses:

| Status | Meaning |
|---|---|
| `draft` | Created and waiting for human review. |
| `needs_review` | Generated but has low confidence or missing optional fields. |
| `accepted` | Future accepted state after a WikiNode is created or updated. |
| `rejected` | Reviewer rejected the suggestion. |
| `superseded` | A newer suggestion replaced this one. |

Status constraints:

- IM034 does not implement these statuses.
- `accepted` must not be possible until a future approved WikiNode write path exists.
- `rejected` and `superseded` require a future review workflow decision.
- Product UI should call this a draft suggestion, not an imported WikiNode.

## 6. SourceRef Carry-Forward Rules

Source evidence must survive the transition from Parsed Document to suggestion.

Required carry-forward:

- Every suggested WikiNode must retain Source, Raw Material, and Parsed Document references.
- SourceRefs must include locator type, locator, excerpt, and confidence when available.
- SourceRefs copied from Parsed Document must remain traceable to the original evidence.
- Generated relation candidates must include source evidence or be marked as inferred.

Forbidden:

- Dropping SourceRefs during suggestion generation.
- Replacing evidence locators with only a Parsed Document title.
- Treating confidence as proof of correctness.
- Exposing storage credentials, signed URLs, internal paths, parser stack traces, or raw object storage refs in product UI.

## 7. Source Operation Lifecycle

Every future suggestion attempt must be observable through Source Operation evidence.

Recommended operation properties:

- `operationType` must be `suggest_wikinode`.
- Exactly one `parsedDocumentId` is attached.
- `rawMaterialId` and `sourceId` are copied from the Parsed Document.
- `operationId` is attached to the suggestion if a suggestion is created.
- `startedAt` is set when generation begins.
- `finishedAt` is set for terminal states.
- Terminal summaries must be safe for product UI.

Required lifecycle:

```text
queued
  -> running
  -> succeeded | failed | skipped | cancelled
```

State meanings:

- `queued` means accepted but not yet running.
- `running` means suggestion work has started.
- `succeeded` means a draft suggestion was persisted.
- `failed` means no valid suggestion was produced.
- `skipped` means the Parsed Document was intentionally not eligible under a safe rule.
- `cancelled` means user/system cancellation occurred before terminal output.

## 8. Future API Candidate

This is not implemented by IM034.

Candidate endpoint for a future approved task:

```http
POST /api/parsed-documents/{parsedDocumentId}/suggest-wikinode
```

Required future request properties:

- `conversionProfile`
- `idempotencyKey` or client-provided operation key

Required future response properties:

- `operationId`
- `parsedDocumentId`
- `status`
- safe summary
- `suggestionId` only when a suggestion is persisted

Forbidden response properties:

- Auto-created WikiNode IDs.
- Auto-created WikiLink IDs.
- Auto-created Index Segment IDs.
- Raw vector chunks.
- Storage credentials.
- Signed URLs.
- Full parser internals.

## 9. Accept / Reject Boundary

Accepting or rejecting a suggestion is not implemented by IM034.

Future accept action requires separate approval because it creates or updates curated knowledge.

Minimum future accept constraints:

- Human reviewer confirms the title, content, objectType, subtype, metadata, relations, and sourceRefs.
- Accept creates a draft WikiNode or updates a draft WikiNode only after explicit confirmation.
- Accept must not publish.
- Accept must not generate Index Segments.
- Accept must not sync to a vector store.
- Accept must preserve suggestion evidence and Source Operation history.

Minimum future reject constraints:

- Rejection stores a user-safe reason.
- Rejection does not delete Source, Raw Material, Parsed Document, or operation evidence.
- Rejection does not block a future new suggestion unless supersession rules say so.

## 10. Duplicate And Conflict Rules

Future suggestion generation must avoid silent duplicate knowledge creation.

Recommended first conflict checks:

- Existing WikiNode with same title in the target knowledge base.
- Existing draft suggestion for the same Parsed Document.
- Existing accepted suggestion for the same Parsed Document.
- Existing WikiNode already referencing the same Parsed Document sourceRefs.

Recommended conflict messages:

- `已存在同名 WikiNode，请先确认是否更新现有草稿。`
- `该 Parsed Document 已有待审核建议，请先处理现有建议。`
- `该 Parsed Document 已生成过 WikiNode，不建议重复创建。`

Conflict resolution is deferred. The first implementation should reject ambiguous cases rather than merging or overwriting silently.

## 11. Rollback And Retry Rules

Rollback must preserve evidence integrity.

Required future behavior:

- If Source Operation creation fails, suggestion generation must not start.
- If suggestion generation fails before persistence, no suggestion is created.
- If suggestion persistence succeeds but operation finalization fails, the system must surface a recoverable operational error and reconcile the operation log before allowing retry.
- Parsed Document records are never deleted by suggestion rollback.
- Source Operation records remain append-only evidence.

Retry is separate from accept/reject:

- Retry is allowed only for terminal failed suggestion operations.
- Retry creates a new Source Operation record.
- Retry must use the same Parsed Document and allowlisted conversion profile.
- Retry must not bypass eligibility, evidence, duplicate, or conflict checks.
- Batch retry is deferred.

## 12. Safe Error Summary

Suggestion failures must be summarized without exposing internals.

Allowed error summary content:

- Parsed Document not eligible.
- Missing SourceRef evidence.
- Unsupported content structure.
- Duplicate suggestion exists.
- Suggestion generation timed out.
- Suggestion persistence failed.

Forbidden error summary content:

- Stack traces.
- Raw exception class names.
- Storage credentials.
- Signed URLs.
- Full filesystem paths.
- Internal service hostnames.
- Secret values.
- Full raw document payloads.

Recommended user-facing messages:

| Failure | Message |
|---|---|
| Not eligible | `当前 Parsed Document 不满足生成 WikiNode 建议的条件。` |
| Missing evidence | `缺少 SourceRef 证据，不能生成建议。` |
| Duplicate | `该 Parsed Document 已有 WikiNode 建议。` |
| Timeout | `生成建议超时，请稍后重试。` |
| Persistence failure | `建议保存失败，请稍后重试。` |

## 13. Acceptance Requirements For Future Implementation

Any future implementation must add:

- API contract tests for eligible, rejected, duplicate, failure, and success cases.
- Repository or integration tests for Source Operation lifecycle.
- Repository or integration tests for suggestion persistence when a suggestion table is approved.
- Playwright coverage for disabled state, loading state, success state, failure state, duplicate state, and no batch conversion.
- API smoke coverage only after the write endpoint is approved.

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

## 14. Stop Conditions For Implementation

Stop for explicit approval if implementation needs:

- WikiNode creation or update.
- New suggestion persistence tables.
- API write endpoints.
- Database migrations.
- Frontend action buttons.
- Review workflow or approval states.
- Authentication or permission checks.
- External AI or LLM integration.
- Prompt templates or model credentials.
- Parser execution.
- Parsed Document versioning.
- Batch conversion.
- Auto-publish.
- Auto-index.
- Vector sync.

## 15. Recommended Next Task

```text
IM035 Draft WikiNode Suggestion Read-only Contract Planning
```

IM035 should remain planning-only unless the user explicitly expands scope. It should decide whether suggestions require a first-class persistence model and read-only review surface before any write endpoint, accept action, or WikiNode creation path is implemented.
