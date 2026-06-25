package com.wikinode.studio.model;

public record DraftWikiNodeRelationCandidate(
  String targetTitle,
  String relationType,
  String source,
  Double confidence
) {
}
