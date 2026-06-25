package com.wikinode.studio.model;

public record DraftWikiNodeSuggestionReviewResult(
  String suggestionId,
  String status,
  String summary,
  String reviewNote
) {
}
