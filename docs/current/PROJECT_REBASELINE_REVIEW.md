# WikiNode Studio Project Rebaseline Review

Task: `IM007-precheck Full Documentation Review & Next Step Plan`

Date: 2026-06-23

## 1. Review Scope

This review read the current project rules, product scope, roadmap boundary, design reference, and verification guidance:

- `AGENTS.md`
- `README.md`
- `docs/current/PROJECT_CONTEXT.md`
- `docs/current/PRODUCT_SCOPE.md`
- `docs/current/FEATURE_MAP.md`
- `docs/current/DESIGN_REFERENCE.md`
- `docs/current/DONE_REPORT_TEMPLATE.md`
- `docs/current/STORY_QUEUE.yaml`
- `docs/current/ACTIVE_TASKS.yaml`
- `docs/current/BLOCKERS.md`
- `docs/current/WEKNORA_WIKI_GRAPH_ANALYSIS.md`
- `docs/quality/GATE_REGISTRY.md`
- `docs/quality/STATE_MANAGEMENT.md`
- `docs/quality/frontend-ux-guidelines.md`

This review checked these implementation areas:

- Frontend shell and `sidebar-07` structure: `src/app/router.tsx`, `src/components/layout/app-shell.tsx`, `src/components/app-sidebar.tsx`, `src/components/ui/sidebar.tsx`.
- Product routes and pages: `src/pages/**`.
- WikiNode editor components: `src/components/wiki/**`.
- Wiki Graph components: `src/components/graph/**`.
- Retrieval and Index Segment components: `src/components/retrieval/**`, `src/components/segments/**`.
- TypeScript types and mock data: `src/types/**`, `src/data/**`.
- Frontend services: `src/services/**`.
- Java API, models, repositories, and migrations: `src/main/java/**`, `src/main/resources/db/migration/**`.
- Tests and scripts: `tests/e2e/**`, `src/test/java/**`, `scripts/**`, `playwright.config.ts`, `.github/workflows/ci.yml`.

No functional code was changed in this review.

## 2. Current Implementation Status

| Module | Current Status | Evidence | Gap |
|---|---|---|---|
| Overview | Done | `src/pages/overview-page.tsx` renders WikiNode count, published count, broken links, indexed nodes, Index Segments, failed index jobs, quality issues, retrieval health. | Uses mixed live API and mock frontend data; product metrics are not yet API-backed end to end. |
| Knowledge Bases | Skeleton | `/knowledge-bases`, detail, and settings routes exist in `src/app/router.tsx`; `src/pages/skeleton-pages.tsx` uses `mockKnowledgeBases`. | No create/edit/copy/move workflows; no API model; settings are static boundary copy. |
| Sources | Partial | `src/pages/sources-page.tsx`, `src/types/source.ts`, `src/data/mock-sources.ts`, Java `SourceItem`, `/api/sources`. | No Source import, sync job execution, snapshots, or parser workflow by design; frontend mock has 6 sources while backend seed has 4. |
| Raw Materials | Skeleton | `/raw-materials`, detail, and parsed-result routes exist; `src/types/raw-material.ts` and `mockRawMaterials` include 8 items. | No backend model or API; no file preview, parser output, or re-parse behavior. |
| WikiNodes | Partial | `src/pages/wiki-node-list-page.tsx`, create/edit pages, `src/components/wiki/wiki-node-table.tsx`, Java `/api/wiki-nodes`, PostgreSQL seed data. | Editor is usable but shallow; publish and re-index buttons are static UI and must not become real approval/publishing behavior without a confirmed task. |
| WikiLinks / Broken Links / Wiki Graph | Partial | `src/utils/link-parser.ts`, Java double-link parser, `/broken-links`, `/wiki-graph`, graph overview/ego API, `GraphEdge.resolved`. | Wiki Graph is a card/list visualization, not an interactive canvas; WikiLink is computed from Markdown, not a persisted explicit model. |
| Index Segments | Partial | `src/types/index-segment.ts`, `src/data/mock-index-segments.ts`, `/index-segments`, `/index-segments/strategy`, `/index-segments/debug`, Segments inspector tab. | Mock-only; no backend IndexSegment model, generation job, sync status, or persisted segment records. |
| Publishing / Index | Skeleton | `/publishing`, `/index-status`, `/vector-sync`, `/index-jobs`; Java `IndexStatusSummary`; README excludes publishing approval. | Publishing center and vector sync are static; no approval, export, batch, or real vector-store sync should be added without explicit scope. |
| Retrieval Test | Partial | `src/pages/retrieval-test-page.tsx`, `src/types/retrieval.ts`, Java `/api/retrieval-test`, contract tests ensure result has `node` and no `chunk` or `document`. | Frontend debug can show mock `matchedSegments`; backend retrieval result has no `matchedSegments` field and no IndexSegment mapping layer yet. |
| Tags / Metadata | Skeleton | Routes for `/tags`, `/node-types`, `/metadata-fields`; `WikiNode` has tags, node type, optional metadata fields in TypeScript. | No tag CRUD, metadata schema, classification rules, or backend model. |
| Quality | Skeleton | `/quality-issues`, conflict, expired, duplicate, retrieval evaluation routes; `QualityIssue` type and 8 mock issues. | No backend quality issue store, detection rules, or evaluation workflow. |
| System | Skeleton | `/system/parser-engine`, `/system/storage-engine`, `/system/vector-store`, `/system/embedding-config`, `/system/health`; boundary copy says external vector stores only. | No real parser/storage/vector/embedding configuration. Embedding remains out of scope for current MVP work. |
| Admin | Skeleton | `/admin/users`, `/admin/roles`, `/admin/permissions`, `/admin/audit-logs`; `StudioUser` type and 5 mock users. | No separate `Role` or `Permission` TypeScript types; no auth, RBAC, audit log backend, or permission boundary. |

## 3. Product Boundary Check

| Check | Result | Evidence | Notes |
|---|---|---|---|
| Agent / Chatbot / Workflow / MCP / IM added as product scope | Pass | Source scan found these terms only in docs/tests boundary checks, not as product pages or implementation surfaces. | `FEATURE_MAP.md` mentions external Agent consumers, which is allowed as ecosystem context. |
| System turned into a vector database | Pass | `SystemVectorStorePage` and `settings-page.tsx` say the system configures external vector stores and does not own a vector database. | Good boundary language. |
| Product uses Chunk Management naming | Pass | Tests block `Chunk Management`; visible Index Segment pages use `Index Segments`. | Some docs discuss `chunk` only as prohibited or WeKnora analysis context. |
| Correct use of Index Segment | Pass | `IndexSegment` type and pages describe controlled retrieval units generated from WikiNodes. | Current implementation is mock-only. |
| Retrieval Test returns WikiNode by default | Pass | TypeScript `RetrievalResult.node: WikiNode`; Java `RetrievalResult(WikiNode node, ...)`; API smoke checks `node=true`. | Backend does not expose `matchedSegments`; frontend mock does only in debug. |
| `matchedSegments` only in debug mode | Pass | `src/services/retrieval-mock-service.ts` sets `matchedSegments` only when `query.debug` is true. | UI labels use `Debug mode`; acceptable for precheck, but future UX may localize. |
| Frontend follows shadcn `sidebar-07` shell | Pass | `AppShell` uses `SidebarProvider`, `AppSidebar`, `SidebarInset`, `SidebarTrigger`, `Separator`, `Breadcrumb`; `AppSidebar` uses grouped navigation. | Layout is preserved. |

## 4. Design Reference Check

| Design Rule | Status | Evidence | Gap |
|---|---|---|---|
| `SidebarProvider` | Done | `src/components/layout/app-shell.tsx`. | None. |
| `AppSidebar` | Done | `src/components/app-sidebar.tsx`. | None. |
| `SidebarInset` | Done | `src/components/layout/app-shell.tsx`. | None. |
| `SidebarTrigger` | Done | Header in `AppShell`. | None. |
| `Breadcrumb` | Done | `AppBreadcrumb` in `AppShell`. | Breadcrumb is simple and labels all nested routes as `编辑`; may need route-aware labels later. |
| Collapsible sidebar | Done | `AppSidebar` renders `<Sidebar collapsible="icon">`. | None. |
| Full navigation groups | Done | Platform, Knowledge, Governance, System groups in `AppSidebar`; Admin lives under System entry and routes exist. | Admin is not a top-level visible group; current design reference lists System with Users/Audit Logs, so this is acceptable but should be watched. |
| WikiNode Editor internal three-column layout | Done | `WikiNodeEditPage` grid uses `260px / 1fr / 340px`; Explorer, editor, inspector components are separated. | Needs responsive/mobile treatment and deeper workflow states. |
| Inspector tabs | Done | `WikiNodeInspector` has Metadata, Links, Sources, Index, Segments. | Tab content is useful but still mock/static for segments. |
| Segments naming | Done | UI uses `Segments` tab and `Index Segment` labels. | No `Chunk Management` visible. |

## 5. Data Model Check

| Type / Model | Current Coverage | Gaps / Inconsistencies |
|---|---|---|
| `KnowledgeBase` | TypeScript type exists with health, counts, owner, timestamps. | No Java/backend model or API. |
| `Source` | TypeScript `SourceItem` and Java `SourceItem` exist. | Frontend supports more source types than backend seed data; no Source detail/snapshot backend. |
| `RawMaterial` | TypeScript type exists. | No Java/backend model or API; no `ParsedDocument` type. |
| `WikiNode` | TypeScript and Java models exist; API and DB persist core fields. | TypeScript model is richer than Java/DB: business domain, brand, product category, scenario, owner, security level, review/publish status, version, and contentPlainText are frontend-only. |
| `WikiLink` | TypeScript and Java models exist; unresolved links are represented. | Links are computed from Markdown, not persisted as explicit records. |
| `IndexSegment` | TypeScript type exists and mock data generated from WikiNodes. | No Java/backend model, DB table, API, generation job, or vector document sync contract. |
| `RetrievalResult` | TypeScript and Java models return `node: WikiNode`. | TypeScript has optional debug `matchedSegments`; Java backend result does not. |
| `QualityIssue` | TypeScript type and mock data exist. | No Java/backend model, DB table, API, or rule engine. |
| `User / Role / Permission` | `StudioUser` type has inline `role` enum; routes for users/roles/permissions exist. | No standalone `Role` or `Permission` type; no backend/auth/RBAC/audit model. |

## 6. Mock Data Check

| Mock Data Area | Current Coverage | Needs Supplement |
|---|---|---|
| KnowledgeBase count | 3 records in `mockKnowledgeBases`. | Enough for list/detail validation; add settings variants when KB settings deepen. |
| Source count | 6 frontend records; 4 backend seed records. | Align seed richness or document the frontend/backend mismatch when source workflows begin. |
| RawMaterial count | 8 records. | Add parsed document detail shape when Raw Material work starts. |
| WikiNode count | 12 frontend records; 5 backend seed records after reset. | Good frontend variety; backend seed is lean. Editor deepening should decide whether to rely on backend seed or mock surface. |
| WikiLink count | 20 inline `[[...]]` references in frontend mock WikiNodes. | Add explicit relation-type variety if graph work deepens. |
| Broken links | 3 unresolved frontend mock targets: `洗衣机排水规范`, `客户联系规范`, `配件库存规则`. | Good for broken-link validation; backend seed also has unresolved references through parser. |
| IndexSegment count | 36 generated mock segments from 12 nodes x 3 segment types. | Enough for table/debug; lacks lifecycle states beyond node index status. |
| `matchedSegments` | Present only when Retrieval debug mode is enabled. | Backend has no matched segment evidence; do not add without IndexSegment backend scope. |
| Retrieval logs | 10 mock logs. | Query log page is skeleton; no backend logs or evaluation data. |
| Quality issues | 8 mock issues. | No non-broken-link issue behavior; enough for navigation skeleton only. |

## 7. Test & Script Check

| Verification Entry | Current Status | Notes |
|---|---|---|
| `pnpm lint` | Stable required check. | Runs ESLint over the frontend workspace. |
| `pnpm build` | Stable required check. | Runs `tsc -b && vite build`. |
| `mvn test` | Stable backend check. | Tests use the test profile/H2 and do not require local PostgreSQL. |
| Playwright | Available but config needs repair. | Manual 3001 startup works, but the current README/config command shape can start Vite on the default `5173` instead of `3001`. Backend must also be running for API-backed smoke. |
| `scripts/check.sh` | Stable Harness entry. | Runs `scripts/check-state.sh --strict`, script tests, optional env-driven lint/type/test/build commands, and shell syntax check. |
| `scripts/reset-db.sh` | Available but requires local PostgreSQL and `psql`. | Drops/recreates `public`, runs Flyway through Spring Boot non-web mode, verifies 5 seed WikiNodes. |
| `scripts/api-smoke.sh` | Available but requires running backend and local DB cleanup access. | Checks WikiNode CRUD, broken links, retrieval node contract, and absence of `chunk`/`document`. |
| GitHub Actions | Partial | Current CI runs `mvn test`, `pnpm install --frozen-lockfile`, `pnpm run lint`, `pnpm run build`. PostgreSQL integration CI and Playwright CI are not wired yet. |

README / Playwright config consistency:

- README says frontend runs on `http://127.0.0.1:3001`.
- README says `pnpm run test:e2e` starts or reuses Vite at `http://127.0.0.1:3001`.
- `playwright.config.ts` currently uses `webServer.command = "pnpm run dev -- --host 127.0.0.1 --port 3001"`.
- In this environment, that command resolves to `vite -- --host 127.0.0.1 --port 3001`, so Vite ignores the intended host/port flags and starts on default `http://localhost:5173/`.
- Result: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 pnpm exec playwright test` times out waiting for the configured web server when no 3001 frontend is already running.
- Workaround verified in this review: manually start `pnpm run dev --host 127.0.0.1 --port 3001`, then run `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 pnpm exec playwright test`; the suite passes.
- This is a real README / Playwright config inconsistency and should be fixed before further product development.

## 8. Recommended Next Development Task

Recommended main task: **F. Playwright / dev server configuration repair**.

Reasons:

- The review found a concrete verification defect: Playwright's configured web server command can start Vite on `5173` while the suite waits for `3001`.
- The same Playwright suite passes when the frontend is manually started on `3001`, so the issue is isolated and repairable.
- Fixing this first protects the next product task from ambiguous local smoke results.
- The repair can stay narrow: no business behavior, no backend API, no schema, no dependencies, and no product UI changes.
- After F is fixed, **A. WikiNode Editor deepening** should be the next product development task.

Why not the other candidates as IM007:

- A. WikiNode Editor deepening: still the best next product task, but should wait until the browser smoke command is reliable.
- B. Index Segment page deepening: useful, but Index Segment is a system-managed object. It should follow clearer WikiNode editing and content/source evidence.
- C. Retrieval Test + Debug deepening: useful, but debug evidence depends on Index Segment maturity. Retrieval already satisfies the key boundary: returns WikiNode by default.
- D. Wiki Graph page deepening: visually valuable, but less central than the editing workflow and likely to create interaction complexity.
- E. Java backend data model planning: important later, but it risks expanding into DB/schema/API planning before the frontend product surface is stable.
- G. Mock data quality enhancement: current mock data is adequate for editor deepening; supplement it inside the editor task only if needed for acceptance.

Draft IM007 prompt:

```text
You are working in WikiNode Studio.

Task name:
IM007 Playwright / Dev Server Config Repair

Goal:
Repair the local Playwright webServer and README dev-server instructions so browser smoke reliably starts or reuses Vite on http://127.0.0.1:3001.

Read first:
1. AGENTS.md
2. docs/current/PROJECT_CONTEXT.md
3. docs/current/PRODUCT_SCOPE.md
4. docs/current/FEATURE_MAP.md
5. docs/current/DESIGN_REFERENCE.md
6. docs/current/PROJECT_REBASELINE_REVIEW.md
7. docs/current/STORY_QUEUE.yaml
8. docs/current/ACTIVE_TASKS.yaml
9. docs/current/BLOCKERS.md
10. docs/quality/GATE_REGISTRY.md

Allowed scope:
- `playwright.config.ts`
- `README.md`
- `package.json` scripts only if needed, but do not change dependencies or lockfiles.
- Existing Playwright tests only if the command repair requires assertion updates.
- `docs/current/**` only for the Done Report or task evidence if required.

Do not:
- Add dependencies or modify lock files.
- Change product UI behavior, backend API, Java models, repository, Flyway migrations, or database behavior.
- Expand Playwright product coverage beyond the existing smoke intent unless separately approved.
- Implement real publishing, approval, export, batch, auth, permissions, vector database, embedding, Source import, parser, or external integration behavior.

Expected improvements:
1. Make `pnpm run test:e2e` reliably start or reuse Vite on `http://127.0.0.1:3001`.
2. Align README frontend and Playwright instructions with the command that actually works in this pnpm/Vite environment.
3. Keep `VITE_USE_MOCK_FALLBACK=false` for real backend integration smoke.
4. Preserve existing Playwright scope and assertions.
5. Document backend/PostgreSQL prerequisites clearly.

Required verification:
- pnpm lint
- pnpm build
- bash scripts/check.sh
- git diff --check origin/main..HEAD
- mvn test
- ./scripts/reset-db.sh if local PostgreSQL is available
- ./scripts/api-smoke.sh against a running backend
- PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 pnpm exec playwright test

Done Report must include changed files, runtime status, verification, product boundary check, and remaining risks. The recommended follow-up after IM007 is WikiNode Editor deepening.
```

## 9. Risks

- Product scope risk: Static buttons such as publish and re-index are visible in the editor. They are acceptable as current skeleton controls, but converting them into real actions would trigger approval/publishing/indexing stop conditions.
- Frontend structure risk: Many roadmap routes exist as skeleton pages. This is useful for IA validation but can make the product look broader than the implemented behavior.
- Data model risk: TypeScript models are richer than Java/DB models. Future backend work must explicitly reconcile fields rather than assuming frontend types are already persisted.
- Naming risk: Index Segment naming is mostly correct. Keep tests guarding against `Chunk Management`; avoid raw `chunk` copy in visible UI.
- Backend connection risk: Frontend mock data has 12 WikiNodes while reset DB has 5 WikiNodes. Browser smoke may show different titles depending on API availability and fallback behavior.
- Test risk: Playwright is locally available and the suite passes with a manually started 3001 frontend, but the current configured webServer command can time out because Vite starts on 5173. CI does not yet run Playwright or PostgreSQL integration.
- Governance risk: `STORY_QUEUE.yaml` and `ACTIVE_TASKS.yaml` still list IM005 as ready even though current `origin/main` includes the frontend navigation skeleton. Queue state should be refreshed before starting another implementation task.

## 10. Final Recommendation

- Treat this review as the IM007 precheck baseline, not as feature implementation.
- Refresh current task state before implementation so completed IM005 work is not represented as ready work.
- Choose **IM007 Playwright / Dev Server Config Repair** as the next task.
- Then choose **WikiNode Editor Deepening** as the next product task after the smoke command is reliable.
- Keep the config repair behavior-neutral: no product UI, backend, schema, API, or dependency scope.
- Preserve `sidebar-07`; do not redesign the application shell.
- Keep Retrieval results WikiNode-centered; show Index Segments only as secondary/debug evidence.
- Do not implement real publish, re-index, approval, batch, auth, permissions, vector database, embedding, Source import, parser, Agent, Chatbot, Workflow, MCP, or IM scope.
- Use the existing mock data first; supplement only what the editor needs.
- Run `pnpm lint`, `pnpm build`, `bash scripts/check.sh`, and `git diff --check origin/main..HEAD` before Done Report.
- Keep Playwright as an environment-dependent smoke until PostgreSQL/backend CI is wired.
