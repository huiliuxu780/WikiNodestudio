# WeKnora WikiGraph Source Analysis

## 0. Source Snapshot

- Repository: `https://github.com/Tencent/WeKnora.git`
- Local read-only checkout: `/tmp/codex-weknora-analysis`
- Branch: `main`
- Commit: `94ce8fedb19ad5f4f70ec581033ad034be974598`
- Scan size: 2,071 tracked files; 370 frontend files under `frontend/src`; 918 backend files under `internal`; 96 docs files under `docs`.
- Focused evidence set: 276 paths matched Wiki, graph, knowledge-search, chunk, Neo4j, or search keywords.
- Scope: read-only source analysis. No WeKnora code was modified or copied.

## 1. 结论摘要

- WeKnora has a real Wiki Mode. README describes it as agents distilling raw documents into interlinked Markdown wiki pages with an interactive graph, and v0.5.0 marks Wiki Mode GA.
- WeKnora has a Wiki Browser UI at `frontend/src/views/knowledge/wiki/WikiBrowser.vue`, mounted from `frontend/src/views/knowledge/KnowledgeBase.vue` when a KB has `indexing_strategy.wiki_enabled`.
- WeKnora has two graph concepts that must not be merged: the Wiki page link graph from `wiki_pages.in_links/out_links`, and the Neo4j entity-relationship graph used for GraphRAG.
- The Wiki Graph page is interactive and rendered by custom SVG code, not React Flow, G6, Cytoscape, or d3. It supports search, filters, pan, zoom, drag, hover highlight, click drawer, double-click ego expansion, and shift-click bloom expansion.
- Wiki Graph nodes are Wiki pages: `{ slug, title, page_type, link_count }`. Wiki Graph edges are directed Wiki references: `{ source, target }`.
- Wiki page references use Markdown `[[slug]]` and `[[slug|display name]]`. Backend parses these into `out_links`, updates target `in_links`, and exposes `/api/v1/knowledgebase/:kb_id/wiki/graph`.
- Knowledge search is separate from Wiki page search. `/api/v1/knowledge-search` and `/knowledge-bases/:id/hybrid-search` return chunk-shaped `SearchResult` objects, not Wiki pages or graph nodes.
- Directly reusable ideas: Wiki Browser IA, page type grouping, link graph interaction model, index/log special pages, status polling, graph type filters, and graph overview/ego query split.
- Must adapt before reuse: WeKnora `WikiPage` should become our `WikiNode`; WeKnora `out_links/in_links` should become explicit `WikiLink`; WeKnora chunk search should become Index Segment-backed retrieval returning WikiNode.
- Do not import Agent, Chat, IM, MCP, LLM answer generation, or Neo4j GraphRAG as core MVP behavior. Only keep coupling notes because WeKnora's Wiki generation is LLM/agent-heavy.

## 2. 相关目录和文件

| Type | Path | Role | Reference |
| --- | --- | --- | --- |
| frontend | `frontend/src/views/knowledge/KnowledgeBase.vue` | KB detail page; shows Documents / Wiki / Graph breadcrumb tabs and mounts `WikiBrowser`. | yes |
| frontend | `frontend/src/views/knowledge/wiki/WikiBrowser.vue` | Main Wiki Browser and Wiki Graph component. Browser view has sidebar + reader; graph view has SVG graph canvas, search, legend, filters, drawer. | yes |
| frontend | `frontend/src/api/wiki/index.ts` | Wiki API client and frontend TypeScript DTOs: `WikiPage`, `WikiGraphData`, `WikiStats`, CRUD, graph, search, issues. | yes |
| frontend | `frontend/src/views/knowledge/settings/GraphSettings.vue` | Entity/relation extraction settings for Neo4j knowledge graph, not Wiki page link graph. | partial |
| frontend | `frontend/src/components/GlobalCommandPalette/useSearch.ts` | Global command palette fans out to `/api/v1/knowledge-search` for chunk/file search. | partial |
| frontend | `frontend/src/api/knowledge-base/index.ts` | `knowledgeSemanticSearch()` posts to `/api/v1/knowledge-search`; also contains KB APIs. | partial |
| backend | `internal/router/router.go` | Registers Wiki routes under `/api/v1/knowledgebase/:kb_id/wiki`; registers `/api/v1/knowledge-search`; registers `/knowledge-bases/:id/hybrid-search`. | yes |
| backend | `internal/handler/wiki_page.go` | HTTP handler for Wiki page CRUD, folders, index, graph, stats, search, rebuild links, lint, auto-fix, issues. | yes |
| backend | `internal/types/wiki_page.go` | Core Wiki data model: `WikiPage`, `WikiFolder`, `WikiGraphData`, `WikiGraphNode`, `WikiGraphEdge`, `WikiStats`, `WikiPageIssue`. | yes |
| backend | `internal/application/service/wiki_page.go` | Wiki service; parses links, maintains backlinks, builds graph overview/ego subgraphs, searches pages. | yes |
| backend | `internal/application/repository/wiki_page.go` | Persistence for `wiki_pages`, folders, search/list queries, source refs, slug lookup. | yes |
| backend | `internal/application/service/wiki_linkify.go` | Auto-injects `[[slug|display]]` links while avoiding code, existing links, Markdown links, images, and reference definitions. | yes |
| backend | `internal/application/service/wiki_ingest*.go` | LLM-powered Wiki ingest pipeline from documents/chunks to summary/entity/concept pages, citations, taxonomy, dedup, index rebuild. | partial |
| backend | `internal/agent/prompts_wiki.go` | Prompt definitions for Wiki summaries, entity/concept extraction, candidate slugs, taxonomy, modification, dedup. | partial |
| backend | `migrations/versioned/000037_wiki_and_indexing.up.sql` | Creates `wiki_pages`, `wiki_folders`, `wiki_page_issues`, `wiki_config`, `indexing_strategy`. | yes |
| backend | `migrations/versioned/000061_wiki_page_hierarchy.up.sql` | Adds hierarchy fields and folder indexes for Wiki Browser directory tree. | yes |
| backend | `internal/types/search.go` | Chunk-shaped `SearchResult` and `SearchParams`. | yes |
| backend | `internal/handler/session/qa.go` | `/api/v1/knowledge-search` request handler, calls session search without LLM summary. | yes |
| backend | `internal/application/service/session_knowledge_qa.go` | Builds search targets and retrieves chunk results for knowledge search. | yes |
| backend | `internal/handler/knowledgebase.go` | `/knowledge-bases/:id/hybrid-search` handler. | yes |
| backend | `internal/application/service/knowledgebase_search.go` | Hybrid vector + keyword search over KB chunks. | yes |
| backend | `internal/types/graph.go` | Entity/relation graph structs for Neo4j GraphRAG, separate from Wiki link graph. | partial |
| backend | `internal/application/repository/retriever/neo4j/repository.go` | Neo4j repository for extracted entity/relation graph. | partial |
| backend | `internal/agent/tools/query_knowledge_graph.go` | Agent tool that queries graph-configured KBs through hybrid search / graph config. | no for MVP |
| docs | `README.md` | Product description and screenshots for Wiki Browser and Wiki Knowledge Graph. | yes |
| docs | `docs/KnowledgeGraph.md` | Neo4j knowledge graph setup, separate from Wiki page link graph. | partial |
| docs | `docs/api/knowledge-search.md` | API docs for chunk-shaped `/knowledge-search`. | yes |
| docs | `docs/api/knowledge-base.md` | API docs for `/knowledge-bases/:id/hybrid-search`. | yes |
| docs | `docs/images/wiki-browser.png` | Wiki Browser screenshot. | yes |
| docs | `docs/images/wiki-graph.png` | Wiki Graph screenshot. | yes |

Key locations:

- Wiki Browser page: `frontend/src/views/knowledge/wiki/WikiBrowser.vue`
- Wiki Graph page: same component, `view === 'graph'`
- Graph component: same component, custom SVG renderer in `renderGraph()`
- Knowledge search API client: `frontend/src/api/knowledge-base/index.ts`
- Wiki API client: `frontend/src/api/wiki/index.ts`
- Knowledge search backend route: `internal/router/router.go` group `/knowledge-search`
- Wiki page backend route: `internal/router/router.go` function `RegisterWikiPageRoutes`
- Wiki page model: `internal/types/wiki_page.go`
- Wiki graph node/edge model: `internal/types/wiki_page.go`
- Neo4j entity graph model: `internal/types/graph.go`

## 3. Wiki Mode 实现链路

Observed source chain:

```text
Raw documents / Knowledge files
  -> chunking and document processing
  -> Wiki ingest queue
  -> LLM prompts extract summary pages, entity pages, concept pages, citations, taxonomy
  -> wiki_pages stores Markdown WikiPage records
  -> [[slug]] / [[slug|display]] references are parsed into out_links
  -> target pages receive in_links backlinks
  -> WikiBrowser lists/searches/reads pages
  -> Wiki Graph API builds nodes/edges from in_links/out_links
```

Implementation evidence:

- `README.md` describes Wiki Mode as agent-driven auto-generation of structured, interlinked Markdown Wiki pages from raw documents.
- `internal/types/wiki_page.go` says `WikiPage` is an LLM-generated, interlinked Markdown document.
- `migrations/versioned/000037_wiki_and_indexing.up.sql` creates `wiki_pages.content TEXT`, `summary`, `source_refs`, `chunk_refs`, `in_links`, `out_links`, and full-text index over title + content.
- `internal/application/service/wiki_ingest_batch.go` checks `kb.IsWikiEnabled()`, loads `WikiConfig`, resolves synthesis model, processes pending wiki ops, and reduces extracted slug updates into pages.
- `internal/agent/prompts_wiki.go` defines LLM prompts for summary page generation, entity/concept extraction, candidate slugs, taxonomy, page modification, and deduplication.
- `internal/application/service/wiki_page.go` parses `[[...]]` links, normalizes slugs, updates `out_links`, and refreshes target `in_links`.

Answers:

- Wiki pages are generated by the Wiki ingest pipeline under `internal/application/service/wiki_ingest*.go`, using prompts in `internal/agent/prompts_wiki.go`.
- Wiki pages are stored in relational table `wiki_pages`.
- Wiki pages are Markdown. `WikiPage.Content` is full Markdown content.
- Links are expressed as `[[slug]]` or `[[slug|display name]]`.
- A Wiki page belongs to a `knowledge_base_id` and cites source knowledge/files through `source_refs`; it can cite concrete source chunks through `chunk_refs`. This is evidence linkage, but the user-facing Wiki object is the page.

## 4. Wiki Browser 页面分析

`WikiBrowser.vue` is a large single Vue component with two modes:

- `view === 'browser'`: left list/tree plus right reader.
- `view === 'graph'`: full-screen graph canvas plus overlays/drawer.

Browser structure:

- Left side: `wiki-sidebar`, grouped by page types and directories. It lazy-loads buckets by page type and category path.
- Main reader: opens an index page, log view, or selected WikiPage Markdown content.
- Search: top sidebar input calls `searchWikiPages()`; graph mode has a remote search select as well.
- References: content uses `[[slug|display]]` links and click handlers to navigate to other pages.
- Navigation: `navigateToSlug()`, `selectPage()`, and graph drawer link handling support internal jumps.
- Source view: emits `open-source-doc` to parent `KnowledgeBase.vue`; page data carries `source_refs` and `chunk_refs`.
- Editing: component has `canEdit` prop and calls CRUD/move/fix APIs, but generated pages are primarily browser/reader surfaces; write operations are gated by KB ownership.
- Status: polls `getWikiStats()` and surfaces pending wiki tasks/issues.
- Scaling choices: page type buckets, paginated index sections, virtual scroller, and graph overview/ego modes are designed for very large wiki KBs.

Relevant components/functions:

- Parent mount: `KnowledgeBase.vue` imports `WikiBrowser`, computes `isWiki`, and shows `Documents / Wiki / Graph` tabs.
- API: `listWikiPages`, `listWikiFolders`, `getWikiPage`, `getWikiIndex`, `getWikiLog`, `getWikiStats`, `searchWikiPages`, `listWikiIssues`.
- UI helpers: `WikiFolderActions.vue`, `RecycleScroller`, `picturePreview`, `hydrateProtectedFileImages`.

## 5. Wiki Graph 页面分析

The Wiki Graph view is inside `WikiBrowser.vue`, not a separate route/component. It is not based on a third-party graph visualization library. `frontend/package.json` includes Mermaid for Markdown diagrams, but there is no React Flow, G6, Cytoscape, or d3 dependency for the Wiki Graph. The graph is custom SVG with a force simulation implemented in component code.

Graph API:

```http
GET /api/v1/knowledgebase/:kb_id/wiki/graph
```

Query params:

- `mode=overview | ego`
- `center=<slug>` for ego mode
- `depth=1..3`
- `types=summary,entity,concept,synthesis,comparison,index,log`
- `limit`, default 500, max 2000 in handler

Backend behavior:

- `WikiPageHandler.GetGraph()` validates query params and calls `wikiService.GetGraph()`.
- `wikiPageService.GetGraph()` fetches all pages and computes a bounded graph subset.
- Overview mode sorts pages by `len(in_links) + len(out_links)` and returns top-N nodes.
- Ego mode performs undirected BFS from a center slug using both inbound and outbound links.
- Edges are only returned when both endpoints survive selection.

Actual structures:

```ts
type WeKnoraWikiGraphNode = {
  slug: string
  title: string
  page_type: string
  link_count: number
}

type WeKnoraWikiGraphEdge = {
  source: string
  target: string
}

type WeKnoraWikiGraphMeta = {
  mode: 'overview' | 'ego'
  total: number
  returned: number
  truncated: boolean
  center?: string
  depth?: number
}
```

Interaction support:

- Click node: select, highlight, pan, open right drawer with page Markdown.
- Double-click node: load ego graph centered on that page.
- Shift-click / bloom: pull hidden neighbors into current canvas.
- Search: graph search overlay, remote search via `searchWikiPages()`.
- Filters: clickable legend filters by page type.
- Zoom/pan: mouse wheel and background drag.
- Drag nodes: SVG `mousedown` node drag, pinning after drag.
- Fit view: programmatic pan/zoom.
- Edge arrows: can show/hide; bidirectional pairs are collapsed into one line with double arrows.
- Broken/unresolved links: not represented as first-class graph nodes. `updateInLinks()` skips missing targets; `GetGraph()` only includes edges whose target slug exists in selected pages. Lint/issues APIs may surface problems separately, but the graph data itself omits unresolved links.

Important distinction:

- Wiki Graph: page-link graph derived from `wiki_pages.out_links/in_links`.
- Neo4j Knowledge Graph: entity/relation graph extracted from chunks with LLM, configured by `NEO4J_ENABLE`, stored in Neo4j, and used for GraphRAG/agent exploration. It uses `GraphNode{Name, Chunks, Attributes}` and `GraphRelation{Node1, Node2, Type}`.

## 6. 知识搜索 API 分析

Frontend search entries:

- `frontend/src/api/knowledge-base/index.ts`:
  - `knowledgeSemanticSearch({ query, knowledge_base_ids, knowledge_ids })`
  - posts to `/api/v1/knowledge-search`
- `frontend/src/components/GlobalCommandPalette/useSearch.ts`:
  - fans out command palette search to `/api/v1/knowledge-search`
  - merges with message search when not scoped to a KB
- CLI:
  - `cli/cmd/search/chunks.go`
  - `cli/skills/weknora-rag-search/references/search-chunks.md`

Backend search endpoints:

| Endpoint | Handler | Service | Return |
| --- | --- | --- | --- |
| `POST /api/v1/knowledge-search` | `internal/handler/session/qa.go` `SearchKnowledge()` | `sessionService.SearchKnowledge()` | `[]SearchResult` chunks |
| `POST /api/v1/knowledge-bases/:id/hybrid-search` | `internal/handler/knowledgebase.go` `HybridSearch()` | `knowledgeBaseService.HybridSearch()` | `[]SearchResult` chunks |
| `GET /api/v1/knowledgebase/:kb_id/wiki/search` | `WikiPageHandler.SearchPages()` | `wikiPageService.SearchPages()` | `[]WikiPage` |

`/api/v1/knowledge-search` request:

```ts
type SearchKnowledgeRequest = {
  query: string
  knowledge_base_id?: string
  knowledge_base_ids?: string[]
  knowledge_ids?: string[]
}
```

`/knowledge-bases/:id/hybrid-search` request:

```ts
type SearchParams = {
  query_text: string
  query_embedding?: number[]
  vector_threshold: number
  keyword_threshold: number
  match_count: number
  disable_keywords_match: boolean
  disable_vector_match: boolean
  knowledge_ids: string[]
  tag_ids: string[]
  only_recommended: boolean
  knowledge_base_ids?: string[]
  skip_context_enrichment?: boolean
}
```

`SearchResult` return shape is chunk/document-source oriented:

```ts
type SearchResult = {
  id: string
  content: string
  knowledge_id: string
  chunk_index: number
  knowledge_title: string
  start_at: number
  end_at: number
  seq: number
  score: number
  match_type: string
  sub_chunk_id: string[]
  metadata: Record<string, string>
  chunk_type: string
  parent_chunk_id: string
  image_info: string
  knowledge_filename: string
  knowledge_source: string
  knowledge_channel: string
  chunk_metadata?: unknown
  matched_content?: string
  knowledge_description?: string
  knowledge_base_id?: string
}
```

Call chain:

```text
GlobalCommandPalette/useSearch.ts or CLI search chunks
  -> frontend/src/api/knowledge-base/index.ts knowledgeSemanticSearch()
  -> POST /api/v1/knowledge-search
  -> internal/router/router.go knowledgeSearch.POST("")
  -> internal/handler/session/qa.go SearchKnowledge()
  -> internal/application/service/session_knowledge_qa.go SearchKnowledge()
  -> buildSearchTargets()
  -> knowledgeBaseService.HybridSearch()
  -> vector / keyword retrievers + fusion + result processing
  -> []types.SearchResult
```

Capabilities:

- Supports `knowledge_base_id` and `knowledge_base_ids`.
- Supports `knowledge_ids`.
- Hybrid search supports vector + keyword, and can disable either side.
- Hybrid search supports tag filtering for FAQ-style retrieval via `tag_ids`, plus `only_recommended`.
- It carries `metadata` in results, but this is result metadata, not a general metadata-filter contract like WikiNode Studio may need.
- It does not return Wiki pages, graph nodes, or WikiNode-like objects.
- It can be adapted into our `/api/knowledge/retrieve`, but only after adding an Index Segment -> WikiNode mapping layer. Direct reuse would expose chunks as primary results, which conflicts with WikiNode Studio's product rule.

## 7. 对 WikiNode Studio 的复刻建议

### 7.1 直接可参考

- Wiki Browser layout: left page tree/list, central Markdown reader, issue/status indicators, source jumps.
- Wiki Graph UX: overview mode, ego mode, graph search, type filters, click drawer, pan/zoom/drag, fit view.
- Backend graph API idea: bounded overview graph plus center-neighborhood graph avoids loading a full large graph.
- Page type grouping: `summary`, `entity`, `concept`, `synthesis`, `comparison` can inspire our `nodeType` grouping, but labels should be WikiNode-specific.
- Link syntax parser: `[[slug]]` and `[[slug|display]]`, plus safe linkification that avoids code blocks and existing Markdown links.
- Status polling: pending tasks/issues can map to our future source/import/index job indicators.
- Full-text wiki page search: useful for WikiNode search, separate from retrieval ranking.
- Index/log special surfaces: useful as optional future system-generated pages or audit feeds.

### 7.2 需要改造后参考

- `WikiPage` -> `WikiNode`: keep title, slug, Markdown content, source refs, status, version; add our product metadata, index status, owner, security level.
- `in_links/out_links` arrays -> `WikiLink` table/model: WeKnora stores links as slug arrays; WikiNode Studio should keep explicit resolved/unresolved link records for backlinks and Broken Links.
- `SearchResult` chunk -> `IndexSegment` evidence: WeKnora returns raw chunks; WikiNode Studio should return `node: WikiNode` with optional `matchedSegments` only in debug mode.
- `WikiGraphEdge` -> `WikiGraphEdge` with `edgeId`, `relationType`, `resolved`: WeKnora edge has only `source/target`; our graph should preserve unresolved links and relation semantics.
- Wiki ingest LLM pipeline -> later parser/normalization pipeline: WeKnora auto-generates pages; our MVP should first support explicit managed WikiNodes and only later consider LLM-assisted generation.
- Neo4j entity graph -> optional future retrieval enhancement: do not make it required for MVP WikiLink Graph.

### 7.3 不建议引入

- Agent Mode and ReAct orchestration.
- Chat UI and LLM answer generation.
- IM integrations.
- MCP tools and human-in-the-loop MCP approval.
- Neo4j GraphRAG as a mandatory MVP dependency.
- WeKnora's `chunk` command/API surface as product-facing terminology.
- Full RBAC/tenant organization model in the current frontend skeleton.
- LLM-heavy Wiki auto-generation as a required create/edit path.

## 8. 我们的数据模型建议

```ts
type SourceRef = {
  sourceId: string
  sourceType: string
  sourceTitle: string
  sourceUrl?: string
  paragraphRef?: string
  version?: string
}

type WikiNode = {
  nodeId: string
  title: string
  slug: string
  nodeType: string
  summary: string
  contentMarkdown: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  sourceRefs: SourceRef[]
  indexStatus: 'not_indexed' | 'indexing' | 'indexed' | 'outdated' | 'failed' | 'deleted'
  incomingCount: number
  outgoingCount: number
  brokenLinkCount: number
  version: number
  createdAt: string
  updatedAt: string
}

type WikiLink = {
  linkId: string
  fromNodeId: string
  fromTitle: string
  toNodeId?: string
  toTitle?: string
  targetTitle: string
  relationType: 'reference' | 'derived_from' | 'overrides' | 'conflicts_with' | 'depends_on' | 'applies_to' | 'excludes' | 'similar_to' | 'parent_of' | 'used_by'
  resolved: boolean
}

type WikiGraphNode = {
  nodeId: string
  title: string
  nodeType: string
  status: string
  linkCount: number
  brokenLinkCount: number
}

type WikiGraphEdge = {
  edgeId: string
  fromNodeId: string
  toNodeId?: string
  targetTitle: string
  relationType: string
  resolved: boolean
}

type IndexSegment = {
  segmentId: string
  nodeId: string
  nodeTitle: string
  segmentType: string
  contentPreview: string
  indexStatus: string
  vectorDocId?: string
  retrievalHits: number
  avgScore?: number
  sourceRefs: SourceRef[]
}

type RetrievalResult = {
  node: WikiNode
  score: number
  matchedReason: string
  matchedFields: string[]
  incomingLinks: WikiLink[]
  outgoingLinks: WikiLink[]
  matchedSegments?: {
    segmentId: string
    segmentType: string
    score: number
    contentPreview: string
  }[]
}
```

Design notes:

- Store unresolved WikiLinks explicitly. WeKnora skips missing targets in graph edges; our Broken Links page requires unresolved records.
- Keep `IndexSegment` separate from `WikiNode`. It is retrieval evidence, not the primary product object.
- Keep `matchedSegments` optional and debug-only.
- Use `nodeId` as primary identity in API; keep `slug` for routes and Markdown link syntax.

## 9. 我们的前端页面建议

| WikiNode Studio Page | WeKnora reference | Recommendation |
| --- | --- | --- |
| Overview | `KnowledgeBase.vue` status polling and stats patterns | Use metric cards for WikiNodes, broken links, indexed nodes, retrieval health; do not import chat/agent panels. |
| Knowledge Bases | `KnowledgeBaseList.vue`, `KnowledgeBaseEditorModal.vue` | Reuse card/list status ideas and indexing strategy language, but simplify permissions and tenant features. |
| WikiNodes | `WikiBrowser.vue` sidebar buckets and `listWikiPages()` | Build a denser table/list plus search/filter; keep WikiNode wording. |
| WikiNode Editor | `WikiBrowser.vue` reader + source refs + link navigation | Use our three-column editor design: Explorer, Markdown editor/preview, Inspector. WeKnora's browser is mostly reader-first. |
| Wiki Graph | `WikiBrowser.vue` graph mode | Directly adapt overview/ego, type filters, search, drawer, and pan/zoom/drag; add unresolved links as graph artifacts. |
| Broken Links | `WikiPageIssue`, lint/auto-fix APIs, `in_links/out_links` logic | Build explicit unresolved WikiLink list; do not hide missing targets like WeKnora graph does. |
| Index Segments | `SearchResult`, chunk APIs, `chunk_refs` | Use only as reference for evidence display. Rename and model as controlled Index Segments, not chunks. |
| Retrieval Test | `/knowledge-search`, `HybridSearch`, `KnowledgeSearchTool` | Adapt search controls, but return `WikiNode` by default and show `matchedSegments` only in debug mode. |
| Sources | `KnowledgeBase.vue` document list and upload/source controls | Use source status patterns later; keep current skeleton mock-only. |
| Settings | `GraphSettings.vue`, `KBIndexingStrategy.vue`, `KBVectorStoreSettings.vue` | Useful for future config pages, but MVP should state external vector stores are configured, not implemented by us. |

## 10. 风险与注意事项

- WikiGraph is partly coupled to Agent/LLM generation because Wiki pages are generated by the Wiki ingest pipeline and prompts. However, the browser and graph read model can be used without adopting Agent UI.
- Wiki Mode depends on LLM-assisted extraction and page generation in WeKnora. WikiNode Studio should not require LLM generation for MVP create/edit workflows.
- Graph data can be separated from Agent if we model WikiNode and WikiLink directly. WeKnora's `wiki_pages.out_links/in_links` graph API already demonstrates a non-Neo4j page-link graph.
- WeKnora also has Neo4j knowledge graph code, but that graph is entity/relation extraction for GraphRAG and should not become our WikiLink Graph dependency.
- `/api/v1/knowledge-search` returns chunks. WikiNode Studio must not expose that as primary retrieval output; build `IndexSegment -> WikiNode` mapping first.
- WeKnora's product contains large adjacent scope: Agent, Chat, IM, MCP, RBAC, tenant organization, web search, observability, and model/provider configuration. These are not needed for current WikiNode Studio skeleton.
- WeKnora's custom SVG graph is feature-rich but large. For our first static/mock frontend skeleton, use a lightweight relation-card or simpler SVG graph; adopt force-directed interactions later if needed.

## Done Notes

- Found WikiGraph/WikiBrowser related files: `KnowledgeBase.vue`, `WikiBrowser.vue`, `frontend/src/api/wiki/index.ts`, `internal/handler/wiki_page.go`, `internal/types/wiki_page.go`, `internal/application/service/wiki_page.go`, `internal/application/repository/wiki_page.go`, `migrations/versioned/000037_wiki_and_indexing.up.sql`, `migrations/versioned/000061_wiki_page_hierarchy.up.sql`.
- Found knowledge search APIs: `POST /api/v1/knowledge-search`, `POST|GET /api/v1/knowledge-bases/:id/hybrid-search`, `GET /api/v1/knowledgebase/:kb_id/wiki/search`.
- Main reusable point: Wiki Browser + Wiki Graph interaction model.
- Main non-reusable point: chunk-first retrieval and Agent/Chat/Neo4j-heavy scope.
- Recommended next step: use this report as context for `IM005`, but keep `IM005` frontend-only and mock-only.
