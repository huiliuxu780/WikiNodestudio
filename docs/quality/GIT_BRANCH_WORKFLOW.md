# Git Branch Workflow

This file is the command-level runbook for task branches, worktrees, verification, commits, integration, and push confirmation. `AGENTS.md` remains the highest-level execution rule.

## 1. Task Start

Before every non-trivial task, read:

- `AGENTS.md`
- `docs/current/PROJECT_CONTEXT.md`
- `docs/current/STORY_QUEUE.yaml`
- `docs/current/ACTIVE_TASKS.yaml`
- `docs/current/BLOCKERS.md`
- `docs/quality/GATE_REGISTRY.md`
- Current task files

If the task is not in the current queue, scope is unclear, or allowed/forbidden files are not explicit, output a Gate Plan first and do not develop directly.

## 2. Branch Creation

Direct development on `main` is forbidden.

Recommended task branch:

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c codex/<task-id>-<short-name>
```

If `git pull --ff-only` fails, do not auto merge or rebase `main`; mark blocked and ask for direction.

## 3. Worktree Rules

Use `git worktree` only when all are true:

- there are at least two independent ready tasks
- write scopes do not overlap
- tasks have no dependency on each other
- each worktree can run `bash scripts/check.sh` independently

The main Worker remains responsible for diff review, final verification, commits, and Done Report.

## 4. Development Loop

Only modify current task allowed files. Run local focused checks as needed. Final completion requires:

```bash
git diff --check
bash scripts/check.sh
```

## 5. Final Verification And Commit

1. Run `bash scripts/check.sh`.
2. Update traceability logs and state if required.
3. Run final `git diff --check`.
4. Run final `bash scripts/check.sh`.
5. Check scope diff.
6. Stage only current task files.
7. Commit locally.
8. Output Done Report.

## 6. Push

Remote push is never automatic. Ask before pushing.
