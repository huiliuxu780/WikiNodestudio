package com.wikinode.studio.model;

import java.util.Map;

public record KnowledgeBaseRequest(
  String kbId,
  String name,
  String description,
  String businessDomain,
  String type,
  String status,
  String visibility,
  String owner,
  Map<String, Object> settings
) {
}
