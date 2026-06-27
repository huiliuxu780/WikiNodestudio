package com.wikinode.studio.model;

public record ParsedDocumentSegment(
  String segmentId,
  String parsedDocumentId,
  String rawMaterialId,
  String sourceId,
  int position,
  String segmentType,
  String title,
  String content,
  String contentPreview,
  int tokenCount,
  String sourceLocator,
  String createdAt,
  String updatedAt
) {
}
