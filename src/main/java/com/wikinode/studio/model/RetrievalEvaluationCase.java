package com.wikinode.studio.model;

import java.util.List;

public record RetrievalEvaluationCase(
  String caseId,
  String query,
  RetrievalQuery.RetrievalFilters filters,
  int topK,
  List<String> expectedNodeIds,
  RetrievalEvaluationRunResult runResult,
  String createdAt,
  String updatedAt
) {
}
