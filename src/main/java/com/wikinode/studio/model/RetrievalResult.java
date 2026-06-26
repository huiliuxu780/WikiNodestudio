package com.wikinode.studio.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record RetrievalResult(
  WikiNode node,
  double score,
  String matchedReason,
  List<String> matchedFields,
  List<WikiLink> incomingLinks,
  List<WikiLink> outgoingLinks,
  List<RetrievalMatchedSegment> matchedSegments
) {
}
