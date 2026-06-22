package com.wikinode.studio.model;

public record GraphNode(
  String nodeId,
  String title,
  String nodeType,
  String status,
  String indexStatus,
  int incomingCount,
  int outgoingCount,
  int brokenLinkCount
) {
}
