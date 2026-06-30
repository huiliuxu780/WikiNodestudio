# Design Reference

## Application Shell

Use shadcn/ui `new-york-v4` `sidebar-07` as the WikiNode Studio application shell.

Reference URL: https://ui.shadcn.com/view/new-york-v4/sidebar-07

## Layout Rules

The app shell must keep the established structure:

- `SidebarProvider`
- `AppSidebar`
- `SidebarInset`
- Header
- `SidebarTrigger`
- `Separator`
- `Breadcrumb`
- Main content area inside `SidebarInset`

## Product Navigation

`AppSidebar` is the product-level navigation. `WikiNode Explorer` is an internal panel inside the WikiNode Editor. They are not the same thing.

Navigation groups should map to the product scope:

- Platform: Overview, Knowledge Bases, WikiNodes, Wiki Graph, Retrieval Test.
- Knowledge: Sources, Raw Materials, Index Segments, Publishing & Index, Broken Links.
- Governance: Tags & Metadata, Quality, Evaluation.
- System: Settings, Users, Audit Logs.

## Visual Style

- B2B SaaS style.
- Compact and information-dense.
- Work-focused rather than marketing-style.
- Do not invent a separate dashboard layout when the sidebar shell already provides the app structure.
- Keep product copy user-facing; avoid leaking implementation terms such as DTO, repository, mock fallback, or raw chunk.

## WikiNode Editor Layout

Inside `SidebarInset`, the WikiNode Editor should use:

- Main: the current WikiNode Markdown Editor and Preview.
- Right: Inspector Panel.

The WikiNode detail/edit route must stay focused on the current WikiNode. Do not
show a persistent "recent nodes" or all-node explorer inside the editor. Broad
WikiNode discovery belongs on the WikiNode list page, global sidebar navigation,
or a deliberate switcher/search action, not as a fixed panel in the editing
workspace.

Inspector tabs:

- Metadata.
- Links.
- Sources.
- Index.
- Segments.

## Retrieval Display Rule

Retrieval results should display WikiNode-centered results by default. Debug mode may show matched Index Segments as evidence, but the primary user-facing result remains the WikiNode.
