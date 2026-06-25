package com.wikinode.studio.model;

public record RawMaterial(
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
}
