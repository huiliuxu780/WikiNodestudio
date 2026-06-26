# Current Blockers

## Active Blockers

None.

## Active Scope Constraints

- `IM048` may align WikiNode Knowledge Object Java/DB/API/frontend surfaces, but must not add Source import, parser execution, publishing, embedding, vector sync, permissions, or dependencies.
- `IM049` may implement deterministic local Index Segment generation and trace evidence, but must not call embedding or write to external vector stores.
- `IM050` may add Retrieval API debug evidence and query logs, but must keep normal results WikiNode-first and must not introduce Chat API or answer generation.
- `IM051` may model publishing/index readiness and job evidence, but must not execute publishing, approval, rollback, batch publish, embedding, or external vector sync.
- `IM052` may add quality/evaluation evidence records, but must not implement complex scoring, export, batch automation, or destructive remediation.
- `IM053` may add tags/metadata governance after Knowledge Object alignment, but must not create a separate object system or permission boundary.
- `IM054` is planning/read-only unless explicitly expanded; no auth enforcement, permission checks, RBAC backend, or audit persistence.
- Future frontend work must follow `docs/quality/frontend-ux-guidelines.md`.

## Standing Constraints

- No real external integration without a confirmed task.
- No package or lockfile changes without a confirmed dependency decision.
- No database, auth, permission, approval, export, batch, production formula, settlement, or charge-factor work without a confirmed task.
- No archive execution.
- No vector database, embedding, raw chunk exposure, Source import, permissions, versioning, or publishing approval work unless the active IM explicitly allows it.
