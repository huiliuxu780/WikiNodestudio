package com.wikinode.studio.model;

public record IndexStatusSummary(
  int totalNodes,
  int indexed,
  int outdated,
  int failed,
  int notIndexed
) {
}
