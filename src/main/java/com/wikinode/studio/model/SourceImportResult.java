package com.wikinode.studio.model;

import java.util.List;

public record SourceImportResult(
  String operationId,
  String sourceId,
  String rawMaterialId,
  String parsedDocumentId,
  String status,
  String summary,
  int segmentCount,
  List<String> segmentIds,
  String suggestionId
) {
}
