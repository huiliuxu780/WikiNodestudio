package com.wikinode.studio.model;

import java.util.List;
import java.util.Map;

public record DraftWikiNodeSuggestion(
  String suggestionId,
  String parsedDocumentId,
  String rawMaterialId,
  String sourceId,
  String operationId,
  String title,
  String objectType,
  String subtype,
  String contentDraft,
  Map<String, String> metadataDraft,
  List<ParsedDocumentSourceRef> sourceRefs,
  List<DraftWikiNodeRelationCandidate> relationCandidates,
  Double confidence,
  String status,
  String reviewNote,
  String conflictStatus,
  List<String> conflictReasons,
  List<String> matchedWikiNodeIds,
  List<String> matchedSuggestionIds,
  int sourceRefCount,
  int relationCandidateCount,
  String createdAt,
  String updatedAt
) {
}
