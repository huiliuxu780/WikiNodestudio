# Source / Raw Material Parser and Import Operation Plan

Task: `IM029 Parser / Import Operation Planning`

Date: 2026-06-25

Status: planning baseline only.

## 1. Purpose

This document plans the future real operation layer after the read-only Source evidence chain is in place.

Current implemented chain:

```text
Source
  -> Raw Material
  -> Parsed Document
  -> WikiNode / Knowledge Object
  -> Index Segment
  -> Retrieval API returns WikiNodes
```

IM029 does not implement real import, upload, sync, parser execution, storage access, retry, logs, permissions, or batch operations. It defines the approval boundaries and execution sequence required before those capabilities can be safely built.

## 2. Current Baseline

Implemented by prior increments:

- IM025: read-only Source / Raw Material UX acceptance surfaces.
- IM026: Source / Raw Material / Parsed Document model contract plan.
- IM027: read-only backend model, migration, seed data, repository, and GET API.
- IM028: frontend API alignment for existing read-only Source evidence pages.
- IM030: read-only Source Operation logs, GET APIs, and Source / Raw Material operation log panels.
- IM031: read-only Parser Profile registry, GET API, and Parser Engine profile panel.

Current product behavior:

- `/sources` reads the Source list from approved GET APIs.
- `/sources/:sourceId` reads Source detail and related Raw Materials from approved GET APIs.
- `/raw-materials` reads Raw Materials from approved GET APIs.
- `/raw-materials/:rawMaterialId` reads Raw Material detail, Source, and Parsed Document list from approved GET APIs.
- `/raw-materials/:rawMaterialId/parsed-result` reads Parsed Document preview evidence from approved GET APIs.
- All Source / Raw Material / Parsed Document pages remain read-only.

Current hard exclusions:

- No create Source.
- No credential connector.
- No file upload.
- No sync job execution.
- No parser execution.
- No real storage object read/write.
- No retry or batch operation.
- No permissions, approval, export, or audit implementation.

## 3. Product Invariants

Future operation work must preserve:

- WikiNode remains the primary managed knowledge object.
- Raw Material is source evidence, not a WikiNode.
- Parsed Document is normalized intermediate evidence, not final curated knowledge.
- Index Segment is generated from curated WikiNode / Knowledge Object content.
- Retrieval API returns WikiNodes by default.
- `matchedSegments` remains debug evidence only.
- Product UI must not expose `Chunk Management`, `Chat API`, `Chatbot`, `Agent Platform`, `Workflow Builder`, or `Vector DB Management`.

## 4. Operation Capability Boundaries

| Capability | Meaning | Requires separate approval | First safe shape |
|---|---|---:|---|
| Source create/edit | Configure a knowledge origin and owner metadata. | Yes | Manual metadata only; no credential fields. |
| Credential connector | Store access credentials for Feishu/API/database/web sources. | Yes | Planning before implementation because it crosses auth and secret boundaries. |
| File upload | Accept PDF/Word/Excel/media files into managed storage. | Yes | Single-file upload with size/type validation and no parser execution. |
| Source sync | Pull snapshots from configured sources. | Yes | Dry-run job that creates operation logs before changing Raw Materials. |
| Raw Material capture | Persist immutable source snapshot metadata and storage pointer. | Yes | Append-only record with content hash and source version. |
| Parser execution | Convert Raw Material into Parsed Document. | Yes | Manual one-record parse command with safe parser profile allowlist. |
| Parser retry | Re-run failed parser operations. | Yes | Explicit retry on one failed Raw Material; no bulk retry. |
| Operation logs | Show job attempts, errors, and safe summaries. | Yes | Read-only logs first, then narrow write path with the operation. |
| Storage object access | Read or write original artifacts and parsed content blobs. | Yes | Opaque storage refs; no credential or signed URL exposure in product UI. |
| WikiNode conversion | Create or update WikiNodes from Parsed Document evidence. | Yes | Draft-only suggested WikiNode creation after manual review. |

## 5. Proposed Future Data Objects

These are planning candidates, not implemented by IM029.

### 5.1 Source Connection

Represents connection configuration without exposing secrets in product UI.

Candidate fields:

- `connectionId`
- `sourceId`
- `connectionType`
- `displayName`
- `credentialStatus`
- `lastValidatedAt`
- `createdAt`
- `updatedAt`

Rules:

- Do not store secrets in frontend state.
- Do not return secret values from any API.
- Validation failures must use user-safe messages.

### 5.2 Source Operation

Represents one sync, upload, parse, or conversion attempt.

Candidate fields:

- `operationId`
- `operationType`
- `sourceId`
- `rawMaterialId`
- `parsedDocumentId`
- `status`
- `requestedBy`
- `startedAt`
- `finishedAt`
- `summary`
- `errorSummary`

Initial `operationType` values:

- `source_sync`
- `file_upload`
- `raw_material_capture`
- `parse_raw_material`
- `retry_parse`
- `suggest_wikinode`

Initial `status` values:

- `queued`
- `running`
- `succeeded`
- `failed`
- `cancelled`
- `skipped`

### 5.3 Parser Profile

Represents an allowlisted parser route.

Candidate fields:

- `parserProfile`
- `displayName`
- `supportedRawMaterialTypes`
- `supportedSourceTypes`
- `contentFormat`
- `enabled`
- `version`

Rules:

- Parser profile is selected by platform configuration, not free-form user text.
- Parser output must produce Parsed Document evidence before any WikiNode conversion.

### 5.4 Storage Object

Represents the managed storage pointer behind a Raw Material or Parsed Document.

Candidate fields:

- `storageObjectId`
- `storageProvider`
- `storageRef`
- `contentHash`
- `contentType`
- `byteSize`
- `createdAt`

Rules:

- Product UI may show provider, hash, size, and safe reference labels.
- Product UI must not show bucket credentials, signed URLs, access tokens, or internal path secrets.

## 6. Future API Boundary Candidates

These APIs are candidates for future approved implementation tasks only.

### 6.1 Read-only operation APIs

Read-only operation APIs should come before write operations:

```http
GET /api/sources/{sourceId}/operations
GET /api/raw-materials/{rawMaterialId}/operations
GET /api/source-operations/{operationId}
GET /api/parser-profiles
```

Purpose:

- Let PM and engineers inspect operation state without triggering real work.
- Preserve the existing read-only acceptance style.

### 6.2 Narrow write APIs

Each write API requires explicit approval before implementation:

```http
POST /api/sources
POST /api/sources/{sourceId}/sync-dry-run
POST /api/raw-materials/upload
POST /api/raw-materials/{rawMaterialId}/parse
POST /api/raw-materials/{rawMaterialId}/parse-retry
POST /api/parsed-documents/{parsedDocumentId}/suggest-wikinode
```

Required constraints:

- All write endpoints must be idempotency-aware or operation-id based.
- All write endpoints must produce a Source Operation record.
- All write endpoints must return WikiNode-centered product language.
- No endpoint may return raw vector chunks as the primary result.

## 7. Proposed Execution Sequence

### IM030 - Source Operation Read-only Logs

Type: backend + frontend read-only implementation only after approval.

Goal:

- Add read-only operation log model and pages so future operations have an observable audit surface before any action button exists.

Allowed after approval:

- Java model for Source Operation.
- DB migration for operation logs.
- GET APIs for operation lists and details.
- Frontend read-only operation log panels.
- Tests and API smoke coverage.

Forbidden:

- No operation execution.
- No upload.
- No parser execution.
- No sync job execution.
- No credentials.

### IM031 - Parser Profile Read-only Registry

Type: backend + frontend read-only implementation only after approval.

Goal:

- Add a read-only parser profile registry so future parser execution uses allowlisted profiles.

Allowed after approval:

- Parser profile seed data.
- GET `/api/parser-profiles`.
- Frontend read-only parser profile page or panel.

Forbidden:

- No parser execution.
- No parser plugin loading.
- No dependency changes unless explicitly approved.

### IM032 - File Upload Planning

Type: planning only unless explicitly expanded.

Goal:

- Specify file upload constraints before implementation.

Must define:

- Supported MIME types.
- File size limits.
- Storage provider boundary.
- Virus/security scan boundary if needed.
- Error messages.
- Cleanup and retry behavior.

Forbidden:

- No upload UI.
- No storage write.
- No backend endpoint implementation.

### IM033 - Single Raw Material Parse Planning

Type: planning only unless explicitly expanded.

Goal:

- Specify manual one-record parse execution after upload/storage boundaries are approved.

Must define:

- Parser profile selection.
- Operation record lifecycle.
- Parsed Document write semantics.
- Safe error summary.
- Retry constraints.
- Rollback and re-run rules.

Forbidden:

- No parser implementation.
- No dependency changes.
- No batch parse.

### IM034 - Draft WikiNode Suggestion Planning

Type: planning only unless explicitly expanded.

Goal:

- Plan how a Parsed Document can suggest a draft WikiNode without bypassing manual governance.

Must preserve:

- WikiNode remains curated and reviewable.
- Parsed Document remains evidence.
- Suggested WikiNode starts as draft.
- SourceRefs carry Source / Raw Material / Parsed Document locators.

Forbidden:

- No auto-publish.
- No auto-index.
- No batch conversion.

## 8. Acceptance Gates For Future Operation Work

Any future operation implementation must pass:

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

Additional acceptance requirements:

- New write APIs require API contract tests.
- New DB tables require JDBC repository tests or equivalent migration coverage.
- New frontend action buttons require Playwright success, failure, loading, and disabled-state coverage.
- New operation pages must keep Chinese user-facing status labels.
- Any auth, permission, approval, export, batch, or storage-secret boundary must stop for explicit confirmation before implementation.

## 9. Explicit Non-goals For IM029

IM029 does not:

- Add Java code.
- Add DB migrations.
- Add API routes.
- Add frontend routes.
- Add frontend service calls.
- Add tests.
- Add dependencies.
- Modify package or lock files.
- Implement upload, sync, parser execution, retry, operation logs, storage access, credentials, permissions, approval, export, or batch operations.

## 10. Recommended Next Task

Recommended next task after IM031:

```text
IM032 File Upload Planning
```

Start IM032 as planning only unless the user explicitly expands scope. It must not add upload UI, storage writes, backend upload endpoints, parser execution, or dependencies.
