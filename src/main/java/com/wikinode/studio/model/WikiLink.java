package com.wikinode.studio.model;

public record WikiLink(
  String linkId,
  String fromNodeId,
  String fromTitle,
  String toNodeId,
  String toTitle,
  String targetTitle,
  String relationType,
  boolean resolved
) {
}
