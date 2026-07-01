# IM081 Source Connector Credential UX and Connection Readiness Plan

> Product design and execution boundary for the next Source connector packet. This plan defines local credential-readiness UX only. It does not authorize real OAuth, real secret storage, real external connection tests, or real external connector execution.

## Goal

Make Source connector readiness understandable to a knowledge operator.

After IM080, operators can see Source ownership, ingestion mode, connection status, sync status, and processing evidence. IM081 adds the missing operator-facing layer around credential readiness and connection-check evidence:

- which credential profile is associated with a Source
- whether credentials are missing, configured, expired, revoked, or not required
- what scope the connector is expected to access
- when readiness was last checked
- what failed and who should fix it
- where to inspect processing records and import fallback evidence

## Product Design Brief

Use the existing WikiNode Studio B2B SaaS shell and dense operator-console style.

Do not create a connector marketplace, onboarding page, AI-style explainer section, or large card stack. Do not put implementation caveats such as mock fallback, local-only, or no real execution into the user-facing page.

The correct UI shape is:

```text
Sources List
  -> Source Detail
  -> 接入配置
  -> 凭据与连接状态
  -> 最近检查 / 失败原因 / 处理记录
```

## User Flow

Primary flow:

```text
Knowledge Base Detail
  -> Source row
  -> Source Detail
  -> 接入配置
  -> check credential readiness status
  -> inspect Processing Records or import fallback evidence
```

Secondary flow:

```text
Sources List
  -> scan credential status and last check result
  -> open Source Detail
  -> inspect readiness detail and owner
```

## Screen Design

### Sources List

Keep the dense table from IM080 and add only the readiness fields operators need for triage.

Recommended columns:

- Source
- Knowledge Base
- Owner
- Source Type
- Ingestion Mode
- Credential Status
- Connection Status
- Sync Status
- Last Check
- Raw Material
- WikiNode Suggestions
- Actions

Actions remain narrow:

- View Source
- Import File

Do not add a real "Connect Feishu", "Test API", "Authorize", "OAuth Login", "Save Secret", or "Schedule Sync" action.

### Knowledge Base Detail Source Tab

Add credential readiness to the Source ownership table so a Knowledge Base owner can see which Sources are operationally blocked.

Recommended fields:

- Source
- Source Type
- Credential Status
- Connection Status
- Sync Status
- Last Check
- Raw Material
- WikiNode Suggestions
- Actions

### Source Detail Header Summary

Add credential readiness beside connection and sync state.

Recommended summary:

```text
Source type
Knowledge Base
Owner
Credential Status
Connection Status
Sync Status
Ingestion Mode
Last Check
```

### Source Detail 接入配置 Tab

Split the current configuration table into two dense sections:

1. Connector Profile
   - Source Type
   - Ingestion Mode
   - Sync Policy
   - Parser Profile
   - Knowledge Base
   - Owner

2. Credential and Connection Readiness
   - Credential Profile
   - Credential Status
   - Credential Scope
   - Connection Status
   - Last Check Time
   - Last Failure Reason
   - Owner

Display secrets only as non-sensitive labels, for example:

```text
feishu-after-sales-space
api-service-readonly
No credential required
```

Never display token values, app secrets, passwords, private keys, cookies, or raw auth headers.

### Processing Records Tab

Keep Source Operation evidence as the place for historical checks.

Connection readiness records should be visible as ordinary Source Operation rows, for example:

- Connection Check
- Credential Refresh Check
- Source Sync
- Parse Raw Material
- Generate WikiNode Suggestions

## Data Model Boundary

Allowed frontend/local fields on `SourceItem`:

- `credentialProfile?: string | null`
- `credentialStatus?: "not_required" | "missing" | "configured" | "expired" | "revoked"`
- `credentialScope?: string | null`
- `credentialOwner?: string | null`
- `lastCredentialCheckedAt?: string | null`

These fields are display metadata only. They do not imply real secret persistence.

Allowed display labels:

- Not Required / 无需凭据
- Missing / 缺少凭据
- Configured / 已配置
- Expired / 已过期
- Revoked / 已撤销

## Explicit Non-goals

IM081 must not implement:

- real OAuth
- real Feishu authorization
- real API key storage
- password, token, app secret, private key, cookie, or auth header input
- encryption or secret management
- real external connection test
- external scheduler
- webhook setup
- database connector execution
- web crawler execution
- embedding
- external vector sync
- approval workflow
- RBAC or permission enforcement
- batch operation
- export
- Agent, Chatbot, Workflow, MCP, IM integration
- product-facing Chunk Management
- package or lockfile changes

## Test Plan

Update Playwright before implementation:

- Source list shows Credential Status and Last Check.
- Source detail summary shows Credential Status without exposing secret values.
- Source detail 接入配置 tab shows connector profile and credential readiness sections.
- Knowledge Base detail Source tab shows credential readiness in the ownership table.
- Source operation records can show connection-check evidence.
- Forbidden product drift terms and secret-looking values are not visible in product UI.

## Verification

Required:

```bash
pnpm lint
pnpm build
bash scripts/check.sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 PLAYWRIGHT_API_URL=http://127.0.0.1:8080 pnpm exec playwright test
git diff --check origin/main..HEAD
```
