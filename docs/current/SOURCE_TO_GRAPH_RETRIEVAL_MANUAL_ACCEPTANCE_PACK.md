# Source to Graph Retrieval Manual Acceptance Pack

## Goal

Provide one repeatable local acceptance path for the operator-visible chain:

```text
Source import
  -> Raw Material
  -> Parsed Document
  -> document segments
  -> Draft WikiNode Suggestion
  -> draft WikiNode
  -> local publish and Index Segment preparation
  -> WikiGraph
  -> Retrieval API WikiNode result
```

This pack is for manual acceptance and regression checks. It does not add product UI, backend behavior, external vector sync, or new model scope.

## Preconditions

Run from the repository root on latest `main` or the current task branch.

```bash
git status
git log --oneline -5
bash scripts/reset-db.sh
```

Start backend and frontend in separate terminals:

```bash
mvn spring-boot:run
```

```bash
VITE_USE_MOCK_FALLBACK=false pnpm run dev --host 127.0.0.1 --port 3001
```

Confirm the API is live:

```bash
curl -fsS http://127.0.0.1:8080/api/wiki-nodes >/dev/null
```

## Sample Acceptance File

Use this markdown content for browser import:

```markdown
# IM074 端到端售后验收规范

IM074 端到端售后验收规范用于确认 Source 导入、文档片段、WikiNode 建议、知识图谱和知识召回链路。

## 处理口径

端到端售后验收需要参考 [[收费政策]]，并保留来源证据和图谱关系。
```

Suggested filename:

```text
im074-e2e-acceptance.md
```

## Browser Acceptance Steps

1. Open `http://127.0.0.1:3001/sources/src-pdf-dishwasher`.
2. Upload `im074-e2e-acceptance.md`.
3. Click `导入并解析`.
4. Confirm the success message says the file generated a Parsed Document, document segments, and a Draft WikiNode Suggestion.
5. Click `打开生成的 WikiNode 建议`.
6. Confirm the suggestion detail shows:
   - title `IM074 端到端售后验收规范`
   - source evidence
   - relation candidate or content reference to `收费政策`
7. Fill `采纳说明`.
8. Click `采纳为草稿 WikiNode`.
9. Open the generated draft WikiNode link.
10. Click `发布`.
11. Confirm the publish feedback says the WikiNode was published and local Index Segments were prepared.
12. Open `http://127.0.0.1:3001/wiki-graph`.
13. Search `IM074`.
14. Confirm the imported WikiNode appears on the graph.
15. Confirm the graph has a resolved relation to `收费政策`.
16. Open `http://127.0.0.1:3001/retrieval-test`.
17. Search `IM074 端到端售后验收`.
18. Confirm Retrieval API returns a WikiNode result for `IM074 端到端售后验收规范`.
19. Enable debug mode.
20. Confirm debug evidence shows matched Index Segment evidence while the primary result remains a WikiNode.

## API Guard

Run the automated guard after manual acceptance or before PR merge:

```bash
bash scripts/api-smoke.sh
```

The smoke must include these passing lines:

```text
POST /api/draft-wikinode-suggestions/{importedSuggestionId}/accept: PASS 200
POST /api/wiki-nodes/{importedNodeId}/publish: PASS 200
GET /api/wiki-graph/overview after imported publish: PASS 200
POST /api/retrieval-test imported WikiNode: PASS 200
Retrieval node contract: PASS node=true chunk=false document=false
```

## Pass Criteria

- Browser import produces Raw Material, Parsed Document, document segments, and a Draft WikiNode Suggestion.
- Suggestion acceptance creates a draft WikiNode.
- Publish prepares local Index Segments.
- WikiGraph shows the imported WikiNode and a resolved WikiLink edge to `收费政策`.
- Retrieval API returns the imported WikiNode as the primary result.
- Debug mode may show matched Index Segment evidence.
- Normal result must not expose raw document or external vector-store internals as the primary object.

## Fail Criteria

- Import succeeds but no Draft WikiNode Suggestion is available.
- Suggestion acceptance does not create a WikiNode.
- Publish does not prepare local Index Segments.
- WikiGraph cannot find the imported WikiNode.
- WikiGraph does not resolve `[[收费政策]]`.
- Retrieval API does not return the imported WikiNode.
- Retrieval result is document-first or external-vector-internal-first instead of WikiNode-first.

## Explicit Non-goals

- No external vector store sync.
- No embedding execution.
- No production parser connector.
- No new Source connector.
- No approval, permission, batch, export, or audit implementation.
- No Agent, Chatbot, Workflow, or Vector DB Management surface.
