# MVP v0.2 Execution Plan

Task: `IM017 Planning - MVP v0.2 Remaining Work Plan Mode`

Date: 2026-06-24

Baseline:

- `main = origin/main = 3ce8e71`
- `IM014 Frontend Localization and UX Feedback Baseline` merged.
- `IM015 WikiGraph Canvas Recovery and Visualization` merged.
- `IM016 WikiGraph Canvas Layout Optimization` merged.
- Open PR count at planning start: `0`.

This plan is a planning artifact only. It does not authorize implementation outside the next confirmed task.

## 1. Read Set And Current Evidence

Required files were present and reviewed:

- `AGENTS.md`
- `README.md`
- `docs/current/PROJECT_CONTEXT.md`
- `docs/current/PRODUCT_SCOPE.md`
- `docs/current/DESIGN_REFERENCE.md`
- `docs/current/FEATURE_MAP.md`
- `docs/current/STORY_QUEUE.yaml`
- `docs/current/ACTIVE_TASKS.yaml`
- `docs/current/BLOCKERS.md`
- `docs/current/KNOWLEDGE_OBJECT_MODEL_SPEC.md`
- `docs/current/FULL_FEATURE_INVENTORY_AND_GAP_MATRIX.md`
- `docs/current/WEKNORA_WIKI_GRAPH_ANALYSIS.md`
- `docs/quality/frontend-ux-guidelines.md`
- `docs/quality/GATE_REGISTRY.md`

Current implementation was also checked through the route map, core page/component/service/test paths, and release docs.

Important status note: `PROJECT_CONTEXT.md`, `STORY_QUEUE.yaml`, `ACTIVE_TASKS.yaml`, and `FULL_FEATURE_INVENTORY_AND_GAP_MATRIX.md` still contain older planning language from before IM014/IM015/IM016. For this plan, the Git history and current source tree are treated as the authoritative evidence that IM014, IM015, and IM016 are complete and merged. This planning task intentionally does not rewrite the queue; queue cleanup should happen only in a confirmed state-hygiene or release-baseline task.

## 2. Product Boundary

WikiNode Studio is an enterprise knowledge asset and knowledge governance platform. It is WikiNode-centered and Retrieval API returns WikiNodes by default.

Keep these product names stable:

- `WikiNode`: product-facing knowledge object and Knowledge Object carrier.
- `WikiLink`: double-link relationship between WikiNodes.
- `Knowledge Object`: model carried through WikiNode fields such as `objectType`, `subtype`, `metadata`, `sourceRefs`, `relations`, and `processingProfile`.
- `Index Segment`: controlled indexing and retrieval unit.
- `Retrieval API`: knowledge retrieval interface centered on WikiNode results.

Do not introduce these product surfaces:

- Agent platform.
- Chatbot or chat conversation UI.
- Workflow builder.
- MCP platform.
- IM tool.
- Vector database management.
- Product-facing Chunk Management.
- LLM final-answer generation platform.

Index Segment must not be renamed to Chunk Management. Retrieval API must not be renamed to Chat API. WikiGraph must not drift into a Workflow Builder.

## 3. Current MVP v0.2 State Judgment

MVP v0.2 is close to a manual acceptance baseline, but not ready for release closure yet.

Already solid enough for manual review:

- React + Spring Boot MVP baseline.
- PostgreSQL + Flyway schema and seed path.
- `scripts/reset-db.sh` and `scripts/api-smoke.sh`.
- GitHub Actions baseline CI.
- Playwright coverage for frontend shell, MVP smoke, Knowledge Object, WikiGraph canvas, Index Segment naming, and product-boundary terms.
- WikiNode list, create, editor, detail, Markdown preview, WikiLink badges, backlinks, and broken links.
- Frontend Chinese UX and operation feedback baseline from IM014.
- Knowledge Object model rebaseline from IM011.
- WikiGraph React Flow node-edge canvas from IM015.
- WikiGraph canvas-first layout, visible MiniMap, and collapsible Inspector from IM016.
- Index Segment frontend mock surfaces and editor Segments tab.
- Retrieval Test mock experience with WikiNode-centered result cards and debug-only `matchedSegments`.

Still blocking manual acceptance polish:

- Current release docs and queue docs still describe older state and need a v0.2 release pass later.
- Sources, Raw Materials, Parsed Documents, and Source Detail look broader than their real current capability unless their mock/skeleton boundary is made explicit.
- Retrieval Test is useful, but the Query -> matched evidence -> WikiNode explanation can be clearer.
- WikiNode Knowledge Object metadata exists, but current detail/editor surfaces still need a focused pass to make `objectType`, `subtype`, `metadata`, `sourceRefs`, `relations`, and `processingProfile` consistently legible.
- Index Segment pages are conceptually correct, but preview/debug completion is still needed before a PM can confidently explain the controlled retrieval unit.
- Full acceptance pack for v0.2 does not exist yet.

## 4. Must / Should / Deferred Classification

Must before MVP v0.2 manual acceptance:

- IM017: Manual Acceptance Sweep and Bugfix.
- IM018: Sources and Raw Materials Boundary Clarification.
- IM019: Retrieval Test Debug Experience Enhancement.
- IM020: WikiNode Knowledge Object Metadata Surface.

Should before v0.2 release closure:

- IM021: Index Segment Preview and Debug Completion.

Release closure:

- IM022: MVP v0.2 Release Baseline and Acceptance Pack.

Deferred to Phase 2:

- Real Source import.
- File upload.
- Feishu integration.
- Web crawler.
- Database metadata crawler.
- API parser.
- PDF / Word parser.
- OCR.
- LLM extraction.
- Real Index Segment generation engine.
- Real vector sync.
- Embedding invocation.
- Permissions, roles, and audit implementation.
- Approval workflow.
- Version diff.
- Multi-knowledge-base isolation.
- Query log persistence and evaluation runner.
- Real publishing and index job execution.

## 5. Recommended Execution Order

1. IM017 - MVP v0.2 Manual Acceptance Sweep and Bugfix.
2. IM018 - Sources and Raw Materials Boundary Clarification.
3. IM019 - Retrieval Test Debug Experience Enhancement.
4. IM020 - WikiNode Knowledge Object Metadata Surface.
5. IM021 - Index Segment Preview and Debug Completion.
6. IM022 - MVP v0.2 Release Baseline and Acceptance Pack.

Reasoning:

- IM017 should happen first because IM014/IM015/IM016 just landed and the whole app needs a human-facing sweep before deeper targeted work.
- IM018 should happen before demos that include Sources or Raw Materials, because those pages are easy to overread as real import/parser capability.
- IM019 and IM020 strengthen the core acceptance story: Retrieval returns WikiNodes, and WikiNodes carry Knowledge Object metadata.
- IM021 comes after retrieval and metadata are clearer, because Index Segment is evidence for retrieval and should not become a separate product object.
- IM022 closes documentation, acceptance checklist, feature inventory, and release handoff after the product surfaces have stabilized.

## 6. IM017 - MVP v0.2 Manual Acceptance Sweep and Bugfix

Status: Must.

Task goal: Run an all-current-MVP manual acceptance sweep after IM014/IM015/IM016, then fix obvious user-facing defects only.

Why now: The UI baseline, graph canvas, and graph layout were merged in sequence. Before adding narrower features, the current app needs a full-page acceptance pass to catch regressions, layout breaks, copy leaks, and missing feedback.

Concrete scope:

- Open and inspect current MVP pages:
  - `/`
  - `/wiki-nodes`
  - `/wiki-nodes/create`
  - `/wiki-nodes/:id`
  - `/wiki-nodes/:id/detail`
  - `/wiki-graph`
  - `/broken-links`
  - `/retrieval-test`
  - `/sources`
  - `/raw-materials`
  - `/index-status`
  - `/settings`
  - `/admin/roles`
- Fix obvious Chinese copy leaks on existing MVP pages.
- Fix obvious layout breakage, overflow, or unreadable dense panels.
- Fix obvious unclear button labels, form feedback, loading states, empty states, and error states.
- Add or tighten Playwright assertions for missed acceptance-critical behavior.
- Preserve IM014 Chinese UX baseline.
- Preserve IM015 React Flow graph ability.
- Preserve IM016 canvas-first graph layout.

Explicit non-goals:

- No new page.
- No new module.
- No backend change.
- No DB change.
- No API change.
- No dependency change.
- No real Source import.
- No file upload.
- No parser execution.
- No vector sync.
- No permission or approval work.

Allowed files:

- `src/app/**`
- `src/components/**`
- `src/pages/**`
- `src/services/**`
- `src/types/**`
- `src/utils/**`
- `tests/e2e/**`
- `docs/current/**`
- `docs/quality/**`
- `docs/registry/**`

Forbidden files:

- `.github/workflows/**`
- `package.json`
- `pnpm-lock.yaml`
- `pom.xml`
- `src/main/java/**`
- `src/main/resources/db/migration/**`

Dependency / backend / DB / API:

- New dependency: no.
- Backend change: no.
- DB change: no.
- API change: no.

Suggested tests:

- `pnpm lint`
- `pnpm build`
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 pnpm exec playwright test`
- `bash scripts/check.sh`
- `git diff --check origin/main..HEAD`

Acceptance standard:

- All listed MVP routes render without blank states or broken layout.
- Visible product copy stays Chinese and WikiNode-centered.
- No visible product surface uses forbidden drift terms.
- Forms and actions keep clear loading/success/failure/validation feedback.
- WikiGraph still shows real React Flow nodes/edges, visible MiniMap, and click-to-open Inspector.
- Tests cover any fixed regression.

Preconditions:

- Start from latest `main`.
- IM014/IM015/IM016 must remain merged.

Next-ready classification:

- IM017 is the only next ready candidate from this plan.

## 7. IM018 - Sources and Raw Materials Boundary Clarification

Status: Must.

Task goal: Make Sources, Raw Materials, Parsed Documents, Source Detail, sync jobs, and sync logs accurately communicate current mock/skeleton boundaries without implementing real ingestion.

Why now: Sources and Raw Materials are the upstream entry to the product chain. If their boundary is vague, manual reviewers may mistake visual skeletons for real import, parsing, or synchronization.

Concrete scope:

- Clarify the relationship among Source, Raw Material, and Parsed Document in current UI copy.
- Mark current demo data as product prototype / mock evidence where appropriate without exposing implementation jargon.
- Strengthen empty/loading/error states for Sources and Raw Materials pages.
- Make Source Detail show what is real today and what is planned later.
- Keep user-facing copy clear that real sync/upload/parse is not supported in MVP v0.2.
- Add Playwright coverage for boundary copy and forbidden drift terms.

Explicit non-goals:

- No file upload.
- No Feishu integration.
- No web crawler.
- No database connector.
- No PDF parser.
- No Word parser.
- No background sync task.
- No real Source import.
- No Source create workflow.

Allowed files:

- `src/pages/sources-page.tsx`
- `src/pages/skeleton-pages.tsx`
- `src/types/source.ts`
- `src/types/raw-material.ts`
- `src/data/mock-sources.ts`
- `src/data/mock-raw-materials.ts`
- `src/utils/display-labels.ts`
- `tests/e2e/**`
- `docs/current/**`

Forbidden files:

- `.github/workflows/**`
- `package.json`
- `pnpm-lock.yaml`
- `pom.xml`
- `src/main/java/**`
- `src/main/resources/db/migration/**`

Dependency / backend / DB / API:

- New dependency: no.
- Backend change: no.
- DB change: no.
- API change: no.

Suggested tests:

- `pnpm lint`
- `pnpm build`
- Focused Playwright for `/sources`, `/sources/:sourceId`, `/raw-materials`, and parsed result preview.
- `bash scripts/check.sh`
- `git diff --check origin/main..HEAD`

Acceptance standard:

- A reviewer can explain Source -> Raw Material -> Parsed Document from the UI.
- The UI does not imply real upload, sync, parser, or connector execution exists.
- Current mock/skeleton boundaries are visible in user language.
- No prohibited Agent, Chatbot, Workflow, vector DB ownership, or Chunk Management wording appears.

Preconditions:

- IM017 should be complete, or IM018 should begin from a visually accepted main baseline.

## 8. IM019 - Retrieval Test Debug Experience Enhancement

Status: Must.

Task goal: Make Retrieval Test a clearer main-chain acceptance page that explains why WikiNodes were returned and keeps matched Index Segments debug-only.

Why now: Retrieval Test is a core demo path. It proves the product returns WikiNodes rather than raw chunks, but current debug explanation still needs a focused acceptance pass.

Concrete scope:

- Improve query input, sample query, filter, topK, and debug-mode affordances.
- Keep result cards centered on WikiNode.
- Show match reason, matched fields, source evidence, and link context more clearly.
- Show `matchedSegments` only inside debug evidence.
- Improve no-result, failure, and backend-unavailable copy.
- Add Playwright coverage for normal mode, debug mode, no-result state, and forbidden drift terms.

Explicit non-goals:

- No real vector database.
- No embedding invocation.
- No rerank engine.
- No LLM answer generation.
- No Chat API.
- No raw chunk as primary result.
- No query log persistence.
- No evaluation runner.

Allowed files:

- `src/pages/retrieval-test-page.tsx`
- `src/components/retrieval/**`
- `src/services/retrieval-mock-service.ts`
- `src/types/retrieval.ts`
- `src/utils/display-labels.ts`
- `tests/e2e/**`
- `docs/current/**`

Forbidden files:

- `.github/workflows/**`
- `package.json`
- `pnpm-lock.yaml`
- `pom.xml`
- `src/main/java/**`
- `src/main/resources/db/migration/**`

Dependency / backend / DB / API:

- New dependency: no.
- Backend change: no.
- DB change: no.
- API change: no.

Suggested tests:

- `pnpm lint`
- `pnpm build`
- Focused Playwright for `/retrieval-test` normal/debug/no-result behavior.
- `bash scripts/check.sh`
- `git diff --check origin/main..HEAD`

Acceptance standard:

- Normal retrieval result is WikiNode-first.
- Debug mode shows Index Segment evidence without turning segments into primary product objects.
- No visible product surface exposes raw chunk as the main result.
- Empty, loading, and error feedback is Chinese and actionable.

Preconditions:

- IM017 should be complete.
- IM018 is recommended first if the acceptance session will include Sources/Raw Materials.

## 9. IM020 - WikiNode Knowledge Object Metadata Surface

Status: Must.

Task goal: Lightly surface the Knowledge Object model in existing WikiNode UI without creating a new Knowledge Object management module.

Why now: The model rebaseline is documented and partially represented in frontend mock data. Manual reviewers need to see how WikiNode carries `objectType`, `subtype`, `metadata`, `sourceRefs`, `relations`, and `processingProfile`.

Concrete scope:

- Improve WikiNode Detail / Editor / Inspector display for:
  - `objectType`
  - `subtype`
  - `metadata`
  - `sourceRefs`
  - `relations`
  - `processingProfile`
- Preserve `nodeType` compatibility in existing filters and badges.
- Prefer read-only display or light editing of already-existing frontend fields.
- Use shared display labels for object type, subtype, status, index status, and source type.
- Add Playwright coverage for Knowledge Object metadata display.

Explicit non-goals:

- No standalone Knowledge Object management module.
- No subtype management UI.
- No metadata schema designer.
- No new objectType expansion.
- No Type Processor.
- No Source-to-WikiNode compiler.
- No backend schema expansion.
- No Java model change unless a later task explicitly approves it.

Allowed files:

- `src/pages/wiki-node-edit-page.tsx`
- `src/pages/skeleton-pages.tsx`
- `src/components/wiki/**`
- `src/types/wiki.ts`
- `src/data/mock-wiki-nodes.ts`
- `src/utils/display-labels.ts`
- `tests/e2e/**`
- `docs/current/**`

Forbidden files:

- `.github/workflows/**`
- `package.json`
- `pnpm-lock.yaml`
- `pom.xml`
- `src/main/java/**`
- `src/main/resources/db/migration/**`

Dependency / backend / DB / API:

- New dependency: no.
- Backend change: no.
- DB change: no.
- API change: no.

Suggested tests:

- `pnpm lint`
- `pnpm build`
- Focused Playwright for WikiNode editor/detail Knowledge Object metadata.
- `bash scripts/check.sh`
- `git diff --check origin/main..HEAD`

Acceptance standard:

- A reviewer can see how a WikiNode carries Knowledge Object attributes.
- `objectType` remains a small platform classification.
- `subtype` and `metadata` carry business classification details.
- `sourceRefs` remain evidence, not taxonomy.
- `Index Segment` language remains unchanged.

Preconditions:

- IM017 should be complete.

## 10. IM021 - Index Segment Preview and Debug Completion

Status: Should.

Task goal: Complete the frontend acceptance experience for Index Segment as a controlled retrieval unit.

Why now: Index Segment is central to the product boundary between WikiNode and external vector stores. It should be clearer before release closure, but it can follow the must-have manual acceptance and retrieval/metadata passes.

Concrete scope:

- Improve Index Segment list readability.
- Improve segment preview cards and content evidence.
- Improve Segment Strategy explanation.
- Improve Segment Debug explanation.
- Make Index Status and WikiNode ownership clearer.
- Show the WikiNode source of each segment.
- Reinforce that the platform manages Index Segments, not external vector-store chunks.
- Add Playwright coverage for Index Segment preview/debug and forbidden drift terms.

Explicit non-goals:

- No real vector database.
- No embedding invocation.
- No real vector sync.
- No backend segment generation engine.
- No Java `IndexSegment` model.
- No DB table.
- No Retrieval API return-shape change to raw chunks.

Allowed files:

- `src/pages/skeleton-pages.tsx`
- `src/components/segments/**`
- `src/components/wiki/wiki-node-inspector.tsx`
- `src/data/mock-index-segments.ts`
- `src/types/index-segment.ts`
- `src/utils/display-labels.ts`
- `tests/e2e/**`
- `docs/current/**`

Forbidden files:

- `.github/workflows/**`
- `package.json`
- `pnpm-lock.yaml`
- `pom.xml`
- `src/main/java/**`
- `src/main/resources/db/migration/**`

Dependency / backend / DB / API:

- New dependency: no.
- Backend change: no.
- DB change: no.
- API change: no.

Suggested tests:

- `pnpm lint`
- `pnpm build`
- Focused Playwright for `/index-segments`, `/index-segments/strategy`, `/index-segments/debug`, and editor Segments tab.
- `bash scripts/check.sh`
- `git diff --check origin/main..HEAD`

Acceptance standard:

- A reviewer can explain how Index Segments relate to WikiNodes.
- Debug evidence is useful without implying real embedding/vector sync exists.
- Product copy does not expose Chunk Management or vector DB ownership.

Preconditions:

- IM019 should be complete so segment debug aligns with Retrieval Test debug behavior.
- IM020 is recommended first if segment metadata depends on Knowledge Object display.

## 11. IM022 - MVP v0.2 Release Baseline and Acceptance Pack

Status: Release closure.

Task goal: Close MVP v0.2 by updating release docs, acceptance checklist, feature inventory, and next-phase backlog after IM017-IM021.

Why now: Release docs should be updated after the product surfaces are stable, not before. This task should be the release packaging pass.

Concrete scope:

- Add or update MVP v0.2 release baseline documentation.
- Add or update MVP v0.2 acceptance checklist.
- Update feature inventory / gap matrix with statuses after IM014-IM021.
- Mark each major area as Done, Functional Mock, Visual Skeleton, Missing, or Deferred.
- Update README if necessary.
- Clarify current automated and manual verification commands.
- Summarize Phase 2 backlog.
- Optionally reconcile current queue/state docs if explicitly confirmed during this task.

Explicit non-goals:

- No new feature.
- No business code change unless a severe documentation mismatch blocks release acceptance.
- No real integration.
- No parser execution.
- No vector sync.
- No permission or approval implementation.

Allowed files:

- `README.md`
- `docs/current/**`
- `docs/release/**`
- `docs/quality/**`
- `docs/registry/**`

Forbidden files:

- `src/**`
- `tests/**`
- `.github/workflows/**`
- `package.json`
- `pnpm-lock.yaml`
- `pom.xml`
- `src/main/java/**`
- `src/main/resources/db/migration/**`

Dependency / backend / DB / API:

- New dependency: no.
- Backend change: no.
- DB change: no.
- API change: no.

Suggested tests:

- `bash scripts/check-state.sh`
- `bash scripts/check.sh`
- `git diff --check origin/main..HEAD`
- Optional verification evidence from latest completed IM branches.

Acceptance standard:

- Release baseline accurately reflects current main.
- Manual acceptance checklist covers the actual v0.2 routes and flows.
- Inventory no longer mislabels IM015/IM016 graph canvas work as missing.
- Phase 2 backlog is explicit and not mixed into current ready tasks.
- Queue/state updates, if any, are minimal and explain why they are necessary.

Preconditions:

- IM017 through IM021 should be complete or explicitly deferred.

## 12. What Must Not Be Started In IM017-IM022

These are not allowed in this execution plan unless the user opens a separate confirmed task:

- Real Source import.
- File upload or external connector work.
- Feishu, web crawler, database crawler, API connector, PDF/Word parser, OCR, or LLM extraction.
- Java model expansion for Knowledge Object or Index Segment.
- DB migrations for Source/Raw Material/ParsedDocument/IndexSegment.
- Retrieval API contract change from WikiNode result to raw segment/chunk result.
- Real vector store sync or embedding call.
- Auth, permissions, roles, audit implementation.
- Publishing approval flow.
- Batch operations, export, or destructive product actions.
- New dependencies.

## 13. Next Action

Recommended next IM: `IM017 - MVP v0.2 Manual Acceptance Sweep and Bugfix`.

Recommended branch:

```bash
git switch main
git pull --ff-only origin main
git switch -c codex/im017-mvp-v02-manual-acceptance-sweep
```

Recommended first acceptance route pass:

```text
/ -> /wiki-nodes -> /wiki-nodes/create -> /wiki-nodes/wn-001 -> /wiki-nodes/wn-001/detail
-> /wiki-graph -> /broken-links -> /retrieval-test -> /sources -> /raw-materials
-> /index-status -> /settings -> /admin/roles
```

Recommended verification for IM017:

```bash
pnpm lint
pnpm build
bash scripts/check.sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 pnpm exec playwright test
git diff --check origin/main..HEAD
```

Do not push any IM017 branch until local validation passes and the user explicitly confirms push.
