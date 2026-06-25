# Single Raw Material Parse Plan

Task: `IM033 Single Raw Material Parse Planning`

Date: 2026-06-25

Status: planning baseline only.

## 1. Purpose

This document defines how a future approved task may parse exactly one Raw Material into Parsed Document evidence.

IM033 does not implement parser execution, parser dependencies, parser plugins, Parsed Document writes, retry execution, API endpoints, database migrations, UI action buttons, upload, storage access, permissions, approval, export, or batch parse. It only fixes the safe semantics required before implementation.

## 2. Product Position

Single Raw Material parse is the narrow operation between uploaded or captured evidence and normalized Parsed Document content.

The intended future chain is:

```text
Source
  -> Raw Material
  -> Source Operation: parse_raw_material
  -> Parsed Document
  -> Draft WikiNode suggestion after a later approved task
```

Product invariants:

- Raw Material remains immutable source evidence.
- Parsed Document is normalized intermediate evidence, not a WikiNode.
- Parser output must not auto-create, auto-publish, or auto-index WikiNodes.
- Parser output must not create Index Segments directly.
- Retrieval API remains WikiNode-centered.

## 3. Parser Profile Selection

Future parse execution must select a Parser Profile from the read-only registry introduced by IM031.

Required selection rules:

- The Raw Material `rawMaterialType` must be included in `supportedRawMaterialTypes`.
- The Source `sourceType` must be included in `supportedSourceTypes`.
- The Parser Profile must be `enabled`.
- The requested `parserProfile` must match an allowlisted profile ID.
- Free-form parser names from the browser are not allowed.
- Parser Profile selection must be resolved server-side before any parser work starts.

Recommended first selection behavior:

| Raw Material condition | Selected profile |
|---|---|
| `sourceType=feishu`, `rawMaterialType=document_snapshot` | `feishu_article_v1` |
| `sourceType=pdf`, `rawMaterialType=file` | `pdf_manual_article_v1` |
| `sourceType=excel`, `rawMaterialType=file` | `excel_fee_table_v1` |
| No matching enabled profile | Reject before operation starts |

User-facing rejection message:

```text
当前 Raw Material 没有可用的 Parser Profile，不能进入解析流程。
```

## 4. Operation Lifecycle

Every future parse attempt must create or update one Source Operation record.

Required lifecycle:

```text
queued
  -> running
  -> succeeded | failed | skipped | cancelled
```

Recommended first implementation rules:

- `operationType` must be `parse_raw_material`.
- Exactly one `rawMaterialId` is attached.
- `sourceId` is copied from the Raw Material.
- `parsedDocumentId` stays empty until a Parsed Document write succeeds.
- `requestedBy` uses the authenticated user or `system` in local/dev mode.
- `startedAt` is set when execution begins, not when the UI opens.
- `finishedAt` is set for terminal states.
- Terminal operation summaries must be safe for product UI.

State constraints:

- `queued` means accepted but not yet running.
- `running` means parser work has started.
- `succeeded` means Parsed Document metadata and normalized content are persisted.
- `failed` means no valid Parsed Document was produced.
- `skipped` means the Raw Material did not need parsing under a safe rule.
- `cancelled` means user/system cancellation occurred before terminal parser output.

## 5. Parsed Document Write Semantics

Future parse success must create or replace Parsed Document evidence without mutating the Raw Material payload.

Required Parsed Document fields:

- `parsedDocumentId`
- `rawMaterialId`
- `sourceId`
- `title`
- `contentFormat`
- `normalizedContent`
- `metadata`
- `sourceRefs`
- `parserProfile`
- `parseStatus`
- `parseErrorSummary`
- `createdAt`
- `updatedAt`

Write rules:

- The parser writes exactly one Parsed Document for one Raw Material in the first implementation.
- `sourceRefs` must include Source, Raw Material, locator type, locator, excerpt, and confidence when available.
- `contentFormat` must match the selected Parser Profile.
- `parseStatus` becomes `parsed` only after Parsed Document persistence succeeds.
- If persistence fails after parser output is generated, the operation becomes `failed` and no partial Parsed Document should be visible.
- Parser output must not update WikiNode content.
- Parser output must not update Index Segments.

Replacement policy for a Raw Material that already has a Parsed Document:

- First implementation should reject re-parse unless it is an explicitly approved retry task.
- Re-parse must not overwrite previous Parsed Document evidence silently.
- Future replacement should either version Parsed Documents or create a new Parsed Document and mark the previous one as superseded.

## 6. Safe Error Summary

Parser failures must be summarized without exposing internals.

Allowed error summary content:

- Unsupported file type.
- Unsupported profile match.
- Empty or unreadable content.
- File failed security scan.
- Parser timed out.
- Parsed content did not satisfy minimum structure.

Forbidden error summary content:

- Stack traces.
- Raw parser exception class names.
- Storage credentials.
- Bucket names or signed URLs.
- Full filesystem paths.
- Secret values.
- Internal service hostnames.
- Raw document excerpts beyond a short safe excerpt.

Recommended user-facing messages:

| Failure | Message |
|---|---|
| No matching profile | `当前 Raw Material 没有可用的 Parser Profile。` |
| Unsupported content | `该文件内容暂不支持解析。` |
| Empty content | `未读取到可解析内容。` |
| Timeout | `解析超时，请稍后重试。` |
| Security block | `文件未通过安全检查，不能解析。` |
| Persistence failure | `解析结果保存失败，请稍后重试。` |

## 7. Retry Constraints

Retry is not implemented by IM033 and must remain a separate approved task.

Future retry rules:

- Retry is allowed only for terminal `failed` parse operations.
- Retry must create a new Source Operation record.
- Retry must use the same Raw Material and an enabled Parser Profile.
- Retry must not modify the previous failed operation except by linking it as prior evidence if a future schema supports it.
- Retry must not be bulk or batch in the first implementation.
- Retry must not bypass file type, scan, profile, or size checks.

Recommended retry rejection messages:

- `只有解析失败的 Raw Material 可以重试。`
- `当前 Parser Profile 已停用，不能重试。`
- `批量重试不在当前范围内。`

## 8. Rollback And Re-run Rules

Rollback must prioritize evidence integrity over convenience.

Required future behavior:

- If operation creation fails, parser execution must not start.
- If parser execution fails before Parsed Document persistence, no Parsed Document is created.
- If Parsed Document persistence succeeds but operation finalization fails, the system must surface a recoverable operational error and reconcile the operation log before allowing retry.
- If cleanup is needed, it must target temporary parser artifacts, not Raw Material evidence.
- Raw Material records are never deleted by parse rollback.
- Source Operation records are append-only audit evidence.

Re-run is separate from retry:

- Retry means running again after a failed operation.
- Re-run after success requires explicit versioning or supersession semantics.
- Re-run after success is deferred until Parsed Document versioning is planned.

## 9. Future API Candidate

This is not implemented by IM033.

Candidate endpoint for a future approved task:

```http
POST /api/raw-materials/{rawMaterialId}/parse
```

Required future request properties:

- `parserProfile`
- `idempotencyKey` or client-provided operation key

Required future response properties:

- `operationId`
- `rawMaterialId`
- `status`
- safe summary

Forbidden response properties:

- Raw storage credentials.
- Signed URLs.
- Raw vector chunks.
- Auto-created WikiNode IDs.
- Auto-created Index Segment IDs.

## 10. Acceptance Requirements For Future Implementation

Any future implementation must add:

- API contract tests for parse acceptance, rejection, failure, and success.
- Repository or integration tests for Source Operation lifecycle.
- Repository or integration tests for Parsed Document write semantics.
- Playwright coverage for action disabled state, loading state, success state, failure state, and no batch parse.
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

## 11. Stop Conditions For Implementation

Stop for explicit approval if implementation needs:

- Parser library dependencies.
- Package or lockfile changes.
- Real storage object reads.
- Signed URLs.
- Authentication or permission checks.
- Malware scanner integration.
- Parser execution workers or queues.
- Parsed Document versioning.
- Retry execution.
- Batch parse.
- WikiNode suggestion or creation.
- Auto-publish or auto-index.

## 12. Recommended Next Task

```text
IM034 Draft WikiNode Suggestion Planning
```

IM034 should remain planning-only unless the user explicitly expands scope. It should define how Parsed Document evidence can propose a draft WikiNode while preserving manual governance, sourceRefs, and no auto-publish/no auto-index rules.
