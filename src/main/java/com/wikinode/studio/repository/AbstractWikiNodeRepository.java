package com.wikinode.studio.repository;

import com.wikinode.studio.model.GraphEdge;
import com.wikinode.studio.model.GraphNode;
import com.wikinode.studio.model.IndexStatusSummary;
import com.wikinode.studio.model.ParsedDocument;
import com.wikinode.studio.model.ParserProfile;
import com.wikinode.studio.model.RawMaterial;
import com.wikinode.studio.model.RetrievalQuery;
import com.wikinode.studio.model.RetrievalResult;
import com.wikinode.studio.model.SourceItem;
import com.wikinode.studio.model.SourceOperation;
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

abstract class AbstractWikiNodeRepository implements WikiNodeRepository {

  private static final Pattern DOUBLE_LINK_PATTERN = Pattern.compile("\\[\\[([^\\]]+)]]");

  protected abstract List<WikiNode> loadNodes();

  protected abstract Optional<WikiNode> loadNode(String nodeId);

  protected abstract void insertNode(WikiNode node);

  protected abstract void replaceNode(String nodeId, WikiNode node);

  protected abstract List<SourceItem> loadSources();

  protected abstract List<RawMaterial> loadRawMaterials();

  protected abstract List<ParsedDocument> loadParsedDocuments();

  protected abstract List<SourceOperation> loadSourceOperations();

  protected abstract List<ParserProfile> loadParserProfiles();

  @Override
  public List<WikiNode> listNodes() {
    return loadNodes().stream().map(this::withComputedCounts).toList();
  }

  @Override
  public Optional<WikiNode> findNode(String nodeId) {
    return loadNode(nodeId).map(this::withComputedCounts);
  }

  @Override
  public WikiNode createNode(WikiNodeUpsertRequest request) {
    WikiNode node = buildNode(null, request, null);
    ensureSlugAvailable(node.slug(), node.nodeId(), null);
    insertNode(node);
    return findNode(node.nodeId()).orElse(node);
  }

  @Override
  public WikiNode updateNode(String nodeId, WikiNodeUpsertRequest request) {
    WikiNode existing = loadNode(nodeId).orElseThrow(() -> new IllegalArgumentException("WikiNode not found"));
    WikiNode node = buildNode(nodeId, request, existing);
    ensureSlugAvailable(node.slug(), node.nodeId(), nodeId);
    replaceNode(nodeId, node);
    return findNode(nodeId).orElse(node);
  }

  @Override
  public List<WikiLink> outgoingLinks(String nodeId) {
    return loadNode(nodeId).map(this::buildOutgoingLinks).orElse(List.of());
  }

  @Override
  public List<WikiLink> backlinks(String nodeId) {
    return allLinks().stream()
      .filter(WikiLink::resolved)
      .filter(link -> nodeId.equals(link.toNodeId()))
      .toList();
  }

  @Override
  public List<WikiLink> brokenLinks() {
    return allLinks().stream().filter(link -> !link.resolved()).toList();
  }

  @Override
  public List<RetrievalResult> search(RetrievalQuery query) {
    String cleanQuery = Optional.ofNullable(query.query()).orElse("").trim();
    RetrievalQuery.RetrievalFilters filters = query.filters() == null
      ? new RetrievalQuery.RetrievalFilters(null, null, null)
      : query.filters();
    int limit = query.topK() > 0 ? query.topK() : 5;

    return listNodes().stream()
      .filter(node -> filters.nodeType() == null || filters.nodeType().equals(node.nodeType()))
      .filter(node -> filters.status() == null || filters.status().equals(node.status()))
      .map(node -> retrievalResult(node, cleanQuery, filters))
      .filter(result -> result.score() > 0.05 || cleanQuery.isBlank())
      .sorted(Comparator.comparingDouble(RetrievalResult::score).reversed())
      .limit(limit)
      .toList();
  }

  @Override
  public List<SourceItem> listSources() {
    return List.copyOf(loadSources());
  }

  @Override
  public Optional<SourceItem> findSource(String sourceId) {
    return loadSources().stream().filter(source -> source.sourceId().equals(sourceId)).findFirst();
  }

  @Override
  public List<RawMaterial> listRawMaterials() {
    return List.copyOf(loadRawMaterials());
  }

  @Override
  public List<RawMaterial> listRawMaterialsForSource(String sourceId) {
    return loadRawMaterials().stream().filter(rawMaterial -> rawMaterial.sourceId().equals(sourceId)).toList();
  }

  @Override
  public Optional<RawMaterial> findRawMaterial(String rawMaterialId) {
    return loadRawMaterials().stream().filter(rawMaterial -> rawMaterial.rawMaterialId().equals(rawMaterialId)).findFirst();
  }

  @Override
  public List<ParsedDocument> listParsedDocumentsForRawMaterial(String rawMaterialId) {
    return loadParsedDocuments().stream().filter(parsedDocument -> parsedDocument.rawMaterialId().equals(rawMaterialId)).toList();
  }

  @Override
  public Optional<ParsedDocument> findParsedDocument(String parsedDocumentId) {
    return loadParsedDocuments().stream().filter(parsedDocument -> parsedDocument.parsedDocumentId().equals(parsedDocumentId)).findFirst();
  }

  @Override
  public List<SourceOperation> listSourceOperationsForSource(String sourceId) {
    return loadSourceOperations().stream().filter(operation -> operation.sourceId().equals(sourceId)).toList();
  }

  @Override
  public List<SourceOperation> listSourceOperationsForRawMaterial(String rawMaterialId) {
    return loadSourceOperations().stream().filter(operation -> rawMaterialId.equals(operation.rawMaterialId())).toList();
  }

  @Override
  public Optional<SourceOperation> findSourceOperation(String operationId) {
    return loadSourceOperations().stream().filter(operation -> operation.operationId().equals(operationId)).findFirst();
  }

  @Override
  public List<ParserProfile> listParserProfiles() {
    return List.copyOf(loadParserProfiles());
  }

  @Override
  public WikiGraphOverview graphOverview() {
    return new WikiGraphOverview(
      listNodes().stream().map(this::graphNode).toList(),
      allLinks().stream().map(this::graphEdge).toList()
    );
  }

  @Override
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

    Map<String, WikiNode> nodesById = listNodes().stream()
      .collect(LinkedHashMap::new, (map, node) -> map.put(node.nodeId(), node), Map::putAll);

    return new WikiGraphOverview(
      egoNodeIds.stream().map(nodesById::get).filter(node -> node != null).map(this::graphNode).toList(),
      egoLinks.stream().map(this::graphEdge).toList()
    );
  }

  @Override
  public IndexStatusSummary indexStatus() {
    List<WikiNode> nodes = loadNodes();
    return new IndexStatusSummary(
      nodes.size(),
      countByIndexStatus(nodes, "indexed"),
      countByIndexStatus(nodes, "outdated"),
      countByIndexStatus(nodes, "failed"),
      countByIndexStatus(nodes, "not_indexed")
    );
  }

  private List<WikiLink> allLinks() {
    return loadNodes().stream().flatMap(node -> buildOutgoingLinks(node).stream()).toList();
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
    return loadNodes().stream()
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

  private int countByIndexStatus(List<WikiNode> nodes, String status) {
    return (int) nodes.stream().filter(node -> status.equals(node.indexStatus())).count();
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
    boolean conflict = loadNodes().stream()
      .filter(node -> exceptNodeId == null || !exceptNodeId.equals(node.nodeId()))
      .anyMatch(node -> slug.equals(node.slug()) || slug.equals(node.nodeId()) || nodeId.equals(node.slug()));
    if (conflict) {
      throw new IllegalArgumentException("WikiNode slug already exists");
    }
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
}
