# Frontend UX Guidelines

These rules apply to current WikiNode Studio frontend work and future UI changes.

## Button Naming

- Use Chinese verb-object labels for user actions: `创建知识节点`, `保存`, `检索`, `重置`, `重试`.
- Loading buttons must keep the action visible and prevent repeat submission: `创建中...`, `保存中...`, `检索中...`.
- Do not expose backend operation names, DTO names, repository terms, or test helper wording in visible button labels.
- Disabled states must reflect the current operation, not hide the action.

## Status Display

- Status values must be shown through `src/utils/display-labels.ts`.
- Do not add page-local mappings for `draft`, `published`, `indexed`, `failed`, `processing`, source type, sync status, retrieval fields, or common action labels.
- Product-facing examples:
  - `draft` / `DRAFT` -> `草稿`
  - `published` / `PUBLISHED` -> `已发布`
  - `indexed` / `INDEXED` -> `已索引`
  - `failed` / `FAILED` -> `失败`
  - `processing` / `PROCESSING` -> `处理中`
- Technical IDs may remain visible only when they are intentionally metadata, such as `nodeId`.

## Operation Feedback

- Create WikiNode:
  - Disable the submit button while creating.
  - Show `创建中...` during submission.
  - Show `创建成功` after a successful create and route to the detail page.
  - Show `创建失败` with a user-readable cause after failure.
- Edit WikiNode:
  - Disable the save button while saving.
  - Show `保存中...` during submission.
  - Show `保存成功` after save.
  - Show `保存失败` with a user-readable cause after failure.
- Retrieval Test:
  - Disable search while searching.
  - Show `检索中...` during search.
  - Show normal result cards on success.
  - Show `暂无匹配的知识节点` when the response is empty.
  - Show `检索失败` with a user-readable cause after failure.
- API loading failures use the shared error card with `加载失败` and a `重试` action when reload is available.

## Form Validation

- Required fields must have visible Chinese labels and user-readable validation messages.
- WikiNode create requires title, slug, summary, and content.
- WikiNode edit requires title, summary, and content.
- Slug helper text must explain the accepted format: lowercase letters, numbers, and hyphens.
- Duplicate slug errors returned by the API must be translated to `Slug 已存在，请更换后重试`.
- Do not show raw English technical messages as the only visible error copy.

## Loading, Empty, And Error States

- Loading text must be Chinese and specific to the operation where possible.
- Empty states must say what is empty and what it means for the user.
- Error states must separate the title from the cause, for example `加载失败` plus the specific cause.
- Use existing shadcn/ui components before adding new UI dependencies.
- Do not add toast or notification dependencies without an explicit dependency decision.

## Rules For Future Features

- New frontend pages must use `src/utils/display-labels.ts` for shared labels.
- New forms must include required-field validation, duplicate-submit protection, and Chinese helper/error text.
- New API-bound pages must provide a loading state, empty state, error card, and retry action when reload is available.
- Visible UI must not expose `chunk`, DTO names, repository names, mock fallback behavior, or backend implementation terms.
- Source import, vector database, embedding, permissions, version management, and publishing approval remain out of scope unless a new Gate Plan explicitly approves them.
