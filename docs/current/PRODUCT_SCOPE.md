# Product Scope

## Product Positioning

WikiNode Studio is an enterprise knowledge asset platform for knowledge governance and controlled retrieval.

It sits between enterprise knowledge sources and external vector knowledge bases. It turns raw, multi-source knowledge into manageable WikiNodes, connects them through WikiLinks, generates Index Segments before publishing, syncs those segments to external vector stores, and exposes Retrieval API results centered on WikiNode.

## Core Principle

- Business users manage WikiNodes.
- The system manages Index Segments.
- External vector stores manage embeddings and similarity retrieval.
- Retrieval API returns WikiNodes by default, not raw vector chunks.

## In Scope

- Knowledge Base management.
- Source management.
- Raw Materials and Parsed Documents.
- Parser, Storage, and Normalization configuration.
- WikiNode management.
- WikiLink, Backlinks, Broken Links, and Wiki Graph.
- Index Segment management.
- Publishing, Index status, and Vector Store sync configuration.
- Retrieval API and Retrieval Test.
- Query Logs and Evaluation Cases.
- Tags, Metadata, and Classification.
- Quality Issues and Retrieval Evaluation.
- System Config.
- Users, Roles, Permissions, and Audit Logs.

## Out of Scope

- Agent platform.
- Chatbot.
- Chat conversation UI.
- Workflow builder.
- MCP integration.
- IM integration.
- Building or replacing a vector database.
- Replacing Aliyun, Volcano, or other external vector stores.
- LLM-generated final customer answer as a core platform page.
- Exposing raw vector chunks as the primary retrieval result.

## Naming Rules

- Use `WikiNode` as the primary business knowledge object.
- Use `WikiLink` for node-to-node relationships.
- Use `Index Segment`, `索引片段`, or `召回片段`; do not call the product surface `Chunk Management`.
- Use `Retrieval API`; do not call it `Chat API`.
- Use `matchedSegments` only for debug-mode retrieval evidence.

## MVP Guardrail

The current MVP baseline may implement only the active, confirmed task scope from `docs/current/STORY_QUEUE.yaml` and `docs/current/ACTIVE_TASKS.yaml`.

The full product scope in this file and `docs/current/FEATURE_MAP.md` is a roadmap boundary, not permission to build every module at once.
