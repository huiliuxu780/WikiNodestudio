# Current Blockers

## Active Blockers

None.

## Active Scope Constraints

- `IM001` may modify GitHub Actions only after staying inside the Integration CI Gate.
- `IM004` may read Tencent/WeKnora source outside this repository, but may only write the analysis report and Harness state files in this repository.
- `IM005` may implement frontend shell/mock skeleton files only and must not change backend, database, API, package, or lock files.
- Playwright CI scope should use the current frontend UX smoke coverage without expanding product behavior.
- PostgreSQL CI scope is limited to service startup, Flyway-backed Spring Boot startup, and API availability checks.
- Future frontend work must follow `docs/quality/frontend-ux-guidelines.md`.

## Standing Constraints

- No real external integration without a confirmed task.
- No package or lockfile changes without a confirmed dependency decision.
- No database, auth, permission, approval, export, batch, production formula, settlement, or charge-factor work without a confirmed task.
- No archive execution.
- No vector database, embedding, chunk exposure, Source import, permissions, versioning, or publishing approval work during Integration CI.
