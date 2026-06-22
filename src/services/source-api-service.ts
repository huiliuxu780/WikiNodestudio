import { listWikiNodes } from "@/services/wiki-node-api-service"
import { listSources as listMockSources } from "@/services/wiki-node-mock-service"
import { apiGet, withMockFallback } from "@/services/api-client"
import type { SourceItem } from "@/types/source"

export function listSources() {
  return withMockFallback(apiGet<SourceItem[]>("/sources"), listMockSources)
}

export async function getNodesBySourceId(sourceId: string) {
  if (!sourceId) return []

  const nodes = await listWikiNodes()
  return nodes.filter((node) => node.sourceRefs.some((source) => source.sourceId === sourceId))
}
