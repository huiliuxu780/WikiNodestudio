package com.wikinode.studio.model;

import java.util.List;

public record RetrievalLog(
  String logId,
  String query,
  RetrievalQuery.RetrievalFilters filters,
  List<String> returnedNodeIds,
  List<String> matchedSegmentIds,
  long latencyMs,
  String status,
  String errorSummary,
  String createdAt
) {
}
