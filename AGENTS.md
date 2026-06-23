# AGENTS.md

## Project Identity

- Project name: `wikinode-studio`
- Current stage: WikiNode Studio MVP Baseline v0.1 with Codex Harness governance
- Current development mode: Gate Plan controlled, local commit after green check, push only after explicit confirmation unless the user explicitly asks to push
- Goal: keep WikiNode Studio development auditable, scope-bound, and repeatably verifiable.

## Project Root

- The project root is this repository root.
- Codex must use the repository root as the working directory for this project.

## Harness Entry

Before every non-trivial task, Codex must read the default current-state set:

1. `AGENTS.md`
2. `docs/current/PROJECT_CONTEXT.md`
3. `docs/current/PRODUCT_SCOPE.md`
4. `docs/current/DESIGN_REFERENCE.md`
5. `docs/current/STORY_QUEUE.yaml`
6. `docs/current/ACTIVE_TASKS.yaml`
7. `docs/current/BLOCKERS.md`
8. `docs/quality/GATE_REGISTRY.md`
9. Current task files

For product planning, frontend, API, data-model, or roadmap work, Codex must also read `docs/current/FEATURE_MAP.md`. For narrowly scoped governance or CI work, read the relevant `FEATURE_MAP.md` section when the task touches product scope.

Legacy or archive files are not default startup context after the current layer exists.

## Product Scope Source

Long-term product direction lives in:

1. `docs/current/PRODUCT_SCOPE.md`
2. `docs/current/FEATURE_MAP.md`
3. `docs/current/DESIGN_REFERENCE.md`

These files define durable product boundaries and naming rules. They do not authorize broad implementation by themselves; every implementation still requires a current ready story/task or a direct user-confirmed scope.

## State Governance

Detailed state governance rules live in `docs/quality/STATE_MANAGEMENT.md`.

Hard rules:

- Default to reading `docs/current/**`, not archive or legacy history.
- Archive files are historical reference only and are not executable queues.
- `docs/current/**` and `docs/registry/**` follow a single-writer rule: only the main Worker may write them.
- Subagents may review or recommend state changes, but must not directly write current or registry files.
- `docs/registry/TRACE_INDEX.yaml` stores IDs, paths, and relationships only; it must not store `status`.
- Run `bash scripts/check-state.sh` when current or registry state changes.

## Standard Workflow

Every non-trivial task must follow this order:

1. Read the Harness entry files and task context.
2. Output a Gate Plan.
3. Stop for confirmation when the task requires confirmation or triggers a hard stop condition.
4. Work on a task branch, never directly on `main`.
5. Modify only confirmed in-scope files.
6. Run `bash scripts/check.sh`.
7. Update traceability logs and audit evidence when required.
8. Run final verification after log/audit updates.
9. Commit the verified completed scope locally.
10. Output a Done Report.
11. Ask before pushing.

Use `docs/current/DONE_REPORT_TEMPLATE.md` for the product-facing Done Report shape and `docs/quality/DONE_REPORT_TEMPLATE.md` for the Harness traceability minimum.

## Stop Conditions

Hard stop conditions require explicit confirmation:

- new dependencies
- package or lockfile changes
- real external data sources or integrations
- database persistence
- authentication or permission boundaries
- approval, export, or batch-operation capabilities
- production formulas, settlement rules, or charge factors
- destructive or ambiguous Git/file operations
- failed final verification

## Default Scope Constraints

Unless the current user instruction explicitly allows it, Codex must not:

- develop business features
- create frontend pages
- create backend services or databases
- connect real APIs
- add mock business data
- install dependencies
- modify package or lockfiles
- import from archive or external legacy code

## Verification Requirement

- Every task must run `bash scripts/check.sh` before it is reported complete.
- Documentation-only changes also require check.
- If check fails, the Done Report must explain the failure and recommended next action.
