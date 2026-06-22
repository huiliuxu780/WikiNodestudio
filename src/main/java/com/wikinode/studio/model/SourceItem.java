package com.wikinode.studio.model;

public record SourceItem(
  String sourceId,
  String sourceType,
  String title,
  String owner,
  String syncStatus,
  String lastSyncedAt,
  int generatedNodes
) {
}
