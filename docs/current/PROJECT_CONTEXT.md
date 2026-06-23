# Current Project Context

## Current Stage

WikiNode Studio MVP Baseline v0.1 is fixed and verifiable.

## Active Boundary

The product baseline includes the React frontend MVP, Spring Boot API, PostgreSQL + Flyway persistence, reset/seed scripts, API smoke, GitHub Actions baseline CI, release documentation, and minimal Playwright browser smoke.

Current development must stay inside confirmed task scope. The standing MVP exclusions remain: no Source import, no vector database, no embedding, no chunk exposure, no permissions, no version management, and no publishing approval flow unless explicitly approved by the user.

## Current Queue

`docs/current/STORY_QUEUE.yaml` and `docs/current/ACTIVE_TASKS.yaml` now identify the next ready engineering hardening task: PostgreSQL integration CI plus Playwright smoke CI.

The frontend UX polish rules are now captured in `docs/quality/frontend-ux-guidelines.md` and should be treated as standing frontend quality guidance for future UI work.

The next implementation pass should update GitHub Actions to orchestrate PostgreSQL, Spring Boot, Vite, and the existing Playwright smoke. It must keep the scope to CI integration only and must not expand product behavior.

## Current Execution Rules

- Read current files by default, not historical archive files.
- Treat `docs/current/**` as the execution queue source.
- Treat `docs/registry/**` as lookup indexes only.
- Do not execute from archive files.
- Keep subagents read-only for `docs/current/**` and `docs/registry/**`; the main Worker is the single writer.
- Run `bash scripts/check-state.sh` for state changes.
- `bash scripts/check.sh` runs strict state checks by default.
- Run `bash scripts/check.sh` before reporting a task complete.

## Current Stop Conditions

- Real external data sources or integrations.
- Database persistence changes unless a matching task is active.
- CI service orchestration beyond PostgreSQL, Spring Boot, Vite, and Playwright Chromium.
- Unconfirmed new dependencies or package/lockfile changes.
- Authentication or permission boundaries.
- Approval, export, batch-operation, or production workflow capabilities.
- Production formula, settlement-rule, or charge-factor changes.
- Destructive or ambiguous Git/file operations.
- Failed final verification.

## Current Recommendation

Next recommended task: implement the Integration CI Gate for PostgreSQL integration CI plus Playwright smoke CI, then verify the GitHub Actions run before expanding browser smoke coverage.
