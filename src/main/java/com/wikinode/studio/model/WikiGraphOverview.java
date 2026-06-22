package com.wikinode.studio.model;

import java.util.List;

public record WikiGraphOverview(
  List<GraphNode> nodes,
  List<GraphEdge> edges
) {
}
