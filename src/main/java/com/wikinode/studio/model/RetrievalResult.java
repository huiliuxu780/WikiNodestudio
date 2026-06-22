package com.wikinode.studio.model;

import java.util.List;

public record RetrievalResult(
  WikiNode node,
  double score,
  String matchedReason,
  List<String> matchedFields,
  List<WikiLink> incomingLinks,
  List<WikiLink> outgoingLinks
) {
}
