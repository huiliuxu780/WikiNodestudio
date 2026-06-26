package com.wikinode.studio.repository;

import com.wikinode.studio.model.IndexSegment;
import com.wikinode.studio.model.IndexSegmentMetadataSummaryItem;
import com.wikinode.studio.model.KnowledgeRelation;
import com.wikinode.studio.model.KnowledgeRelationEvidence;
import com.wikinode.studio.model.ParsedDocument;
import com.wikinode.studio.model.ParsedDocumentSourceRef;
import com.wikinode.studio.model.ParserProfile;
import com.wikinode.studio.model.RawMaterial;
import com.wikinode.studio.model.DraftWikiNodeRelationCandidate;
import com.wikinode.studio.model.DraftWikiNodeSuggestion;
import com.wikinode.studio.model.SourceItem;
import com.wikinode.studio.model.SourceOperation;
import com.wikinode.studio.model.SourceRef;
import com.wikinode.studio.model.WikiNode;
import java.util.List;
import java.util.Map;

final class WikiNodeSeedData {

  private WikiNodeSeedData() {
  }

  static List<SourceItem> sources() {
    return List.of(
      new SourceItem("src-feishu-cc", "feishu", "CC 售后政策飞书空间", "售后运营", "synced", "2026-06-18", 4, 2),
      new SourceItem("src-pdf-dishwasher", "pdf", "洗碗机培训 PDF", "产品培训", "synced", "2026-06-17", 2, 1),
      new SourceItem("src-excel-fee", "excel", "维修收费标准 Excel", "服务财务", "pending", "2026-06-16", 1, 1),
      new SourceItem("src-word-manual", "word", "产品说明书 Word", "产品资料", "synced", "2026-06-15", 1, 1)
    );
  }

  static List<RawMaterial> rawMaterials() {
    return List.of(
      new RawMaterial("rm-001", "src-feishu-cc", "售后政策空间快照", "document_snapshot", "2026.06", "2026-06-20T10:35:00+08:00", "sha256:rm001", "workspace", "workspace://snapshots/rm-001", "parsed", 1, "2026-06-20", "2026-06-20"),
      new RawMaterial("rm-007", "src-feishu-cc", "投诉升级案例补充", "document_snapshot", "2026.06", "2026-06-22T09:00:00+08:00", "sha256:rm007", "workspace", "workspace://snapshots/rm-007", "parsing", 0, "2026-06-22", "2026-06-22"),
      new RawMaterial("rm-002", "src-pdf-dishwasher", "洗碗机培训 PDF", "file", "2026.05", "2026-06-18T15:12:00+08:00", "sha256:rm002", "object_storage", "object://training/rm-002.pdf", "parsed", 1, "2026-06-18", "2026-06-18"),
      new RawMaterial("rm-003", "src-excel-fee", "维修收费标准 Excel", "file", "2026.06", "2026-06-16T09:00:00+08:00", "sha256:rm003", "object_storage", "object://finance/rm-003.xlsx", "parsed", 1, "2026-06-16", "2026-06-16"),
      new RawMaterial("rm-004", "src-word-manual", "产品说明书 Word", "file", "2026.05", "2026-06-12T18:20:00+08:00", "sha256:rm004", "object_storage", "object://manuals/rm-004.docx", "failed", 0, "2026-06-12", "2026-06-12")
    );
  }

  static List<ParsedDocument> parsedDocuments() {
    return List.of(
      new ParsedDocument(
        "pd-001",
        "rm-001",
        "src-feishu-cc",
        "售后政策空间快照解析结果",
        "markdown",
        "# 保修政策\n\n保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。",
        Map.of("language", "zh-CN", "businessDomain", "after_sales"),
        List.of(new ParsedDocumentSourceRef("src-feishu-cc", "rm-001", "pd-001", "heading", "保修政策/收费例外", "保修期内维修不收取人工费", 0.92)),
        "feishu_article_v1",
        "parsed",
        null,
        "2026-06-20",
        "2026-06-20"
      ),
      new ParsedDocument(
        "pd-002",
        "rm-002",
        "src-pdf-dishwasher",
        "洗碗机培训 PDF 解析结果",
        "markdown",
        "# 洗碗机培训\n\n排查时先确认电源、水路和错误码。",
        Map.of("language", "zh-CN", "businessDomain", "product_support"),
        List.of(new ParsedDocumentSourceRef("src-pdf-dishwasher", "rm-002", "pd-002", "page", "P-8", "先检查电源、水路和错误码", 0.88)),
        "pdf_manual_article_v1",
        "parsed",
        null,
        "2026-06-18",
        "2026-06-18"
      ),
      new ParsedDocument(
        "pd-003",
        "rm-003",
        "src-excel-fee",
        "维修收费标准 Excel 解析结果",
        "structured_table",
        "| 项目 | 费用 |\n| --- | --- |\n| 上门检测 | 按服务单收费 |",
        Map.of("language", "zh-CN", "businessDomain", "service_fee"),
        List.of(new ParsedDocumentSourceRef("src-excel-fee", "rm-003", "pd-003", "row", "Sheet1:R2", "上门检测按服务单收费", 0.9)),
        "excel_fee_table_v1",
        "parsed",
        null,
        "2026-06-16",
        "2026-06-16"
      )
    );
  }

  static List<SourceOperation> sourceOperations() {
    return List.of(
      new SourceOperation(
        "op-src-feishu-sync-001",
        "source_sync",
        "src-feishu-cc",
        null,
        null,
        "succeeded",
        "system",
        "2026-06-20T10:30:00+08:00",
        "2026-06-20T10:35:00+08:00",
        "Completed read-only Source sync evidence capture for 2 Raw Materials.",
        null
      ),
      new SourceOperation(
        "op-src-feishu-parse-001",
        "parse_raw_material",
        "src-feishu-cc",
        "rm-001",
        "pd-001",
        "succeeded",
        "system",
        "2026-06-20T10:36:00+08:00",
        "2026-06-20T10:37:00+08:00",
        "Completed read-only Parsed Document evidence preview.",
        null
      ),
      new SourceOperation(
        "op-src-feishu-suggest-001",
        "suggest_wikinode",
        "src-feishu-cc",
        "rm-001",
        "pd-001",
        "succeeded",
        "system",
        "2026-06-20T10:38:00+08:00",
        "2026-06-20T10:39:00+08:00",
        "Created read-only Draft WikiNode Suggestion seed evidence.",
        null
      ),
      new SourceOperation(
        "op-pdf-suggest-001",
        "suggest_wikinode",
        "src-pdf-dishwasher",
        "rm-002",
        "pd-002",
        "succeeded",
        "system",
        "2026-06-18T15:20:00+08:00",
        "2026-06-18T15:21:00+08:00",
        "Created read-only Draft WikiNode Suggestion seed evidence.",
        null
      ),
      new SourceOperation(
        "op-word-parse-001",
        "parse_raw_material",
        "src-word-manual",
        "rm-004",
        null,
        "failed",
        "system",
        "2026-06-12T18:21:00+08:00",
        "2026-06-12T18:22:00+08:00",
        "Parser profile rejected this Raw Material in the read-only seed baseline.",
        "Unsupported document structure in seed evidence."
      )
    );
  }

  static List<DraftWikiNodeSuggestion> draftWikiNodeSuggestions() {
    return List.of(
      new DraftWikiNodeSuggestion(
        "sug-001",
        "pd-001",
        "rm-001",
        "src-feishu-cc",
        "op-src-feishu-suggest-001",
        "保修期内维修服务政策",
        "Article",
        "service_fee_policy",
        "# 保修期内维修服务政策\n\n保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。\n\n该内容仍是待审核 WikiNode 建议，不会自动发布或索引。",
        Map.of("language", "zh-CN", "businessDomain", "after_sales"),
        List.of(new ParsedDocumentSourceRef("src-feishu-cc", "rm-001", "pd-001", "heading", "保修政策/收费例外", "保修期内维修不收取人工费", 0.92)),
        List.of(new DraftWikiNodeRelationCandidate("收费政策", "references", "inferred_from_source_ref", 0.74)),
        0.88,
        "draft",
        null,
        "title_match",
        List.of("标题可能重复"),
        List.of("wn-001"),
        List.of(),
        1,
        1,
        "2026-06-20",
        "2026-06-20"
      ),
      new DraftWikiNodeSuggestion(
        "sug-002",
        "pd-002",
        "rm-002",
        "src-pdf-dishwasher",
        "op-pdf-suggest-001",
        "洗碗机基础排查建议",
        "Procedure",
        "troubleshooting_flow",
        "# 洗碗机基础排查建议\n\n排查时先确认电源、水路和错误码。\n\n该内容仍需人工复核后才能进入 WikiNode。",
        Map.of("language", "zh-CN", "businessDomain", "product_support"),
        List.of(new ParsedDocumentSourceRef("src-pdf-dishwasher", "rm-002", "pd-002", "page", "P-8", "先检查电源、水路和错误码", 0.88)),
        List.of(new DraftWikiNodeRelationCandidate("保修期内维修服务政策", "references", "inferred_from_source_ref", 0.62)),
        0.76,
        "needs_review",
        "需要产品培训负责人复核标题和适用范围。",
        "none",
        List.of(),
        List.of(),
        List.of(),
        1,
        1,
        "2026-06-18",
        "2026-06-18"
      )
    );
  }

  static List<ParserProfile> parserProfiles() {
    return List.of(
      new ParserProfile(
        "feishu_article_v1",
        "飞书文章解析 Profile",
        List.of("document_snapshot"),
        List.of("feishu"),
        "markdown",
        true,
        "v1"
      ),
      new ParserProfile(
        "pdf_manual_article_v1",
        "PDF 手册解析 Profile",
        List.of("file"),
        List.of("pdf"),
        "markdown",
        true,
        "v1"
      ),
      new ParserProfile(
        "excel_fee_table_v1",
        "Excel 收费表解析 Profile",
        List.of("file", "table_extract"),
        List.of("excel"),
        "structured_table",
        true,
        "v1"
      )
    );
  }

  static List<IndexSegment> indexSegments() {
    SourceRef feishuPolicyRef = new SourceRef(
      "src-feishu-cc",
      "feishu",
      "CC 售后政策飞书空间",
      "https://feishu.example.com/wiki/after-sales",
      "P-12",
      "2026.06"
    );
    SourceRef excelFeeRef = new SourceRef(
      "src-excel-fee",
      "excel",
      "维修收费标准 Excel",
      null,
      "Sheet1:R2",
      "2026.06"
    );

    return List.of(
      new IndexSegment(
        "seg-001",
        "wn-001",
        "保修政策",
        "Article",
        "service_fee_policy",
        "body",
        "保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。",
        "保修政策 / Body section segment",
        "保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。",
        28,
        true,
        "indexed",
        "vec-wn-001-body",
        "2026-06-18",
        23,
        0.88,
        List.of(feishuPolicyRef),
        List.of(feishuPolicyRef.sourceId()),
        "feishu_article_v1",
        List.of(
          new IndexSegmentMetadataSummaryItem("objectType", "Article"),
          new IndexSegmentMetadataSummaryItem("subtype", "service_fee_policy"),
          new IndexSegmentMetadataSummaryItem("businessDomain", "after_sales")
        ),
        "2026-06-18",
        "2026-06-18",
        Map.of(
          "nodeType", "policy",
          "status", "published",
          "tags", List.of("保修", "售后", "政策"),
          "objectType", "Article",
          "subtype", "service_fee_policy"
        )
      ),
      new IndexSegment(
        "seg-002",
        "wn-002",
        "收费政策",
        "Article",
        "fee_policy",
        "summary",
        "保外维修、上门服务和配件费用的收费规则。",
        "收费政策 / Summary segment",
        "保外维修、上门服务和配件费用的收费规则。",
        18,
        true,
        "indexed",
        "vec-wn-002-summary",
        "2026-06-17",
        18,
        0.81,
        List.of(excelFeeRef),
        List.of(excelFeeRef.sourceId()),
        "excel_fee_table_v1",
        List.of(
          new IndexSegmentMetadataSummaryItem("objectType", "Article"),
          new IndexSegmentMetadataSummaryItem("subtype", "fee_policy"),
          new IndexSegmentMetadataSummaryItem("businessDomain", "service_fee")
        ),
        "2026-06-17",
        "2026-06-17",
        Map.of(
          "nodeType", "policy",
          "status", "published",
          "tags", List.of("收费", "保外", "维修"),
          "objectType", "Article",
          "subtype", "fee_policy"
        )
      )
    );
  }

  static List<WikiNode> nodes() {
    SourceRef feishuPolicyRef = new SourceRef(
      "src-feishu-cc",
      "feishu",
      "CC 售后政策飞书空间",
      "https://feishu.example.com/wiki/after-sales",
      null,
      "2026.06"
    );

    return List.of(
      new WikiNode(
        "wn-001",
        "wn-001",
        "保修政策",
        "policy",
        "Article",
        "service_fee_policy",
        Map.of(
          "businessDomain", "after_sales",
          "language", "zh-CN",
          "lifecycleStatus", "published"
        ),
        List.of(
          new KnowledgeRelation("rel-wn-001-wn-002", "wn-001", "wn-002", "has_policy", "outgoing", 0.92, "system", new KnowledgeRelationEvidence("ref-web-service-fee")),
          new KnowledgeRelation("rel-wn-001-wn-003", "wn-001", "wn-003", "references", "outgoing", 0.88, "system", new KnowledgeRelationEvidence("ref-web-service-fee"))
        ),
        "web_article_policy_v1",
        "保修期内产品故障的维修原则和例外条件。",
        """
        ## 适用范围

        保修期内的产品故障原则上提供免费维修。

        保修期外维修请参考 [[收费政策]]。
        如涉及人为损坏，请参考 [[人为损坏判定规则]]。
        如客户无法提供购买凭证，请参考 [[购买凭证规则]]。

        """,
        List.of("保修", "售后", "政策"),
        "published",
        List.of(new SourceRef(feishuPolicyRef.sourceId(), feishuPolicyRef.sourceType(), feishuPolicyRef.sourceTitle(), feishuPolicyRef.sourceUrl(), "P-12", feishuPolicyRef.version())),
        "indexed",
        0,
        0,
        0,
        "2026-06-10",
        "2026-06-18",
        "2026-06-18"
      ),
      new WikiNode(
        "wn-002",
        "wn-002",
        "收费政策",
        "policy",
        "保外维修、上门服务和配件费用的收费规则。",
        """
        ## 收费规则

        保修期外维修按服务单收费。
        费用明细来自 [[维修收费标准]]。
        与保内条件冲突时，以 [[保修政策]] 为准。
        """,
        List.of("收费", "保外", "维修"),
        "published",
        List.of(new SourceRef("src-excel-fee", "excel", "维修收费标准 Excel", null, "Sheet1:R2", "2026.06")),
        "indexed",
        0,
        0,
        0,
        "2026-06-11",
        "2026-06-17",
        "2026-06-17"
      ),
      new WikiNode(
        "wn-003",
        "wn-003",
        "人为损坏判定规则",
        "procedure",
        "判定人为损坏时需要采集的证据和处理口径。",
        """
        ## 判定流程

        外观破损、进液、私拆等情况需要记录证据。
        对免费维修疑问，回到 [[保修政策]] 判断。
        """,
        List.of("人为损坏", "证据", "售后"),
        "published",
        List.of(new SourceRef(feishuPolicyRef.sourceId(), feishuPolicyRef.sourceType(), feishuPolicyRef.sourceTitle(), feishuPolicyRef.sourceUrl(), "P-26", feishuPolicyRef.version())),
        "indexed",
        0,
        0,
        0,
        "2026-06-12",
        "2026-06-16",
        "2026-06-16"
      ),
      new WikiNode(
        "wn-004",
        "wn-004",
        "洗碗机故障排查",
        "troubleshooting",
        "洗碗机常见故障的首轮排查步骤。",
        """
        ## 排查步骤

        洗碗机不工作时先检查电源、水路和错误码。
        涉及保内维修时关联 [[保修政策]]。
        """,
        List.of("洗碗机", "排查", "保修"),
        "published",
        List.of(new SourceRef("src-pdf-dishwasher", "pdf", "洗碗机培训 PDF", null, "P-8", "2026.05")),
        "indexed",
        0,
        0,
        0,
        "2026-06-13",
        "2026-06-18",
        "2026-06-18"
      ),
      new WikiNode(
        "wn-005",
        "wn-005",
        "维修收费标准",
        "term",
        "维修费用项目和配件价格的标准说明。",
        """
        ## 标准

        收费标准用于解释 [[收费政策]] 中的费用明细。
        """,
        List.of("收费", "标准", "配件"),
        "published",
        List.of(new SourceRef("src-excel-fee", "excel", "维修收费标准 Excel", null, "Sheet1:R8", "2026.06")),
        "indexed",
        0,
        0,
        0,
        "2026-06-14",
        "2026-06-15",
        "2026-06-15"
      )
    );
  }
}
