package com.wikinode.studio.model;

public record DraftWikiNodeSuggestionGenerationResult(
  String operationId,
  String parsedDocumentId,
  String status,
  String summary,
  String suggestionId
) {
}
