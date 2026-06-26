# Current Blockers

## Active Blockers

None.

## Active Scope Constraints

- `IM057` may add the backend, repository, database migration, frontend service, WikiNode Inspector UI, and tests required for single Knowledge Relation create/update/delete/list operations under one WikiNode.
- `IM057` must not add batch relation operations, approval workflow, AI relation suggestions, graph algorithms, Broken Link repair/create/associate/ignore actions, Source import, parser execution, vector retrieval changes, permissions, package changes, or new dependencies.
- Future frontend work must follow `docs/quality/frontend-ux-guidelines.md`.

## Standing Constraints

- No real external integration without a confirmed task.
- No package or lockfile changes without a confirmed dependency decision.
- No database, auth, permission, approval, export, batch, production formula, settlement, or charge-factor work without a confirmed task.
- No archive execution.
- No vector database, embedding, raw chunk exposure, Source import, permissions, versioning, or publishing approval work unless the active IM explicitly allows it.
