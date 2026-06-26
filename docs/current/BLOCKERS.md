# Current Blockers

## Active Blockers

None.

## Active Scope Constraints

- `IM053` may deepen Query Logs, Evaluation Cases, and Retrieval Evaluation pages using existing Retrieval API evidence.
- `IM053` must not add backend API changes, database migrations, batch evaluation execution, export, answer generation, scoring engine, external vector DB integration, embedding invocation, permissions, publishing approval, package changes, or new dependencies.
- Future frontend work must follow `docs/quality/frontend-ux-guidelines.md`.

## Standing Constraints

- No real external integration without a confirmed task.
- No package or lockfile changes without a confirmed dependency decision.
- No database, auth, permission, approval, export, batch, production formula, settlement, or charge-factor work without a confirmed task.
- No archive execution.
- No vector database, embedding, raw chunk exposure, Source import, permissions, versioning, or publishing approval work unless the active IM explicitly allows it.
