# Current Blockers

## Active Blockers

None.

## Active Scope Constraints

- `IM048` may align WikiNode Knowledge Object Java/DB/API/frontend surfaces, but must not add Source import, parser execution, publishing, embedding, vector sync, permissions, or dependencies.
- `IM049` may implement deterministic local Index Segment generation and trace evidence, but must not call embedding or write to external vector stores.
- `IM050` may add Retrieval API debug evidence, query logs, and evaluation cases, but must keep normal results WikiNode-first and must not introduce Chat API, answer generation, complex scoring, export, or batch automation.
- `IM051` may create a back-half baseline for publishing/index readiness, metadata governance, and admin/audit planning, but must not execute publishing, approval, rollback, batch publish, embedding, external vector sync, auth enforcement, permission checks, RBAC backend, or audit persistence.
- Future frontend work must follow `docs/quality/frontend-ux-guidelines.md`.

## Standing Constraints

- No real external integration without a confirmed task.
- No package or lockfile changes without a confirmed dependency decision.
- No database, auth, permission, approval, export, batch, production formula, settlement, or charge-factor work without a confirmed task.
- No archive execution.
- No vector database, embedding, raw chunk exposure, Source import, permissions, versioning, or publishing approval work unless the active IM explicitly allows it.
