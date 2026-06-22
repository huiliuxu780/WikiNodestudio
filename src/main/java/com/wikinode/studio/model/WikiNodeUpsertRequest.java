package com.wikinode.studio.model;

import java.util.List;

public record WikiNodeUpsertRequest(
  String nodeId,
  String slug,
  String title,
  String nodeType,
  String summary,
  String contentMarkdown,
  List<String> tags,
  String status,
  List<SourceRef> sourceRefs,
  String indexStatus,
  String createdAt,
  String updatedAt,
  String lastIndexedAt
) {
}
