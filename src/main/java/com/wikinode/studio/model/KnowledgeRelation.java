package com.wikinode.studio.model;

public record KnowledgeRelation(
  String id,
  String sourceNodeId,
  String targetNodeId,
  String relationType,
  String status,
  String source,
  String direction,
  Double confidence,
  String createdBy,
  String anchorText,
  String note,
  KnowledgeRelationEvidence evidence
) {
  public KnowledgeRelation(
    String id,
    String sourceNodeId,
    String targetNodeId,
    String relationType,
    String direction,
    Double confidence,
    String createdBy,
    KnowledgeRelationEvidence evidence
  ) {
    this(
      id,
      sourceNodeId,
      targetNodeId,
      relationType,
      "active",
      "user".equals(createdBy) ? "manual" : "system",
      direction,
      confidence,
      createdBy,
      null,
      null,
      evidence
    );
  }
}
