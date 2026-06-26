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

## Phase 2 Increment Update

After the MVP v0.2 baseline, the first Phase 2 implementation sequence has also been merged:

- `IM048` WikiNode Knowledge Object API alignment.
- `IM049` Index Segment generation and trace model.
- `IM050` Retrieval API debug evidence, query logs, and evaluation cases.
- `IM051` Publishing, index, metadata governance, and admin planning baseline.
- `IM053` Retrieval evaluation console baseline.
- `IM054` Quality issue console baseline.

The expected `main` baseline after IM054 is:

```text
ecd6b44 Merge pull request #50 from huiliuxu780/codex/im054-current-queue-definition
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
- WikiNode Knowledge Object fields aligned across Java, DB, API, frontend types/services, detail/editor surfaces, and tests.
- Deterministic local Index Segment generation with trace evidence tied to WikiNode content and source refs.
- Retrieval API debug evidence, minimal query logs, and evaluation case evidence while preserving WikiNode-first normal results.
- Read-only Query Logs, Evaluation Cases, and Retrieval Evaluation console surfaces for PM-readable retrieval evidence.
- Read-only Quality Issues evidence console for PM-readable WikiNode, WikiLink, source evidence, Index Segment, and retrieval-quality risks.
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
- Publishing, Index Status, Tags / Metadata, Roles, Permissions, and Audit Logs as read-only planning/boundary surfaces.

### Read-only Evidence Surfaces

- Query Logs.
- Evaluation Cases.
- Retrieval Evaluation.
- Quality Issues.

### Visual Skeleton

- Knowledge Base detail/settings.
- Parser, Storage, Vector Store, Embedding, Health, Publishing, Vector Sync, Index Jobs.
- Tags, Metadata, Admin Users/Roles/Permissions/Audit.

### Deferred

- Real Source import, file upload, external connectors, parser execution, OCR, LLM extraction.
- Parsed Document write path and real Raw Material storage access.
- Conflict Detection, Expired Knowledge, and Duplicate Knowledge as standalone product pages or workflows.
- External vector-store sync execution.
- Real embedding invocation or vector-store sync.
- Retrieval API return-shape change to raw segments or chunks.
- Full query log analytics and evaluation runner.
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

Latest local evidence from IM051:

```text
pnpm lint: passed
pnpm build: passed, with existing Vite chunk size warning
bash scripts/check.sh: passed
Playwright: 51 passed
git diff --check origin/main..HEAD: passed
```

GitHub evidence:

- IM019 PR #13 checks passed and merged.
- IM020 PR #14 checks passed and merged.
- IM021 PR #15 checks passed and merged.
- IM022 PR #16 checks passed and merged.
- IM048 PR #43 checks passed and merged.
- IM049 PR #44 checks passed and merged.
- IM050 PR #45 checks passed and merged.
- IM051 PR #46 checks passed and merged.
- IM053 PR #49 checks passed and merged.
- IM054 PR #50 checks passed and merged.

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
- `/publishing`
- `/tags`
- `/metadata-fields`
- `/settings`
- `/admin/roles`
- `/admin/permissions`
- `/admin/audit-logs`

## Known Limits

- Some navigation modules remain read-only planning surfaces instead of executable workflows.
- Real Source import, parser execution, publishing approval, external vector sync, permissions, audit persistence, export, and batch operations remain explicitly deferred.
- Vite production build reports an existing chunk size warning.
- Current broad navigation intentionally includes skeleton modules that are not real business workflows.

## Phase 2 Backlog

1. Source import, upload, parser execution, and Parsed Document write path.
2. External vector-store sync boundary and execution design.
3. Publishing/index job model beyond the read-only baseline.
4. Retrieval evaluation runner and query log analytics beyond minimal evidence.
5. Quality issue and retrieval evaluation workflows.
6. Tags/metadata schema management beyond the planning baseline.
7. Users, roles, permissions, and audit implementation beyond the planning baseline.
