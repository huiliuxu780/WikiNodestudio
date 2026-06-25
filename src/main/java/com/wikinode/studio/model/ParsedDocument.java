package com.wikinode.studio.model;

import java.util.List;
import java.util.Map;

public record ParsedDocument(
  String parsedDocumentId,
  String rawMaterialId,
  String sourceId,
  String title,
  String contentFormat,
  String normalizedContent,
  Map<String, String> metadata,
  List<ParsedDocumentSourceRef> sourceRefs,
  String parserProfile,
  String parseStatus,
  String parseErrorSummary,
  String createdAt,
  String updatedAt
) {
}
