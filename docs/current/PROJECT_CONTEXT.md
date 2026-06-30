# Current Project Context

## Current Stage

WikiNode Studio is in Phase 2 execution after the MVP v0.2 baseline, Source / Raw Material / Parsed Document increments, Draft WikiNode Suggestion increments, and the first Phase 2 API / Index Segment / Retrieval / governance back-half increments.

## Product Direction

WikiNode Studio is an enterprise knowledge asset platform between multi-source enterprise knowledge and external vector knowledge bases. The durable product model is WikiNode-centered: business users manage WikiNodes, the system manages Index Segments, external vector stores manage embeddings and similarity retrieval, and Retrieval API returns WikiNodes by default.

The full product scope is captured in `docs/current/PRODUCT_SCOPE.md`; the roadmap-level feature map is captured in `docs/current/FEATURE_MAP.md`; frontend shell and navigation rules are captured in `docs/current/DESIGN_REFERENCE.md`.

## Active Boundary

The product baseline includes the React frontend MVP, Spring Boot API, PostgreSQL + Flyway persistence, reset/seed scripts, API smoke, GitHub Actions baseline CI, v0.2 release documentation, Playwright browser coverage, Source / Raw Material / Parsed Document read-only APIs, Draft WikiNode Suggestion review APIs, WikiNode Knowledge Object API alignment, Index Segment generation and trace evidence, Retrieval API debug evidence, the Quality Issues evidence console, the publishing / metadata governance / admin planning baseline, Knowledge Relation management through the IM059-IM064 follow-up sequence, IM066 evidence-console completion for Source Operation, Index Job, Vector Sync, Retrieval Debug, System Health, and Admin pages, and IM075 Knowledge Base administration as the persisted scope container around WikiNodes and Sources.

Current development must stay inside confirmed task scope. The standing MVP exclusions remain: no real Source import, file upload, parser execution, vector database implementation, embedding invocation, product-facing Chunk Management, automated quality repair, batch operation, export, permissions, version management, audit implementation, or publishing approval flow unless explicitly approved by the user.

The current full-requirement completion assessment is captured in `docs/current/REQUIREMENT_COMPLETION_AUDIT.md`. Its conclusion is that the local MVP baseline and current Knowledge Relation MVP scope are complete, but the full product requirements are not complete.

## Current Queue

Current executable Phase 2 work is tracked in:

- `docs/current/STORY_QUEUE.yaml`
- `docs/current/ACTIVE_TASKS.yaml`

Use these release documents for baseline acceptance and handoff:

- `docs/release/mvp-baseline-v0.2.md`
- `docs/release/mvp-v0.2-acceptance-checklist.md`

The active executable packet is `US077` / `IM077`: Imported Knowledge Acceptance to WikiNode Retrieval Loop. It closes the post-import loop so a generated Draft WikiNode Suggestion can be reviewed, accepted into a WikiNode, prepared as local Index Segment evidence, verified in WikiGraph, and returned by Retrieval Test under the same Knowledge Base scope. It must keep Retrieval API and graph verification WikiNode-centered. It does not implement real external connectors, embedding, external vector sync, approval workflow, RBAC, batch operations, export, Agent, Chatbot, Workflow, Vector DB Management, or product-facing Chunk Management.

The frontend UX polish rules are captured in `docs/quality/frontend-ux-guidelines.md` and should be treated as standing frontend quality guidance for future UI work.

## Current Execution Rules

- Read current files by default, not historical archive files.
- Read `docs/current/PRODUCT_SCOPE.md` and `docs/current/DESIGN_REFERENCE.md` before non-trivial work.
- Read `docs/current/FEATURE_MAP.md` for product planning, frontend, API, data-model, or roadmap work.
- Treat `docs/current/**` as the execution queue source.
- Treat `docs/registry/**` as lookup indexes only.
- Do not execute from archive files.
- Keep subagents read-only for `docs/current/**` and `docs/registry/**`; the main Worker is the single writer.
- Run `bash scripts/check-state.sh` for state changes.
- `bash scripts/check.sh` runs strict state checks by default.
- Run `bash scripts/check.sh` before reporting a task complete.

## Current Stop Conditions

- Real external product integrations.
- Database persistence changes unless a matching task is active.
- CI service orchestration beyond PostgreSQL, Spring Boot, Vite, and Playwright Chromium.
- Unconfirmed new dependencies or package/lockfile changes.
- Authentication or permission boundaries.
- Approval, export, batch-operation, or production workflow capabilities.
- Production formula, settlement-rule, or charge-factor changes.
- Destructive or ambiguous Git/file operations.
- Failed final verification.

## Current Recommendation

Current recommended next step: complete and verify `IM077`, then decide whether the next capability packet should address external connector configuration, publishing approval, permissions, or retrieval evaluation depth.
