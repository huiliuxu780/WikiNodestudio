package com.wikinode.studio.model;

import java.util.List;

public record RetrievalQuery(
  String query,
  RetrievalFilters filters,
  int topK
) {

  public record RetrievalFilters(
    String nodeType,
    String status,
    List<String> tags
  ) {
  }
}
