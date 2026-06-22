package com.wikinode.studio.repository;

import com.wikinode.studio.model.SourceItem;
import com.wikinode.studio.model.SourceRef;
import com.wikinode.studio.model.WikiNode;
import java.util.List;

final class WikiNodeSeedData {

  private WikiNodeSeedData() {
  }

  static List<SourceItem> sources() {
    return List.of(
      new SourceItem("src-feishu-cc", "feishu", "CC 售后政策飞书空间", "售后运营", "synced", "2026-06-18", 4),
      new SourceItem("src-pdf-dishwasher", "pdf", "洗碗机培训 PDF", "产品培训", "synced", "2026-06-17", 2),
      new SourceItem("src-excel-fee", "excel", "维修收费标准 Excel", "服务财务", "pending", "2026-06-16", 1),
      new SourceItem("src-word-manual", "word", "产品说明书 Word", "产品资料", "synced", "2026-06-15", 1)
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
