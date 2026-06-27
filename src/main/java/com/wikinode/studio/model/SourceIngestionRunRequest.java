package com.wikinode.studio.model;

public record SourceIngestionRunRequest(
  String conversionProfile,
  String requestedBy
) {
}
