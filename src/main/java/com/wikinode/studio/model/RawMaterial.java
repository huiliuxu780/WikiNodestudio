package com.wikinode.studio.model;

public record RawMaterial(
  String rawMaterialId,
  String sourceId,
  String knowledgeBaseId,
  String title,
  String rawMaterialType,
  String sourceVersion,
  String capturedAt,
  String contentHash,
  String storageProvider,
  String storageRef,
  String parseStatus,
  int parsedDocumentCount,
  String createdAt,
  String updatedAt
) {
  public RawMaterial(
    String rawMaterialId,
    String sourceId,
    String title,
    String rawMaterialType,
    String sourceVersion,
    String capturedAt,
    String contentHash,
    String storageProvider,
    String storageRef,
    String parseStatus,
    int parsedDocumentCount,
    String createdAt,
    String updatedAt
  ) {
    this(
      rawMaterialId,
      sourceId,
      null,
      title,
      rawMaterialType,
      sourceVersion,
      capturedAt,
      contentHash,
      storageProvider,
      storageRef,
      parseStatus,
      parsedDocumentCount,
      createdAt,
      updatedAt
    );
  }
}
