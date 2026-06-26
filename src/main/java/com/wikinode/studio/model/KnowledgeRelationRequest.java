package com.wikinode.studio.model;

public record KnowledgeRelationRequest(
  String targetNodeId,
  String relationType,
  String status,
  String source,
  Double confidence,
  String anchorText,
  String note,
  String evidenceSourceRefId
) {
}
