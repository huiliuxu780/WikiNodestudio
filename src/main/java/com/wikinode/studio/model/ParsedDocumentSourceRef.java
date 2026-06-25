package com.wikinode.studio.model;

public record ParsedDocumentSourceRef(
  String sourceId,
  String rawMaterialId,
  String parsedDocumentId,
  String locatorType,
  String locator,
  String excerpt,
  Double confidence
) {
}
