# Source / Raw Material / Parsed Document Phase 2 Plan

Task: `IM024 Source / Raw Material / Parsed Document Phase 2 Plan`

Date: 2026-06-25

Status: planning baseline only.

## 1. Purpose

This plan defines the next safe product slice after MVP v0.2. It turns the first Phase 2 backlog item from `docs/release/mvp-baseline-v0.2.md` into an auditable execution sequence without starting real import, parser, backend, database, API, dependency, permission, or external integration work.

The goal is to keep the upstream knowledge pipeline clear before implementation:

```text
Source
  -> Raw Material
  -> Parsed Document
  -> WikiNode / Knowledge Object
  -> Index Segment
  -> Retrieval API returns WikiNodes
```

## 2. Current MVP v0.2 Baseline

Current user-visible state:

- `/sources` explains Source boundaries and shows read-only source records.
- `/sources/:sourceId` is a read-only Source Detail acceptance surface.
- `/raw-materials` explains Raw Material as a source snapshot.
- `/raw-materials/:rawMaterialId` is a read-only Raw Material Detail surface.
- `/raw-materials/:rawMaterialId/parsed-result` is a static Parsed Result Preview.
- No real sync, upload, parser execution, download, storage access, or import action is exposed.

Current implementation reality:

- Frontend pages use local mock data.
- Java has an early `SourceItem` surface, but the frontend Source flow is not API-wired end to end.
- `RawMaterial` exists as frontend mock data.
- `ParsedDocument` is not yet a first-class frontend, Java, DB, or API model.
- Parser, storage, sync job, snapshot, and import workflows are deferred.

## 3. Concept Boundaries

| Concept | Product meaning | Not this |
|---|---|---|
| Source | A configured origin of enterprise knowledge, such as a Feishu document space, PDF repository, web source, database, API, or manual corpus. | Not the parsed content itself. Not a WikiNode. |
| Raw Material | A captured immutable or versioned snapshot from a Source, such as an uploaded file, document snapshot, HTML snapshot, or table extract. | Not a Knowledge Object. Not an Index Segment. |
| Parsed Document | Normalized content produced from Raw Material, such as Markdown, structured tables, sections, extracted metadata, and source references. | Not final curated knowledge. Not an external vector chunk. |
| WikiNode | The curated business knowledge asset created or linked from Parsed Document evidence. | Not raw imported content. |
| SourceRef | Evidence pointer from WikiNode or Index Segment back to Source / Raw Material / Parsed Document ranges. | Not an edit workflow by itself. |

## 4. Product Invariants

- WikiNode remains the primary business knowledge object.
- Source and Raw Material are upstream evidence surfaces, not business knowledge objects.
- Parsed Document is a normalized intermediate artifact, not a replacement for WikiNode.
- Index Segment is generated from WikiNode / Knowledge Object content, not from external vector-store internal chunks.
- Retrieval API returns WikiNodes by default.
- `matchedSegments` remains debug evidence only.
- Product UI must not expose `Chunk Management`, `Chat API`, `Chatbot`, `Agent Platform`, `Workflow Builder`, or `Vector DB Management`.

## 5. Proposed Phase 2 Execution Sequence

### IM025 - Source / Raw Material UX Acceptance Deepening

Type: frontend-only mock refinement.

Goal: make the current Source and Raw Material pages easier to manually review without introducing real import.

Allowed:

- Improve read-only Source Detail, Raw Material Detail, and Parsed Result Preview layout.
- Clarify snapshot, parser, source evidence, and WikiNode conversion copy.
- Add Playwright coverage for current boundary states.

Forbidden:

- No real create source.
- No upload.
- No sync execution.
- No parser execution.
- No backend, DB, API, dependency, auth, permission, approval, export, or batch operation changes.

Exit criteria:

- PM can understand the upstream evidence chain from existing mock pages.
- The pages remain clearly non-operational for real import.

### IM026 - Source / Raw Material / Parsed Document Model Contract Plan

Type: docs and API/model planning only.

Goal: define the minimum future Java/DB/API contract before implementation.

Allowed:

- Add a contract proposal document.
- Define candidate entities, fields, relationships, lifecycle states, and API boundaries.
- Define migration risk and rollout steps.

Forbidden:

- No Java code.
- No migration.
- No API route implementation.
- No frontend service wiring.
- No parser or external connector code.

Exit criteria:

- The team can review a concrete backend contract before any schema or API change.

### IM027 - Minimal Backend Model Spike

Type: implementation only after explicit approval.

Goal: implement the smallest persistent model if the IM026 contract is approved.

Likely scope:

- `Source`
- `RawMaterial`
- `ParsedDocument`
- source-to-raw-material relation
- raw-material-to-parsed-document relation
- read-only API list/detail endpoints

Hard stop:

- Requires explicit approval because it touches Java, DB, API, migrations, and persistence.

### IM028 - Frontend API Alignment

Type: implementation only after IM027 is merged.

Goal: wire read-only frontend Source / Raw Material / Parsed Document pages to approved backend endpoints.

Forbidden unless separately approved:

- Create source.
- Upload.
- Real sync.
- Parser execution.
- External connectors.

### IM029 - Parser / Import Operation Planning

Type: planning only unless explicitly expanded.

Goal: plan real import, upload, sync, parser execution, storage access, retry, and logs.

Hard stop:

- Real import, upload, parser execution, external connectors, file storage, auth, permission, approval, export, and batch operation boundaries require explicit confirmation.

## 6. Minimal Future Model Sketch

This is a planning sketch, not an implementation contract.

### Source

Candidate fields:

- `id`
- `name`
- `sourceType`
- `description`
- `owner`
- `syncStatus`
- `lastSyncedAt`
- `boundaryNote`
- `createdAt`
- `updatedAt`

### Raw Material

Candidate fields:

- `id`
- `sourceId`
- `title`
- `rawMaterialType`
- `snapshotVersion`
- `capturedAt`
- `contentHash`
- `storageRef`
- `parseStatus`
- `createdAt`
- `updatedAt`

### Parsed Document

Candidate fields:

- `id`
- `rawMaterialId`
- `parserProfile`
- `contentFormat`
- `title`
- `normalizedContent`
- `metadata`
- `sourceRefs`
- `parseStatus`
- `parseErrorSummary`
- `createdAt`
- `updatedAt`

### SourceRef

Candidate fields:

- `sourceId`
- `rawMaterialId`
- `parsedDocumentId`
- `locatorType`
- `locator`
- `excerpt`
- `confidence`

## 7. Candidate Read-Only API Boundaries

These routes are candidates for IM026 planning review, not implemented in IM024:

```text
GET /api/sources
GET /api/sources/{sourceId}
GET /api/sources/{sourceId}/raw-materials
GET /api/raw-materials
GET /api/raw-materials/{rawMaterialId}
GET /api/raw-materials/{rawMaterialId}/parsed-documents
GET /api/parsed-documents/{parsedDocumentId}
```

No write endpoint should be planned until import/upload/parser operation boundaries are explicitly approved.

## 8. Acceptance Gates For Future Implementation

Any future implementation must preserve:

- WikiNode-centered product language.
- Explicit distinction between Raw Material, Parsed Document, WikiNode, and Index Segment.
- Read-only behavior unless a write operation is explicitly approved.
- No Product UI named `Chunk Management`.
- No Retrieval API drift toward `Chat API`.
- No parser/upload/sync execution hidden behind a harmless-looking button.

Required verification for frontend-only slices:

```bash
pnpm lint
pnpm build
bash scripts/check.sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 pnpm exec playwright test
git diff --check origin/main..HEAD
```

Required verification for future backend/model slices:

```bash
mvn test
pnpm lint
pnpm build
bash scripts/check.sh
./scripts/api-smoke.sh
git diff --check origin/main..HEAD
```

## 9. IM024 Non-Goals

IM024 does not:

- Add or change frontend product behavior.
- Add or change tests.
- Add or change Java code.
- Add or change DB migrations.
- Add or change API contracts.
- Add dependencies.
- Modify package or lock files.
- Connect real external sources.
- Add upload, parser execution, sync, retry, logs, auth, permissions, approval, export, or batch operations.

## 10. Recommended Next Task

Recommended next task after IM024:

```text
IM025 Source and Raw Material UX Acceptance Deepening
```

Recommended scope:

- frontend-only
- existing pages only
- mock/read-only data only
- better Source Detail, Raw Material Detail, Parsed Result Preview
- Playwright coverage for boundary copy and route smoke

Do not start IM025 until IM024 is merged or the user explicitly allows a stacked branch.
