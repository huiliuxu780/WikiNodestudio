package com.wikinode.studio.model;

public record DraftWikiNodeSuggestionGenerationRequest(
  String conversionProfile,
  String idempotencyKey
) {
}
