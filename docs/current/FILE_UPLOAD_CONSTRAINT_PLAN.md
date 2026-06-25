# File Upload Constraint Plan

Task: `IM032 File Upload Planning`

Date: 2026-06-25

Status: planning baseline only.

## 1. Purpose

This document defines the constraints required before WikiNode Studio can implement file upload for Raw Materials.

IM032 does not implement upload UI, storage writes, backend upload endpoints, parser execution, retry execution, credentials, permissions, approval, export, or batch operations. It only fixes the product and engineering boundaries for a future approved implementation task.

## 2. Product Position

File upload is a Source-to-Raw-Material capture path.

The expected future chain is:

```text
Manual or configured Source
  -> uploaded file as Raw Material
  -> Parsed Document after an approved parser operation
  -> WikiNode draft after manual governance
  -> Index Segment after publish/index flow
```

Product invariants:

- Uploaded files become Raw Material evidence, not WikiNodes.
- Parser execution is a separate approved operation after upload.
- WikiNode remains manually governable and reviewable.
- Index Segment remains generated from curated WikiNode content.
- Retrieval API returns WikiNodes, not raw file chunks.

## 3. Supported File Types

Initial future implementation should allow only document-like knowledge inputs:

| Category | MIME types | Extensions | Intended Raw Material type |
|---|---|---|---|
| PDF document | `application/pdf` | `.pdf` | `file` |
| Word document | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `.docx` | `file` |
| Excel workbook | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | `.xlsx` | `file` |
| Plain text | `text/plain` | `.txt` | `file` |
| Markdown | `text/markdown`, `text/plain` with `.md` extension | `.md` | `file` |

Explicitly deferred:

- Images as primary knowledge files.
- Audio and video.
- Archives such as `.zip`, `.rar`, `.7z`.
- Executables, scripts, installers, macros, and binary unknowns.
- Legacy `.doc` / `.xls` unless a separate parser and security boundary is approved.

## 4. Size Limits

Recommended first implementation limits:

- Per-file maximum: `25 MB`.
- Batch size: not supported in the first implementation.
- One request uploads exactly one file.
- Empty files are rejected.
- Files whose stream length differs from declared size are rejected.

Future changes above `25 MB` should be treated as a separate performance/storage decision because they affect timeout, storage, virus scan, and parser scheduling behavior.

## 5. Storage Provider Boundary

The first upload implementation must not expose object storage credentials or direct write locations to the browser.

Allowed first shape:

- Browser posts the file to a backend upload endpoint after explicit approval.
- Backend validates type and size.
- Backend writes to a configured managed storage provider.
- Backend stores only an opaque `storageRef`, `contentHash`, provider label, and metadata in Raw Material records.

Forbidden first shape:

- Browser receives bucket credentials.
- Browser receives signed write URLs unless a separate security review approves them.
- Product UI displays bucket names, access tokens, internal filesystem paths, or signed URLs.
- Upload response triggers parser execution automatically.

## 6. Security And Scan Boundary

Upload implementation must define a safe handling stage before the file can become a parsed candidate.

Minimum future security checks:

- Extension allowlist.
- MIME type allowlist.
- Content sniffing where practical.
- File size validation before storage write.
- Content hash calculation.
- Duplicate hash detection as advisory evidence, not automatic merge.
- Malware or virus scan boundary before parser execution.

If malware scanning is not available in the first implementation, the upload feature must remain disabled or limited to a clearly marked local/dev-only path. Production upload should not be enabled without a scan decision.

## 7. Error Messages

Future upload errors must be user-safe and Chinese-readable.

Recommended user-facing messages:

| Condition | Message |
|---|---|
| Unsupported type | `暂不支持该文件类型，请上传 PDF、DOCX、XLSX、TXT 或 Markdown 文件。` |
| File too large | `文件超过 25 MB，请拆分或压缩内容后再上传。` |
| Empty file | `文件内容为空，请选择有效文件。` |
| Scan pending | `文件已接收，正在等待安全检查。` |
| Scan failed | `文件未通过安全检查，不能进入解析流程。` |
| Storage write failed | `文件保存失败，请稍后重试或联系管理员。` |
| Duplicate hash | `检测到内容可能重复，请确认是否仍需保留新的 Raw Material。` |

Messages must not expose stack traces, bucket paths, storage credentials, parser internals, or security scanner details.

## 8. Cleanup And Retry Behavior

Upload cleanup must be explicit and conservative:

- If validation fails before storage write, no Raw Material is created.
- If storage write succeeds but metadata persistence fails, the orphaned storage object must be queued for cleanup.
- If metadata persistence succeeds, Raw Material status should remain pre-parse and not trigger parser execution automatically.
- Retrying upload creates a new Source Operation record in a future approved implementation.
- Upload retry must not reuse a partially failed operation unless idempotency has been explicitly designed.
- Batch cleanup is deferred.

## 9. Future API Candidate

This is not implemented by IM032.

Candidate endpoint for a future approved task:

```http
POST /api/raw-materials/upload
```

Required future request properties:

- Single file payload.
- Source association.
- Optional source version label.
- Idempotency key or operation ID.

Required future response properties:

- Raw Material metadata.
- Source Operation ID.
- Safe status.
- No parser result.
- No storage secret.
- No signed URL.

## 10. Stop Conditions For Implementation

Any future upload implementation must stop for explicit approval if it needs:

- Package or lockfile changes.
- New storage SDK dependency.
- Real object storage credentials.
- Signed URLs.
- Authentication or permission boundaries.
- Malware scanning service integration.
- Parser execution.
- Retry execution.
- Batch upload.
- Export, approval, or audit workflow.

## 11. Recommended Next Task

```text
IM033 Single Raw Material Parse Planning
```

IM033 should remain planning-only unless the user explicitly expands scope. It should define parser profile selection, operation lifecycle, Parsed Document write semantics, safe error summaries, retry constraints, and rollback rules without implementing parser execution.
