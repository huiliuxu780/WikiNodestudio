# Knowledge Relation Management Read Surface Plan

Task: `IM056 Knowledge Relation Management Read Surface`

Date: 2026-06-27

Status note: This document is the IM056 read-surface baseline, not the full requirement completion record. After IM057, single Knowledge Relation CRUD exists, but the external PRD is still only partially complete. Use `docs/current/KNOWLEDGE_RELATION_REQUIREMENT_TRACE.md` for the current requirement completion matrix and remaining packet plan.

## Purpose

This document turns the external `Knowledge Relation Management PRD` into the current WikiNode Studio execution baseline and implementation plan.

The outcome of `IM056` is a complete read-only relation-management surface using the current frontend, API, and data contracts. It implements what the existing contract can support now: a first-class WikiNode relation tab, relation type/source/status display, Markdown WikiLink context, Broken Links relation context, and Playwright acceptance coverage.

It still does not implement relation CRUD, database migrations, new backend endpoints, graph algorithms, automatic repair, import execution, vector retrieval, or AI relation suggestions.

The core product decision is:

```text
Markdown WikiLink remains a fast authoring input.
Knowledge Relation becomes a first-class WikiNode information surface.
```

## Source Inputs

- External PRD: `/Users/mac/Downloads/KNOWLEDGE_RELATION_MANAGEMENT_PRD.md`
- Product scope: `docs/current/PRODUCT_SCOPE.md`
- Feature map: `docs/current/FEATURE_MAP.md`
- Knowledge Object model: `docs/current/KNOWLEDGE_OBJECT_MODEL_SPEC.md`
- Current frontend types: `src/types/wiki.ts`
- Current label mapping: `src/utils/display-labels.ts`
- Current Markdown parser: `src/utils/link-parser.ts`
- Current graph builder: `src/utils/knowledge-graph.ts`
- Current backend API: `src/main/java/com/wikinode/studio/api/WikiNodeController.java`
- Current relation models:
  - `src/main/java/com/wikinode/studio/model/KnowledgeRelation.java`
  - `src/main/java/com/wikinode/studio/model/KnowledgeRelationEvidence.java`
  - `src/main/java/com/wikinode/studio/model/WikiLink.java`
  - `src/main/java/com/wikinode/studio/model/GraphEdge.java`
- Current schema reference: `src/main/resources/db/migration/V8__align_wikinode_knowledge_object_fields.sql`

## Current Contract Audit

| Area | Current state | Gap against PRD |
|---|---|---|
| Markdown WikiLink | `[[target]]` and `[[target|label]]` parse into `WikiLink`; unresolved targets become broken links. | Markdown links default to `reference`; no explicit relation source/status/anchor contract is exposed as first-class relation metadata. |
| Frontend `KnowledgeRelation` | `KnowledgeRelation` exists on `WikiNode.relations` with `targetNodeId`, `relationType`, `direction`, `confidence`, `createdBy`, and evidence source ref. | Missing relation `status`, `source`, anchor/display context, note/description, timestamps, and target object summary fields. |
| Backend `KnowledgeRelation` | Java model and evidence model exist. | Same contract gaps as frontend; no dedicated relation read endpoint. |
| Database | `wiki_node_relations` exists with source node, target node, relation type, direction, confidence, created by, and evidence source ref. | Missing relation status, relation source, anchor text, display label, note, timestamps, and review metadata. Any schema expansion is a future stop-condition task. |
| API | Existing endpoints include outgoing links, backlinks, broken links, graph overview, and graph ego view. | No `GET /api/wiki-nodes/{id}/relations`; no POST/PATCH/DELETE relation endpoints; broken links and graph responses do not expose relation status/source as a unified relation contract. |
| Display labels | `relationTypeLabels` covers current lowercase relation types and broken WikiLink labels. | No shared `relationStatusLabels` or `relationSourceLabels`; PRD uppercase enum names need a mapping decision before implementation. |
| WikiNode detail/editor | Inspector already shows Knowledge Object relation information inside metadata. | No dedicated `关联关系` tab/section with grouped relation cards, relation source/status, target object summary, anchor context, or notes. |
| Broken Links | Page shows unresolved WikiLinks. | It is not yet a relation-governance surface with relation type, relation source, status, source WikiNode, target text, and repair context. |
| WikiGraph | React Flow canvas already draws semantic relation and WikiLink edges. | Graph lacks relation type/status/source filters, legend, and risk-oriented edge treatments for conflicts or broken relations. |
| Retrieval | Retrieval remains WikiNode-centered and can carry relationship evidence as context. | Relationship-driven retrieval behavior is future work and must not expose raw chunk management or Chat API concepts. |

## Product Direction

Knowledge Relation Management should make relationships readable, governable, and traceable around WikiNodes:

- WikiNode remains the business-facing managed object.
- Knowledge Object metadata remains the extensible model surface.
- WikiLink remains the authoring shortcut and textual evidence.
- Knowledge Relation is the structured relationship contract used by detail pages, graph, broken-link governance, and future retrieval evidence.
- Index Segment remains the controlled indexing and retrieval unit; it must not be renamed or surfaced as Chunk Management.

The product must not drift into Agent Platform, Chatbot, Workflow Builder, Vector DB Management, or raw chunk-management language.

## Relation Type Contract

The external PRD uses uppercase enum names. The current codebase already uses lowercase snake-case relation values. To avoid unnecessary churn, future implementation should keep the current lowercase contract unless a dedicated migration task is approved.

| PRD term | Current implementation value | Chinese label direction | Phase 1 status |
|---|---|---|---|
| `REFERENCES` | `references` / legacy `reference` | 引用 | Keep and normalize display. |
| `RELATED_TO` | `related_to` | 相关 | Keep. |
| `APPLIES_TO` | `applies_to` | 适用于 | Keep. |
| `REPLACES` | `replaces` | 替代 | Keep. |
| `CONFLICTS_WITH` | `conflicts_with` | 冲突 | Keep. |
| `DERIVED_FROM` | `derived_from` | 来源于 | Keep. |

Current product-specific relation values also remain valid because they already support Knowledge Object scenarios:

- `contains`
- `part_of`
- `explains`
- `has_manual`
- `has_part_catalog`
- `has_policy`
- `has_asset`
- `broken_wikilink` as a graph/display-only unresolved WikiLink marker

## Relation Status Contract

The PRD relation status model is accepted as product direction. IM056 implements frontend read labels and derived display only; backend persistence and schema fields are not expanded.

| Target value | Chinese label | Meaning |
|---|---|---|
| `active` | 有效 | Relation is valid and target exists. |
| `broken` | 断链 | Target is missing or cannot be resolved. |
| `pending_review` | 待确认 | Relation needs human confirmation. |
| `rejected` | 已驳回 | Relation was reviewed and rejected. |

Future backend implementation should use lowercase values in Java and database fields unless a migration plan explicitly chooses another convention.

## Relation Source Contract

The PRD relation source model is accepted as product direction. IM056 implements frontend read labels and derives current display from existing `createdBy`, WikiLink, and evidence data; backend persistence and schema fields are not expanded.

| Target value | Chinese label | Phase direction |
|---|---|---|
| `markdown_link` | 正文双链 | Phase 1 read baseline. |
| `manual` | 人工添加 | Future write task only. |
| `import` | 导入生成 | Future Source operation task only. |
| `system` | 系统生成 | Future deterministic system rule task only. |
| `api` | API 写入 | Future integration task only. |
| `llm_suggested` | AI 推荐 | Deferred; do not expose in MVP UI until explicitly scoped. |

## IM056 Execution Scope

IM056 directly implements the read-only relation baseline:

1. Add or align frontend read types that can show structured relations for a WikiNode.
2. Preserve existing Markdown WikiLink parsing and broken-link behavior.
3. Show relation type, status, source, target title, target object type, source evidence, and anchor/display context where the current data allows it.
4. Clearly distinguish structured relations from Markdown-derived WikiLinks.
5. Keep relation creation, editing, delete, repair, rejection, approval, and batch operations out of scope.

If backend or schema gaps block any requested behavior, this task stops at the current contract and does not add migrations or API changes.

## UI Direction

The frontend implementation uses a compact B2B work-surface style:

- Add a dedicated `关联关系` tab or section in WikiNode detail/editor.
- Group relations by semantic type:
  - 适用范围
  - 引用知识
  - 相关知识
  - 替代关系
  - 冲突关系
  - 来源依据
  - 断链 / 待确认
- Use table/list density for scanning; avoid explanatory cards that read like implementation notes.
- Show target object title, object type, relation type, relation status, relation source, evidence basis, and optional note.
- Keep action buttons hidden until a write-capable task is explicitly approved.
- In Broken Links, show relation context rather than only unresolved text.
- Preserve current WikiGraph behavior; graph filter or legend expansion remains outside IM056 because it is not required to prove the first-class WikiNode relation surface.

## API Direction

Candidate future read endpoint:

```text
GET /api/wiki-nodes/{id}/relations
```

Candidate future write endpoints from the external PRD are not approved for implementation in this task:

```text
POST   /api/wiki-nodes/{id}/relations
PATCH  /api/wiki-nodes/{id}/relations/{relationId}
DELETE /api/wiki-nodes/{id}/relations/{relationId}
```

Those write endpoints cross stop-condition boundaries because they affect relationship persistence, validation, review semantics, permissions, and user-visible mutation behavior.

## Explicit Non-goals

`IM056` does not do:

- New frontend pages.
- Relation add/edit/delete drawer.
- Relation POST/PATCH/DELETE APIs.
- Database migration.
- Backend service expansion.
- Real Source import.
- Parser execution.
- File upload.
- Embedding or vector sync.
- Raw chunk management.
- Chat API, Chatbot, Agent Platform, or Workflow Builder.
- LLM relation suggestion UI.
- Ontology editor.
- Permission, approval, audit, export, or batch operations.
- Package or lockfile changes.

## Stop Conditions for Future Tasks

Future tasks must stop for explicit confirmation before any of these:

- Adding relation persistence fields or a migration.
- Adding relation write APIs.
- Adding manual relation creation, edit, delete, repair, reject, or ignore actions.
- Adding relation source values backed by real external integrations.
- Adding LLM or AI-suggested relations.
- Adding permissions, review workflow, audit trail, batch operations, or export.
- Changing Retrieval API output semantics beyond WikiNode-centered relationship evidence.
- Adding dependencies or modifying package/lock files.

## IM056 Acceptance

- `docs/current/KNOWLEDGE_RELATION_MANAGEMENT_PRD.md` exists and is the current relation-management planning baseline.
- Current state files point to `IM056`.
- Registry indexes include the relation-management contract audit.
- The document separates product direction from implementation permission.
- The document identifies current contract gaps and the implemented read-only frontend surface.
- WikiNode Inspector includes a dedicated `关联关系` surface.
- The relation surface shows structured relations, Markdown WikiLinks, unresolved links, relation type, relation source, relation status, target object, and source evidence where available.
- Broken Links shows unresolved relation context and does not expose fake create, associate, ignore, repair, or batch actions.
- No Java, database, backend API, package, lockfile, or CI files are changed.
- `bash scripts/check-state.sh` and `bash scripts/check.sh` pass.
