# WikiNode Studio Full Feature Inventory and Gap Matrix

Task: `IM010 Full Feature Inventory & Functional Gap Matrix`

Date: 2026-06-23

Baseline: `origin/main` as checked out on branch `codex/im010-feature-inventory-gap-matrix`.

Note: this review is documentation-only. It does not include the unmerged pushed branch `codex/im010-retrieval-debug-deepening`; therefore Retrieval Test is assessed from the current `origin/main` baseline.

## 1. Purpose

This review creates a full feature inventory for WikiNode Studio and separates product reality from navigation breadth.

Goals:

- Inventory every first-level product module and its second-level features.
- Judge completion by implementation evidence, not by whether a route or menu item exists.
- Distinguish `Done`, `Functional Mock`, `Visual Skeleton`, `Doc Only`, `Missing`, and `Risk / Drift`.
- Identify fake, skeleton, mock-only, and genuinely verifiable areas.
- Recommend the next development priority based on the main product chain.

Reviewed inputs:

- Governance and scope: `AGENTS.md`, `docs/current/PROJECT_CONTEXT.md`, `docs/current/PRODUCT_SCOPE.md`, `docs/current/FEATURE_MAP.md`, `docs/current/DESIGN_REFERENCE.md`, `docs/current/STORY_QUEUE.yaml`, `docs/current/ACTIVE_TASKS.yaml`, `docs/current/BLOCKERS.md`, `docs/quality/GATE_REGISTRY.md`.
- Prior reviews: `docs/current/PROJECT_REBASELINE_REVIEW.md`, `docs/current/FULL_REQUIREMENT_COVERAGE_REVIEW.md`, `docs/current/WEKNORA_WIKI_GRAPH_ANALYSIS.md`.
- Runtime docs: `README.md`, `docs/current/DONE_REPORT_TEMPLATE.md`.
- Frontend: `src/app/router.tsx`, `src/components/app-sidebar.tsx`, `src/components/layout/app-shell.tsx`, `src/pages/**`, `src/components/wiki/**`, `src/components/graph/**`, `src/components/retrieval/**`, `src/components/segments/**`.
- Data and services: `src/types/**`, `src/data/**`, `src/services/**`, `src/utils/link-parser.ts`.
- Backend and persistence: `src/main/java/com/wikinode/studio/**`, `src/main/resources/db/migration/**`, `src/test/java/**`.
- Validation: `tests/e2e/**`, `playwright.config.ts`, `package.json`, `scripts/check.sh`, `scripts/reset-db.sh`, `scripts/api-smoke.sh`.

## 2. Status Definition

| Status | Definition |
|---|---|
| Done | Has page or API entry, meaningful interaction, data, backend or stable service, DB/schema where needed, and tests. A real flow is verifiable. |
| Functional Mock | Has page, meaningful interaction, and stable mock/local data. Product experience is verifiable, but it is not connected end to end to real backend persistence. |
| Visual Skeleton | Has route/page/layout or static cards, but interaction is weak and mainly validates information architecture. |
| Doc Only | Documented in product scope or feature map, but no concrete code entry exists. |
| Missing | Absent from docs and code, or no clear product entry exists. |
| Risk / Drift | Implemented or described, but naming, product boundary, route/API contract, or architecture may drift from the product model. |

## 3. Full Feature Inventory

### 3.1 Overview

- Dashboard metrics: present with WikiNode, published, broken links, indexed nodes, Index Segments, failed jobs, quality issues, and retrieval health in `src/pages/overview-page.tsx`.
- Recent updates and top referenced nodes: present from mock WikiNode data.
- Distribution summaries: present for node type and index status.
- Missing: source count, recent source sync, recent publish records, recent index task history backed by services.

### 3.2 Knowledge Base

- List/detail/settings pages exist through `src/pages/skeleton-pages.tsx`.
- Mock data exists in `src/data/mock-knowledge-bases.ts`.
- No create/edit, copy, move, archive, delete, KB settings persistence, backend model, DB schema, or permission scope exists.

### 3.3 Sources

- Source list has table interaction and selected-source-to-WikiNode association in `src/pages/sources-page.tsx`.
- Source detail, sync jobs, and sync logs routes exist.
- Mock data exists in `src/data/mock-sources.ts`; Java has `SourceItem` and `/api/sources`, but frontend source service currently uses mock service.
- No real Source creation, import, sync execution, snapshots, auth config, parser trigger, or backend source detail API exists.

### 3.4 Raw Materials / Parsed Documents

- Raw Material list, detail, and parsed result preview routes exist.
- Mock raw materials exist in `src/data/mock-raw-materials.ts`.
- `ParsedDocument` is not a first-class frontend or backend type.
- File preview, parsed diff, re-parse, parsing logs, and parser error workflows are skeleton or absent.

### 3.5 Parser / Storage / Normalization

- Parser Engine and Storage Engine routes exist as generic skeleton pages.
- Normalization is documented in `FEATURE_MAP.md`, but no route-specific page, type, service, backend API, or DB schema exists.
- Current pages intentionally avoid real parser/storage integration.

### 3.6 WikiNode

- WikiNode list, create, detail, and editor routes exist.
- List supports search and filters; create/edit support local validation and local mock persistence through `src/services/wiki-node-mock-service.ts`.
- Editor has the required three-column workspace: Explorer, Markdown Editor/Preview, Inspector.
- Inspector tabs exist: Metadata, Links, Sources, Index, Segments.
- Java backend has WikiNode CRUD API, repository, DB tables, seed data, and tests, but frontend WikiNode service currently resolves to mock service rather than `api-client.ts`.
- Version history, diff view, quality check, batch operations, real publish, and real re-index are not implemented.

### 3.7 WikiLink / Backlinks / Broken Links

- Double-link parsing exists in `src/utils/link-parser.ts` and backend repository parsing.
- Markdown Preview renders resolved and broken WikiLink badges.
- Backlinks and Broken Links pages exist.
- Backend exposes links, backlinks, broken links, graph overview, and graph ego endpoints.
- WikiLinks are computed from Markdown; there is no persisted `wiki_links` table or relationship editor.

### 3.8 Wiki Graph

- `/wiki-graph` exists and uses `WikiGraphView`.
- Current graph is a filterable card/list relationship view with node selection and inspector.
- It is not yet an interactive graph canvas with pan, zoom, drag, search, ego expansion, or impact analysis.
- WeKnora analysis documents stronger graph behavior, but it has not been implemented here.

### 3.9 Index Segment

- Index Segment list, strategy, debug, and WikiNode Inspector Segments tab exist.
- TypeScript `IndexSegment` exists and mock segments are generated from mock WikiNodes.
- Retrieval debug mock can show `matchedSegments` when debug is enabled.
- No Java `IndexSegment` model, DB table, API, generation job, sync-status lifecycle, or vector document mapping exists.

### 3.10 Publishing / Index / Vector Sync

- Publishing, Index Status, Vector Sync, and Index Jobs routes exist.
- Index Status page groups WikiNodes by `indexStatus`.
- Java backend exposes `/api/index-status` summary, though frontend index status page currently uses mock WikiNodes.
- Publishing, approval, retry, vector sync, failed job handling, and external vector-store execution are skeleton only.

### 3.11 Retrieval Test / Retrieval Debug / Retrieval API

- Retrieval Test page exists with query input, nodeType/status/tag/topK filters, debug toggle, sample queries, result cards, and matchedSegments display only in debug mode.
- Frontend retrieval service currently uses mock retrieval logic from `src/services/retrieval-mock-service.ts`.
- Java backend exposes `/api/retrieval-test` and contract tests protect WikiNode-centered results without raw `chunk` or `document` fields.
- Current `origin/main` lacks retrievalMode, Retrieval Trace, saved evaluation case interaction, Query Logs real page, and backend debug `matchedSegments`.

### 3.12 Tags / Metadata

- Tags, node types, and metadata fields routes exist as skeleton pages.
- WikiNode type includes tags and several metadata fields.
- No standalone tag/metadata schema model, CRUD, classification rules, security-level management page, backend API, or DB tables exist beyond `wiki_node_tags`.

### 3.13 Quality / Evaluation

- Quality Issues, Conflict Detection, Expired Knowledge, Duplicate Knowledge, Retrieval Evaluation, and Evaluation Cases routes exist.
- Mock quality issues and retrieval logs exist.
- No quality issue backend, detection rules, dedup/conflict workflow, retrieval evaluation runner, saved query cases, or scoring model exists.

### 3.14 System Config

- Parser, storage, vector store, embedding, system health, and settings pages exist.
- Vector Store and Settings pages correctly state that the platform configures external vector stores and does not implement a vector database.
- No real system config type, API, DB schema, health check API, parser/storage connector, embedding config persistence, or retrieval gateway config exists.

### 3.15 Users / Roles / Permissions / Audit

- Users, Roles, Permissions, and Audit Logs routes exist as skeleton pages.
- `StudioUser` mock type and `mockUsers` exist.
- No standalone `Role`, `Permission`, `AuditLog`, auth boundary, RBAC backend, audit DB schema, or operation log service exists.

## 4. Gap Matrix

| Module | Feature | Documented | Route Exists | Page Exists | Interaction | Mock Data | Frontend Type | Backend API | DB Schema | Test Coverage | Status | Gap | Recommended Action |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Overview | Metric cards | Yes, `FEATURE_MAP.md` | Yes, `/` | Yes, `overview-page.tsx` | Read-only dashboard | Mixed WikiNode, segment, quality mocks | Partial | Partial via WikiNode/broken links/index APIs | Partial | Playwright route smoke | Functional Mock | Metrics are not API-backed end to end. | Keep; later add Overview API only when dashboard becomes product-critical. |
| Overview | Recent updates | Yes | Yes | Yes | Read-only list | WikiNode mock data | No dedicated type | No dedicated API | No | Route smoke | Functional Mock | No activity/event source. | Defer until audit or activity model exists. |
| Overview | Source sync/publish/index history | Yes | No dedicated route | Partial cards only | None | Partial static values | No | No | No | No focused test | Visual Skeleton | No service-backed history. | Fold into Publishing/Index or Source tasks later. |
| Knowledge Base | KB List | Yes | Yes, `/knowledge-bases` | Yes, `KnowledgeBaseListPage` | Link to detail | 3 KBs | `KnowledgeBase` | No | No | Route smoke | Visual Skeleton | No search/create/archive/actions. | Deepen after Source/WikiNode chain needs KB scope. |
| Knowledge Base | KB Detail | Yes | Yes, `/knowledge-bases/:kbId` | Yes | Read-only summary | 3 KBs | `KnowledgeBase` | No | No | Route smoke | Visual Skeleton | No tabs or module-level drill-down. | Add tabs only when KB-scoped workflows begin. |
| Knowledge Base | Create/Edit KB | Yes | No | No | None | No | Partial type only | No | No | No | Doc Only | Planned but no entry. | P1/P2; not required for core chain. |
| Knowledge Base | KB Settings | Yes | Yes | Yes | Read-only settings copy | Mock settings text | Partial | No | No | Route smoke | Visual Skeleton | No persistence or policy behavior. | Keep boundary copy; avoid permissions/publishing until approved. |
| Knowledge Base | Copy/Move KB | Yes | No | No | None | No | No | No | No | No | Doc Only | Broad admin workflow absent. | Defer. |
| Sources | Source List | Yes | Yes, `/sources` | Yes, `sources-page.tsx` | Select source and view related nodes | 6 sources | `SourceItem` | Java `/api/sources` exists, frontend uses mock | `source_items` | Route smoke | Functional Mock | Frontend is not wired to backend source API. | P1 Source deepening; decide API wiring and detail model. |
| Sources | Create Source | Yes | No | No | None | No | Partial source type | No | No | No | Doc Only | No create/import scope. | Defer until Source/Raw Material task. |
| Sources | Source Detail | Yes | Yes, `/sources/:sourceId` | Yes | Read-only summary | 6 sources | `SourceItem` | No detail API | `source_items` only | Route smoke | Visual Skeleton | No sync config, snapshots, raw materials, or failure details. | Deepen with Source task. |
| Sources | Sync Jobs | Yes | Yes | Generic page | Static list | Static route cards | No | No | No | Route smoke | Visual Skeleton | No job entity or execution. | P1 after Source model. |
| Sources | Sync Logs | Yes | Yes | Generic page | Static list | Static route cards | No | No | No | Route smoke | Visual Skeleton | No log model. | P1 after Source model. |
| Sources | Source Snapshots | Yes | No dedicated route | No | None | No | No | No | No | No | Doc Only | Snapshots not modeled. | Pair with Raw Material backend. |
| Raw Materials | Raw Material List | Yes | Yes, `/raw-materials` | Yes | Read-only list | 8 raw materials | `RawMaterial` | No | No | Route smoke | Visual Skeleton | No table actions or backend. | P1 Source/Raw Material deepening. |
| Raw Materials | Raw Material Detail | Yes | Yes | Yes | Read-only summary | 8 raw materials | `RawMaterial` | No | No | Route smoke | Visual Skeleton | No preview/download/reparse. | Defer until parser scope approved. |
| Raw Materials | File Preview | Yes | No dedicated route | No | None | No | No | No | No | No | Doc Only | Planned but absent. | Add only with file storage scope. |
| Raw Materials | Parsed Result Preview | Yes | Yes | Yes | Static list | raw `parsedDocumentId` only | No `ParsedDocument` | No | No | Route smoke | Visual Skeleton | ParsedDocument is not a real model. | Add ParsedDocument type/model in P1. |
| Raw Materials | Raw vs Parsed Diff | Yes | No | No | None | No | No | No | No | No | Doc Only | Absent. | Defer. |
| Raw Materials | Re-parse | Yes | No | No | None | No | No | No | No | No | Doc Only | Parser operation not in scope. | Defer until parser integration. |
| Parser / Storage / Normalization | Parser Engine | Yes | Yes, `/system/parser-engine` | Generic page | Static list | Static route cards | No | No | No | Route smoke | Visual Skeleton | No parser config or health check. | P2/P1 depending on Source plan. |
| Parser / Storage / Normalization | Storage Engine | Yes | Yes | Generic page | Static list | Static route cards | No | No | No | Route smoke | Visual Skeleton | No storage provider config. | Defer. |
| Parser / Storage / Normalization | Normalization Rules | Yes | No | No | None | No | No | No | No | No | Doc Only | Documented but no UI/API. | Add only after parsed document model. |
| WikiNode | WikiNode List | Yes | Yes, `/wiki-nodes` | Yes | Search and filters | 12 mock nodes | `WikiNode` | Java list API exists, frontend uses mock | `wiki_nodes`, tags, refs | Playwright smoke | Functional Mock | UI not wired to backend list. | Keep stable; backend alignment later. |
| WikiNode | WikiNode Create | Yes | Yes | Yes | Form validation, local create | localStorage mock | `WikiNodeCreateInput` | Java POST exists, frontend uses mock | `wiki_nodes` | Playwright create smoke, Java/API smoke | Functional Mock | Frontend and backend flows are parallel, not integrated. | Align service wiring in backend alignment task. |
| WikiNode | WikiNode Detail | Yes | Yes, `/wiki-nodes/:nodeId/detail` | Yes | Read-only summary | 12 mock nodes | `WikiNode` | Java GET exists | `wiki_nodes` | Route smoke | Visual Skeleton | Not a real reader/detail surface. | Either deepen or keep editor as primary. |
| WikiNode | WikiNode Editor | Yes | Yes, `/wiki-nodes/:nodeId` | Yes | Edit title/summary/body, save, local publish/re-index state, retrieval link | localStorage mock | `WikiNode` | Java PUT exists, frontend uses mock | `wiki_nodes` | Playwright editor smoke | Functional Mock | Publish/re-index are local-only; no real backend connection. | Candidate P0 only if continuing editor polish. |
| WikiNode | Markdown Preview | Yes | Editor tab | Yes, `MarkdownPreview` | Edit/preview switch | WikiNode mock | `WikiNode` and `WikiLink` | No dedicated API | No | Playwright resolved/broken link test | Functional Mock | Preview parser is frontend-only. | Keep; add edge cases with link task. |
| WikiNode | Metadata Inspector | Yes | Editor inspector | Yes | Read-only metadata | WikiNode mock | Rich TS fields | Partial Java fields | Partial DB fields | Playwright inspector smoke | Functional Mock | Rich TS fields exceed Java/DB model. | Feed into Java model alignment. |
| WikiNode | Source Evidence | Yes | Inspector Sources tab | Yes | Read-only source refs | sourceRefs in nodes | `SourceRef` | Java `SourceRef` exists | `wiki_node_source_refs` | Editor route smoke | Functional Mock | No source evidence editing or source detail drill-through. | P1 after Source model. |
| WikiNode | Links Inspector | Yes | Inspector Links tab | Yes | Read-only link lists | Computed links | `WikiLink` | Java links/backlinks API | Computed, no table | Playwright inspector smoke | Functional Mock | No link repair or persisted links. | Pair with WikiGraph/WikiLink task. |
| WikiNode | Index Inspector | Yes | Inspector Index tab | Yes | Read-only index fields | Node index status, segment mock | `WikiIndexStatus` | `/api/index-status` summary only | `index_status` on nodes | Editor smoke | Functional Mock | No per-node index job or backend segment evidence. | Do after Index Segment model. |
| WikiNode | Segments Tab | Yes | Inspector Segments tab | Yes | Read-only segment cards | 36 mock segments | `IndexSegment` | No | No | Playwright naming test | Functional Mock | Mock-only; no backend segment model. | P0/P1 Index Segment deepening. |
| WikiNode | Version History | Yes | No | No | None | No | `version` field only | No | No | No | Doc Only | Field exists, workflow absent. | Defer until persistence model broadens. |
| WikiNode | Diff View | Yes | No | No | None | No | No | No | No | No | Doc Only | Absent. | Defer. |
| WikiNode | Batch Operations | Yes | No | No | None | No | No | No | No | No | Doc Only | Publishing/export/batch is a stop-condition area. | Defer until explicit approval. |
| WikiLink / Backlinks / Broken Links | WikiLink List | Yes | No dedicated list route | No | Links shown in inspector/graph | Computed | `WikiLink` | links per node | No table | Inspector/route smoke | Visual Skeleton | No standalone relationship management. | Defer or combine with graph. |
| WikiLink / Backlinks / Broken Links | Backlinks | Yes | Yes, `/backlinks` | Yes | Read-only grouped cards | Computed from nodes | `WikiLink` | Java backlinks API exists | Computed | Route smoke | Functional Mock | Frontend uses mock; no persisted links. | Combine with WikiGraph readable relationship task. |
| WikiLink / Backlinks / Broken Links | Broken Links | Yes | Yes, `/broken-links` | Yes | Read-only broken-link review | Computed broken links | `BrokenLink` | Java `/api/broken-links` exists | Computed | Playwright smoke, API smoke | Functional Mock | No repair action. | P0 if graph/link repair is next. |
| WikiLink / Backlinks / Broken Links | Impact Analysis | Yes | Yes | Generic page | Static list | Static route cards | No | No | No | Route smoke | Visual Skeleton | No impact algorithm. | Defer until persisted WikiLink. |
| Wiki Graph | Graph Relationship View | Yes | Yes, `/wiki-graph` | Yes | Filter, select node, show relationships | WikiNode mock | `GraphNode`, `GraphEdge` | Java graph endpoints exist | Computed | Route smoke | Functional Mock | Card/list view, not a graph canvas. | Recommended immediate next if visual relationship is largest gap. |
| Wiki Graph | Graph Filters | Yes | Yes | Yes | nodeType/status/show broken toggles | WikiNode mock | Partial | No dedicated API filters | No | Route smoke | Functional Mock | Local-only filtering. | Keep; expand with graph deepening. |
| Wiki Graph | Graph Inspector | Yes | Yes | Yes | Read-only incoming/outgoing/broken | Computed links | `WikiLink` | Java ego endpoint exists | Computed | Route smoke | Functional Mock | No edit or repair. | Combine with graph task. |
| Wiki Graph | Interactive Canvas | Yes via WeKnora reference | No | No | None | No | No | No | No | No | Doc Only | Pan/zoom/drag/search/ego expansion absent. | Candidate A. |
| Index Segment | Index Segment List | Yes | Yes | Yes | Table read-only | 36 generated mock segments | `IndexSegment` | No | No | Playwright naming test | Functional Mock | No backend or lifecycle. | Candidate C after graph or before backend alignment. |
| Index Segment | Segment Preview | Yes | List/Inspector | Partial | Read-only previews | 36 segments | `IndexSegment` | No | No | Editor segment smoke | Functional Mock | No full preview/detail route. | Add detail only with Segment task. |
| Index Segment | Segment Strategy | Yes | Yes | Yes | Static strategy card | Static | No strategy type | No | No | Route smoke | Visual Skeleton | No configurable strategy. | Defer until backend segment generator. |
| Index Segment | Segment Debug | Yes | Yes | Yes | Read-only first segment panel | 36 segments | `IndexSegment` | No | No | Route smoke | Functional Mock | Not connected to retrieval trace. | Candidate C or B. |
| Index Segment | Segment Sync Status | Yes | Partial via fields | Partial | Read-only fields | segment `indexStatus`, `vectorDocId` | `IndexSegment` | No | No | Naming smoke | Functional Mock | No sync job or API. | P1 Publishing/Index alignment. |
| Index Segment | matchedSegments in Retrieval Debug | Yes | `/retrieval-test` debug toggle | Yes | Debug toggle shows matched segments | mock search segments | `RetrievalResult.matchedSegments` | No backend debug evidence | No | Playwright debug smoke | Functional Mock | Backend lacks matchedSegments; no retrieval trace. | Candidate B if retrieval loop is prioritized. |
| Publishing / Index / Vector Sync | Publishing Center | Yes | Yes, `/publishing` | Generic page | Static list | Static | No | No | No | Route smoke | Visual Skeleton | No publish workflow. | Defer; approval/publishing is stop-condition scope. |
| Publishing / Index / Vector Sync | Index Status | Yes | Yes, `/index-status` | Yes | Read-only grouping | WikiNode mock | `WikiIndexStatus` | Java `/api/index-status` exists | node `index_status` | Route smoke | Functional Mock | Frontend not wired to backend summary; no job details. | Fold into Index Segment/Publishing task. |
| Publishing / Index / Vector Sync | Vector Store Sync | Yes | Yes, `/vector-sync` | Generic page | Static list | Static | No | No | No | Route smoke | Visual Skeleton | No sync execution by design. | Defer; keep external vector boundary. |
| Publishing / Index / Vector Sync | Index Jobs | Yes | Yes, `/index-jobs` | Generic page | Static list | Static | No | No | No | Route smoke | Visual Skeleton | No job model. | Defer. |
| Publishing / Index / Vector Sync | Failed Retry | Yes | No dedicated workflow | No | None | No | No | No | No | No | Doc Only | No retry action. | Defer until job backend. |
| Retrieval Test / Retrieval Debug / Retrieval API | Retrieval Test | Yes | Yes, `/retrieval-test` | Yes | Query, filters, topK, debug, search/reset | WikiNodes, segments, logs | `RetrievalQuery`, `RetrievalResult` | Java `/api/retrieval-test`, frontend uses mock | No retrieval tables | Playwright + Java/API smoke | Functional Mock | Frontend not API-wired; current baseline lacks retrievalMode and trace. | Candidate B if retrieval loop is next. |
| Retrieval Test / Retrieval Debug / Retrieval API | Query Panel | Yes | Yes | Yes | Query input, nodeType/status/tag/topK, debug, sample queries | Sample queries in component | `RetrievalQuery` | Java query supports filters/topK | No | Playwright smoke | Functional Mock | No retrievalMode in current main. | Add retrievalMode in Retrieval task. |
| Retrieval Test / Retrieval Debug / Retrieval API | Filters | Yes | Yes | Yes | nodeType/status/tags/topK | Mock retrieval respects nodeType/status/tags/topK | `RetrievalQuery.filters` | Java filters exist | No | Playwright no-result path | Functional Mock | Backend ranking not segment-backed. | Keep, deepen with API alignment. |
| Retrieval Test / Retrieval Debug / Retrieval API | Normal Mode Result | Yes | Yes | Yes | Result cards with open WikiNode | Mock results | `RetrievalResult.node` | Java result has `node` | No | Playwright/API smoke | Done | Contract returns WikiNode and blocks raw chunk/document. | Preserve as invariant. |
| Retrieval Test / Retrieval Debug / Retrieval API | Debug Mode matchedSegments | Yes | Yes | Yes | Toggle reveals segments | Mock segments | Optional `matchedSegments` | No backend field | No | Playwright debug smoke | Functional Mock | Backend debug evidence missing. | Candidate B after or before Segment backend planning. |
| Retrieval Test / Retrieval Debug / Retrieval API | Retrieval Trace | Yes in requested scope | Generic `/retrieval-debug` route only | No real panel | Static route cards | Static | No | No | No | Route smoke only | Visual Skeleton | Query-to-segment-to-node trace absent on main. | Candidate B. |
| Retrieval Test / Retrieval Debug / Retrieval API | Query Logs | Yes | Yes, `/query-logs` | Generic page | Static list | 10 retrieval logs | `RetrievalLog` | No | No | Route smoke | Visual Skeleton | No query log page or persistence. | Defer or light entry in Retrieval task. |
| Retrieval Test / Retrieval Debug / Retrieval API | Evaluation Cases | Yes | Yes | Generic page | Static list | Static cases | No case type | No | No | Route smoke | Visual Skeleton | No save/run/evaluate workflow. | P2 Quality/Evaluation. |
| Retrieval Test / Retrieval Debug / Retrieval API | API Contract | Yes | Backend `/api/retrieval-test`; docs mention `/api/knowledge/retrieve` | No docs page beyond skeleton | API smoke verifies | Seed/backend data | Java records | Yes | No retrieval table | Java tests + API smoke | Risk / Drift | Product docs name Retrieval API; backend endpoint is test-specific and frontend mock-only. | Align API naming when backend model task starts. |
| Tags / Metadata | Tag Management | Yes | Yes, `/tags` | Generic page | Static list | Node tags | Tags inside `WikiNode` | No dedicated API | `wiki_node_tags` only | Route smoke | Visual Skeleton | No tag CRUD. | P2. |
| Tags / Metadata | Node Type Management | Yes | Yes | Generic page | Static list | Static route cards | `WikiNodeType` | No | No | Route smoke | Visual Skeleton | No configurable types. | P2. |
| Tags / Metadata | Metadata Field Management | Yes | Yes | Generic page | Static list | Static route cards | fields in `WikiNode` | No | No | Route smoke | Visual Skeleton | No schema designer. | P2 after model alignment. |
| Tags / Metadata | Business Classification | Yes | No dedicated route | No | None | Partial fields | Partial | No | No | No | Doc Only | Classification fields are frontend-only. | P2. |
| Tags / Metadata | Security Level Management | Yes | No dedicated route | No | None | Partial node field | `securityLevel` field | No | No | No | Doc Only | No security policy model. | Defer until permissions scope. |
| Quality / Evaluation | Quality Issues | Yes | Yes | Generic page | Static list | 8 quality issues | `QualityIssue` | No | No | Route smoke | Visual Skeleton | No issue detail/actions. | P2. |
| Quality / Evaluation | Conflict Detection | Yes | Yes | Generic page | Static list | Static route cards | No | No | No | Route smoke | Visual Skeleton | No detector. | P2. |
| Quality / Evaluation | Expired Knowledge | Yes | Yes | Generic page | Static list | Static route cards | WikiNode expiredDate field | No | No | Route smoke | Visual Skeleton | No expiration rule. | P2. |
| Quality / Evaluation | Duplicate Knowledge | Yes | Yes | Generic page | Static list | Static route cards | No | No | No | Route smoke | Visual Skeleton | No duplicate algorithm. | P2. |
| Quality / Evaluation | Missing Source | Yes | No dedicated route | No | None | quality issue type exists | `QualityIssue.issueType` | No | No | No | Doc Only | Issue type exists, no workflow. | P2. |
| Quality / Evaluation | Missing Metadata | Yes | No dedicated route | No | None | No | No dedicated type | No | No | No | Doc Only | Not represented in current `QualityIssue` union. | Add when quality rules start. |
| Quality / Evaluation | Retrieval Evaluation | Yes | Yes | Generic page | Static list | Static route cards | No | No | No | Route smoke | Visual Skeleton | No evaluation runner. | P2 after retrieval debug matures. |
| System Config | Parser Config | Yes | Yes | Generic page | Static list | Static route cards | No | No | No | Route smoke | Visual Skeleton | No config persistence. | Defer. |
| System Config | Storage Config | Yes | Yes | Generic page | Static list | Static route cards | No | No | No | Route smoke | Visual Skeleton | No storage integration. | Defer. |
| System Config | Vector Store Config | Yes | Yes | Yes, `SystemVectorStorePage` | Static boundary copy | Static route cards | No | No | No | Route smoke | Visual Skeleton | No external vector config; boundary is correct. | Keep as boundary page until P1. |
| System Config | Embedding Config | Yes | Yes | Generic page | Static list | Static route cards | No | No | No | Route smoke | Visual Skeleton | Embedding is out of current MVP implementation. | Defer. |
| System Config | Retrieval Gateway Config | Yes | No dedicated route | No | None | No | No | No | No | No | Doc Only | Documented but absent. | Defer until API gateway planning. |
| System Config | System Health | Yes | Yes | Generic page | Static list | Static route cards | No | No | No | Route smoke | Visual Skeleton | No health API. | Add only when ops scope starts. |
| Users / Roles / Permissions / Audit | Users | Yes | Yes, `/admin/users` | Generic page | Static list | 5 users | `StudioUser` | No | No | Route smoke | Visual Skeleton | No user management. | Defer; permissions are out of MVP. |
| Users / Roles / Permissions / Audit | Roles | Yes | Yes | Generic page | Static list | Static route cards | No standalone `Role` | No | No | Route smoke | Visual Skeleton | No role model. | Defer. |
| Users / Roles / Permissions / Audit | Permissions | Yes | Yes | Generic page | Static list | Static route cards | No standalone `Permission` | No | No | Route smoke | Visual Skeleton | No permission boundary. | Defer. |
| Users / Roles / Permissions / Audit | Audit Logs | Yes | Yes | Generic page | Static list | Static route cards | No `AuditLog` | No | No | Route smoke | Visual Skeleton | No audit event model. | Defer. |
| Users / Roles / Permissions / Audit | Operation Logs | Yes in feature map tree | No | No | None | No | No | No | No | No | Doc Only | No route or model. | Defer. |

## 5. Fake Function Identification

### 5.1 Visual Skeleton

| Feature | Current Evidence | Why It Is Fake / Mock / Skeleton | Impact | Suggested Next Step |
|---|---|---|---|---|
| Knowledge Base Detail and Settings | `KnowledgeBaseDetailPage`, `KnowledgeBaseSettingsPage` | Read-only summaries; no tabs, CRUD, settings persistence, or backend model. | Can validate IA but not KB workflow. | Defer until KB scoping is needed. |
| Raw Material Detail / Parsed Result Preview | `RawMaterialDetailPage`, `ParsedResultPreviewPage` | Shows parsed IDs and static extraction bullets; no parsed document type or parser output. | May overstate parser readiness. | Add `ParsedDocument` model only in Source/Raw Material task. |
| Parser / Storage / Embedding / Health pages | `GenericSkeletonPage` routes | Static route cards only. | Broad system surface looks real but has no configuration behavior. | Keep as roadmap shell; do not deepen before Source pipeline scope. |
| Publishing / Vector Sync / Index Jobs | `/publishing`, `/vector-sync`, `/index-jobs` | Static cards, no job model or sync execution. | Could be mistaken for publish capability. | Preserve as skeleton until explicit publishing/index task. |
| Query Logs / Evaluation Cases | Generic route pages and mock logs | No saved case entity, log persistence, or evaluation runner. | Evaluation workflow is not verifiable. | P2 after Retrieval Debug. |
| Admin Users / Roles / Permissions / Audit | Generic pages and `mockUsers` | No auth, RBAC, role/permission/audit models. | Permission scope remains unimplemented. | Defer; current MVP excludes permissions. |

### 5.2 Doc Only

| Feature | Current Evidence | Why It Is Fake / Mock / Skeleton | Impact | Suggested Next Step |
|---|---|---|---|---|
| KB Create/Edit/Copy/Move/Delete | `FEATURE_MAP.md` documents them; no route/component/API. | No implementation entry. | KB management is not a real workflow. | Defer. |
| Source create/import/auth config/snapshots | Documented in `FEATURE_MAP.md`; no code. | No connector/import workflow. | Source pipeline not started. | P1 Source/Raw Material task. |
| File Preview, Raw vs Parsed Diff, Re-parse | Documented; no code. | Parser/storage integration absent. | Raw Material surface is read-only skeleton. | Pair with parser/storage scope later. |
| Normalization Rules | Documented; no route/type/API. | Not represented in code. | Normalization cannot be validated. | Add after ParsedDocument model. |
| WikiNode Version History and Diff | `version` field exists, but no route/page. | No history store. | No auditability of edits. | Defer until persistence alignment. |
| WikiNode Batch Operations | Documented; no code. | Batch/publish/export actions are stop-condition scope. | No bulk workflow. | Defer until explicit approval. |
| Interactive Wiki Graph Canvas | WeKnora analysis describes it; local code has no canvas. | Local graph is card/list relation view. | Product lacks graph-native relationship exploration. | Candidate immediate next task. |
| Retrieval Trace | Generic `/retrieval-debug` only. | No trace panel on current main. | Cannot explain Query -> Segment -> WikiNode chain clearly. | Candidate Retrieval Debug task. |
| Retrieval Gateway Config | Documented; no route/type/API. | No gateway layer. | External API configuration absent. | Defer until backend/API planning. |
| Operation Logs | Documented in feature tree; no route/type/API. | Not represented. | Auditability incomplete. | P2 governance. |

### 5.3 Mock Only but Useful

| Feature | Current Evidence | Why It Is Fake / Mock / Skeleton | Impact | Suggested Next Step |
|---|---|---|---|---|
| WikiNode Editor | `WikiNodeEditPage`, `WikiNodeEditor`, `WikiNodeInspector`, localStorage service | Usable product workflow, but frontend does not call backend API. | Good product validation; not real persistence integration. | Preserve and later align frontend service with Java model. |
| Markdown Preview with WikiLinks | `MarkdownPreview`, Playwright resolved/broken link checks | Frontend parser only. | Validates double-link UX. | Extend with graph/link repair task. |
| WikiGraph relationship view | `WikiGraphView` | Filter/select/inspect are local frontend interactions. | Useful for relationship review but not graph visualization. | Candidate A. |
| Index Segment pages and Inspector tab | `IndexSegmentTable`, `SegmentDebugPanel`, `WikiNodeInspector` | Stable mock segments, no backend. | Clarifies Index Segment concept. | Candidate C after graph/retrieval decision. |
| Retrieval Test normal/debug result | `retrieval-test-page.tsx`, `retrieval-mock-service.ts` | Useful query experience, backend not wired and no real segments. | Validates WikiNode-centered retrieval boundary. | Candidate B. |
| Broken Links | `BrokenLinksPage`, link parser, API smoke contract | Computed links, no persisted relationship table. | Real enough for validation, but no repair flow. | Combine with WikiGraph/WikiLink task. |

## 6. Real Functional Areas

| Area | Why It Is Verifiable | Evidence |
|---|---|---|
| shadcn sidebar-07 application shell | The shell uses the required provider/sidebar/inset/header/breadcrumb structure and Playwright checks navigation groups. | `app-shell.tsx`, `app-sidebar.tsx`, `tests/e2e/frontend-skeleton.spec.ts`. |
| Full navigation baseline | All roadmap routes render non-empty pages and are checked by Playwright. | `src/app/router.tsx`, `frontend-skeleton.spec.ts`. |
| WikiNode create/edit product workflow | UI supports validation, create, edit, save feedback, local persistence, and editor layout. | `wiki-node-create-page.tsx`, `wiki-node-edit-page.tsx`, `wiki-node-mock-service.ts`, `mvp-smoke.spec.ts`. |
| WikiLink parsing and broken-link display | Double links are parsed, rendered as resolved/broken badges, and broken links are visible. | `link-parser.ts`, `markdown-preview.tsx`, `broken-links-page.tsx`, Playwright tests. |
| Retrieval API contract baseline | Backend contract and API smoke verify `result.node` and reject raw `chunk`/`document` fields. | `WikiNodeController.java`, `RetrievalResult.java`, `WikiNodeApiContractTest.java`, `scripts/api-smoke.sh`. |
| PostgreSQL reset and API smoke baseline | DB reset, Flyway seed, CRUD smoke, broken-link smoke, and retrieval contract smoke are scriptable. | `scripts/reset-db.sh`, `scripts/api-smoke.sh`, `V1__create_wikinode_schema.sql`, `V2__seed_wikinode_data.sql`. |
| Playwright baseline | Config now starts/reuses Vite on 3001 and covers app shell, routes, editor, retrieval, broken links, and settings. | `playwright.config.ts`, `tests/e2e/**`. |

## 7. Product Boundary Check

| Boundary | Verdict | Evidence | Notes |
|---|---|---|---|
| Agent | Pass | No product route or implementation; occurrences are in scope docs and WeKnora analysis only. | External Agent consumers are ecosystem context, not platform scope. |
| Chatbot | Pass | No chatbot page, service, or API. | Product remains retrieval/governance platform. |
| Workflow | Pass | No workflow builder route or execution service. | Static pages do not create workflow scope. |
| MCP | Pass | No MCP integration code. | Terms appear only in exclusions. |
| IM | Pass | No IM integration code. | Good. |
| Vector Database | Pass | `SystemVectorStorePage` and settings copy say external vector stores only. | No local vector DB implementation. |
| Chunk Management | Pass | UI/tests use Index Segment; tests reject `Chunk Management`. | Docs mention raw chunk only as prohibited/external-source terminology. |
| Index Segment naming | Pass | Navigation, pages, inspector, retrieval debug, and tests use Index Segment. | Keep this invariant. |
| External vector chunks as managed objects | Pass | Product surfaces treat Index Segment as the controlled unit. | Backend segment model is missing, but boundary is clear. |
| Retrieval returns WikiNode | Pass | TypeScript and Java `RetrievalResult` center `node: WikiNode`; API smoke checks this. | Strong core contract. |
| `matchedSegments` debug-only | Pass | `retrieval-mock-service.ts` sets `matchedSegments` only when `query.debug` is true. | Backend lacks debug field. |

Risk note: `src/services/wiki-node-api-service.ts`, `retrieval-api-service.ts`, and `source-api-service.ts` are named as API services but currently return mock service results. This is not visible product drift, but it is an architecture risk for future backend alignment.

## 8. Main Product Chain Coverage

| Chain Step | Current Status | Evidence | Blocking Gap | Next Action |
|---|---|---|---|---|
| Source / Raw Material | Visual Skeleton to Functional Mock | `SourcesPage`, `mockSources`, `RawMaterialListPage`, `mockRawMaterials`, Java `SourceItem` | No real source import, raw material backend, parsed document model, parser execution, or snapshots. | P1 Source/Raw Material deepening after core retrieval/graph clarity. |
| WikiNode | Functional Mock with backend contract | WikiNode list/create/editor, mock service, Java CRUD, DB schema, Playwright and API smoke | Frontend is not wired to backend; TS model richer than Java/DB. | Backend alignment task after key UI decisions settle. |
| WikiLink / WikiGraph | Functional Mock | Link parser, broken links, backlinks, graph card view, Java graph endpoints | No persisted WikiLink table; graph is not an interactive canvas. | Recommended immediate task: WikiGraph Visualization. |
| Index Segment | Functional Mock | `IndexSegment` type, 36 mock segments, segment pages, editor Segments tab | No Java model, DB table, API, generation job, or segment-node mapping. | P0/P1 Index Segment deepening after graph or as next alternative. |
| Retrieval API / Test | Functional Mock plus Done API contract | Retrieval Test UI, mock retrieval, Java `/api/retrieval-test`, contract/API smoke | Frontend not API-wired; no retrievalMode/trace on main; backend lacks matchedSegments. | Retrieval Debug task after graph or segment decision. |
| Quality / Evaluation | Visual Skeleton | quality routes, `QualityIssue`, mock issues, evaluation route | No detector, issue backend, saved evaluation cases, or evaluation runner. | P2 after core chain matures. |

## 9. Next Development Priority

### P0: Core Product Validation

| Priority | Task | Why | Expected Deliverable | Suggested Branch |
|---|---|---|---|---|
| P0-1 | WikiGraph Visualization | Current graph is the largest user-visible gap in the WikiNode -> WikiLink -> WikiGraph chain after editor deepening. It will make double-link relationships readable before segment/retrieval backend alignment. | `/wiki-graph` becomes a real relationship workspace with search/filter/selection, clearer edge rendering, broken-link visibility, and stable tests. | `codex/im011-wikigraph-visualization` |
| P0-2 | Index Segment Page Deepening | Index Segment is the controlled retrieval unit and currently mock-only. | Segment list/detail/debug explains node ownership, sync state, vectorDocId, and segment evidence without backend persistence. | `codex/im012-index-segment-deepening` |
| P0-3 | Retrieval Test + Debug Deepening | Retrieval Test must explain WikiNode -> Index Segment -> Retrieval API -> WikiNode result. | Query panel adds retrievalMode and trace; debug mode explains matchedSegments; normal mode remains WikiNode-first. | `codex/im013-retrieval-debug-deepening` |

### P1: Backend Alignment

| Priority | Task | Why | Expected Deliverable | Suggested Branch |
|---|---|---|---|---|
| P1-1 | Java WikiNode / WikiLink / IndexSegment Model Alignment | TS model is richer than Java/DB; IndexSegment has no backend model. | Narrow Java records, migrations, and API planning or implementation for core chain only. | `codex/im014-java-core-model-alignment` |
| P1-2 | Source / Raw Material Deepening | Source pipeline is the start of the main product chain but is currently skeleton. | Source detail, raw material model, parsed document shape, and mock or backend plan. | `codex/im015-source-raw-material-deepening` |
| P1-3 | Publishing / Index / Vector Sync Planning | Needed before real segment sync; risky if done too early. | Read-only job/status model and external vector-store boundary plan. | `codex/im016-publishing-index-planning` |

### P2: Governance

| Priority | Task | Why | Expected Deliverable | Suggested Branch |
|---|---|---|---|---|
| P2-1 | Quality / Evaluation Skeleton Deepening | Quality and evaluation exist as skeletons but need concrete cases after retrieval behavior stabilizes. | Evaluation cases, query logs, issue triage mock workflow, no real scoring engine. | `codex/im017-quality-evaluation-skeleton` |
| P2-2 | Tags / Metadata Management Planning | Metadata schema should follow core model alignment, not precede it. | Tag/node-type/metadata field UX and type plan. | `codex/im018-tags-metadata-planning` |
| P2-3 | Users / Roles / Audit Planning | Permissions are explicitly out of MVP; do not implement auth yet. | Read-only RBAC/audit planning doc or skeleton cleanup. | `codex/im019-admin-governance-planning` |

## 10. Recommended Immediate Next Task

Recommended task: **A. WikiGraph Visualization**.

Reason:

- The WikiNode Editor has already been deepened on current `origin/main`; the next core-chain gap is making WikiLinks and broken links readable as a graph workspace.
- Current `/wiki-graph` is useful but still a card/list relationship view. It does not yet match the product expectation or the WeKnora reference evidence for a graph-first relationship surface.
- Improving graph visualization stays inside the core product chain without touching external vector stores, Source import, parser execution, auth, permissions, or Java backend.
- It prepares the product for later Index Segment and Retrieval Debug work because retrieval evidence is more understandable when WikiNode relationships are clear.

Why not the other candidates now:

- B. Retrieval Test + Debug Deepening: important, but current `origin/main` already has a functional retrieval mock and strong WikiNode result contract. It should follow a clearer graph/link surface or be next if the team prioritizes retrieval loop demos over graph clarity.
- C. Index Segment Page Deepening: important, but segment evidence depends on the user understanding the WikiNode and WikiLink structure it came from.
- D. Java WikiNode / WikiLink / IndexSegment Model Alignment: needed soon, but doing backend modeling before graph/segment UX decisions may over-model fields.
- E. Source / Raw Material Deepening: starts the upstream chain, but it is broader and can trigger parser/storage/source-import scope. It should wait until the core WikiNode relationship/retrieval loop is clearer.
- F. Quality / Evaluation Skeleton Deepening: lower priority; it depends on stable retrieval/debug behavior.

Draft prompt:

```text
You are working in WikiNode Studio.

Task name:
IM011 WikiGraph Visualization

Goal:
Deepen the existing /wiki-graph page from a card/list relationship view into a clearer WikiNode relationship workspace. The page must make WikiNode -> WikiLink -> backlinks -> broken links readable without adding backend, vector database, Agent, Chatbot, Workflow, MCP, IM, parser, Source import, auth, or permission scope.

Read first:
1. AGENTS.md
2. docs/current/PROJECT_CONTEXT.md
3. docs/current/PRODUCT_SCOPE.md
4. docs/current/FEATURE_MAP.md
5. docs/current/DESIGN_REFERENCE.md
6. docs/current/WEKNORA_WIKI_GRAPH_ANALYSIS.md
7. docs/current/FULL_FEATURE_INVENTORY_AND_GAP_MATRIX.md
8. docs/current/DONE_REPORT_TEMPLATE.md

Scope:
- Update /wiki-graph only and closely related graph components/tests.
- Preserve shadcn sidebar-07 application shell.
- Reuse existing WikiNode, WikiLink, GraphNode, GraphEdge, and mock data.
- Keep WikiLinks computed from existing WikiNode Markdown for this task.
- Improve graph readability, search/filtering, node selection, incoming/outgoing/broken link evidence, and Open WikiNode navigation.
- Add focused Playwright coverage for graph search/filter/select/open-node and no Chunk Management/product-boundary drift.

Do not:
- Add dependencies unless explicitly confirmed.
- Add backend APIs, DB schema, Java model changes, real graph database, vector database, Source import, parser, auth, permissions, Agent, Chatbot, Workflow, MCP, IM, or LLM answer generation.
- Rename Index Segment to Chunk Management.
- Change Retrieval result contract.

Validation:
- pnpm lint
- pnpm build
- bash scripts/check.sh
- git diff --check origin/main..HEAD
- PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 pnpm exec playwright test
- mvn test
- ./scripts/reset-db.sh
- ./scripts/api-smoke.sh

Done Report must include goal, changes, files, graph interaction notes, product boundary check, validation, uncovered scope, next recommendation, branch and workspace status.
```

## 11. Final Summary

- Current project reality: application shell, full navigation, WikiNode Editor, double-link preview, mock Index Segments, Retrieval Test, backend WikiNode CRUD/retrieval contract, reset DB, API smoke, and Playwright baseline are verifiable.
- Most roadmap breadth is still skeleton: Knowledge Base management, Source create/sync, Raw Material parsing, parser/storage config, publishing/index jobs, quality/evaluation, tags/metadata management, and admin/RBAC.
- The strongest product object is WikiNode; the strongest backend contract is `RetrievalResult.node: WikiNode`.
- The biggest user-visible core-chain gap after editor deepening is WikiGraph: current implementation shows relationship cards, not a graph workspace.
- Index Segment is conceptually correct and consistently named, but remains frontend mock-only with no Java/DB/API model.
- Retrieval Test is useful and respects debug-only `matchedSegments`, but current `origin/main` lacks retrievalMode and Retrieval Trace.
- Product boundary is intact: no Agent, Chatbot, Workflow, MCP, IM, vector database implementation, or product-facing Chunk Management module was introduced.
- Architecture risk: frontend service files named as API services currently use mock services, so future backend alignment must be explicit.
- Recommended next task: `IM011 WikiGraph Visualization`.
- Do not start backend model expansion until graph/segment/retrieval UX decisions are clearer.
