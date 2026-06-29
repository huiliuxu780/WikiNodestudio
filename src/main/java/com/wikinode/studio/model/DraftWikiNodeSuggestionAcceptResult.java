package com.wikinode.studio.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record DraftWikiNodeSuggestionAcceptResult(
  String suggestionId,
  String knowledgeBaseId,
  String status,
  String summary,
  String reviewNote,
  String nodeId,
  String nodeStatus,
  Integer indexSegmentCount
) {
}
