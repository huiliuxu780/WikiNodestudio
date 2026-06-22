package com.wikinode.studio.model;

public record GraphEdge(
  String edgeId,
  String fromNodeId,
  String toNodeId,
  String targetTitle,
  String relationType,
  boolean resolved
) {
}
