# Current Project Context

## Current Stage

WikiNode Studio MVP Baseline v0.2 is fixed and verifiable after IM014 through IM022.

## Product Direction

WikiNode Studio is an enterprise knowledge asset platform between multi-source enterprise knowledge and external vector knowledge bases. The durable product model is WikiNode-centered: business users manage WikiNodes, the system manages Index Segments, external vector stores manage embeddings and similarity retrieval, and Retrieval API returns WikiNodes by default.

The full product scope is captured in `docs/current/PRODUCT_SCOPE.md`; the roadmap-level feature map is captured in `docs/current/FEATURE_MAP.md`; frontend shell and navigation rules are captured in `docs/current/DESIGN_REFERENCE.md`.

## Active Boundary

The product baseline includes the React frontend MVP, Spring Boot API, PostgreSQL + Flyway persistence, reset/seed scripts, API smoke, GitHub Actions baseline CI, v0.2 release documentation, and Playwright browser coverage for the main MVP acceptance paths.

Current development must stay inside confirmed task scope. The standing MVP exclusions remain: no real Source import, file upload, parser execution, vector database implementation, embedding invocation, product-facing Chunk Management, permissions, version management, audit implementation, or publishing approval flow unless explicitly approved by the user.

## Current Queue

MVP v0.2 acceptance work from IM014 through IM023 is now the current release baseline.

Use these release documents for manual acceptance and handoff:

- `docs/release/mvp-baseline-v0.2.md`
- `docs/release/mvp-v0.2-acceptance-checklist.md`

The older queue files remain part of the Harness state history, but they do not authorize automatic continuation into a new implementation stream. Any post-v0.2 work must start from a new explicit user-confirmed task.

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

- Real external product integrations. Read-only source analysis for `IM004` is limited to Tencent/WeKnora evidence gathering outside this repository.
- Database persistence changes unless a matching task is active.
- CI service orchestration beyond PostgreSQL, Spring Boot, Vite, and Playwright Chromium.
- Unconfirmed new dependencies or package/lockfile changes.
- Authentication or permission boundaries.
- Approval, export, batch-operation, or production workflow capabilities.
- Production formula, settlement-rule, or charge-factor changes.
- Destructive or ambiguous Git/file operations.
- Failed final verification.

## Current Recommendation

Recommended sequencing: finish `IM001` if CI hardening remains the priority; otherwise run `IM004` and `IM005` as separate task branches, with `IM004` read-only/report-only and `IM005` frontend-only/mock-only.
