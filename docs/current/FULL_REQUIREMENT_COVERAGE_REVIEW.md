# WikiNode Studio Full Requirement Coverage Review

Task: `IM008 Full Requirement Coverage Review`

Date: 2026-06-23

## 1. Review Goal

This review checks whether WikiNode Studio has completed the first baseline stages and whether the project can safely move from baseline construction into product-depth work.

The review focuses on three questions:

1. Are the documented product requirements represented by current navigation, pages, data models, mock data, backend contracts, and tests?
2. Are the durable product boundaries still intact, especially the WikiNode-centered retrieval model and Index Segment naming?
3. What should the next development task be after IM007 repaired the Playwright dev-server verification entry?

This is a documentation-only review. No functional code, product page behavior, backend behavior, database schema, dependency, or test behavior was changed.

## 2. Reviewed Inputs

Current governance, product, and design documents:

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
- `docs/current/PROJECT_REBASELINE_REVIEW.md`
- `docs/current/WEKNORA_WIKI_GRAPH_ANALYSIS.md`
- `docs/quality/GATE_REGISTRY.md`

Current implementation areas checked:

- Frontend application shell and sidebar layout: `src/app/router.tsx`, `src/components/layout/app-shell.tsx`, `src/components/app-sidebar.tsx`, `src/components/ui/sidebar.tsx`
- Frontend pages and feature surfaces: `src/pages/**`
- WikiNode editor and inspector components: `src/components/wiki/**`
- Wiki Graph components: `src/components/graph/**`
- Retrieval and Index Segment components: `src/components/retrieval/**`, `src/components/segments/**`
- TypeScript models and mock data: `src/types/**`, `src/data/**`
- Frontend services: `src/services/**`
- Java API, models, repositories, and migrations: `src/main/java/**`, `src/main/resources/db/migration/**`
- Tests and validation scripts: `tests/e2e/**`, `src/test/java/**`, `scripts/**`, `playwright.config.ts`, `.github/workflows/ci.yml`

## 3. Stage Completion Assessment

| Stage | Current Verdict | Evidence | Remaining Gap |
|---|---|---|---|
| Stage 1 Product Direction & Governance | Done | `PRODUCT_SCOPE.md`, `FEATURE_MAP.md`, `DESIGN_REFERENCE.md`, current queue files, blockers, gate registry, and rebaseline review define product boundaries, naming, layout, and validation expectations. | Current queue still contains older completed task entries and should be kept tidy in a later governance cleanup. |
| Stage 2 Frontend Application Shell & Navigation | Done | `AppShell` uses `SidebarProvider`, `AppSidebar`, `SidebarInset`, `SidebarTrigger`, `Breadcrumb`; router covers the full documented navigation surface. | Many routes are still visual skeletons or shallow product validation pages. This is acceptable for baseline, not enough for production workflow depth. |
| Stage 3 Engineering Validation Baseline | Done locally, Partial in CI | `pnpm lint`, `pnpm build`, `mvn test`, `scripts/check.sh`, `reset-db`, `api-smoke`, and Playwright can run locally after IM007 fixed the dev-server command. | GitHub Actions currently covers backend unit tests and frontend lint/build, but not PostgreSQL reset/API smoke or Playwright. |

Verdict: the project has completed the baseline stage. It is ready to move into the next product-depth task, provided each task stays narrow and keeps the current verification stack green.

## 4. Full Feature Coverage Matrix

| Module | Documented | Route Exists | Page Exists | Mock Data Exists | Types Exist | Backend Exists | Test Exists | Status | Gap |
|---|---|---|---|---|---|---|---|---|---|
| Overview | Yes | Yes, `/` | Yes | Partial, combines mock metrics and API data | Partial, no dedicated overview type | Partial, via WikiNode, broken links, and index status APIs | Yes, route and smoke coverage | Functional Skeleton | Metrics are not API-backed end to end. |
| Knowledge Bases | Yes | Yes, list/detail/settings | Yes | Yes, 3 knowledge bases | Yes, `KnowledgeBase` | No | Route coverage only | Visual Skeleton | No backend model, CRUD, settings persistence, or permission scope. |
| Sources | Yes | Yes, list/detail/sync jobs/sync logs | Yes | Yes, 6 frontend sources | Yes, `SourceItem` | Partial, source listing through WikiNode API | Partial | Functional Skeleton | No import, sync execution, snapshot, parser, or source detail backend. |
| Raw Materials / Parsed Documents | Yes | Yes, raw material list/detail/parsed result | Yes | Yes, 8 raw materials | Partial, `RawMaterial` but no `ParsedDocument` type | No | Route coverage only | Visual Skeleton | Parsed document is page copy and mock metadata only, not a first-class type or backend model. |
| Parser / Storage / Normalization | Yes | Yes, system parser/storage routes | Yes | No dedicated data | No | No | Route coverage only | Visual Skeleton | Configuration pages exist, but no parser, storage engine, or normalization workflow is implemented. |
| WikiNodes | Yes | Yes, list/create/edit/detail aliases | Yes | Yes, 12 frontend WikiNodes and 5 reset DB seed nodes | Yes, TypeScript and Java models | Yes, API, repository, DB schema, seed data | Yes, frontend and backend | Functional Skeleton | Editor is usable but shallow; publish and re-index remain static UI controls. |
| WikiLinks / Backlinks / Broken Links / Wiki Graph | Yes | Yes, graph, backlinks, impact, broken links | Yes | Yes, inline `[[...]]` links and broken targets | Yes, TypeScript and Java link/graph models | Yes, computed from WikiNode content | Yes | Functional Skeleton | Links are computed, not persisted; graph is a card/list visualization rather than an interactive canvas. |
| Index Segments | Yes | Yes, list/strategy/debug | Yes | Yes, generated mock segments | Yes, `IndexSegment` | No | Yes, language and route coverage | Functional Skeleton | No Java model, DB table, API, generation job, sync state, or segment-to-node backend mapping. |
| Publishing / Index / Vector Sync | Yes | Yes, publishing/index status/vector sync/jobs | Yes | Partial | Partial, index fields on WikiNode and mock jobs | Partial, index status summary only | Route coverage only | Visual Skeleton | No publishing workflow, approval, export, batch, vector sync, or index job backend. |
| Retrieval API / Retrieval Test / Debug | Yes | Yes, retrieval test/debug/API docs/logs/evaluation cases | Yes | Yes, retrieval logs and debug matched segments | Yes, `RetrievalResult` | Yes, `/api/retrieval-test` | Yes, frontend, smoke, and Java contract tests | Functional Skeleton | Backend retrieval has no `matchedSegments` evidence and no IndexSegment mapping layer yet. |
| Tags / Metadata / Classification | Yes | Yes, tags/node types/metadata fields | Yes | Partial, tags on WikiNodes and page cards | Partial, WikiNode fields only | No | Route coverage only | Visual Skeleton | No tag CRUD, metadata schema, classification rules, or backend model. |
| Quality / Evaluation | Yes | Yes, quality issues/conflicts/expired/duplicates/retrieval evaluation | Yes | Yes, 8 mock quality issues | Yes, `QualityIssue` | No | Route coverage only | Visual Skeleton | No detection rules, issue persistence, conflict workflow, duplicate handling, or evaluation backend. |
| System Config | Yes | Yes, parser/storage/vector/embedding/health/settings | Yes | No dedicated system config data | No | No | Route coverage and copy checks | Visual Skeleton | Boundary copy is present, but no real parser, storage, vector-store, embedding, or health configuration. |
| Users / Roles / Permissions / Audit | Yes | Yes, users/roles/permissions/audit logs | Yes | Partial, 5 users | Partial, `StudioUser` only | No | Route coverage only | Visual Skeleton | No standalone `Role`, `Permission`, audit log, auth, RBAC, or permission boundary implementation. |

## 5. Product Boundary Compliance

| Boundary | Verdict | Evidence | Notes |
|---|---|---|---|
| No Agent platform | Pass | Product routes do not include Agent modules; occurrences are in scope documents, tests, or WeKnora analysis context. | External Agent consumers remain allowed as downstream users of Retrieval API. |
| No Chatbot product | Pass | No chatbot page, API, or workflow exists. | Chat/Agent terms in WeKnora analysis are explicitly non-reusable scope. |
| No Workflow builder | Pass | No workflow builder route or implementation exists. | Static skeleton pages do not introduce workflow execution. |
| No MCP / IM scope | Pass | No MCP or IM integration code exists. | Terms appear only in boundary/gate documents. |
| Not a vector database | Pass | Settings and system pages describe external vector stores and avoid vector database ownership. | Vector sync pages are visual skeletons only. |
| No Chunk Management product naming | Pass | UI and tests use `Index Segment`; tests guard against `Chunk Management`. | `chunk` appears in docs/tests as prohibited or external-analysis language. |
| Correct Index Segment concept | Pass | TypeScript model, mock data, pages, and inspector tab use Index Segment as the controlled retrieval unit generated from WikiNode. | Backend model is still missing. |
| Retrieval returns WikiNode by default | Pass | TypeScript and Java `RetrievalResult` center `node: WikiNode`; smoke and Java tests reject `chunk` and `document` fields. | Good core contract. |
| `matchedSegments` debug-only | Pass | Mock retrieval service adds `matchedSegments` only when debug is enabled; Retrieval page explains this behavior. | Backend does not yet return matched segments. |

Conclusion: the current implementation respects the documented product boundary. The main risk is future scope creep from visible skeleton routes and static controls, not current code behavior.

## 6. Naming Consistency Check

| Naming Area | Verdict | Evidence | Recommended Follow-up |
|---|---|---|---|
| WikiNode | Pass | Product pages, API models, tests, and README center WikiNode. | Keep future editor work WikiNode-centered. |
| WikiLink | Pass | Link parser, graph pages, broken-link pages, and tests use WikiLink/backlink language. | Decide later whether computed links are enough or whether persisted WikiLink records are needed. |
| Index Segment | Pass | Navigation, pages, inspector tabs, retrieval debug, and tests use Index Segment. | Preserve tests that reject `Chunk Management`. |
| Parsed Document | Partial | FEATURE_MAP documents the concept; Raw Materials pages mention parsed documents. | Add `ParsedDocument` type and backend planning only when Raw Material work is approved. |
| Retrieval Result | Pass | Retrieval result remains node-centered. | Keep segment evidence secondary/debug-only. |
| Document / chunk words | Needs Review | README, scripts, and tests use `chunk`/`document` only as rejected fields; WeKnora analysis uses them as external source terms. | Acceptable now. Avoid adding these terms to visible product copy except as explicit boundary text. |
| Debug mode | Needs Review | UI uses English `Debug mode` and `matchedSegments` labels. | Acceptable for baseline. Future UX pass may localize or clarify debug labels. |

## 7. Frontend UX Coverage

The frontend now supports broad product validation across the documented information architecture:

- Application shell follows the shadcn `sidebar-07` pattern with collapsible sidebar, grouped navigation, header trigger, breadcrumb, and inset content area.
- Navigation covers Platform, Knowledge, Governance, System, and Admin routes.
- Overview shows a usable control-room snapshot of WikiNode, Index Segment, broken-link, index, quality, and retrieval health.
- WikiNode List supports scanning, filtering, and entry into create/edit/detail flows.
- WikiNode Editor uses the required internal three-column layout: explorer, editor, and inspector.
- Inspector tabs cover Metadata, Links, Sources, Index, and Segments.
- Retrieval Test keeps WikiNode results primary and shows matched Index Segments only in debug mode.
- WikiGraph, Index Segment, Sources, Raw Materials, Quality, System, and Admin areas are present enough for product-level IA validation.

Current UX limitations:

- Most non-WikiNode modules are still skeleton or shallow validation pages.
- Graph visualization is useful for relationship review but not yet an interactive graph workspace.
- Editor actions such as publish and re-index are static and must not become real publishing/indexing behavior without explicit scope confirmation.
- Mobile and narrow viewport behavior exists through the shell, but complex editor layout still needs deeper responsive validation.

## 8. Backend Coverage

Current backend coverage is strongest around WikiNode and graph/retrieval contract basics:

- Spring Boot exposes WikiNode list, detail, create, update, links, backlinks, broken links, graph overview, graph ego, retrieval test, sources, and index status endpoints.
- PostgreSQL/Flyway baseline creates WikiNode, tags, sources, and node-source reference tables.
- Reset DB and API smoke scripts provide repeatable local integration validation.
- Java tests protect the key contract that retrieval returns WikiNode-centered results and does not expose raw `chunk` or `document` payloads.

Backend gaps:

- No backend model yet for KnowledgeBase, RawMaterial, ParsedDocument, IndexSegment, QualityIssue, Role, Permission, AuditLog, publishing jobs, vector sync jobs, retrieval logs, or evaluation cases.
- TypeScript `WikiNode` is richer than the Java/DB model. Fields such as business domain, brand, product category, scenario, owner, review/publish states, security level, version, and plain-text content are frontend-only today.
- WikiLinks are computed from Markdown rather than persisted as first-class records.
- Backend retrieval does not yet expose debug `matchedSegments`, which is acceptable until an IndexSegment backend model exists.

Recommendation: do not jump directly into broad backend modeling. First deepen the WikiNode Editor workflow so the project can decide which fields and relationships truly need persistence.

## 9. Test Coverage

Current validation strengths:

- `pnpm lint` checks frontend lint health.
- `pnpm build` checks TypeScript and Vite production build.
- `mvn test` checks backend contracts and repository behavior.
- `bash scripts/check.sh` checks Harness state, script tests, optional command hooks, and shell syntax.
- `scripts/reset-db.sh` validates local PostgreSQL reset, Flyway migration, and seed count.
- `scripts/api-smoke.sh` validates key API behavior, including retrieval node contract and no `chunk`/`document` exposure.
- Playwright now automatically starts or reuses Vite on `127.0.0.1:3001` after IM007.
- Frontend e2e tests cover sidebar navigation, skeleton route non-blank checks, Index Segment naming, Retrieval Test language, WikiNode editor inspector tabs, and MVP smoke.

Coverage gaps:

- CI does not yet run PostgreSQL reset/API smoke or Playwright.
- KnowledgeBase, Source detail, RawMaterial, ParsedDocument, Quality, Admin, and System pages mostly have route/skeleton coverage rather than workflow coverage.
- WikiNode Editor tests cover key smoke behavior but not rich editing, source evidence, link repair, segment evidence, or inspector state changes in depth.
- Index Segment behavior has UI and mock coverage only.
- Retrieval debug coverage does not yet validate backend segment evidence because the backend model is not implemented.
- Graph tests do not cover interactive canvas behavior because the graph page is not yet interactive.

## 10. Completion Verdict

| Question | Verdict | Rationale |
|---|---|---|
| Has the project direction and governance baseline been established? | Yes | Scope, feature map, design reference, blockers, queue, gate registry, and done-report templates are present. |
| Has the frontend application shell and navigation baseline been established? | Yes | shadcn `sidebar-07` shell is implemented and full navigation/routes exist. |
| Has the engineering validation baseline been established? | Yes locally, partial in CI | Local validation stack is now stable after IM007. CI covers lint/build/tests but not full integration/browser smoke. |
| Can the project enter product-depth development? | Yes | The next work can safely deepen one core product surface if it keeps the validation stack green. |
| Should the next task be broad backend modeling? | No | Backend modeling should follow a clarified editor and data-entry workflow, not precede it. |

Overall verdict: baseline is complete enough to start Phase 2 product-depth work. The next task should deepen the WikiNode Editor rather than expanding navigation, backend schema, or adjacent platform scope.

## 11. Recommended Next Phase Tasks

| Priority | Candidate | Recommendation | Reason |
|---|---|---|---|
| 1 | A. WikiNode Editor deepening | Do next | WikiNode is the core product object. The editor determines which metadata, source evidence, WikiLink, index, and segment fields actually need persistence and test coverage. |
| 2 | F. TypeScript/Java DTO contract alignment | Do after editor requirements are clearer | Current frontend types are richer than backend models. Alignment is important, but it should be driven by editor behavior rather than speculative schema expansion. |
| 3 | B. Index Segment page deepening | Do after editor and DTO alignment | Index Segments depend on stable WikiNode content, metadata, and source references. |
| 4 | C. Retrieval Test + Debug deepening | Do after Index Segment model clarity | Debug evidence should come from real segment mapping, not only mock data. |
| 5 | G. Playwright coverage extension | Do incrementally with each product-depth task | The dev-server issue is fixed. Next value is targeted coverage for newly deepened workflows. |

Deferred candidates:

- D. Wiki Graph page deepening should wait until WikiLink data and editor link repair behavior are clearer.
- E. Java backend data model planning should be scoped around concrete editor and retrieval needs, not the whole feature map at once.
- H. Mock data quality enhancement should be folded into product-depth tasks instead of becoming a standalone mock expansion.

## 12. Recommended IM009

Recommended next task: **IM009 WikiNode Editor Deepening**.

Why this is the right next task:

- WikiNode is the central managed object in the product model.
- The editor is already present but shallow, making it the highest-leverage next slice.
- Editor deepening will expose the real contract needs for metadata, source references, WikiLinks, Index Segment evidence, and retrieval debug.
- It keeps the project product-centered without jumping into broad backend, vector, workflow, or admin scope.
- It creates a better foundation for later Index Segment, Retrieval Debug, Wiki Graph, and backend DTO work.

Why not the other tasks now:

- Index Segment deepening depends on stable WikiNode content and source evidence.
- Retrieval Debug deepening depends on real or better-modeled Index Segment evidence.
- Wiki Graph deepening depends on clearer WikiLink creation and repair behavior.
- Backend data model planning is important, but doing it before editor behavior risks over-modeling.
- Playwright dev-server repair was already completed in IM007; future test work should follow product workflow changes.

Draft IM009 prompt:

```text
You are working in WikiNode Studio.

Task name:
IM009 WikiNode Editor Deepening

Goal:
Deepen the existing WikiNode Editor page as the core product workflow without expanding platform scope. Improve the editor, inspector, and related mock/API behavior only as needed to make WikiNode editing, source evidence, WikiLinks, metadata, index status, and segment evidence clearer and testable.

Read first:
1. AGENTS.md
2. docs/current/PROJECT_CONTEXT.md
3. docs/current/PRODUCT_SCOPE.md
4. docs/current/FEATURE_MAP.md
5. docs/current/DESIGN_REFERENCE.md
6. docs/current/PROJECT_REBASELINE_REVIEW.md
7. docs/current/FULL_REQUIREMENT_COVERAGE_REVIEW.md
8. docs/current/STORY_QUEUE.yaml
9. docs/current/ACTIVE_TASKS.yaml
10. docs/current/BLOCKERS.md
11. docs/quality/GATE_REGISTRY.md

Allowed scope:
- Existing WikiNode list/create/edit/detail pages.
- Existing WikiNode editor components.
- Existing inspector tabs: Metadata, Links, Sources, Index, Segments.
- Existing TypeScript WikiNode/source/link/index-segment types only if needed.
- Existing mock data only if needed to support editor validation.
- Focused tests for the editor workflow.
- Minimal README/docs updates only if validation instructions change.

Do not:
- Add new top-level pages.
- Add Agent, Chatbot, Workflow, MCP, IM, LLM answer generation, vector database, embedding, auth, permissions, publishing approval, batch operations, export, real Source import, parser, or external integrations.
- Implement real vector sync or real publishing.
- Rename Index Segment to Chunk Management.
- Make Retrieval results chunk-first or document-first.
- Do broad Java backend schema planning unless a narrow editor contract fix is explicitly required.

Expected improvements:
1. Make the WikiNode editor feel like the primary working surface, not only a form demo.
2. Strengthen editor states around title, slug, type, status, tags, summary, body, source evidence, WikiLinks, index status, and segment evidence.
3. Keep the internal three-column layout required by DESIGN_REFERENCE.md.
4. Keep inspector tabs stable and useful.
5. Add focused tests for the improved editor behavior.

Required validation:
- pnpm lint
- pnpm build
- bash scripts/check.sh
- git diff --check origin/main..HEAD
- mvn test
- ./scripts/reset-db.sh if local PostgreSQL is available
- ./scripts/api-smoke.sh against a running backend
- PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 pnpm exec playwright test

Done Report must include:
1. Goal
2. Changed behavior
3. Changed files
4. Product boundary check
5. Validation results
6. Remaining gaps
7. Current branch and workspace state
```

## 13. Risks

| Risk Area | Risk | Mitigation |
|---|---|---|
| Product scope risk | Full navigation can make the product look broader than the implemented MVP. | Keep future tasks centered on one product surface at a time and preserve explicit non-goals. |
| Frontend structure risk | Skeleton pages may accumulate shallow UI without real workflow depth. | Deepen WikiNode Editor first, then use that workflow to drive adjacent surfaces. |
| Data model risk | TypeScript types are richer than Java/DB models. | Align models only when a concrete workflow requires persistence or API contract changes. |
| Naming risk | External source analysis and debug terms can reintroduce chunk/document language. | Keep tests that block `Chunk Management`; use `Index Segment` for product surfaces. |
| Backend handoff risk | Backend currently covers WikiNode basics but not the full feature map. | Avoid broad backend expansion until editor and retrieval contract needs are clear. |
| Test risk | Full local validation is available, but CI does not run the full integration/browser stack. | Keep local full validation mandatory; add CI integration later when stable and worth the runtime cost. |
| UX risk | WikiNode Editor static actions may imply real publishing or indexing capability. | Treat publish/re-index as visual placeholders until explicit task approval. |

## 14. Final Summary

- Stage 1 product direction and governance are complete enough for product-depth work.
- Stage 2 frontend shell and full navigation baseline are complete.
- Stage 3 local engineering validation baseline is complete after IM007, while CI remains partial.
- Current product boundary is intact: no Agent, Chatbot, Workflow, MCP, IM, vector database ownership, Chunk Management naming, or chunk-first retrieval.
- Full feature coverage exists at the navigation and skeleton level, but only WikiNode, WikiLinks/graph basics, retrieval test, and index status have meaningful backend/API coverage.
- The largest current gap is not more routes. It is depth in the core WikiNode editing workflow.
- TypeScript models are ahead of Java/DB models; avoid broad backend modeling until editor behavior clarifies the contract.
- Index Segment and Retrieval Debug should deepen after WikiNode Editor and DTO alignment.
- The recommended next development task is `IM009 WikiNode Editor Deepening`.
- Keep every next task narrow, validated, and explicit about non-goals.
