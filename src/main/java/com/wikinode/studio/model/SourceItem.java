package com.wikinode.studio.model;

public record SourceItem(
  String sourceId,
  String sourceType,
  String title,
  String owner,
  String syncStatus,
  String lastSyncedAt,
  int generatedNodes,
  int rawMaterialCount,
  String knowledgeBaseId
) {
  public SourceItem(
    String sourceId,
    String sourceType,
    String title,
    String owner,
    String syncStatus,
    String lastSyncedAt,
    int generatedNodes,
    int rawMaterialCount
  ) {
    this(sourceId, sourceType, title, owner, syncStatus, lastSyncedAt, generatedNodes, rawMaterialCount, null);
  }
}
