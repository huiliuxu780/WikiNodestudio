package com.wikinode.studio.model;

public record DraftWikiNodeSuggestionRetryResult(
  String suggestionId,
  String status,
  String summary,
  String reviewNote,
  String replacementSuggestionId,
  String replacementStatus,
  String operationId
) {
}
