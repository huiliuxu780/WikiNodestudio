package com.wikinode.studio.model;

import java.util.Map;

public record KnowledgeBase(
  String kbId,
  String name,
  String description,
  String businessDomain,
  String type,
  String status,
  String visibility,
  String owner,
  Map<String, Object> settings,
  int wikiNodeCount,
  int sourceCount,
  String archivedAt,
  String createdAt,
  String updatedAt
) {
}
