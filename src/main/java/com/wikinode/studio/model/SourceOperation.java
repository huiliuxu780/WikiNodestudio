package com.wikinode.studio.model;

public record SourceOperation(
  String operationId,
  String operationType,
  String sourceId,
  String knowledgeBaseId,
  String rawMaterialId,
  String parsedDocumentId,
  String status,
  String requestedBy,
  String startedAt,
  String finishedAt,
  String summary,
  String errorSummary
) {
  public SourceOperation(
    String operationId,
    String operationType,
    String sourceId,
    String rawMaterialId,
    String parsedDocumentId,
    String status,
    String requestedBy,
    String startedAt,
    String finishedAt,
    String summary,
    String errorSummary
  ) {
    this(
      operationId,
      operationType,
      sourceId,
      null,
      rawMaterialId,
      parsedDocumentId,
      status,
      requestedBy,
      startedAt,
      finishedAt,
      summary,
      errorSummary
    );
  }
}
