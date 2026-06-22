import type { WikiIndexStatus, WikiNodeStatus, WikiNodeType } from "@/types/wiki"

export const nodeTypeLabels: Record<WikiNodeType, string> = {
  policy: "Policy",
  procedure: "Procedure",
  faq: "FAQ",
  product: "Product",
  guide: "Guide",
  troubleshooting: "Troubleshooting",
  term: "Term",
}

export const statusLabels: Record<WikiNodeStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
}

export const indexStatusLabels: Record<WikiIndexStatus, string> = {
  not_indexed: "Not indexed",
  indexed: "Indexed",
  failed: "Failed",
  outdated: "Outdated",
}

export function compactDate(value: string) {
  return value.replace("2026-", "")
}

export function toPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

