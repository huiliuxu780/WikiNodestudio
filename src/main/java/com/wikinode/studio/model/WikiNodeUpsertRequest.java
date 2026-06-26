package com.wikinode.studio.model;

import java.util.List;
import java.util.Map;

public record WikiNodeUpsertRequest(
  String nodeId,
  String slug,
  String title,
  String nodeType,
  String objectType,
  String subtype,
  Map<String, Object> metadata,
  List<KnowledgeRelation> relations,
  String processingProfile,
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
  public WikiNodeUpsertRequest(
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
    this(
      nodeId,
      slug,
      title,
      nodeType,
      null,
      null,
      null,
      null,
      null,
      summary,
      contentMarkdown,
      tags,
      status,
      sourceRefs,
      indexStatus,
      createdAt,
      updatedAt,
      lastIndexedAt
    );
  }
}
