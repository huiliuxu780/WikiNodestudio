package com.wikinode.studio.model;

public record KnowledgeBaseLifecycleResult(
  String kbId,
  String status,
  String summary,
  String archivedAt,
  String updatedAt
) {
}
