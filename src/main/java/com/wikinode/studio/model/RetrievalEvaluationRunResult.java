package com.wikinode.studio.model;

import java.util.List;

public record RetrievalEvaluationRunResult(
  List<String> returnedNodeIds,
  List<String> matchedSegmentIds,
  String status,
  String summary
) {
}
