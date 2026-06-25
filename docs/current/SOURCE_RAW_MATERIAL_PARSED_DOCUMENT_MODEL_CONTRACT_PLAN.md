# Source / Raw Material / Parsed Document Model Contract Plan

Task: `IM026 Source / Raw Material / Parsed Document Model Contract Plan`

Date: 2026-06-25

Status: contract planning only.

## 1. Purpose

This document defines the minimum future model and read-only API contract for the upstream knowledge evidence chain:

```text
Source
  -> Raw Material
  -> Parsed Document
  -> WikiNode / Knowledge Object
  -> Index Segment
  -> Retrieval API returns WikiNodes
```

It is a planning artifact for review before any Java, database, API, migration, parser, upload, external connector, or frontend service wiring work.

## 2. Scope

Allowed in this plan:

- Define candidate entities and fields.
- Define relationships and lifecycle states.
- Define read-only API boundary candidates.
- Define migration and rollout risks.
- Define acceptance gates for a future implementation task.

Explicitly not implemented in IM026:

- No Java model.
- No repository.
- No migration.
- No controller.
- No frontend service wiring.
- No parser execution.
- No upload.
- No Source import.
- No auth connector.
- No permission, approval, export, or batch operation.
- No dependency or package change.

## 3. Product Rules

The future contract must preserve these product rules:

- `WikiNode` remains the primary business knowledge object.
- `Source` is the configured origin of raw enterprise knowledge.
- `Raw Material` is a captured source snapshot or original artifact.
- `Parsed Document` is normalized intermediate content, not final curated knowledge.
- `SourceRef` points from WikiNode / Index Segment evidence back to Source / Raw Material / Parsed Document ranges.
- `Index Segment` is generated from curated WikiNode / Knowledge Object content, not from external vector-store internal chunks.
- `Retrieval API` returns WikiNodes by default.
- No product surface should be named `Chunk Management`, `Chat API`, `Chatbot`, `Agent Platform`, `Workflow Builder`, or `Vector DB Management`.

## 4. Entity Model

### 4.1 Source

Source represents a configured origin of enterprise knowledge.

Candidate fields:

| Field | Type direction | Required | Notes |
|---|---|---|---|
| `sourceId` | string | yes | Stable product ID, e.g. `src-feishu-cc`. |
| `sourceType` | enum string | yes | `feishu`, `pdf`, `word`, `excel`, `web`, `manual`, `api`, `database`, `legacy_kb`, later extensible. |
| `title` | string | yes | User-facing source name. |
| `description` | string | no | User-facing context. |
| `owner` | string | yes | Business owner display name or owner key. |
| `syncStatus` | enum string | yes | Read-only status in the first backend slice. |
| `lastSyncedAt` | timestamp | no | Null when never synced. |
| `generatedNodeCount` | integer | yes | Derived count of linked WikiNodes, not hand edited. |
| `rawMaterialCount` | integer | yes | Derived count. |
| `createdAt` | timestamp | yes | System timestamp. |
| `updatedAt` | timestamp | yes | System timestamp. |

Initial `syncStatus` values:

| Value | Display meaning | Notes |
|---|---|---|
| `not_configured` | 未配置 | Source exists but no real sync has been configured. |
| `pending` | 待同步 | Future job may process it, but IM027 should remain read-only unless approved. |
| `synced` | 已同步 | Has at least one captured Raw Material. |
| `failed` | 同步失败 | Last sync failed; details may be a future log entity. |
| `disabled` | 已停用 | Excluded from future sync. |

### 4.2 Raw Material

Raw Material represents a captured source snapshot or original artifact.

Candidate fields:

| Field | Type direction | Required | Notes |
|---|---|---|---|
| `rawMaterialId` | string | yes | Stable product ID, e.g. `rm-001`. |
| `sourceId` | string | yes | Parent Source. |
| `title` | string | yes | Snapshot or artifact title. |
| `rawMaterialType` | enum string | yes | `file`, `document_snapshot`, `html_snapshot`, `table_extract`, `manual_record`, `api_payload`, `database_rowset`. |
| `sourceVersion` | string | no | External source version or snapshot version. |
| `capturedAt` | timestamp | yes | When the artifact was captured. |
| `contentHash` | string | no | Hash for dedupe and repeatability. |
| `storageProvider` | enum string | yes | `workspace`, `object_storage`, `external_reference`; real storage implementation is deferred. |
| `storageRef` | string | no | Future opaque storage pointer; never expose credentials. |
| `parseStatus` | enum string | yes | Parser lifecycle status. |
| `parsedDocumentCount` | integer | yes | Derived count. |
| `createdAt` | timestamp | yes | System timestamp. |
| `updatedAt` | timestamp | yes | System timestamp. |

Initial `parseStatus` values:

| Value | Display meaning | Notes |
|---|---|---|
| `not_parsed` | 未解析 | No Parsed Document generated. |
| `queued` | 等待解析 | Future parser job queued; not implemented in IM027 unless approved. |
| `parsing` | 解析中 | Future job running. |
| `parsed` | 解析完成 | Has at least one Parsed Document. |
| `failed` | 解析失败 | Parse failed; details may live on Parsed Document or future logs. |
| `skipped` | 已跳过 | Source intentionally not parsed. |

### 4.3 Parsed Document

Parsed Document represents normalized content produced from Raw Material.

Candidate fields:

| Field | Type direction | Required | Notes |
|---|---|---|---|
| `parsedDocumentId` | string | yes | Stable product ID, e.g. `pd-001`. |
| `rawMaterialId` | string | yes | Parent Raw Material. |
| `sourceId` | string | yes | Denormalized for filtering and evidence lookup. |
| `title` | string | yes | Parsed content title. |
| `contentFormat` | enum string | yes | `markdown`, `structured_table`, `json`, `plain_text`, `mixed`. |
| `normalizedContent` | text | yes | Standardized content preview. |
| `metadata` | JSON object | no | Extracted source metadata. |
| `sourceRefs` | JSON array | yes | Ranges back to Raw Material and Source. |
| `parserProfile` | string | yes | Versioned parsing profile, e.g. `feishu_article_v1`. |
| `parseStatus` | enum string | yes | Usually mirrors latest parse result. |
| `parseErrorSummary` | string | no | User-safe error summary. |
| `createdAt` | timestamp | yes | System timestamp. |
| `updatedAt` | timestamp | yes | System timestamp. |

`normalizedContent` must remain pre-WikiNode evidence. It is not a final managed knowledge object and should not be indexed as the primary Retrieval API result.

### 4.4 SourceRef

SourceRef is the evidence pointer used by WikiNode and Index Segment surfaces.

Candidate fields:

| Field | Type direction | Required | Notes |
|---|---|---|---|
| `sourceId` | string | yes | Origin Source. |
| `rawMaterialId` | string | no | Raw Material snapshot. |
| `parsedDocumentId` | string | no | Parsed Document evidence. |
| `locatorType` | enum string | yes | `paragraph`, `page`, `row`, `cell`, `heading`, `range`, `timestamp`, `record`. |
| `locator` | string | yes | Human/debug readable locator. |
| `excerpt` | string | no | Short evidence snippet. |
| `confidence` | number | no | 0 to 1 evidence confidence where available. |

SourceRef should be reusable by:

- WikiNode source evidence.
- Knowledge Object metadata.
- Index Segment evidence.
- Retrieval debug evidence.

## 5. Relationships

Minimum relationship direction:

```text
Source 1 -> N Raw Material
Raw Material 1 -> N Parsed Document
Parsed Document N -> N WikiNode through SourceRef evidence
WikiNode 1 -> N Index Segment
Index Segment N -> N SourceRef evidence
```

Important constraints:

- A Raw Material must have exactly one Source.
- A Parsed Document must have exactly one Raw Material.
- A Parsed Document may support zero, one, or many WikiNodes.
- A WikiNode may reference evidence from many Parsed Documents or Raw Materials.
- A Source may have zero Raw Materials during early configuration, but that does not imply import is implemented.

## 6. Read-Only API Contract Candidates

These endpoints are candidates for the first implementation slice after approval. They intentionally avoid write operations.

```http
GET /api/sources
GET /api/sources/{sourceId}
GET /api/sources/{sourceId}/raw-materials
GET /api/raw-materials
GET /api/raw-materials/{rawMaterialId}
GET /api/raw-materials/{rawMaterialId}/parsed-documents
GET /api/parsed-documents/{parsedDocumentId}
```

### 6.1 Source List Response

Candidate shape:

```json
{
  "items": [
    {
      "sourceId": "src-feishu-cc",
      "sourceType": "feishu",
      "title": "CC 售后政策飞书空间",
      "owner": "Rivers",
      "syncStatus": "synced",
      "lastSyncedAt": "2026-06-20T10:35:00+08:00",
      "rawMaterialCount": 2,
      "generatedNodeCount": 4
    }
  ]
}
```

### 6.2 Raw Material Detail Response

Candidate shape:

```json
{
  "rawMaterialId": "rm-001",
  "sourceId": "src-feishu-cc",
  "title": "售后政策空间快照",
  "rawMaterialType": "document_snapshot",
  "sourceVersion": "2026-06-20",
  "capturedAt": "2026-06-20T10:35:00+08:00",
  "storageProvider": "workspace",
  "storageRef": "workspace://snapshots/rm-001",
  "parseStatus": "parsed",
  "parsedDocumentCount": 1
}
```

### 6.3 Parsed Document Detail Response

Candidate shape:

```json
{
  "parsedDocumentId": "pd-001",
  "rawMaterialId": "rm-001",
  "sourceId": "src-feishu-cc",
  "title": "售后政策空间快照解析结果",
  "contentFormat": "markdown",
  "parserProfile": "feishu_article_v1",
  "parseStatus": "parsed",
  "normalizedContent": "# 售后政策\n\n...",
  "metadata": {
    "language": "zh-CN",
    "businessDomain": "after_sales"
  },
  "sourceRefs": [
    {
      "sourceId": "src-feishu-cc",
      "rawMaterialId": "rm-001",
      "parsedDocumentId": "pd-001",
      "locatorType": "heading",
      "locator": "保修政策/收费例外",
      "excerpt": "保修期内维修不收取人工费...",
      "confidence": 0.92
    }
  ]
}
```

## 7. Write APIs Deferred

These operations are explicitly out of IM026 and must not be implemented in the first read-only backend slice without a new approval:

```http
POST /api/sources
PUT /api/sources/{sourceId}
DELETE /api/sources/{sourceId}
POST /api/sources/{sourceId}/sync
POST /api/raw-materials/upload
POST /api/raw-materials/{rawMaterialId}/parse
POST /api/parsed-documents/{parsedDocumentId}/promote-to-wikinode
```

Reasons:

- They imply real import, upload, parser execution, or destructive operations.
- They may require auth, permissions, audit, approvals, storage access, and external integrations.
- They can change business data and therefore require a separate Gate Plan.

## 8. Migration Direction

If IM027 is approved, the smallest persistence direction should be:

1. Add `sources`.
2. Add `raw_materials` with `source_id`.
3. Add `parsed_documents` with `raw_material_id` and `source_id`.
4. Keep existing WikiNode tables unchanged.
5. Keep existing `wiki_node_source_refs` compatible.
6. Add seed data that mirrors current mock Source / Raw Material / Parsed Document examples.
7. Add read-only API tests before frontend wiring.

Do not add parser jobs, sync jobs, storage adapters, auth connectors, or write endpoints in the same slice.

## 9. Compatibility Notes

Current frontend fields:

- `sourceId`
- `sourceType`
- `title`
- `owner`
- `syncStatus`
- `lastSyncedAt`
- `generatedNodes`
- `rawMaterialId`
- `fileType`
- `storageProvider`
- `parseStatus`
- `parsedDocumentId`

Future backend contract should either:

- keep these product-facing names where possible, or
- provide a narrow frontend mapping layer in a later IM028 task.

Avoid leaking Java or persistence terminology into product UI:

- Do not show DTO.
- Do not show repository.
- Do not show entity table names.
- Do not show raw parser internals.

## 10. Risks

| Risk | Why it matters | Mitigation |
|---|---|---|
| Parser scope creep | Parsed Document can tempt real parser execution. | Keep IM027 read-only and seed-backed. |
| Upload scope creep | Raw Material can imply file upload. | Defer upload to an explicitly approved operation plan. |
| Auth connector scope | Source can imply real Feishu/API credentials. | Start with static seeded sources and no credential fields in UI. |
| Model overreach | Full FEATURE_MAP includes broad source operations. | Implement only the read-only subset first. |
| Retrieval drift | Parsed Document could be treated as retrieval result. | Preserve Retrieval API returns WikiNodes by default. |
| Chunk naming drift | Parsed content may be confused with vector chunks. | Keep Index Segment as controlled retrieval unit; never expose Chunk Management. |

## 11. IM027 Approval Checklist

Before starting any implementation branch, confirm:

- The user explicitly approves Java, DB, API, and migration changes.
- The implementation remains read-only.
- No real Source import, upload, parser execution, or external connector is included.
- No permissions, approval, audit, export, or batch operation is included.
- Seed data mirrors current frontend examples.
- API responses keep WikiNode-centered boundaries and do not expose raw chunks.
- Validation includes `mvn test`, `pnpm lint`, `pnpm build`, `bash scripts/check.sh`, API smoke when relevant, and `git diff --check`.

## 12. Recommended Next Task

Recommended next task:

```text
IM027 Minimal Source / Raw Material / Parsed Document Backend Read-Only Model
```

Only start IM027 after explicit approval because it touches Java, DB, API, and migrations.
