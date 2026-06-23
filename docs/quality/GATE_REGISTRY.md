# Gate Registry

## Default Gate

Use this gate for every non-trivial task.

Checks:

- Has Codex read the current Harness entry set from `AGENTS.md`: `docs/current/PROJECT_CONTEXT.md`, `docs/current/STORY_QUEUE.yaml`, `docs/current/ACTIVE_TASKS.yaml`, `docs/current/BLOCKERS.md`, this file, and any current task files?
- Is the requested task documented in the current queue or clearly specified by the user?
- Are allowed files and forbidden files explicit?
- Does the task require confirmation?
- Does the task touch business code, package files, dependencies, real APIs, backend, database, metrics, formulas, or archive material?
- Is acceptance verifiable?
- Will the task run on a task branch instead of `main`?
- Will `bash scripts/check.sh` be run before Done Report?

Stop conditions:

- Confirmation is required.
- Scope expands beyond the Gate Plan.
- The task needs dependencies, package or lockfile changes.
- The task needs real API, backend, database, or production capability.
- The task changes business metrics, status codes, formulas, settlement rules, or charge factors.
- The task imports from archive/reference source.
- `bash scripts/check.sh` fails.

## Workflow Gate Matrix

| required_workflow | Gate | Typical Scope | Extra Stop Conditions |
| --- | --- | --- | --- |
| `harness` | Harness Documentation Gate | Harness rules, state, audit, branch log, check scripts | Business implementation, dependencies, real integrations, database, auth, permissions, approval, export, batch operations |
| `state-hygiene` | State Hygiene Gate | Current/registry state model, state checks, default read set, archive boundary, trace indexes | Business implementation, dependency/package changes, database, real integrations, auth, permissions, approval, export, batch operations |
| `state-repair` | State Repair Gate | Repair inconsistent current/registry/archive index state | Business code, package/lockfile changes, new dependencies, database, real integrations, product feature work |
| `qa` | QA Acceptance Gate | Acceptance review, verification evidence, audit/report updates | Product behavior changes, implementation edits outside acceptance corrections, dependency/package changes |
| `frontend-ux-polish` | Frontend UX Polish Gate | User-facing frontend copy, display labels, loading/success/failure/empty/error states, form validation, and browser smoke for existing MVP routes | Backend API/DTO/repository/schema changes, package/lockfile changes, new dependencies, Source import, vector DB, embedding, chunk exposure, auth, versioning, publishing flow |
| `integration-ci` | Integration CI Gate | GitHub Actions orchestration for PostgreSQL, Spring Boot, Vite, and Playwright smoke | API/DTO/UI changes, product features, Source import, vector DB, embedding, chunk exposure, auth, permissions, publishing flow |

## Harness Documentation Gate

Allowed:

- Update Harness rules and workflow documentation.
- Update branch/worktree/integration workflow documentation.
- Update current Harness state, registry indexes, backlog, raw requirements, user stories, task log, decision log, audit report, branch log, and project state when the active Gate requires traceability.
- Update check scripts only when the task explicitly concerns verification mechanics.

Forbidden unless explicitly confirmed:

- Add or change business implementation.
- Add dependencies or modify package/lockfiles.
- Connect real APIs, database, auth, permissions, approval, export, or batch operations.
- Change production status codes, business formulas, settlement rules, or charge factors.

Required verification:

- `git diff --check`
- `bash scripts/check.sh`

## Frontend UX Polish Gate

Use this gate for Frontend UX Polish v0.1.

Allowed:

- Localize user-facing copy on the existing MVP frontend routes.
- Add or update display label utilities for statuses, source types, index states, retrieval confidence, actions, empty states, loading states, and user-readable errors.
- Standardize create, edit, retrieval, API-loading, empty, and error feedback using existing frontend components.
- Tighten WikiNode create/edit form validation without changing DTOs or backend contracts.
- Expand existing Playwright/browser smoke coverage for the requested acceptance paths.
- Add frontend UX guidelines and link them from README.

Required checks:

- Backend unit/contract gate: `mvn test`.
- Frontend lint gate: `pnpm run lint`.
- Frontend build gate: `pnpm run build`.
- API smoke gate: `./scripts/api-smoke.sh`.
- Browser smoke gate: `pnpm run test:e2e`.
- Harness gate: `bash scripts/check.sh`.

Forbidden unless explicitly confirmed by the user:

- Backend API, DTO, repository, or database migration changes.
- Package or lockfile changes.
- New dependencies or toast packages.
- New business features, routes, real external integrations, Source import, vector database, embedding, chunk exposure, permissions, version management, or publishing approval flow.

## Integration CI Gate

Use this gate for the next task that wires PostgreSQL integration CI and Playwright smoke CI into GitHub Actions.

Allowed:

- Update `.github/workflows/ci.yml` to add a PostgreSQL-backed integration job.
- Configure a PostgreSQL service in GitHub Actions.
- Set `WIKINODE_DB_URL`, `WIKINODE_DB_USERNAME`, and `WIKINODE_DB_PASSWORD` for the CI backend process.
- Start Spring Boot in CI and verify `/api/wiki-nodes`.
- Install Playwright Chromium in CI.
- Start or reuse the Vite dev server and run `pnpm run test:e2e`.
- Update README and Harness docs for the new CI gate.

Required checks:

- Backend unit/contract gate: `mvn test`.
- Frontend quality gate: `pnpm install --frozen-lockfile`, `pnpm run lint`, `pnpm run build`.
- PostgreSQL integration gate: GitHub Actions starts PostgreSQL, runs Spring Boot with Flyway migrations, and verifies `/api/wiki-nodes`.
- Browser smoke gate: GitHub Actions runs `pnpm run test:e2e` against `/wiki-nodes` and `/retrieval-test`.
- Harness gate: `bash scripts/check.sh`.

Forbidden unless explicitly confirmed by the user:

- API route changes.
- DTO or retrieval contract changes.
- UI/page behavior changes.
- Source import.
- Vector database.
- Embedding.
- Chunk exposure.
- Permissions, version management, or publishing approval flow.
- Expanding Playwright smoke beyond `/wiki-nodes` and `/retrieval-test`.
