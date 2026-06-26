package com.wikinode.studio.model;

import java.util.List;

public record RetrievalMatchedSegment(
  String segmentId,
  String nodeId,
  String segmentType,
  double score,
  String contentPreview,
  List<String> sourceRefIds,
  List<IndexSegmentMetadataSummaryItem> metadataSummary
) {
}
