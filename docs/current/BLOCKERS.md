# Current Blockers

## Active Blockers

None.

## Active Scope Constraints

- `IM064` may update Retrieval Test debug evidence, retrieval result frontend types, the frontend mock retrieval service, and Playwright coverage.
- `IM064` must preserve WikiNode-first Retrieval API results and show Knowledge Relations only as debug evidence context.
- `IM064` must not change backend API, Java model, database migrations, package files, dependencies, Chat API behavior, answer generation, raw chunk-first output, external vector database implementation, embedding, parser execution, vector sync, Source import, permission model, approval workflow, batch operations, export, or repair actions.
- Future frontend work must follow `docs/quality/frontend-ux-guidelines.md`.

## Standing Constraints

- No real external integration without a confirmed task.
- No package or lockfile changes without a confirmed dependency decision.
- No database, auth, permission, approval, export, batch, production formula, settlement, or charge-factor work without a confirmed task.
- No archive execution.
- No vector database, embedding, raw chunk exposure, Source import, permissions, versioning, or publishing approval work unless the active IM explicitly allows it.
