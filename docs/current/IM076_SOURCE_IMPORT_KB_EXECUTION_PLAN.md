# IM076 Source Import to Knowledge Base Execution Plan

> For agentic workers: implement task-by-task with TDD. Do not add real external connectors, embeddings, vector sync, RBAC, approvals, batch operations, export, Agent, Chatbot, Workflow, Vector DB Management, product-facing Chunk Management, package changes, or lockfile changes.

## Goal

Close the local Knowledge Base scoped Source import chain so an imported file keeps the same `knowledgeBaseId` through Source, Raw Material, Parsed Document, document segments, Draft WikiNode Suggestion, accepted WikiNode, WikiGraph, and Retrieval Test.

## Architecture

Reuse the existing local import endpoint `POST /api/sources/{sourceId}/raw-materials/import`. Extend the existing evidence models with a `knowledgeBaseId` ownership snapshot instead of adding a new aggregate import subsystem. Keep Source Detail as the import entry; Knowledge Base Detail, Raw Material Detail, Parsed Result, WikiGraph, and Retrieval Test become verification surfaces.

## Tasks

### Task 1: Backend Contract Red Test

Files:
- Modify `src/test/java/com/wikinode/studio/WikiNodeApiContractTest.java`

Add a contract test that imports a local markdown file under `src-feishu-cc` and asserts:
- `SourceImportResult.knowledgeBaseId == "kb-cc-after-sales"`
- imported Raw Material has the same `knowledgeBaseId`
- imported Parsed Document has the same `knowledgeBaseId`
- imported Parsed Document Segment has the same `knowledgeBaseId`
- generated Draft WikiNode Suggestion has the same `knowledgeBaseId`
- accepted WikiNode has the same `knowledgeBaseId`

Run:

```bash
mvn test -Dtest=WikiNodeApiContractTest
```

Expected first run: fail because the evidence records do not yet expose `knowledgeBaseId`.

### Task 2: Backend Model and Repository Implementation

Files:
- Modify `src/main/java/com/wikinode/studio/model/SourceImportResult.java`
- Modify `src/main/java/com/wikinode/studio/model/RawMaterial.java`
- Modify `src/main/java/com/wikinode/studio/model/ParsedDocument.java`
- Modify `src/main/java/com/wikinode/studio/model/ParsedDocumentSegment.java`
- Modify `src/main/java/com/wikinode/studio/model/SourceOperation.java`
- Modify `src/main/java/com/wikinode/studio/model/DraftWikiNodeSuggestion.java`
- Modify `src/main/java/com/wikinode/studio/repository/AbstractWikiNodeRepository.java`
- Modify `src/main/java/com/wikinode/studio/repository/InMemoryWikiNodeRepository.java`
- Modify `src/main/java/com/wikinode/studio/repository/JdbcWikiNodeRepository.java`
- Modify `src/main/java/com/wikinode/studio/repository/WikiNodeSeedData.java`
- Create `src/main/resources/db/migration/V14__add_knowledge_base_scope_to_source_evidence.sql`

Implementation:
- Add nullable `knowledgeBaseId` field to the evidence records.
- During `importSourceFile`, read `source.knowledgeBaseId()` once and write it to Raw Material, Parsed Document, Parsed Document Segment, Source Operation, SourceImportResult, and Draft WikiNode Suggestion.
- During suggestion generation from existing Parsed Document, derive the knowledge base from Parsed Document first, then Source fallback.
- During accept, keep accepted WikiNode `knowledgeBaseId` from the suggestion.
- Add DB columns and backfill from `source_items.knowledge_base_id`.

Run:

```bash
mvn test -Dtest=WikiNodeApiContractTest
```

Expected: pass.

### Task 3: Frontend Type and Surface Red Test

Files:
- Modify `tests/e2e/source-raw-material-acceptance.spec.ts`
- Modify `tests/e2e/knowledge-base-administration.spec.ts`
- Modify `tests/e2e/retrieval-test-debug.spec.ts`
- Modify `tests/e2e/wiki-graph-canvas.spec.ts`

Add Playwright assertions:
- Source Detail shows Knowledge Base ownership and import success as toast/status, not explainer copy.
- Raw Material Detail shows `Knowledge Base -> Source -> Raw Material`.
- Parsed Result shows segment ownership and generated suggestion ownership.
- Knowledge Base Detail Source tab shows imported evidence counts and recent operation.
- Retrieval Test has a Knowledge Base selector and sends `filters.knowledgeBaseId`.
- WikiGraph can be filtered by Knowledge Base and still shows WikiNode-centered graph nodes.

Run:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 pnpm exec playwright test tests/e2e/source-raw-material-acceptance.spec.ts tests/e2e/knowledge-base-administration.spec.ts
```

Expected first run: fail on missing ownership fields or UI controls.

### Task 4: Frontend Implementation

Files:
- Modify `src/types/source.ts`
- Modify `src/types/raw-material.ts`
- Modify `src/types/source-operation.ts`
- Modify `src/types/draft-wikinode-suggestion.ts`
- Modify `src/types/retrieval.ts` only if needed for UI labels, not contract shape
- Modify `src/services/source-api-service.ts`
- Modify `src/pages/skeleton-pages.tsx`
- Modify `src/pages/knowledge-base-pages.tsx`
- Modify `src/components/retrieval/retrieval-query-panel.tsx`
- Modify `src/pages/retrieval-test-page.tsx`
- Modify `src/pages/wiki-graph-page.tsx` and graph components only where needed for filter support
- Modify `src/utils/display-labels.ts`

Implementation:
- Add `knowledgeBaseId` to frontend evidence types.
- In Source Detail, replace inline import result text with compact status/toast and add Knowledge Base ownership in the summary area.
- In Raw Material and Parsed Result pages, show the ownership chain as a dense row/table, not as explanation cards.
- In Knowledge Base Detail, add import evidence columns in Source tab.
- In Retrieval Query Panel, add Knowledge Base selector using existing `/knowledge-bases` service and write `filters.knowledgeBaseId`.
- In WikiGraph toolbar, add Knowledge Base filter and pass it to graph loading/filtering.

Run focused Playwright until green.

### Task 5: Smoke and Full Verification

Files:
- Modify `scripts/api-smoke.sh`

Add smoke checks that:
- imported source result contains `knowledgeBaseId`
- imported Raw Material / Parsed Document / Segment / Suggestion / accepted WikiNode preserve the same `knowledgeBaseId`
- Retrieval API with the imported knowledge base returns the accepted WikiNode
- Graph overview with the imported knowledge base includes the accepted WikiNode and resolved WikiLink edge

Final verification:

```bash
mvn test
pnpm lint
pnpm build
bash scripts/check.sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 pnpm exec playwright test
git diff --check origin/main..HEAD
```

## Scope Guard

This plan does not implement real Feishu/API/web/database connectors, embedding, external vector sync, approval workflow, RBAC, batch operation, export, Agent, Chatbot, Workflow, Vector DB Management, package changes, lockfile changes, or product-facing Chunk Management.
