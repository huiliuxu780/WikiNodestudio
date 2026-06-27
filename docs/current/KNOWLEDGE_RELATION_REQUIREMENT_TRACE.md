# Knowledge Relation Requirement Trace

Task: `IM058 Knowledge Relation Requirement Reconciliation`

Date: 2026-06-27

## Purpose

This document reconciles the external `Knowledge Relation Management PRD` with the current WikiNode Studio implementation after `IM056` and `IM057`.

It is not an implementation task. It records what is done, what is partial, what is not started, and which future implementation packets should close the remaining product gaps.

Source PRD:

- `/Users/mac/Downloads/KNOWLEDGE_RELATION_MANAGEMENT_PRD.md`

Current implemented baselines:

- `IM056 Knowledge Relation Management Read Surface`
- `IM057 Knowledge Relation Management Mutation Baseline`

## Current Completion Summary

| Area | Status | Current evidence | Remaining gap |
|---|---|---|---|
| WikiNode relation as first-class information | Partial | WikiNode Inspector has a dedicated `关联关系` tab with structured relations, Markdown WikiLinks, and unresolved links. | WikiNode read/detail display does not yet have the full PRD-style grouped relation summary outside the editor inspector. |
| Markdown WikiLink compatibility | Done | Existing `[[slug]]` and `[[slug|text]]` parsing, links, backlinks, broken links, and graph behavior are preserved. | Markdown-derived links are displayed beside structured relations, but persistence as full `KnowledgeRelation` rows remains limited by current implementation. |
| Structured manual relation CRUD | Partial | `GET/POST/PATCH/DELETE /api/wiki-nodes/{id}/relations` and WikiNode Inspector single-relation add/edit/delete are implemented. | UI is an inline compact form, not the PRD drawer; status editing, target object type selection, target search, display name, and Source/Document/Product targets remain open. |
| Relation type/status/source labels | Partial | Lowercase relation type/status/source labels are mapped to Chinese and displayed in the inspector. | PRD uppercase enum examples are not adopted as wire values; this is an intentional current-contract decision. |
| Relation grouping | Partial | Relation cards show semantic group badges and separate structured relations from Markdown links and unresolved links. | PRD requires separate groups: `适用范围`, `引用知识`, `相关知识`, `替代关系`, `冲突关系`, `来源依据`, `断链 / 待确认`. |
| Broken Links relation context | Partial | Broken Links and inspector unresolved links show source node, anchor/target context, relation type/source/status labels where current data supports it. | Create target, ignore, mark processed, repair, and status lifecycle are not implemented. |
| WikiGraph relation visualization | Partial | React Flow WikiGraph shows node-edge relation graph and existing relation labels. | Relation type/status filters, legend, edge style differences, conflict/broken emphasis, and edge detail inspector are not complete. |
| Relation governance | Not started | No implemented approval, confirm, reject, audit, or version history flow. | Needed for Phase 3 only. |
| Retrieval relation usage | Not started | Retrieval remains WikiNode-centered and may show relation evidence only as context. | No `matchedRelations`, `APPLIES_TO` filter, `REPLACES` suppression, `CONFLICTS_WITH` risk handling, or `DERIVED_FROM` citation behavior. |

## PRD Acceptance Trace

| PRD AC | Requirement | Status | Evidence | Next packet |
|---|---|---|---|---|
| AC-001 | WikiNode editor has independent `关联关系` entry. | Done | `WikiNodeInspector` includes `关联关系` tab. | None. |
| AC-002 | Relations are grouped by type. | Partial | Relation cards have semantic group labels; structured/Markdown/unresolved sections are separated. | IM059 relation tab grouping and drawer polish. |
| AC-003 | Markdown WikiLinks automatically generate reference relations. | Partial | Existing WikiLink parser and outgoing links still work and display as `正文双链`. | IM060 Markdown-to-KnowledgeRelation persistence alignment if needed. |
| AC-004 | UI supports adding relations. | Partial | Single structured relation can be added from WikiNode Inspector. | IM059 add drawer with target search and status field. |
| AC-005 | Relation includes type, status, and source. | Partial | Java/frontend model and V11 schema include status/source; Inspector displays them. | IM059 allow user-visible status edit; IM060 markdown mapping hardening. |
| AC-006 | Relation types and statuses display in Chinese. | Done | Display labels use Chinese in relation UI. | None. |
| AC-007 | Non-Markdown users can add relations. | Partial | Inline form allows add without Markdown syntax. | IM059 full drawer and target search. |
| AC-008 | Manual relation does not have to write back to Markdown. | Done | Manual relation API stores structured relation separately. | None. |
| AC-009 | WikiNode display page shows relation section. | Partial | Editor inspector shows relation section; detail/read display is not fully separated per PRD. | IM059 detail/read relation summary. |
| AC-010 | Graph distinguishes relation types by edge style. | Partial | Graph has edge labels and React Flow canvas. | IM061 graph relation filters and edge legend. |
| AC-011 | Graph supports relation type filters. | Not started | No dedicated relationType/status filter set for all PRD relation categories. | IM061 graph relation filters and edge legend. |
| AC-012 | Broken Links shows relation type and source. | Partial | Broken Links context exists without fake repair actions. | IM062 broken-link governance actions. |
| AC-013 | Broken state is visually clear. | Partial | Broken/unresolved links use destructive status labeling in relation surfaces. | IM062 broken-link lifecycle and repair UI. |
| AC-014 | Conflict relation is visually clear. | Partial | `conflicts_with` relation type exists and labels as conflict. | IM059 relation grouping priority; IM061 graph conflict edge treatment. |
| AC-015 | Legacy Markdown WikiLink remains compatible. | Done | Existing links, backlinks, broken links, tests, and graph behavior remain. | None. |
| AC-016 | Legacy wiki_link data can map to relations. | Partial | UI maps Markdown links to relation display, but not full persisted relation rows. | IM060 markdown-to-structured relation mapping. |
| AC-017 | Toasts use Chinese feedback. | Partial | Existing page feedback is Chinese; relation mutation currently updates UI without the full PRD toast set. | IM059 relation mutation feedback polish. |
| AC-018 | Dark mode badges are readable. | Not verified | No dedicated dark-mode visual acceptance for relation badges. | IM059 visual acceptance sweep. |
| AC-019 | Relation editing. | Partial | Single relation edit exists for target/type/note. | IM059 full edit drawer and status editing. |
| AC-020 | Relation review. | Not started | No confirm/reject/review lifecycle. | IM063 relation governance review. |
| AC-021 | Relation-driven retrieval. | Not started | Retrieval API remains WikiNode-first without relation-driven behavior. | IM064 relation-aware retrieval evidence. |

## User Story Trace

| PRD story | Status | Notes |
|---|---|---|
| US-001 Non-Markdown user adds relation | Partial | Single add path exists, but drawer, target search, and status selection are not complete. |
| US-002 Markdown user keeps WikiLinks | Done | Existing WikiLink behavior remains available and visible. |
| US-003 Business expert views applicability | Partial | `applies_to` exists; grouped read summary is incomplete. |
| US-004 PM views conflict risk | Partial | `conflicts_with` exists and can be displayed; graph conflict emphasis and review lifecycle are incomplete. |
| US-005 Operator views source relation | Partial | Source evidence appears; source-object relation targets and parser records are incomplete. |
| US-006 Operator maintains replacement relation | Partial | `replaces` exists and can be manually saved; graph/retrieval use is incomplete. |
| US-007 Operator handles broken links | Partial | Broken links are visible; repair actions are not implemented. |
| US-008 PM filters graph by relation type | Not started | Requires graph filter/legend slice. |

## Recommended Remaining Packets

These packets are intentionally medium-sized product capabilities, not tiny UI patches.

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

Do `IM059 Knowledge Relation Editor Experience Completion` next.

Reason:

- It closes the largest PM-visible gap in Phase 2.
- It makes the manual relation flow feel like a real B2B work surface.
- It avoids jumping prematurely into graph, broken-link repair, approval, or retrieval semantics.
