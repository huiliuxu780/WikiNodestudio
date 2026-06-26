package com.wikinode.studio.model;

import java.util.List;
import java.util.Map;

public record WikiNode(
  String nodeId,
  String slug,
  String title,
  String nodeType,
  String objectType,
  String subtype,
  Map<String, Object> metadata,
  List<KnowledgeRelation> relations,
  String processingProfile,
  String summary,
  String contentMarkdown,
  List<String> tags,
  String status,
  List<SourceRef> sourceRefs,
  String indexStatus,
  int incomingCount,
  int outgoingCount,
  int brokenLinkCount,
  String createdAt,
  String updatedAt,
  String lastIndexedAt
) {
  public WikiNode(
    String nodeId,
    String slug,
    String title,
    String nodeType,
    String summary,
    String contentMarkdown,
    List<String> tags,
    String status,
    List<SourceRef> sourceRefs,
    String indexStatus,
    int incomingCount,
    int outgoingCount,
    int brokenLinkCount,
    String createdAt,
    String updatedAt,
    String lastIndexedAt
  ) {
    this(
      nodeId,
      slug,
      title,
      nodeType,
      defaultObjectType(nodeType),
      defaultSubtype(nodeType),
      defaultMetadata(status),
      List.of(),
      defaultProcessingProfile(nodeType),
      summary,
      contentMarkdown,
      tags,
      status,
      sourceRefs,
      indexStatus,
      incomingCount,
      outgoingCount,
      brokenLinkCount,
      createdAt,
      updatedAt,
      lastIndexedAt
    );
  }

  private static String defaultObjectType(String nodeType) {
    return switch (nodeType == null ? "" : nodeType) {
      case "product" -> "Product";
      case "procedure", "troubleshooting" -> "Procedure";
      case "fee_rule", "regulation" -> "Rule";
      default -> "Article";
    };
  }

  private static String defaultSubtype(String nodeType) {
    return switch (nodeType == null ? "" : nodeType) {
      case "product" -> "product_model";
      case "procedure" -> "procedure";
      case "troubleshooting" -> "troubleshooting_flow";
      case "fee_rule" -> "fee_rule";
      case "regulation" -> "regulation";
      case "guide" -> "guide";
      case "term" -> "term";
      default -> "service_fee_policy";
    };
  }

  private static Map<String, Object> defaultMetadata(String status) {
    return Map.of(
      "businessDomain", "after_sales",
      "language", "zh-CN",
      "lifecycleStatus", status == null ? "draft" : status
    );
  }

  private static String defaultProcessingProfile(String nodeType) {
    return switch (nodeType == null ? "" : nodeType) {
      case "product" -> "db_product_master_v1";
      case "procedure", "troubleshooting" -> "feishu_service_process_v1";
      case "fee_rule" -> "excel_fee_rule_v1";
      default -> "web_article_policy_v1";
    };
  }
}
