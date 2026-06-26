package com.wikinode.studio.model;

import java.util.List;
import java.util.Map;

public record IndexSegment(
  String segmentId,
  String nodeId,
  String nodeTitle,
  String objectType,
  String subtype,
  String segmentType,
  String content,
  String title,
  String contentPreview,
  int tokenCount,
  boolean enabled,
  String indexStatus,
  String vectorDocId,
  String lastIndexedAt,
  int retrievalHits,
  Double avgScore,
  List<SourceRef> sourceRefs,
  List<String> sourceRefIds,
  String processingProfile,
  List<IndexSegmentMetadataSummaryItem> metadataSummary,
  String createdAt,
  String updatedAt,
  Map<String, Object> metadata
) {
}
