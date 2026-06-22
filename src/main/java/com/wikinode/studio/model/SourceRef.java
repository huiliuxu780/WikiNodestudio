package com.wikinode.studio.model;

public record SourceRef(
  String sourceId,
  String sourceType,
  String sourceTitle,
  String sourceUrl,
  String paragraphRef,
  String version
) {
}
