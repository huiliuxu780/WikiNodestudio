import { listWikiNodes } from "@/services/wiki-node-api-service"
import { listSources as listMockSources } from "@/services/wiki-node-mock-service"
import type { SourceItem } from "@/types/source"

export function listSources() {
  return Promise.resolve(listMockSources() as SourceItem[])
}

export async function getNodesBySourceId(sourceId: string) {
  if (!sourceId) return []

  const nodes = await listWikiNodes()
  return nodes.filter((node) => node.sourceRefs.some((source) => source.sourceId === sourceId))
}
