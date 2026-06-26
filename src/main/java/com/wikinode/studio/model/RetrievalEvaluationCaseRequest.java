package com.wikinode.studio.model;

import java.util.List;

public record RetrievalEvaluationCaseRequest(
  String caseId,
  String query,
  RetrievalQuery.RetrievalFilters filters,
  int topK,
  List<String> expectedNodeIds
) {
}
