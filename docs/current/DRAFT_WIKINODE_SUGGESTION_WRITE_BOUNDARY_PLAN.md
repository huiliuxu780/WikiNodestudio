# Draft WikiNode Suggestion Write Boundary Plan

Task: `IM039 Draft WikiNode Suggestion Write Boundary Planning`

Date: 2026-06-25

Status: planning baseline only.

## 1. Purpose

This document defines the write-boundary rules for future Draft WikiNode Suggestion actions after the read-only model, APIs, and review surface are in place.

IM039 does not implement Java code, database migrations, repositories, API routes, frontend buttons, tests, dependencies, suggestion generation, accept/reject workflow, WikiNode creation, publishing, indexing, vector sync, parser execution, permissions, approval workflow, batch conversion, or external AI integration.

The purpose is to prevent the next implementation from collapsing three separate boundaries into one unsafe feature:

```text
Parsed Document -> generate Draft WikiNode Suggestion
Draft WikiNode Suggestion -> accept/reject review decision
Accepted Suggestion -> create or update draft WikiNode
```

## 2. Current Baseline

Implemented before IM039:

- IM034 planned the Parsed Document to Draft WikiNode Suggestion boundary.
- IM035 planned the read-only first-class suggestion contract.
- IM036 implemented read-only suggestion persistence, GET APIs, frontend panels, and tests.
- IM037 polished read-only suggestion review boundaries and browser coverage.

Current allowed behavior:

- Users may read Draft WikiNode Suggestions.
- Users may inspect Source, Raw Material, Parsed Document, Source Operation, sourceRefs, relation candidates, confidence, conflict labels, and proposed content.
- Retrieval API remains unaffected by suggestions.

Current forbidden behavior:

- No user action may generate a new suggestion.
- No user action may accept or reject a suggestion.
- No suggestion may create or update a WikiNode.
- No suggestion may publish, index, create Index Segments, sync vectors, or execute parser work.

## 3. Product Invariants

Future write work must preserve:

- A Draft WikiNode Suggestion is not a WikiNode.
- A Draft WikiNode Suggestion is not published knowledge.
- A Draft WikiNode Suggestion does not affect Retrieval API results.
- Source, Raw Material, Parsed Document, and Source Operation evidence must remain traceable.
- Accepting a suggestion must not publish or index a WikiNode.
- Index Segment generation only starts from curated WikiNode content in a later approved publish/index workflow.
- Product UI must continue using `WikiNode 建议` or `Draft WikiNode Suggestion`, not `已导入 WikiNode`.

## 4. Write Capability Split

The future write surface must be split into separate approved tasks.

| Capability | First safe task shape | Must not include |
|---|---|---|
| Generate suggestion | One Parsed Document creates at most one Draft WikiNode Suggestion through deterministic rules. | Accept/reject, WikiNode creation, AI/LLM, batch conversion. |
| Reject suggestion | One existing suggestion transitions to `rejected` with a safe reviewer note. | Deleting evidence, blocking future suggestions globally, creating WikiNode. |
| Accept suggestion | One existing suggestion transitions to `accepted` and may create a draft WikiNode only if separately approved in the task. | Publish, index, vector sync, batch accept. |
| Retry generation | One failed `suggest_wikinode` operation creates a new Source Operation and re-runs eligibility checks. | Reusing failed operations, batch retry, bypassing duplicate checks. |
| Batch conversion | Deferred. Requires separate approval after single-record generation and review are stable. | Any first write implementation. |

## 5. Recommended Implementation Sequence

The sequence should avoid over-fragmented IM tasks while keeping hard boundaries separate.

Recommended sequence:

1. `IM040 Draft WikiNode Suggestion Generate Operation`
   - Add one write API that creates or skips a Draft WikiNode Suggestion from one Parsed Document.
   - Produce Source Operation evidence.
   - Keep accept/reject absent.
2. `IM041 Draft WikiNode Suggestion Review Decision and Reject Operation`
   - Document task slicing principles.
   - Implement single-suggestion rejection with required review note.
   - Keep accept and WikiNode creation absent.
3. `IM042 Draft WikiNode Suggestion Accept To Draft WikiNode`
   - Plan and implement exact WikiNode write semantics in one approved task only if the hard write boundary is explicitly accepted.
   - Keep publish, index, vector sync, and batch conversion absent.
4. `IM043 Draft WikiNode Suggestion Review Flow Acceptance Sweep`
   - Polish the review flow after generation, reject, and accept are stable.

Planning-only IMs should be reserved for high-risk boundaries such as accept-to-WikiNode, permissions, batch operations, external integrations, or schema expansion. Low-risk review-state changes may combine boundary clarification and implementation when they use existing fields and remain single-record.

## 6. Generate Suggestion Boundary

The first write implementation should be deterministic and one-record only.

Allowed first behavior:

- Endpoint accepts one `parsedDocumentId`.
- Server validates Parsed Document eligibility.
- Server creates one `suggest_wikinode` Source Operation.
- Server uses allowlisted deterministic mapping rules.
- Server persists one Draft WikiNode Suggestion when eligible.
- Server marks the Source Operation terminal state as `succeeded`, `failed`, or `skipped`.
- Response returns `operationId`, `status`, safe summary, and `suggestionId` only when persisted.

Forbidden first behavior:

- No AI/LLM provider.
- No prompt templates.
- No free-form objectType generation.
- No new Knowledge Object objectType or subtype enum.
- No WikiNode creation.
- No WikiLink creation.
- No publish or index.
- No vector sync.
- No batch generation.

## 7. Generate Eligibility Rules

The write API must reject or skip before persistence when:

| Condition | Outcome | User-safe message |
|---|---|---|
| Parsed Document missing | failed | `未找到可用于生成建议的 Parsed Document。` |
| Parsed Document not parsed | skipped | `Parsed Document 尚未解析完成，不能生成 WikiNode 建议。` |
| Normalized content empty | skipped | `解析内容为空，不能生成 WikiNode 建议。` |
| SourceRef evidence missing | skipped | `缺少 SourceRef 证据，不能生成 WikiNode 建议。` |
| Conversion profile unsupported | skipped | `当前内容没有可用的 WikiNode 建议规则。` |
| Existing draft suggestion for Parsed Document | skipped | `该 Parsed Document 已有待审核 WikiNode 建议。` |
| Existing accepted suggestion for Parsed Document | skipped | `该 Parsed Document 已采纳过相关建议。` |
| Existing WikiNode references same source evidence | skipped | `已有 WikiNode 使用相同来源证据，请先确认是否需要更新。` |

Skipped or failed requests must not create WikiNode, WikiLink, Index Segment, publish, or vector sync records.

## 8. Source Operation Lifecycle

Every generation attempt must create Source Operation evidence before producing a suggestion.

Required lifecycle:

```text
queued -> running -> succeeded | failed | skipped | cancelled
```

Rules:

- `operationType` is `suggest_wikinode`.
- `sourceId`, `rawMaterialId`, and `parsedDocumentId` are copied from the Parsed Document chain.
- `summary` must be safe for product UI.
- `errorSummary` must not expose stack traces, exception class names, filesystem paths, storage credentials, signed URLs, hostnames, secret values, or raw document payloads.
- If suggestion persistence fails after operation creation, the operation ends as `failed` with a recoverable safe summary.
- Source Operation records are append-only and are not deleted by rollback.

## 9. API Boundary Candidates

These endpoints are candidates only. They are not implemented by IM039.

### 9.1 First Write Candidate

```http
POST /api/parsed-documents/{parsedDocumentId}/suggest-wikinode
```

Request body:

```json
{
  "conversionProfile": "service_policy_v1",
  "idempotencyKey": "client-generated-key"
}
```

Success response when suggestion is created:

```json
{
  "operationId": "op-suggest-001",
  "parsedDocumentId": "pd-001",
  "status": "succeeded",
  "summary": "已生成待审核 WikiNode 建议。",
  "suggestionId": "sug-001"
}
```

Response when skipped:

```json
{
  "operationId": "op-suggest-002",
  "parsedDocumentId": "pd-001",
  "status": "skipped",
  "summary": "该 Parsed Document 已有待审核 WikiNode 建议。"
}
```

Forbidden response fields:

- `nodeId`
- `wikiLinkId`
- `indexSegmentId`
- raw vector chunks
- storage credentials
- signed URLs
- parser stack traces
- internal exception names

### 9.2 Review APIs

Rejection may be implemented as a single-record review-state operation after explicit approval:

```http
POST /api/draft-wikinode-suggestions/{suggestionId}/reject
```

Request body:

```json
{
  "reviewNote": "证据不足，暂不进入 WikiNode。"
}
```

Success response:

```json
{
  "suggestionId": "sug-001",
  "status": "rejected",
  "summary": "已拒绝 WikiNode 建议。",
  "reviewNote": "证据不足，暂不进入 WikiNode。"
}
```

Forbidden response fields:

- `nodeId`
- `wikiLinkId`
- `indexSegmentId`
- raw vector chunks
- storage credentials
- signed URLs

Acceptance may be implemented as a single-record draft WikiNode creation operation after explicit approval:

```http
POST /api/draft-wikinode-suggestions/{suggestionId}/accept
```

Request body:

```json
{
  "reviewNote": "确认进入草稿 WikiNode，后续人工编辑。"
}
```

Success response:

```json
{
  "suggestionId": "sug-002",
  "status": "accepted",
  "summary": "已采纳为草稿 WikiNode。",
  "reviewNote": "确认进入草稿 WikiNode，后续人工编辑。",
  "nodeId": "wn-from-sug-002",
  "nodeStatus": "draft"
}
```

Forbidden accept response fields:

- `wikiLinkId`
- `indexSegmentId`
- raw vector chunks
- storage credentials
- signed URLs

These APIs remain deferred until separately planned and approved:

```http
POST /api/draft-wikinode-suggestions/{suggestionId}/retry
POST /api/draft-wikinode-suggestions/batch
```

## 10. Accept Boundary

Accept is higher risk than generation because it may create curated knowledge. IM042 approves only the single-record create-draft path; update-existing semantics remain deferred.

Minimum future accept constraints:

- Reviewer must inspect title, contentDraft, objectType, subtype, metadataDraft, sourceRefs, relationCandidates, confidence, and conflict status.
- Accept must require an explicit user action on one suggestion.
- Accept may create a draft WikiNode only after a task explicitly approves WikiNode writes.
- Accept may update an existing draft WikiNode only after update semantics are separately planned.
- Accept must preserve the suggestion, sourceRefs, relation candidates, and Source Operation evidence.
- Accept must set the suggestion status to `accepted` only after the WikiNode write succeeds.
- Accept must leave the created WikiNode as `draft` with `not_indexed`.

Accept must not:

- Publish.
- Index.
- Generate Index Segments.
- Sync vectors.
- Create WikiLinks.
- Create batch WikiNodes.
- Update existing WikiNodes.
- Delete Parsed Document or Raw Material evidence.
- Resolve conflicts silently.

## 11. Reject Boundary

Reject is safer than accept but still mutates review state.

Minimum future reject constraints:

- Rejection applies to exactly one suggestion.
- Rejection requires a Chinese user-readable `reviewNote`.
- Rejection sets status to `rejected`.
- Rejection does not delete Source, Raw Material, Parsed Document, Source Operation, sourceRefs, or relation candidate evidence.
- Rejection does not block future suggestions unless a later supersession policy explicitly says so.

Reject must not:

- Delete suggestions.
- Create WikiNodes.
- Publish.
- Index.
- Trigger retry or regeneration.

## 12. Duplicate And Conflict Policy

First write implementation should reject ambiguous cases rather than merge or overwrite.

Required checks before generation:

- Existing suggestion for the same Parsed Document with status `draft` or `needs_review`.
- Existing accepted suggestion for the same Parsed Document.
- Existing WikiNode with the same normalized title.
- Existing WikiNode sourceRefs overlapping the Parsed Document sourceRefs.

Required conflict representation:

- `conflictStatus`
- `conflictReasons`
- `matchedWikiNodeIds`
- `matchedSuggestionIds`

Conflict values must continue using the read-only labels defined by IM035/IM036/IM037:

- `none`
- `title_match`
- `source_ref_match`
- `existing_suggestion`
- `accepted_before`

## 13. Frontend Boundary

The first generation implementation may add a single controlled action only after backend write behavior exists and is tested.

Frontend rules for that future task:

- Show a single action near Parsed Document evidence, such as `生成 WikiNode 建议`.
- Disable the action while a request is running.
- Show `生成中...` during request.
- Show success as `已生成待审核 WikiNode 建议。`
- Show skipped and failed summaries from the safe API response.
- Keep accept/reject buttons absent.
- Keep publish/index/vector sync buttons absent.
- After success, link to the read-only suggestion detail page.

Frontend must not imply that a WikiNode has been created until a later accept task actually creates one.

## 14. Persistence Boundary

Current persistence already has `draft_wikinode_suggestions`, source refs, relation candidates, and Source Operation seed/read models from IM036.

Future generation implementation may reuse current tables only if:

- It does not require new objectType or subtype enums.
- It does not alter WikiNode schema.
- It does not alter Index Segment schema.
- It does not store raw full source payloads beyond current Parsed Document evidence.

If generation needs idempotency keys, operation attempt metadata, reviewer identity, permission hooks, or audit events, implementation must stop for a separate migration plan.

## 15. Acceptance Requirements For Future Implementation

Any future generation implementation must add tests before production code:

- API contract test for eligible success.
- API contract test for missing Parsed Document.
- API contract test for not parsed Parsed Document.
- API contract test for missing SourceRef evidence.
- API contract test for existing draft suggestion duplicate.
- Repository test for Source Operation lifecycle.
- Repository test for suggestion persistence.
- Playwright test for button disabled/loading/success/skipped/failure states.
- Playwright test that accept/reject/publish/index/batch actions remain absent.
- API smoke coverage only after the endpoint is approved.

Required verification:

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

## 16. Stop Conditions

Stop for explicit approval if any future task needs:

- New dependencies.
- Package or lockfile changes.
- New database tables or migrations beyond the approved task.
- WikiNode creation or update.
- WikiLink creation.
- Index Segment generation.
- Publishing or indexing.
- Vector sync.
- Parser execution.
- External AI or LLM integration.
- Prompt templates or model credentials.
- Authentication or permissions.
- Approval workflow.
- Audit events beyond Source Operation evidence.
- Batch conversion.
- Export or destructive operations.

## 17. Recommended Next Task

```text
IM043 Draft WikiNode Suggestion Review Flow Acceptance Sweep
```

Recommended scope for IM043:

- Polish the review flow after generation, rejection, and accept-to-draft are stable.
- Surface accepted and rejected review outcomes in Suggestion lists and detail pages.
- Preserve the accepted draft WikiNode link after page reload through `matchedWikiNodeIds`.
- Add Playwright coverage for accepted/rejected outcomes and persistent draft WikiNode links.
- Keep backend API, DB, migration, Java model, WikiLink creation, publish, index, vector sync, parser execution, AI/LLM, permissions, approval workflow, and batch conversion out of scope.
