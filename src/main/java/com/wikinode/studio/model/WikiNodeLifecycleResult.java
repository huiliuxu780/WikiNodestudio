package com.wikinode.studio.model;

public record WikiNodeLifecycleResult(
  String nodeId,
  String knowledgeBaseId,
  String status,
  String indexStatus,
  String summary,
  Integer indexSegmentCount,
  String lastPublishedAt,
  String lastIndexedAt
) {
}
