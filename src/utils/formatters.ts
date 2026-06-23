export {
  indexStatusLabels,
  nodeTypeLabels,
  statusLabels,
} from "@/utils/display-labels"

export function compactDate(value: string) {
  return value.replace("2026-", "")
}

export function toPercent(value: number) {
  return `${Math.round(value * 100)}%`
}
