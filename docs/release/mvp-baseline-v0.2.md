# WikiNode Studio MVP Baseline v0.2

## Version

WikiNode Studio MVP Baseline v0.2

## Baseline Commit Chain

This release baseline is closed after these merged increments:

- `IM014` Frontend localization and UX feedback baseline.
- `IM015` WikiGraph canvas recovery and visualization.
- `IM016` WikiGraph canvas layout optimization.
- `IM017` MVP v0.2 execution plan.
- `IM018` Manual acceptance sweep and bugfix.
- `IM019` Sources and Raw Materials boundary clarification.
- `IM020` Retrieval Test debug experience enhancement.
- `IM021` WikiNode Knowledge Object metadata surface.
- `IM022` Index Segment preview and debug completion.

The expected `main` baseline after IM022 is:

```text
dec1f45 Merge IM022 Index Segment preview and debug completion
```

## Product Scope

MVP v0.2 is a manually acceptable WikiNode-centered product prototype. It keeps the core product story stable:

```text
Source / Raw Material / Parsed Document boundary
  -> WikiNode / Knowledge Object carrier
  -> WikiLink and WikiGraph relationship workspace
  -> Index Segment controlled retrieval unit
  -> Retrieval API / Retrieval Test returns WikiNodes
```

## Current Capabilities

### Done

- React + Spring Boot MVP baseline.
- PostgreSQL + Flyway schema and seed flow.
- `scripts/reset-db.sh` and `scripts/api-smoke.sh`.
- GitHub Actions backend/frontend baseline CI.
- shadcn sidebar application shell and product navigation.
- WikiNode list, create, editor, detail, Markdown preview, save feedback, local publish/re-index feedback.
- WikiLink parsing, backlinks, broken links, and resolved/broken preview badges.
- WikiGraph React Flow node-edge canvas with filters, visible MiniMap, fit view, canvas-first layout, and click-to-open inspector.
- Frontend Chinese UX baseline for main MVP pages.
- Playwright coverage for MVP smoke, product-boundary terms, WikiGraph, Knowledge Object, Retrieval Test debug, Index Segment, and skeleton routes.

### Functional Mock

- Sources and Raw Materials pages with explicit current boundary copy.
- Source Detail, Raw Material Detail, and Parsed Result Preview as read-only acceptance surfaces.
- Retrieval Test normal/debug experience with WikiNode-first results and `matchedSegments` only in debug mode.
- WikiNode Detail and Inspector display of Knowledge Object fields: `objectType`, `subtype`, `metadata`, `sourceRefs`, `relations`, and `processingProfile`.
- Index Segment list, preview, strategy, debug, and editor Segments tab.
- Index Status grouping by WikiNode index state.

### Visual Skeleton

- Knowledge Base detail/settings.
- Parser, Storage, Vector Store, Embedding, Health, Publishing, Vector Sync, Index Jobs.
- Query Logs, Evaluation Cases, Quality, Tags, Metadata, Admin Users/Roles/Permissions/Audit.

### Deferred

- Real Source import, file upload, external connectors, parser execution, OCR, LLM extraction.
- Parsed Document backend model and real Raw Material storage access.
- Java/DB/API expansion for Knowledge Object or Index Segment.
- Real Index Segment generation engine.
- Real embedding invocation or vector-store sync.
- Retrieval API return-shape change to raw segments or chunks.
- Query log persistence and evaluation runner.
- Permissions, roles, audit implementation, publishing approval, export, and batch operations.

## Product Boundaries

These names remain required:

- `WikiNode`
- `WikiLink`
- `Knowledge Object`
- `Index Segment`
- `Retrieval API`
- `WikiGraph`

These surfaces remain out of scope:

- Agent platform.
- Chatbot or Chat API.
- Workflow builder.
- Vector DB management.
- Product-facing Chunk Management.
- LLM final-answer generation platform.

## Verification

Local validation for this baseline:

```bash
pnpm lint
pnpm build
bash scripts/check.sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 pnpm exec playwright test
git diff --check origin/main..HEAD
```

Latest local evidence from IM022:

```text
pnpm lint: passed
pnpm build: passed, with existing Vite chunk size warning
bash scripts/check.sh: passed
Playwright: 26 passed
git diff --check origin/main..HEAD: passed
```

GitHub evidence:

- IM019 PR #13 checks passed and merged.
- IM020 PR #14 checks passed and merged.
- IM021 PR #15 checks passed and merged.
- IM022 PR #16 checks passed and merged.

## Manual Acceptance Routes

Use `docs/release/mvp-v0.2-acceptance-checklist.md` for step-by-step acceptance. Main routes:

- `/`
- `/wiki-nodes`
- `/wiki-nodes/create`
- `/wiki-nodes/wn-001`
- `/wiki-nodes/wn-001/detail`
- `/wiki-graph`
- `/broken-links`
- `/retrieval-test`
- `/sources`
- `/sources/src-feishu-cc`
- `/raw-materials`
- `/raw-materials/rm-001`
- `/raw-materials/rm-001/parsed-result`
- `/index-segments`
- `/index-segments/strategy`
- `/index-segments/debug`
- `/index-status`
- `/settings`
- `/admin/roles`

## Known Limits

- Frontend services still use local mock services for several product surfaces.
- Backend CRUD and API smoke exist for the earlier WikiNode baseline, but v0.2 frontend mock surfaces are not fully wired to Java APIs.
- Vite production build reports an existing chunk size warning.
- Current broad navigation intentionally includes skeleton modules that are not real business workflows.

## Phase 2 Backlog

1. Source / Raw Material / Parsed Document model and import planning.
2. Java/DB/API alignment for Knowledge Object and Index Segment.
3. Real Index Segment generation and trace model.
4. Retrieval API alignment for debug evidence and persisted query logs.
5. Publishing/index job model and external vector-store sync boundary.
6. Quality/evaluation runner.
7. Tags/metadata schema management.
8. Users, roles, permissions, and audit planning.
