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
