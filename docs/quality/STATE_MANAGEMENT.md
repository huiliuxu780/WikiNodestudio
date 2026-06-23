# State Management

## Purpose

This project uses a current/registry/archive state model to reduce default context size while keeping execution traceable and repairable.

## Current Layer

Default execution state lives in:

- `docs/current/PROJECT_CONTEXT.md`
- `docs/current/PRODUCT_SCOPE.md`
- `docs/current/DESIGN_REFERENCE.md`
- `docs/current/STORY_QUEUE.yaml`
- `docs/current/ACTIVE_TASKS.yaml`
- `docs/current/BLOCKERS.md`

Roadmap-level product scope lives in:

- `docs/current/FEATURE_MAP.md`

Only `ready`, `in_progress`, and `blocked` stories/tasks belong in current files. Done history must not accumulate here.

## Registry Layer

Lookup indexes live in:

- `docs/registry/TRACE_INDEX.yaml`
- `docs/registry/DECISION_INDEX.yaml`

`TRACE_INDEX.yaml` stores IDs, paths, and relationships only. It must not store `status`.

## Default Read Set

Before non-trivial execution, read:

1. `AGENTS.md`
2. `docs/current/PROJECT_CONTEXT.md`
3. `docs/current/PRODUCT_SCOPE.md`
4. `docs/current/DESIGN_REFERENCE.md`
5. `docs/current/STORY_QUEUE.yaml`
6. `docs/current/ACTIVE_TASKS.yaml`
7. `docs/current/BLOCKERS.md`
8. `docs/quality/GATE_REGISTRY.md`
9. Current task files

For product planning, frontend, API, data-model, or roadmap work, also read `docs/current/FEATURE_MAP.md`. For narrowly scoped governance or CI work, read the relevant section only when product scope is touched.

Use legacy or archive files only when current state is missing, inconsistent, or the task is explicitly about migration, audit, repair, or historical lookup.

## Single Writer Rule

Only the main Worker may write:

- `docs/current/**`
- `docs/registry/**`

Subagents may inspect relevant files and return recommendations, but they must not directly modify current or registry state.

## History-On-Demand Rule

Archive and legacy history may be read only when:

- the user asks for historical lookup
- current task depends on a historical decision
- current files are insufficient
- documents conflict
- the task is audit, review, rollback, incident investigation, or state repair

## State Check

`scripts/check-state.sh` validates:

- required current and registry files exist
- story IDs are unique
- task IDs are unique
- every ready story has a matching active task
- every active task references an existing current story
- current files do not retain `status: done`
- `TRACE_INDEX.yaml` does not contain `status`
- registry paths exist
- current queue does not execute from archive files
- current files stay under line-count budgets
- `PROJECT_CONTEXT.md` does not accumulate done-history markers
