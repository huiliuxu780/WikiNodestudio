# Knowledge Object Model Spec

Task: `IM011 Knowledge Object Model Rebaseline`

Date: 2026-06-24

## Background

WikiNode Studio already has a WikiNode-centered MVP. The current implementation can manage WikiNodes, WikiLinks, Broken Links, Index Segments, and WikiNode-centered Retrieval Test flows. However, the early MVP `nodeType` field is too small to support commercial knowledge modeling by itself.

This rebaseline keeps `WikiNode` as the product-facing object name while defining a more extensible Knowledge Object model underneath it.

```text
WikiNode = Knowledge Object carrier
```

## Design Principles

- Keep `WikiNode` as the business-facing knowledge object.
- Keep `objectType` as a small built-in platform-level classification.
- Use `subtype` for configurable business classification.
- Use `metadata` for extensible business attributes.
- Use `sourceRefs` for evidence and provenance, not business taxonomy.
- Use `relations` for semantic links between WikiNodes / Knowledge Objects.
- Use `processingProfile` for versioned source-to-WikiNode processing strategy.
- Keep `Index Segment` as the controlled indexing and retrieval unit.
- Preserve current `nodeType` compatibility for MVP screens and filters.

## Why Complete Type Enumeration Is Not Required Upfront

Enterprise knowledge types grow with brands, channels, product lines, source systems, service processes, and regional operations. Forcing all business knowledge types into a fixed enum would make the platform brittle and would require product releases for ordinary business taxonomy changes.

The platform should instead provide a stable core model:

```text
objectType + subtype + metadata + sourceRefs + relations + processingProfile
```

This lets the platform stay stable while business teams configure subtypes, metadata schemas, relation policies, and processing profiles over time.

## objectType Definition

`objectType` is a small built-in platform-level classification. It must not become an open-ended business taxonomy.

Initial built-in objectTypes:

| objectType | Meaning |
|---|---|
| Article | Knowledge article, policy explanation, service口径, FAQ-like guidance, general written knowledge. |
| Product | Brand, product category, product series, product model, product master data. |
| Procedure | Step-by-step process, troubleshooting flow, installation flow, service operation process. |
| DataRecord | Structured record or table-backed knowledge such as spare parts, fee table, BOM, compatibility, price, inventory, service network. |
| MediaAsset | PDF, image, video, product material, training asset, manual attachment, product detail image. |
| Collection | Knowledge package, topic package, product knowledge pack, model knowledge pack, training pack. |
| ExternalSource | Web page, PDF source, database table, API endpoint, Feishu document, PIM, DAM, CRM, file system. |
| Rule | Conditional rule, applicability rule, fee rule, service qualification rule, recommendation rule. |

Do not add objectTypes for brand, category, model, source format, channel, or detailed business scenario.

Examples that must not become `objectType`:

- Siemens
- Bosch
- washing_machine
- refrigerator
- service_fee
- warranty
- pdf
- database
- api
- hotline
- ecommerce

These belong in `subtype`, `metadata`, `sourceRefs`, `tags`, or `processingProfile`.

## subtype Definition

`subtype` is configurable business-level classification. It is expected to grow over time.

Examples:

- service_fee_policy
- warranty_policy
- repair_policy
- service_script
- faq
- product_model
- product_category
- troubleshooting_flow
- installation_flow
- service_operation_process
- spare_part_catalog
- fee_table
- bom_table
- compatibility_table
- user_manual_pdf
- product_material
- training_material
- model_knowledge_pack
- category_knowledge_pack
- fee_rule
- applicability_rule

This task does not build subtype management UI. The model only makes subtype future-configurable.

## metadata Definition

`metadata` stores extensible business attributes.

Examples:

- brand
- productCategory
- productSeries
- modelCode
- businessDomain
- scenario
- serviceType
- channel
- region
- language
- effectiveFrom
- effectiveTo
- owner
- securityLevel
- sourceKind
- lifecycleStatus

Frontend type direction:

```ts
type KnowledgeMetadata = Record<string, unknown>
```

This task does not build a metadata schema designer.

## sourceRefs Definition

`sourceRefs` preserve evidence and provenance. They must not represent business type.

Recommended fields:

- sourceType
- sourceName
- sourceUrl
- sourceRecordId
- snapshotId
- snapshotTime
- evidenceRange
- syncJobId
- confidence

`sourceType` examples:

- web_page
- pdf
- database
- api
- excel
- image
- video
- file
- pim
- dam
- crm
- feishu
- manual_input

Legacy frontend fields such as `sourceId`, `sourceTitle`, `paragraphRef`, and `version` may remain for backward compatibility.

## relations Definition

`relations` represent typed semantic relationships between WikiNodes / Knowledge Objects.

Initial relation types:

- references
- derived_from
- applies_to
- contains
- part_of
- replaces
- conflicts_with
- explains
- has_manual
- has_part_catalog
- has_policy
- has_asset
- related_to

This task does not build relation type management UI.

## processingProfile Definition

`processingProfile` is the versioned strategy for transforming Source / Raw Material / Parsed Document into WikiNode / Knowledge Object.

Important rules:

- `sourceKind` decides how raw material is read.
- `objectType` decides what kind of knowledge object is produced.
- `processingProfile` decides how parsing, cleaning, normalization, segmentation, and validation happen.

Examples:

- web_article_policy_v1
- pdf_manual_article_v1
- pdf_procedure_extract_v1
- db_product_master_v1
- api_part_catalog_v1
- dam_product_asset_v1
- excel_fee_table_v1
- feishu_service_process_v1

This task does not implement parser execution.

## Index Segment Boundary

Index Segment remains the controlled retrieval and indexing unit.

- Do not rename Index Segment to Chunk Management.
- Do not introduce product-facing Chunk Management.
- Retrieval may use Index Segment internally.
- Retrieval results must remain WikiNode-centered.

```text
WikiNode / Knowledge Object
  -> Index Segment
  -> External vector store
  -> Retrieval API
  -> WikiNode result
```

## Backward Compatibility With nodeType

`nodeType` is an MVP-era UI classification used by existing routes, filters, badges, and tests. It remains available for current frontend compatibility.

Commercial modeling should use:

```text
objectType + subtype + metadata
```

Recommended compatibility policy:

- Keep `nodeType` until current UI filters and editor affordances are replaced.
- Do not expand `nodeType` into every business taxonomy value.
- Avoid adding brand, product category, source format, or channel values to `nodeType`.
- Use `subtype` and `metadata` for future configurable business classification.

## Example Mappings

| Example | objectType | subtype | sourceKind | processingProfile |
|---|---|---|---|---|
| Siemens service fee web page | Article | service_fee_policy | web_page | web_article_policy_v1 |
| Siemens washing machine spare part API/database | DataRecord | spare_part_catalog | api or database | api_part_catalog_v1 or db_part_catalog_v1 |
| Siemens washing machine model master data | Product | product_model | database | db_product_master_v1 |
| Manual PDF | MediaAsset | user_manual_pdf | pdf | pdf_manual_asset_v1 |
| Troubleshooting flow | Procedure | troubleshooting_flow | document | doc_troubleshooting_procedure_v1 |
| Service operation process | Procedure | service_operation_process | feishu | feishu_service_process_v1 |
| Fee rule | Rule | fee_rule | table or rule_config | rule_fee_table_v1 |
| Product knowledge pack | Collection | model_knowledge_pack | manual_input | manual_collection_v1 |

## Future Configuration Direction

Future product work may add configuration for:

- Allowed subtypes per objectType.
- Metadata schema per subtype.
- Relation policies per objectType/subtype.
- Processing profile registry.
- SourceKind to processingProfile defaults.
- Validation rules before publishing.
- Index Segment generation strategy per objectType/subtype.

These are future configuration surfaces. They are not part of this task.

## Product Boundary Check

This model does not introduce:

- Agent product scope.
- Chatbot product scope.
- Workflow builder scope.
- MCP.
- IM.
- Local vector database.
- Product-facing Chunk Management.
- Real parser execution.
- Source import execution.
- Auth / RBAC / permissions.
- Audit log implementation.
- Backend schema migration.
- Java model expansion.
- Real vector sync.

## Acceptance Criteria

1. Knowledge Object Model Spec exists and is clear.
2. The project no longer conceptually depends on fully enumerating business knowledge types upfront.
3. `objectType` is documented as small built-in platform-level classification.
4. `subtype` is documented as future-configurable business classification.
5. `metadata` is documented as extensible business attributes.
6. `sourceRefs` are documented as evidence/provenance.
7. `relations` are documented as semantic links between WikiNodes.
8. `processingProfile` is documented as versioned Raw-to-WikiNode strategy.
9. Mock data demonstrates commercial extensibility.
10. Existing WikiNode, WikiLink, Broken Links, Retrieval Test, WikiGraph, and Index Segment behavior remains stable.
11. Index Segment naming remains intact.
12. Retrieval result remains WikiNode-centered.
13. No out-of-scope product area is introduced.
