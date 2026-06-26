# Current Blockers

## Active Blockers

None.

## Active Scope Constraints

- `IM055` may turn Conflicts, Expired Knowledge, and Duplicates into read-only, PM-readable governance surfaces using existing WikiNode, WikiLink, source-evidence, Index Segment, and retrieval-quality signals.
- `IM055` must not add backend API changes, database migrations, automated conflict detection, expiration jobs, duplicate-matching algorithms, resolved or ignore write actions, repair actions, batch operations, export, external vector DB integration, embedding invocation, permissions, publishing approval, package changes, or new dependencies.
- Future frontend work must follow `docs/quality/frontend-ux-guidelines.md`.

## Standing Constraints

- No real external integration without a confirmed task.
- No package or lockfile changes without a confirmed dependency decision.
- No database, auth, permission, approval, export, batch, production formula, settlement, or charge-factor work without a confirmed task.
- No archive execution.
- No vector database, embedding, raw chunk exposure, Source import, permissions, versioning, or publishing approval work unless the active IM explicitly allows it.
