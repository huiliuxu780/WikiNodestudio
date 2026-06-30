# IM077 Imported Knowledge Acceptance to WikiNode Retrieval Loop Plan

> For agentic workers: implement task-by-task with TDD. Do not add real external connectors, embeddings, vector sync, RBAC, approvals, batch operations, export, Agent, Chatbot, Workflow, Vector DB Management, product-facing Chunk Management, package changes, or lockfile changes.

## Goal

Close the post-import acceptance loop so an imported Parsed Document can become a reviewed WikiNode and then be verified through local Index Segment evidence, WikiGraph, and Retrieval Test under the same Knowledge Base scope.

## User Flow

```text
Knowledge Base import result
  -> Draft WikiNode Suggestion review
  -> Accept suggestion
  -> WikiNode detail
  -> Index Segment evidence
  -> WikiGraph
  -> Retrieval Test
```

## Tasks

### Task 1: Backend Contract Red Test

Files:

- Modify `src/test/java/com/wikinode/studio/WikiNodeApiContractTest.java`

Add a contract test that imports a local markdown file, follows the generated Draft WikiNode Suggestion, accepts it, and asserts:

- the accepted WikiNode preserves `knowledgeBaseId`
- the accepted WikiNode preserves Source / Raw Material / Parsed Document evidence
- local Index Segments are prepared for the accepted WikiNode
- graph overview filtered by Knowledge Base includes the accepted WikiNode and imported relation
- Retrieval API filtered by Knowledge Base returns the accepted WikiNode

Run:

```bash
mvn test -Dtest=WikiNodeApiContractTest
```

Expected first run: fail on missing or incomplete acceptance-loop evidence.

### Task 2: Frontend Acceptance Red Test

Files:

- Modify `tests/e2e/source-raw-material-acceptance.spec.ts`
- Modify `tests/e2e/draft-wikinode-suggestion-readonly.spec.ts`
- Modify `tests/e2e/wiki-graph-canvas.spec.ts`
- Modify `tests/e2e/retrieval-test-debug.spec.ts`

Add Playwright coverage for:

- import result primary action routes to Draft WikiNode Suggestion review
- suggestion detail shows suggested WikiNode fields, metadata, sourceRefs, relations, Parsed Document evidence, and Knowledge Base ownership
- accepting a suggestion navigates to the accepted WikiNode detail
- WikiNode detail shows Source / Raw Material / Parsed Document evidence
- WikiGraph filtered by the same Knowledge Base shows the accepted WikiNode
- Retrieval Test scoped to the same Knowledge Base returns the accepted WikiNode

Expected first run: fail until implementation is complete.

### Task 3: Backend Implementation

Files:

- Modify `src/main/java/com/wikinode/studio/api/**`
- Modify `src/main/java/com/wikinode/studio/model/**`
- Modify `src/main/java/com/wikinode/studio/repository/**`
- Modify `src/main/resources/db/migration/**` only if existing persistence lacks required acceptance-loop evidence
- Modify `scripts/api-smoke.sh`

Implementation:

- Reuse the existing Draft WikiNode Suggestion accept path.
- Preserve Knowledge Base and source evidence on accepted WikiNode records.
- Prepare local Index Segments for accepted WikiNodes.
- Ensure graph and retrieval repository paths can see accepted imported WikiNodes under Knowledge Base scope.
- Keep all work local; do not invoke embedding or external vector sync.

### Task 4: Frontend Implementation

Files:

- Modify `src/pages/knowledge-base-import-page.tsx`
- Modify Draft WikiNode Suggestion pages under `src/pages/**`
- Modify WikiNode detail / Index Segment / WikiGraph / Retrieval Test surfaces under `src/pages/**` and `src/components/**`
- Modify `src/services/**`, `src/types/**`, and `src/utils/**` only where required by the acceptance loop

Implementation:

- Make import success lead with `查看待审核建议`.
- Turn Draft WikiNode Suggestion detail into an operator review layout.
- Use toast/status feedback for accept/reject operations instead of explanatory page content.
- Show source evidence on WikiNode detail as compact evidence rows.
- Keep graph and retrieval verification WikiNode-centered.

### Task 5: Full Verification

Run:

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
