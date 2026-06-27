package com.wikinode.studio.model;

import java.util.List;

public record SourceIngestionRunResult(
  String operationId,
  String sourceId,
  String status,
  String summary,
  int rawMaterialCount,
  int parsedDocumentCount,
  List<String> generatedSuggestionIds,
  List<String> skippedParsedDocumentIds
) {
}
