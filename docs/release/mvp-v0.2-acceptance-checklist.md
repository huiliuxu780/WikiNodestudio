# WikiNode Studio MVP v0.2 Acceptance Checklist

Use this checklist to verify the MVP v0.2 baseline before demo, handoff, or release tagging.

## Automated Checks

- [ ] Run `pnpm lint`.
- [ ] Run `pnpm build`.
- [ ] Run `bash scripts/check.sh`.
- [ ] Run `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 pnpm exec playwright test`.
- [ ] Confirm Playwright reports all current e2e tests passing.
- [ ] Run `git diff --check origin/main..HEAD` on any release documentation branch.
- [ ] Confirm GitHub Actions Backend and Frontend checks are green for the latest merged PR.

## Optional Backend Smoke

- [ ] Start PostgreSQL.
- [ ] Run `./scripts/reset-db.sh`.
- [ ] Start backend with `mvn spring-boot:run`.
- [ ] Run `./scripts/api-smoke.sh`.
- [ ] Confirm API smoke reports retrieval response with `node=true`, `chunk=false`, and `document=false`.

## Core Route Smoke

- [ ] Open `/` and confirm the sidebar shell and overview render.
- [ ] Open `/wiki-nodes` and confirm WikiNode list, search, filters, and Chinese status labels render.
- [ ] Open `/wiki-nodes/create` and confirm required-field validation is Chinese.
- [ ] Open `/wiki-nodes/wn-001` and confirm editor, preview, inspector, save, local publish, and local re-index feedback render.
- [ ] Open `/wiki-nodes/wn-001/detail` and confirm Knowledge Object fields are visible.
- [ ] Open `/broken-links` and confirm unresolved WikiLink copy is clear.
- [ ] Open `/settings` and `/admin/roles` and confirm localized labels render.

## WikiGraph

- [ ] Open `/wiki-graph`.
- [ ] Confirm React Flow node-edge canvas is visible.
- [ ] Confirm MiniMap is visible.
- [ ] Confirm filters are in the top toolbar.
- [ ] Confirm the Inspector does not take fixed width before selection.
- [ ] Click a node and confirm Inspector opens with object type, subtype, metadata, source evidence, and relations.
- [ ] Confirm broken WikiLink nodes/edges are visible when enabled.
- [ ] Confirm no product copy says `Workflow Builder` or `Chunk Management`.

## Sources And Raw Materials

- [ ] Open `/sources`.
- [ ] Confirm Source -> Raw Material -> Parsed Document boundary copy is visible.
- [ ] Confirm the page states that real sync, upload, and parsing are not executed in MVP v0.2.
- [ ] Open `/sources/src-feishu-cc`.
- [ ] Confirm Source Detail is a read-only acceptance baseline.
- [ ] Open `/raw-materials`.
- [ ] Confirm Raw Material is described as a source snapshot.
- [ ] Open `/raw-materials/rm-001`.
- [ ] Confirm no download, re-parse, or real storage access is implied.
- [ ] Open `/raw-materials/rm-001/parsed-result`.
- [ ] Confirm Parsed Document is a standard content preview and does not imply live PDF/Word/web/database/API parsing.

## Retrieval Test

- [ ] Open `/retrieval-test`.
- [ ] Confirm normal mode states that results are WikiNodes.
- [ ] Search a known query and confirm result cards show WikiNode result type, hit reason, matched fields, source evidence, and WikiLink context.
- [ ] Confirm normal mode does not show `matchedSegments`.
- [ ] Enable debug mode.
- [ ] Search again and confirm `matchedSegments / Index Segment` evidence appears only in debug mode.
- [ ] Search with no-result filters and confirm actionable Chinese empty-state guidance.
- [ ] Confirm no product copy says `Chat API`, `Chatbot`, or raw chunk as primary result.

## Knowledge Object Metadata

- [ ] Open `/wiki-nodes/wn-001/detail`.
- [ ] Confirm `objectType`, `subtype`, `metadata`, `sourceRefs`, `relations`, and `processingProfile` are visible.
- [ ] Open `/wiki-nodes/wn-001`.
- [ ] Confirm Inspector Metadata tab shows Knowledge Object carrier fields.
- [ ] Confirm Knowledge Object relations are read-only and show target WikiNode, relation type, confidence, and evidence ID.
- [ ] Confirm `nodeType` remains a compatibility label and is not expanded into business taxonomy management.

## Index Segment

- [ ] Open `/index-segments`.
- [ ] Confirm the page states that the platform manages WikiNode pre-publish Index Segments, not external vector-store internal chunks.
- [ ] Select or search for a segment and confirm preview shows source WikiNode, content evidence, source evidence range, object type, subtype, and processing profile.
- [ ] Confirm preview states that it does not execute embedding or real vector-store sync.
- [ ] Open `/index-segments/strategy`.
- [ ] Confirm the generation chain is clear: WikiNode / Knowledge Object -> Index Segment -> external vector-store sync evidence.
- [ ] Open `/index-segments/debug`.
- [ ] Confirm debug explains retrieval evidence without invoking embedding or writing to an external vector store.
- [ ] Open `/wiki-nodes/wn-013`, select Inspector `片段`, and confirm object/source evidence appears.
- [ ] Confirm no product copy says `Chunk Management` or `Vector DB Management`.

## Release Boundary

- [ ] Confirm no real Source import exists.
- [ ] Confirm no file upload exists.
- [ ] Confirm no parser execution exists.
- [ ] Confirm no embedding call exists.
- [ ] Confirm no real vector-store sync exists.
- [ ] Confirm no permissions, approval, audit, export, or batch operation implementation exists.
- [ ] Confirm Query Logs, Evaluation, Quality, Admin, Parser/Storage/System routes are visual skeletons or deferred surfaces.
