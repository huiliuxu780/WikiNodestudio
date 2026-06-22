# WikiNode Studio MVP v0.1 Acceptance Checklist

Use this checklist to verify the WikiNode Studio MVP Baseline v0.1 before a demo or handoff.

## Environment

- [ ] Start PostgreSQL.
- [ ] Confirm the local database is `wikinode_studio`.
- [ ] Run `./scripts/reset-db.sh`.
- [ ] Confirm reset restores 5 seed WikiNodes.
- [ ] Start the backend with `mvn spring-boot:run`.
- [ ] Start the frontend with `pnpm run dev -- --host 127.0.0.1 --port 3001`.
- [ ] Confirm `VITE_USE_MOCK_FALLBACK=false` for real backend validation.

## Automated Checks

- [ ] Run `mvn test`.
- [ ] Run `pnpm run lint`.
- [ ] Run `pnpm run build`.
- [ ] Run `./scripts/api-smoke.sh`.
- [ ] Confirm API smoke reports `Retrieval node contract: PASS node=true chunk=false document=false`.
- [ ] Confirm the latest GitHub Actions CI run is green.

## Product Smoke

- [ ] Open `/`.
- [ ] Open `/wiki-nodes`.
- [ ] Open `/wiki-nodes/wn-001`.
- [ ] Open `/broken-links`.
- [ ] Open `/wiki-graph`.
- [ ] Open `/retrieval-test`.
- [ ] Open `/sources`.
- [ ] Open `/index-status`.
- [ ] Open `/settings`.

## WikiNode Loop

- [ ] View an existing WikiNode.
- [ ] Create a new WikiNode.
- [ ] Confirm the new WikiNode appears in the list.
- [ ] Open the new WikiNode detail page.
- [ ] Edit and save the new WikiNode.
- [ ] Confirm the saved changes remain visible after refresh.

## Link And Broken Link Loop

- [ ] Edit an existing WikiNode and add a double link to a missing slug.
- [ ] Save the WikiNode.
- [ ] Confirm `/broken-links` shows the missing slug.
- [ ] Create a WikiNode with the missing slug.
- [ ] Confirm `/broken-links` no longer shows that broken link.
- [ ] Open the created target WikiNode.
- [ ] Confirm backlinks include the source WikiNode.

## Retrieval Loop

- [ ] Open `/retrieval-test`.
- [ ] Search with a keyword from a newly created or edited WikiNode.
- [ ] Confirm Retrieval Test returns the expected WikiNode.
- [ ] Confirm retrieval results are WikiNode-based and do not expose chunk or document payloads.

## Persistence Loop

- [ ] Create a WikiNode.
- [ ] Edit and save a WikiNode.
- [ ] Restart Spring Boot.
- [ ] Query or open the created WikiNode and confirm it still exists.
- [ ] Query or open the edited WikiNode and confirm the saved content still exists.
- [ ] Run `./scripts/reset-db.sh`.
- [ ] Confirm the database returns to the 5 seed WikiNodes.

## Release Boundary

- [ ] Confirm no Source import flow is included in this baseline.
- [ ] Confirm no vector database is included.
- [ ] Confirm no embedding pipeline is included.
- [ ] Confirm no chunk payload is exposed in product/API responses.
- [ ] Confirm no permissions, version management, or publishing approval flow is included.
