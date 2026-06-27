# Knowledge Relation Requirement Trace

Task: `IM058 Knowledge Relation Requirement Reconciliation`

Date: 2026-06-27

## Purpose

This document reconciles the external `Knowledge Relation Management PRD` with the current WikiNode Studio implementation after `IM056` through `IM064`.

It is not an implementation task. It records what is done, what is partial, what is not started, and which future implementation packets should close the remaining product gaps.

Source PRD:

- `/Users/mac/Downloads/KNOWLEDGE_RELATION_MANAGEMENT_PRD.md`

Current implemented baselines:

- `IM056 Knowledge Relation Management Read Surface`
- `IM057 Knowledge Relation Management Mutation Baseline`
- `IM059 Knowledge Relation Editor Experience Completion`
- `IM060 Markdown WikiLink Relation Mapping Hardening`
- `IM061 WikiGraph Relation Filter and Legend Completion`
- `IM062 Broken Link Governance Actions`
- `IM063 Relation Review and Governance`
- `IM064 Relation-Aware Retrieval Evidence`

## Current Completion Summary

| Area | Status | Current evidence | Remaining gap |
|---|---|---|---|
| WikiNode relation as first-class information | Done for current MVP scope | WikiNode Inspector has a dedicated `关联关系` tab with structured relations, Markdown WikiLinks, unresolved links, grouped relation cards, and editor drawer actions. | Source/Document/Product targets remain future scope. |
| Markdown WikiLink compatibility | Done | Existing `[[slug]]` and `[[slug|text]]` parsing, links, backlinks, broken links, graph behavior, anchor text, target identifier, resolved target, relation source, and relation status display are preserved. | Persisting all Markdown-derived links as separate structured relation rows is not required in the current contract. |
| Structured manual relation CRUD | Done for current MVP scope | `GET/POST/PATCH/DELETE /api/wiki-nodes/{id}/relations` and WikiNode Inspector add/edit/delete are implemented with target WikiNode search, status selection, and drawer UI. | Non-WikiNode targets remain future scope. |
| Relation type/status/source labels | Done | Lowercase current-contract relation type/status/source labels are mapped to Chinese and displayed in Inspector, Broken Links, WikiGraph, and Retrieval debug evidence. | PRD uppercase enum examples remain documentation semantics, not wire values. |
| Relation grouping | Done | Relation cards are grouped by semantic sections including `适用范围`, `引用知识`, `相关知识`, `替代关系`, `风险关系`, `来源依据`, and `断链 / 待确认`. | None for current MVP scope. |
| Broken Links relation context | Done for current MVP scope | Broken Links shows source WikiNode, anchor text, target identifier, resolved target, relation type, relation source, relation status, and safe navigation to source WikiNode. | Repair, ignore, create-target, and batch lifecycle actions are intentionally not implemented. |
| WikiGraph relation visualization | Done for current MVP scope | React Flow WikiGraph has relation type/status filters, legend, edge style differences, conflict/broken emphasis, and edge detail inspector. | No graph database, new layout algorithm, or backend graph rewrite. |
| Relation governance | Done for lightweight current MVP scope | Pending/conflict Knowledge Relations can be confirmed or rejected in the WikiNode Inspector using the existing update contract and relation note field. | Full permission model, approval workflow, audit persistence, and version history remain future scope. |
| Retrieval relation usage | Done for debug evidence scope | Retrieval Test supports optional `matchedRelations` evidence for `applies_to`, `replaces`, `conflicts_with`, and `derived_from` context while keeping primary results WikiNode-first. | No Chat API, answer generation, raw chunk-first output, external vector database implementation, or relation-driven scoring contract change. |

## PRD Acceptance Trace

| PRD AC | Requirement | Status | Evidence | Next packet |
|---|---|---|---|---|
| AC-001 | WikiNode editor has independent `关联关系` entry. | Done | `WikiNodeInspector` includes `关联关系` tab. | None. |
| AC-002 | Relations are grouped by type. | Done | IM059 groups structured Knowledge Relations by semantic sections in the WikiNode Inspector. | None. |
| AC-003 | Markdown WikiLinks automatically generate reference relations. | Done for current contract | IM060 preserves WikiLink parsing and maps saved Markdown links into relation evidence with anchor, target, source, and status. | None. |
| AC-004 | UI supports adding relations. | Done | IM059 adds drawer-based relation creation with target WikiNode search and status field. | None. |
| AC-005 | Relation includes type, status, and source. | Done | Relation type/status/source are displayed consistently across relation surfaces and Markdown-derived evidence where available. | None. |
| AC-006 | Relation types and statuses display in Chinese. | Done | Display labels use Chinese in relation UI. | None. |
| AC-007 | Non-Markdown users can add relations. | Done | IM059 enables add/edit/delete without Markdown syntax through the Inspector drawer. | None. |
| AC-008 | Manual relation does not have to write back to Markdown. | Done | Manual relation API stores structured relation separately. | None. |
| AC-009 | WikiNode display page shows relation section. | Done for current MVP scope | WikiNode Inspector is the current relation work surface with grouped relation summary and edit controls. | None. |
| AC-010 | Graph distinguishes relation types by edge style. | Done | IM061 adds relation filters, legend, conflict/broken styling, and edge detail. | None. |
| AC-011 | Graph supports relation type filters. | Done | IM061 adds relation type and relation status filters. | None. |
| AC-012 | Broken Links shows relation type and source. | Done | IM062 shows source WikiNode, anchor, target identifier, resolved target, type, source, and status. | None. |
| AC-013 | Broken state is visually clear. | Done | Broken/unresolved links use destructive status labeling and safe navigation without fake repair actions. | None. |
| AC-014 | Conflict relation is visually clear. | Done | Conflict relations are risk-styled in Inspector and graph surfaces; pending/conflict review controls are available in IM063. | None. |
| AC-015 | Legacy Markdown WikiLink remains compatible. | Done | Existing links, backlinks, broken links, tests, and graph behavior remain. | None. |
| AC-016 | Legacy wiki_link data can map to relations. | Done for current contract | IM060 maps Markdown WikiLinks into relation evidence without forcing manual relations back into Markdown. | None. |
| AC-017 | Toasts use Chinese feedback. | Done for current MVP scope | Relation create/update/delete/review actions use Chinese labels and feedback in existing UI patterns. | None. |
| AC-018 | Dark mode badges are readable. | Deferred | No dedicated dark-mode visual acceptance was required by current tasks. Existing badge variants remain system-token based. | Future visual QA only. |
| AC-019 | Relation editing. | Done | IM059 supports relation edit drawer and status editing. | None. |
| AC-020 | Relation review. | Done for lightweight scope | IM063 supports confirm/reject with review note using the existing update contract. | None. |
| AC-021 | Relation-driven retrieval. | Done for debug evidence scope | IM064 adds `matchedRelations` as Retrieval Test debug evidence while keeping Retrieval API results WikiNode-first. | None. |

## User Story Trace

| PRD story | Status | Notes |
|---|---|---|
| US-001 Non-Markdown user adds relation | Done | Drawer, target WikiNode search, status selection, edit, and delete are implemented for current WikiNode targets. |
| US-002 Markdown user keeps WikiLinks | Done | Existing WikiLink behavior remains available and visible. |
| US-003 Business expert views applicability | Done | `applies_to` appears in grouped Inspector, graph filters, and Retrieval debug evidence. |
| US-004 PM views conflict risk | Done | `conflicts_with` is visually emphasized and can be reviewed through lightweight confirm/reject controls. |
| US-005 Operator views source relation | Done for current MVP scope | Source-backed relation evidence is displayed; non-WikiNode source target mutation remains future scope. |
| US-006 Operator maintains replacement relation | Done for current MVP scope | `replaces` can be saved as a structured relation and appears in graph/retrieval evidence. |
| US-007 Operator handles broken links | Done for evidence scope | Broken links show context and safe navigation; repair/ignore/create-target actions are intentionally not implemented. |
| US-008 PM filters graph by relation type | Done | IM061 adds relation type and status filters with legend and edge detail. |

## Completed Follow-up Packets

These packets were intentionally medium-sized product capabilities, not tiny UI patches. They are now complete and merged after IM064.

### IM059 Knowledge Relation Editor Experience Completion

Goal: complete the user-facing relation management surface without adding governance workflow.

Scope:

- Replace inline relation form with a compact drawer or side panel.
- Add target WikiNode search.
- Add relation status selection: `有效`, `待确认`.
- Add target object type display with only WikiNode enabled for now.
- Group relation cards by semantic section.
- Add Chinese success/failure feedback for create/update/delete.
- Add detail/read relation summary if current route structure supports it.
- Add Playwright coverage for add, edit, delete, grouping, and empty state.

Non-goals:

- No Source/Document/Product target mutation.
- No approval, confirm, reject, batch, repair, AI suggestion, permissions, or retrieval changes.

### IM060 Markdown WikiLink Relation Mapping Hardening

Goal: make Markdown-derived WikiLinks consistently visible as relationship evidence and decide whether they should persist as structured Knowledge Relations.

Scope:

- Clarify current mapping between WikiLink and KnowledgeRelation.
- Preserve old Markdown syntax.
- Show anchor text, target slug, resolved target, relation source, and broken status consistently.
- Add tests for resolved and unresolved Markdown links after save.

Non-goals:

- No forced write-back from manual relations to Markdown.
- No relation governance workflow.

### IM061 WikiGraph Relation Filter and Legend Completion

Goal: close PRD graph requirements around relation type/status filtering and visual edge semantics.

Scope:

- Relation type filters: all, references, related, applies, replaces, conflicts, derived/source, broken.
- Relation status filters: all, active, broken, pending review, rejected.
- Edge visual treatment for conflict and broken relations.
- Graph legend.
- Edge click relation detail.
- Playwright graph coverage.

Non-goals:

- No graph database, new layout algorithm, new dependency, or backend graph rewrite unless a hard blocker is proven.

### IM062 Broken Link Governance Actions

Goal: turn Broken Links from evidence-only into a controlled governance workspace.

Scope:

- Show source node, anchor, target slug, relation type, relation source, and status.
- Add safe navigation to source WikiNode.
- Add scoped actions only when implemented: mark processed, ignore, or create target as a separate confirmed operation.

Non-goals:

- No batch repair, automatic repair, Source import, parser execution, AI suggestion, permissions, or approval flow.

### IM063 Relation Review and Governance

Goal: add confirm/reject lifecycle for risky relations.

Scope:

- Pending review and rejected state transitions.
- Review note.
- Conflict relation emphasis.
- Audit evidence if existing audit model supports it.

Non-goals:

- No full permission model unless separately approved.

### IM064 Relation-Aware Retrieval Evidence

Goal: use relationships as retrieval evidence while preserving WikiNode-first results.

Scope:

- Add `matchedRelations` debug evidence.
- Surface `APPLIES_TO`, `REPLACES`, `CONFLICTS_WITH`, and `DERIVED_FROM` as explainable retrieval context.
- Keep primary Retrieval API result as WikiNode.

Non-goals:

- No Chat API, answer generation, raw chunk-first output, or external vector database implementation.

## Immediate Recommendation

Close the current Knowledge Relation PRD follow-up queue and define the next medium-sized packet from current product requirements only after an explicit user decision.

Reason:

- IM059 through IM064 have closed the current Knowledge Relation PRD follow-up sequence for MVP scope.
- Remaining items are explicitly deferred capabilities such as non-WikiNode relation targets, full approval/audit workflow, repair actions, permissions, and external vector implementation.
- The next slice should not be inferred from this trace alone.
