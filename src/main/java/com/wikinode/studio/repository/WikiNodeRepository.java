package com.wikinode.studio.repository;

import com.wikinode.studio.model.GraphEdge;
import com.wikinode.studio.model.GraphNode;
import com.wikinode.studio.model.IndexStatusSummary;
import com.wikinode.studio.model.RetrievalQuery;
import com.wikinode.studio.model.RetrievalResult;
import com.wikinode.studio.model.SourceItem;
import com.wikinode.studio.model.SourceRef;
import com.wikinode.studio.model.WikiGraphOverview;
import com.wikinode.studio.model.WikiLink;
import com.wikinode.studio.model.WikiNode;
import com.wikinode.studio.model.WikiNodeUpsertRequest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Repository;

@Repository
public class WikiNodeRepository {

  private static final Pattern DOUBLE_LINK_PATTERN = Pattern.compile("\\[\\[([^\\]]+)]]");
  private final Map<String, WikiNode> nodes = new LinkedHashMap<>();
  private final List<SourceItem> sources = new ArrayList<>();

  public WikiNodeRepository() {
    seedSources();
    seedNodes();
  }

  public List<WikiNode> listNodes() {
    return List.copyOf(nodes.values());
  }

  public Optional<WikiNode> findNode(String nodeId) {
    return Optional.ofNullable(nodes.get(nodeId));
  }

  public WikiNode saveNode(WikiNode node) {
    nodes.put(node.nodeId(), node);
    return node;
  }

  public WikiNode createNode(WikiNodeUpsertRequest request) {
    WikiNode node = buildNode(null, request, null);
    ensureSlugAvailable(node.slug(), node.nodeId(), null);
    if (nodes.containsKey(node.nodeId())) {
      throw new IllegalArgumentException("WikiNode slug already exists");
    }
    nodes.put(node.nodeId(), node);
    refreshAllComputedCounts();
    return nodes.get(node.nodeId());
  }

  public WikiNode updateNode(String nodeId, WikiNodeUpsertRequest request) {
    WikiNode existing = nodes.get(nodeId);
    if (existing == null) {
      throw new IllegalArgumentException("WikiNode not found");
    }
    WikiNode node = buildNode(nodeId, request, existing);
    ensureSlugAvailable(node.slug(), node.nodeId(), nodeId);
    nodes.put(nodeId, node);
    refreshAllComputedCounts();
    return nodes.get(nodeId);
  }

  public List<WikiLink> outgoingLinks(String nodeId) {
    return findNode(nodeId).map(this::buildOutgoingLinks).orElse(List.of());
  }

  public List<WikiLink> backlinks(String nodeId) {
    return allLinks().stream()
      .filter(WikiLink::resolved)
      .filter(link -> nodeId.equals(link.toNodeId()))
      .toList();
  }

  public List<WikiLink> brokenLinks() {
    return allLinks().stream().filter(link -> !link.resolved()).toList();
  }

  public List<WikiLink> allLinks() {
    return nodes.values().stream().flatMap(node -> buildOutgoingLinks(node).stream()).toList();
  }

  public List<RetrievalResult> search(RetrievalQuery query) {
    String cleanQuery = Optional.ofNullable(query.query()).orElse("").trim();
    RetrievalQuery.RetrievalFilters filters = query.filters() == null
      ? new RetrievalQuery.RetrievalFilters(null, null, null)
      : query.filters();
    int limit = query.topK() > 0 ? query.topK() : 5;

    return nodes.values().stream()
      .filter(node -> filters.nodeType() == null || filters.nodeType().equals(node.nodeType()))
      .filter(node -> filters.status() == null || filters.status().equals(node.status()))
      .map(node -> retrievalResult(node, cleanQuery, filters))
      .filter(result -> result.score() > 0.05 || cleanQuery.isBlank())
      .sorted(Comparator.comparingDouble(RetrievalResult::score).reversed())
      .limit(limit)
      .toList();
  }

  public List<SourceItem> listSources() {
    return List.copyOf(sources);
  }

  public WikiGraphOverview graphOverview() {
    return new WikiGraphOverview(
      nodes.values().stream().map(this::graphNode).toList(),
      allLinks().stream().map(this::graphEdge).toList()
    );
  }

  public WikiGraphOverview graphEgo(String nodeId) {
    Set<String> egoNodeIds = new HashSet<>();
    egoNodeIds.add(nodeId);

    List<WikiLink> egoLinks = allLinks().stream()
      .filter(link -> nodeId.equals(link.fromNodeId()) || nodeId.equals(link.toNodeId()))
      .toList();
    egoLinks.forEach(link -> {
      egoNodeIds.add(link.fromNodeId());
      if (link.toNodeId() != null) {
        egoNodeIds.add(link.toNodeId());
      }
    });

    return new WikiGraphOverview(
      egoNodeIds.stream().map(nodes::get).filter(node -> node != null).map(this::graphNode).toList(),
      egoLinks.stream().map(this::graphEdge).toList()
    );
  }

  public IndexStatusSummary indexStatus() {
    return new IndexStatusSummary(
      nodes.size(),
      countByIndexStatus("indexed"),
      countByIndexStatus("outdated"),
      countByIndexStatus("failed"),
      countByIndexStatus("not_indexed")
    );
  }

  private RetrievalResult retrievalResult(
    WikiNode node,
    String cleanQuery,
    RetrievalQuery.RetrievalFilters filters
  ) {
    Map<String, Double> fieldScores = new LinkedHashMap<>();
    fieldScores.put("title", fieldScore(cleanQuery, node.title(), 0.48));
    fieldScores.put("summary", fieldScore(cleanQuery, node.summary(), 0.24));
    fieldScores.put("tags", fieldScore(cleanQuery, String.join(" ", node.tags()), 0.18));
    fieldScores.put("contentMarkdown", fieldScore(cleanQuery, node.contentMarkdown(), 0.16));

    long tagBoost = filters.tags() == null
      ? 0
      : filters.tags().stream().filter(tag -> node.tags().contains(tag)).count();
    double score = Math.min(
      0.99,
      fieldScores.values().stream().mapToDouble(Double::doubleValue).sum() + tagBoost * 0.08
    );
    List<String> matchedFields = fieldScores.entrySet().stream()
      .filter(entry -> entry.getValue() > 0.04)
      .map(Map.Entry::getKey)
      .toList();

    return new RetrievalResult(
      node,
      score,
      matchedFields.isEmpty()
        ? "Returned as a related WikiNode."
        : "Matched relevant WikiNode content.",
      matchedFields,
      backlinks(node.nodeId()),
      outgoingLinks(node.nodeId())
    );
  }

  private double fieldScore(String query, String text, double weight) {
    String normalizedQuery = query.toLowerCase(Locale.ROOT);
    String normalizedText = Optional.ofNullable(text).orElse("").toLowerCase(Locale.ROOT);
    if (normalizedQuery.isBlank()) {
      return 0;
    }
    if (normalizedText.contains(normalizedQuery)) {
      return weight;
    }
    return charOverlap(normalizedQuery, normalizedText) * weight * 0.7;
  }

  private double charOverlap(String query, String text) {
    Set<Integer> chars = new HashSet<>();
    query.codePoints().filter(codePoint -> !Character.isWhitespace(codePoint)).forEach(chars::add);
    if (chars.isEmpty()) {
      return 0;
    }

    long matched = chars.stream().filter(codePoint -> text.indexOf(codePoint) >= 0).count();
    return (double) matched / chars.size();
  }

  private List<WikiLink> buildOutgoingLinks(WikiNode node) {
    Matcher matcher = DOUBLE_LINK_PATTERN.matcher(Optional.ofNullable(node.contentMarkdown()).orElse(""));
    List<WikiLink> links = new ArrayList<>();
    int index = 0;

    while (matcher.find()) {
      LinkTarget target = parseLinkTarget(matcher.group(1));
      WikiNode targetNode = findByReference(target.key()).orElse(null);
      links.add(new WikiLink(
        "%s-link-%d".formatted(node.nodeId(), index),
        node.nodeId(),
        node.title(),
        targetNode == null ? null : targetNode.nodeId(),
        targetNode == null ? null : targetNode.title(),
        target.key(),
        "reference",
        targetNode != null
      ));
      index++;
    }

    return links;
  }

  private LinkTarget parseLinkTarget(String rawTarget) {
    String trimmed = Optional.ofNullable(rawTarget).orElse("").trim();
    int separator = trimmed.indexOf('|');
    if (separator < 0) {
      return new LinkTarget(trimmed, trimmed);
    }

    String key = trimmed.substring(0, separator).trim();
    String label = trimmed.substring(separator + 1).trim();
    return new LinkTarget(key.isBlank() ? label : key, label.isBlank() ? key : label);
  }

  private Optional<WikiNode> findByReference(String reference) {
    return nodes.values().stream()
      .filter(node ->
        reference.equals(node.slug()) ||
          reference.equals(node.nodeId()) ||
          reference.equals(node.title())
      )
      .findFirst();
  }

  private GraphNode graphNode(WikiNode node) {
    return new GraphNode(
      node.nodeId(),
      node.title(),
      node.nodeType(),
      node.status(),
      node.indexStatus(),
      node.incomingCount(),
      node.outgoingCount(),
      node.brokenLinkCount()
    );
  }

  private GraphEdge graphEdge(WikiLink link) {
    return new GraphEdge(
      link.linkId(),
      link.fromNodeId(),
      link.toNodeId(),
      link.targetTitle(),
      link.relationType(),
      link.resolved()
    );
  }

  private int countByIndexStatus(String status) {
    return (int) nodes.values().stream().filter(node -> status.equals(node.indexStatus())).count();
  }

  private WikiNode buildNode(String pathNodeId, WikiNodeUpsertRequest request, WikiNode existing) {
    String today = LocalDate.now().toString();
    String nodeId = valueOrDefault(pathNodeId, valueOrDefault(request.nodeId(), valueOrDefault(request.slug(), request.title())));
    String slug = valueOrDefault(request.slug(), nodeId);
    String title = valueOrDefault(request.title(), existing == null ? slug : existing.title());
    String createdAt = valueOrDefault(request.createdAt(), existing == null ? today : existing.createdAt());

    return new WikiNode(
      nodeId,
      slug,
      title,
      valueOrDefault(request.nodeType(), existing == null ? "term" : existing.nodeType()),
      valueOrDefault(request.summary(), existing == null ? "" : existing.summary()),
      valueOrDefault(request.contentMarkdown(), existing == null ? "" : existing.contentMarkdown()),
      listOrDefault(request.tags(), existing == null ? List.of() : existing.tags()),
      valueOrDefault(request.status(), existing == null ? "draft" : existing.status()),
      sourceRefsOrDefault(request.sourceRefs(), existing == null ? List.of() : existing.sourceRefs()),
      valueOrDefault(request.indexStatus(), existing == null ? "not_indexed" : existing.indexStatus()),
      0,
      0,
      0,
      createdAt,
      valueOrDefault(request.updatedAt(), today),
      request.lastIndexedAt() == null && existing != null ? existing.lastIndexedAt() : request.lastIndexedAt()
    );
  }

  private void ensureSlugAvailable(String slug, String nodeId, String exceptNodeId) {
    boolean conflict = nodes.values().stream()
      .filter(node -> exceptNodeId == null || !exceptNodeId.equals(node.nodeId()))
      .anyMatch(node -> slug.equals(node.slug()) || slug.equals(node.nodeId()) || nodeId.equals(node.slug()));
    if (conflict) {
      throw new IllegalArgumentException("WikiNode slug already exists");
    }
  }

  private void refreshAllComputedCounts() {
    Map<String, WikiNode> refreshed = new LinkedHashMap<>();
    nodes.values().forEach(node -> refreshed.put(node.nodeId(), withComputedCounts(node)));
    nodes.clear();
    nodes.putAll(refreshed);
  }

  private WikiNode withComputedCounts(WikiNode node) {
    List<WikiLink> outgoingLinks = buildOutgoingLinks(node);
    return new WikiNode(
      node.nodeId(),
      node.slug(),
      node.title(),
      node.nodeType(),
      node.summary(),
      node.contentMarkdown(),
      node.tags(),
      node.status(),
      node.sourceRefs(),
      node.indexStatus(),
      backlinks(node.nodeId()).size(),
      outgoingLinks.size(),
      (int) outgoingLinks.stream().filter(link -> !link.resolved()).count(),
      node.createdAt(),
      node.updatedAt(),
      node.lastIndexedAt()
    );
  }

  private String valueOrDefault(String value, String fallback) {
    return value == null || value.isBlank() ? fallback : value;
  }

  private List<String> listOrDefault(List<String> value, List<String> fallback) {
    return value == null ? fallback : value;
  }

  private List<SourceRef> sourceRefsOrDefault(List<SourceRef> value, List<SourceRef> fallback) {
    return value == null ? fallback : value;
  }

  private record LinkTarget(String key, String label) {
  }

  private void seedSources() {
    sources.add(new SourceItem("src-feishu-cc", "feishu", "CC 售后政策飞书空间", "售后运营", "synced", "2026-06-18", 4));
    sources.add(new SourceItem("src-pdf-dishwasher", "pdf", "洗碗机培训 PDF", "产品培训", "synced", "2026-06-17", 2));
    sources.add(new SourceItem("src-excel-fee", "excel", "维修收费标准 Excel", "服务财务", "pending", "2026-06-16", 1));
    sources.add(new SourceItem("src-word-manual", "word", "产品说明书 Word", "产品资料", "synced", "2026-06-15", 1));
  }

  private void seedNodes() {
    SourceRef feishuPolicyRef = new SourceRef(
      "src-feishu-cc",
      "feishu",
      "CC 售后政策飞书空间",
      "https://feishu.example.com/wiki/after-sales",
      null,
      "2026.06"
    );

    saveNode(new WikiNode(
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
      1,
      3,
      1,
      "2026-06-10",
      "2026-06-18",
      "2026-06-18"
    ));

    saveNode(new WikiNode(
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
      1,
      2,
      0,
      "2026-06-11",
      "2026-06-17",
      "2026-06-17"
    ));

    saveNode(new WikiNode(
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
      1,
      1,
      0,
      "2026-06-12",
      "2026-06-16",
      "2026-06-16"
    ));

    saveNode(new WikiNode(
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
      1,
      0,
      "2026-06-13",
      "2026-06-18",
      "2026-06-18"
    ));

    saveNode(new WikiNode(
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
      1,
      1,
      0,
      "2026-06-14",
      "2026-06-15",
      "2026-06-15"
    ));

    refreshAllComputedCounts();
  }
}
