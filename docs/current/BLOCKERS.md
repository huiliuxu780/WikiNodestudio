# Current Blockers

## Active Blockers

None.

## Active Scope Constraints

- `IM060` may update frontend WikiLink evidence mapping, display typing, and Playwright coverage for saved Markdown WikiLinks.
- `IM060` must preserve existing `[[target]]` and `[[target|anchor]]` Markdown syntax and keep manual Knowledge Relation editing separate from Markdown write-back.
- `IM060` must not change backend API, Java model, database migrations, package files, dependencies, graph behavior, Broken Link repair actions, retrieval behavior, approvals, permissions, Source import, parser execution, vector sync, AI suggestions, batch operations, or forced manual-relation Markdown write-back.
- Future frontend work must follow `docs/quality/frontend-ux-guidelines.md`.

## Standing Constraints

- No real external integration without a confirmed task.
- No package or lockfile changes without a confirmed dependency decision.
- No database, auth, permission, approval, export, batch, production formula, settlement, or charge-factor work without a confirmed task.
- No archive execution.
- No vector database, embedding, raw chunk exposure, Source import, permissions, versioning, or publishing approval work unless the active IM explicitly allows it.
