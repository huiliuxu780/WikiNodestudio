# Current Blockers

## Active Blockers

None.

## Active Scope Constraints

- Next task may modify GitHub Actions only after staying inside the Integration CI Gate.
- Playwright CI scope should use the current frontend UX smoke coverage without expanding product behavior.
- PostgreSQL CI scope is limited to service startup, Flyway-backed Spring Boot startup, and API availability checks.
- Future frontend work must follow `docs/quality/frontend-ux-guidelines.md`.

## Standing Constraints

- No real external integration without a confirmed task.
- No package or lockfile changes without a confirmed dependency decision.
- No database, auth, permission, approval, export, batch, production formula, settlement, or charge-factor work without a confirmed task.
- No archive execution.
- No vector database, embedding, chunk exposure, Source import, permissions, versioning, or publishing approval work during Integration CI.
