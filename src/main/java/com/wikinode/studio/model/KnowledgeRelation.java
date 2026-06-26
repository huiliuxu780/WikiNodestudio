package com.wikinode.studio.model;

public record KnowledgeRelation(
  String id,
  String sourceNodeId,
  String targetNodeId,
  String relationType,
  String direction,
  Double confidence,
  String createdBy,
  KnowledgeRelationEvidence evidence
) {
}
