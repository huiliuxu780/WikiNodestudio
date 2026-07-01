# IM080 External Source Connector Configuration Baseline Plan

> Product design and execution boundary for the next development packet. This plan defines a local configuration baseline only. It does not authorize real external connector execution.

## Goal

Make Source management credible for a knowledge operator before real connector execution exists.

The operator should be able to answer:

- which Knowledge Base owns this Source
- what source type and ingestion mode it uses
- whether the connection is configured, available, disabled, or failing
- what the last sync/import operation did
- which Raw Materials, Parsed Documents, Draft WikiNode Suggestions, and WikiNodes came from the Source
- what the next safe action is: import a file, inspect evidence, review a suggestion, or fix configuration

## Product Design Brief

Use the current WikiNode Studio B2B SaaS shell and dense operator-console style. Do not use marketing blocks, onboarding prose, explainer-card stacks, or AI-style feature descriptions.

The primary surface is not a connector marketplace. It is a Source ingestion configuration console.

## User Flow

```text
Knowledge Base Detail
  -> Source row
  -> Source Detail
  -> Ingestion Configuration
  -> Raw Material / Parsed Document / Draft WikiNode Suggestion / WikiNode evidence
  -> Processing Records
```

The same flow must also work from:

```text
Sources List
  -> Source Detail
  -> Import File / Processing Records / Evidence Chain
```

## Screen Design

### Sources List

Use a table. Keep the page scannable and operational.

Recommended columns:

- Source
- Knowledge Base
- Source Type
- Ingestion Mode
- Connection Status
- Sync Status
- Last Sync
- Raw Material
- Parsed Document
- WikiNode Suggestions
- Actions

Actions:

- Open Source
- Import File
- View Processing Records

### Source Detail

Use a compact header summary followed by tabs.

Header summary:

```text
Source title | Source type | Knowledge Base | Connection status | Sync status | Last processed time
```

Tabs:

- Overview
- Ingestion Configuration
- Raw Material
- Parsed Document
- WikiNode Suggestions
- Processing Records

### Ingestion Configuration Tab

This is the core IM080 surface.

Fields:

- Source Type: Feishu, File, Web, API, Database, Manual Input
- Ingestion Mode: Manual Import, Scheduled Sync, External Push, Not Configured
- Connection Status: Not Configured, Available, Failed, Disabled
- Sync Policy: Manual, Daily, Weekly, Paused
- Default Parser Profile
- Default Knowledge Base
- Owner
- Last Check Time
- Last Failure Reason

Allowed local actions:

- Save local configuration metadata
- Disable/enable a Source only if the current API already supports safe local state
- Navigate to Import File
- Navigate to Processing Records

Do not present OAuth, real Feishu login, external API test, database connection test, webhook setup, or real scheduled execution as available actions.

### Processing Records Tab

Use a table backed by Source Operation evidence.

Columns:

- Time
- Operation Type
- Status
- Raw Material
- Parsed Document
- Draft WikiNode Suggestion
- Failure Reason
- Operator

### Knowledge Base Detail Integration

The Source tab should remain a Knowledge Base ownership view and expose:

- Source count
- failed or disabled Source count
- latest operation time
- direct Source Detail link
- Import File action for a configured Source

## Data Model Boundary

IM080 may add or expose local Source configuration metadata if needed, but it must not connect to real external systems.

Allowed local metadata:

- `ingestionMode`
- `connectionStatus`
- `syncPolicy`
- `defaultParserProfile`
- `lastCheckedAt`
- `lastFailureReason`

Stop before implementation if these fields require a database migration not already covered by the task confirmation.

## Implementation Tasks

### Task 1: Product Surface Red Tests

Add Playwright coverage that fails first for:

- Sources List shows Source type, Knowledge Base, ingestion mode, connection status, sync status, and evidence counts.
- Source Detail shows a compact header summary and tabs without explainer-card stacks.
- Ingestion Configuration shows local configuration fields and safe actions only.
- Processing Records show Source Operation evidence.
- Knowledge Base Detail Source tab links to Source Detail and Import File.

### Task 2: API and Type Audit

Audit existing Source, Knowledge Base, Raw Material, Parsed Document, Draft WikiNode Suggestion, and Source Operation contracts.

Only add local metadata if required by the accepted IM080 scope. Do not add real connector credentials, tokens, external authorization state, webhook secrets, or external scheduler state.

### Task 3: Sources List Implementation

Upgrade the existing Sources page into a dense Source operations table.

Preserve:

- Knowledge Base ownership
- Source import entry
- Raw Material and WikiNode evidence
- Chinese user-facing labels

### Task 4: Source Detail Configuration Surface

Upgrade Source Detail into the tabbed operator console described above.

Use existing components and current visual system. Avoid nested cards and explanatory page content.

### Task 5: Knowledge Base Integration

Improve the Knowledge Base Detail Source tab so a user can move from a Knowledge Base to a specific Source and see its ingestion configuration and evidence chain.

### Task 6: Verification

Run:

```bash
mvn test
pnpm lint
pnpm build
bash scripts/check.sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 PLAYWRIGHT_API_URL=http://127.0.0.1:8080 pnpm exec playwright test
git diff --check origin/main..HEAD
```

## Explicitly Out of Scope

- real Feishu connector execution
- OAuth or external authorization
- real API/database/web crawler connections
- external scheduler execution
- embedding
- external vector sync
- approval workflow
- RBAC or permission enforcement
- audit persistence
- batch operations
- export
- Agent, Chatbot, Workflow, MCP, IM integration
- product-facing Chunk Management
- package or lockfile changes
