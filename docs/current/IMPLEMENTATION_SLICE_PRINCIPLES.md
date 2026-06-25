# Implementation Slice Principles

Date: 2026-06-25

Status: current slicing guidance.

## 1. Purpose

This document defines how WikiNode Studio should split implementation tasks after MVP v0.2.

The goal is to avoid IM tasks that are too small to validate as product progress, while still keeping hard engineering and product boundaries explicit.

## 2. Core Principle

Split by a PM-verifiable product capability, not by the smallest possible code boundary.

A good IM should let a reviewer answer:

- What can the user now do or inspect?
- What risk boundary did we intentionally preserve?
- Which tests prove the behavior?
- Which future capability remains blocked?

Planning-only IMs are reserved for high-risk boundaries. Low-risk planning updates can be included with a narrow implementation when the implementation uses existing data structures and does not cross a hard stop condition.

## 3. When To Combine

It is acceptable to combine documentation, API, repository, frontend, and tests in one IM when all of these are true:

- The change delivers one coherent user-visible capability.
- The change fits existing product terminology and model boundaries.
- No new dependency, package, lockfile, migration, auth, permission, approval, export, batch, external integration, or storage-secret boundary is crossed.
- The behavior is reversible or non-destructive from the product perspective.
- Verification can cover the full behavior in one local run.

Example:

```text
Review Decision + Reject Operation
```

This can be one IM because rejection mutates only existing Draft WikiNode Suggestion review state, uses existing schema fields, requires a review note, and does not create WikiNode, publish, index, sync vectors, or run parsers.

## 4. When To Split

Split into separate IM tasks when a change crosses any hard boundary:

- New dependency, package, or lockfile change.
- Database migration or durable schema expansion.
- Authentication, permission, approval, export, or batch operation.
- Real external source, storage, parser, AI, vector, or credential integration.
- WikiNode creation or update from imported evidence.
- WikiLink creation.
- Publishing, indexing, Index Segment generation, or vector sync.
- Destructive operation or ambiguous rollback behavior.
- A UI capability that changes the primary product mental model.

Example:

```text
Accept Suggestion To Draft WikiNode
```

This should remain separate because acceptance may create curated WikiNode data and must define duplicate, update, evidence, rollback, and Retrieval API non-impact semantics before implementation.

## 5. PR Shape

Each PR should still stay clean:

- One main product capability per PR.
- Tests should map directly to that capability.
- Documentation updates should explain the capability boundary, not expand the product scope.
- Future work should be named explicitly instead of silently bundled.

Avoid both extremes:

- Too small: one PR only renames a future IM while no behavior is verifiable.
- Too large: one PR combines generation, reject, accept, WikiNode creation, publish, index, and polish.

## 6. Draft WikiNode Suggestion Sequence

After IM040, the preferred sequence is:

1. `IM041 Draft WikiNode Suggestion Review Decision and Reject Operation`
   - Add the slicing principle.
   - Implement single-suggestion rejection with a required review note.
   - Keep accept and WikiNode creation absent.
2. `IM042 Draft WikiNode Suggestion Accept To Draft WikiNode`
   - Separately define and implement the higher-risk acceptance path.
   - Keep publish, index, vector sync, and batch conversion absent.
3. `IM043 Draft WikiNode Suggestion Review Flow Acceptance Sweep`
   - Polish the end-to-end review path after generation, reject, and accept are stable.

## 7. Non-goals

This document does not authorize broad implementation. It only guides task slicing.

Every IM still requires an explicit branch, scoped implementation, local verification, and a Done Report.
