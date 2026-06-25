package com.wikinode.studio.repository;

import com.wikinode.studio.model.GraphEdge;
import com.wikinode.studio.model.GraphNode;
import com.wikinode.studio.model.IndexStatusSummary;
import com.wikinode.studio.model.ParsedDocument;
import com.wikinode.studio.model.ParsedDocumentSourceRef;
import com.wikinode.studio.model.ParserProfile;
import com.wikinode.studio.model.RawMaterial;
import com.wikinode.studio.model.DraftWikiNodeRelationCandidate;
import com.wikinode.studio.model.DraftWikiNodeSuggestion;
import com.wikinode.studio.model.DraftWikiNodeSuggestionAcceptRequest;
import com.wikinode.studio.model.DraftWikiNodeSuggestionAcceptResult;
import com.wikinode.studio.model.DraftWikiNodeSuggestionGenerationRequest;
import com.wikinode.studio.model.DraftWikiNodeSuggestionGenerationResult;
import com.wikinode.studio.model.DraftWikiNodeSuggestionRejectRequest;
import com.wikinode.studio.model.DraftWikiNodeSuggestionRetryRequest;
import com.wikinode.studio.model.DraftWikiNodeSuggestionRetryResult;
import com.wikinode.studio.model.DraftWikiNodeSuggestionReviewResult;
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
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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

  protected abstract List<DraftWikiNodeSuggestion> loadDraftWikiNodeSuggestions();

  protected abstract void insertSourceOperation(SourceOperation operation);

  protected abstract void insertDraftWikiNodeSuggestion(DraftWikiNodeSuggestion suggestion);

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
  public List<DraftWikiNodeSuggestion> listDraftWikiNodeSuggestions() {
    return List.copyOf(loadDraftWikiNodeSuggestions());
  }

  @Override
  public List<DraftWikiNodeSuggestion> listDraftWikiNodeSuggestionsForParsedDocument(String parsedDocumentId) {
    return loadDraftWikiNodeSuggestions().stream()
      .filter(suggestion -> suggestion.parsedDocumentId().equals(parsedDocumentId))
      .toList();
  }

  @Override
  public List<DraftWikiNodeSuggestion> listDraftWikiNodeSuggestionsForRawMaterial(String rawMaterialId) {
    return loadDraftWikiNodeSuggestions().stream()
      .filter(suggestion -> suggestion.rawMaterialId().equals(rawMaterialId))
      .toList();
  }

  @Override
  public Optional<DraftWikiNodeSuggestion> findDraftWikiNodeSuggestion(String suggestionId) {
    return loadDraftWikiNodeSuggestions().stream()
      .filter(suggestion -> suggestion.suggestionId().equals(suggestionId))
      .findFirst();
  }

  @Override
  public DraftWikiNodeSuggestionGenerationResult generateDraftWikiNodeSuggestion(
    String parsedDocumentId,
    DraftWikiNodeSuggestionGenerationRequest request
  ) {
    Optional<ParsedDocument> parsedDocument = findParsedDocument(parsedDocumentId);
    if (parsedDocument.isEmpty()) {
      return new DraftWikiNodeSuggestionGenerationResult(
        null,
        parsedDocumentId,
        "failed",
        "未找到可用于生成建议的 Parsed Document。",
        null
      );
    }

    ParsedDocument document = parsedDocument.get();
    String operationId = operationIdFor(document);

    Optional<DraftWikiNodeSuggestionGenerationResult> skipped = generationSkipResult(document, request, operationId);
    if (skipped.isPresent()) {
      insertSourceOperation(sourceOperation(document, operationId, "skipped", skipped.get().summary(), null));
      return skipped.get();
    }

    DraftWikiNodeSuggestion suggestion = buildDraftWikiNodeSuggestion(document, operationId);
    insertSourceOperation(sourceOperation(document, operationId, "succeeded", "已生成待审核 WikiNode 建议。", null));
    insertDraftWikiNodeSuggestion(suggestion);
    return new DraftWikiNodeSuggestionGenerationResult(
      operationId,
      document.parsedDocumentId(),
      "succeeded",
      "已生成待审核 WikiNode 建议。",
      suggestion.suggestionId()
    );
  }

  @Override
  public DraftWikiNodeSuggestionReviewResult rejectDraftWikiNodeSuggestion(
    String suggestionId,
    DraftWikiNodeSuggestionRejectRequest request
  ) {
    String reviewNote = request == null ? "" : Optional.ofNullable(request.reviewNote()).orElse("").trim();
    if (reviewNote.isBlank()) {
      throw new IllegalArgumentException("拒绝原因不能为空。");
    }

    DraftWikiNodeSuggestion suggestion = findDraftWikiNodeSuggestion(suggestionId)
      .orElseThrow(() -> new IllegalArgumentException("未找到 WikiNode 建议。"));
    if ("rejected".equals(suggestion.status())) {
      return new DraftWikiNodeSuggestionReviewResult(
        suggestion.suggestionId(),
        "skipped",
        "该 WikiNode 建议已被拒绝。",
        suggestion.reviewNote()
      );
    }
    if (!Set.of("draft", "needs_review").contains(suggestion.status())) {
      return new DraftWikiNodeSuggestionReviewResult(
        suggestion.suggestionId(),
        "skipped",
        "当前状态不能拒绝该 WikiNode 建议。",
        suggestion.reviewNote()
      );
    }

    DraftWikiNodeSuggestion rejected = new DraftWikiNodeSuggestion(
      suggestion.suggestionId(),
      suggestion.parsedDocumentId(),
      suggestion.rawMaterialId(),
      suggestion.sourceId(),
      suggestion.operationId(),
      suggestion.title(),
      suggestion.objectType(),
      suggestion.subtype(),
      suggestion.contentDraft(),
      suggestion.metadataDraft(),
      suggestion.sourceRefs(),
      suggestion.relationCandidates(),
      suggestion.confidence(),
      "rejected",
      reviewNote,
      suggestion.conflictStatus(),
      suggestion.conflictReasons(),
      suggestion.matchedWikiNodeIds(),
      suggestion.matchedSuggestionIds(),
      suggestion.sourceRefCount(),
      suggestion.relationCandidateCount(),
      suggestion.createdAt(),
      today()
    );
    insertDraftWikiNodeSuggestion(rejected);

    return new DraftWikiNodeSuggestionReviewResult(
      rejected.suggestionId(),
      rejected.status(),
      "已拒绝 WikiNode 建议。",
      rejected.reviewNote()
    );
  }

  @Override
  public DraftWikiNodeSuggestionAcceptResult acceptDraftWikiNodeSuggestion(
    String suggestionId,
    DraftWikiNodeSuggestionAcceptRequest request
  ) {
    String reviewNote = request == null ? "" : Optional.ofNullable(request.reviewNote()).orElse("").trim();
    if (reviewNote.isBlank()) {
      throw new IllegalArgumentException("采纳说明不能为空。");
    }

    DraftWikiNodeSuggestion suggestion = findDraftWikiNodeSuggestion(suggestionId)
      .orElseThrow(() -> new IllegalArgumentException("未找到 WikiNode 建议。"));
    if ("accepted".equals(suggestion.status())) {
      String existingNodeId = suggestion.matchedWikiNodeIds().isEmpty() ? null : suggestion.matchedWikiNodeIds().getFirst();
      return new DraftWikiNodeSuggestionAcceptResult(
        suggestion.suggestionId(),
        "skipped",
        "该 WikiNode 建议已采纳。",
        suggestion.reviewNote(),
        existingNodeId,
        existingNodeId == null ? null : "draft"
      );
    }
    if (!Set.of("draft", "needs_review").contains(suggestion.status())) {
      return new DraftWikiNodeSuggestionAcceptResult(
        suggestion.suggestionId(),
        "skipped",
        "当前状态不能采纳该 WikiNode 建议。",
        suggestion.reviewNote(),
        null,
        null
      );
    }
    if (!"none".equals(suggestion.conflictStatus())) {
      return new DraftWikiNodeSuggestionAcceptResult(
        suggestion.suggestionId(),
        "skipped",
        "存在冲突，不能直接采纳为 WikiNode。",
        suggestion.reviewNote(),
        null,
        null
      );
    }
    if (loadNodes().stream().anyMatch(node -> suggestion.title().equals(node.title()))) {
      return new DraftWikiNodeSuggestionAcceptResult(
        suggestion.suggestionId(),
        "skipped",
        "已有 WikiNode 使用相同标题，不能直接采纳。",
        suggestion.reviewNote(),
        null,
        null
      );
    }

    String nodeId = acceptedNodeIdFor(suggestion);
    WikiNode node = acceptedDraftWikiNode(suggestion, nodeId);
    insertNode(node);
    DraftWikiNodeSuggestion accepted = new DraftWikiNodeSuggestion(
      suggestion.suggestionId(),
      suggestion.parsedDocumentId(),
      suggestion.rawMaterialId(),
      suggestion.sourceId(),
      suggestion.operationId(),
      suggestion.title(),
      suggestion.objectType(),
      suggestion.subtype(),
      suggestion.contentDraft(),
      suggestion.metadataDraft(),
      suggestion.sourceRefs(),
      suggestion.relationCandidates(),
      suggestion.confidence(),
      "accepted",
      reviewNote,
      suggestion.conflictStatus(),
      suggestion.conflictReasons(),
      List.of(nodeId),
      suggestion.matchedSuggestionIds(),
      suggestion.sourceRefCount(),
      suggestion.relationCandidateCount(),
      suggestion.createdAt(),
      today()
    );
    insertDraftWikiNodeSuggestion(accepted);

    return new DraftWikiNodeSuggestionAcceptResult(
      accepted.suggestionId(),
      accepted.status(),
      "已采纳为草稿 WikiNode。",
      accepted.reviewNote(),
      node.nodeId(),
      node.status()
    );
  }

  @Override
  public DraftWikiNodeSuggestionRetryResult retryDraftWikiNodeSuggestion(
    String suggestionId,
    DraftWikiNodeSuggestionRetryRequest request
  ) {
    String reviewNote = request == null ? "" : Optional.ofNullable(request.reviewNote()).orElse("").trim();
    if (reviewNote.isBlank()) {
      throw new IllegalArgumentException("重新生成原因不能为空。");
    }

    DraftWikiNodeSuggestion suggestion = findDraftWikiNodeSuggestion(suggestionId)
      .orElseThrow(() -> new IllegalArgumentException("未找到 WikiNode 建议。"));
    if ("accepted".equals(suggestion.status())) {
      return new DraftWikiNodeSuggestionRetryResult(
        suggestion.suggestionId(),
        "skipped",
        "已采纳的 WikiNode 建议不能重新生成。",
        suggestion.reviewNote(),
        null,
        null,
        null
      );
    }
    if ("superseded".equals(suggestion.status())) {
      String replacementSuggestionId = suggestion.matchedSuggestionIds().isEmpty() ? null : suggestion.matchedSuggestionIds().getFirst();
      return new DraftWikiNodeSuggestionRetryResult(
        suggestion.suggestionId(),
        "skipped",
        "该 WikiNode 建议已被新建议替代。",
        suggestion.reviewNote(),
        replacementSuggestionId,
        replacementSuggestionId == null ? null : "draft",
        null
      );
    }

    ParsedDocument parsedDocument = findParsedDocument(suggestion.parsedDocumentId())
      .orElseThrow(() -> new IllegalArgumentException("未找到可用于重新生成建议的 Parsed Document。"));
    if (!"parsed".equals(parsedDocument.parseStatus())) {
      return new DraftWikiNodeSuggestionRetryResult(
        suggestion.suggestionId(),
        "skipped",
        "Parsed Document 尚未解析完成，不能重新生成 WikiNode 建议。",
        suggestion.reviewNote(),
        null,
        null,
        null
      );
    }

    String operationId = retryOperationIdFor(parsedDocument);
    DraftWikiNodeSuggestion replacement = buildReplacementDraftWikiNodeSuggestion(parsedDocument, operationId, suggestion);
    DraftWikiNodeSuggestion superseded = new DraftWikiNodeSuggestion(
      suggestion.suggestionId(),
      suggestion.parsedDocumentId(),
      suggestion.rawMaterialId(),
      suggestion.sourceId(),
      suggestion.operationId(),
      suggestion.title(),
      suggestion.objectType(),
      suggestion.subtype(),
      suggestion.contentDraft(),
      suggestion.metadataDraft(),
      suggestion.sourceRefs(),
      suggestion.relationCandidates(),
      suggestion.confidence(),
      "superseded",
      reviewNote,
      suggestion.conflictStatus(),
      suggestion.conflictReasons(),
      suggestion.matchedWikiNodeIds(),
      List.of(replacement.suggestionId()),
      suggestion.sourceRefCount(),
      suggestion.relationCandidateCount(),
      suggestion.createdAt(),
      today()
    );

    insertSourceOperation(sourceOperation(parsedDocument, operationId, "succeeded", "已重新生成 WikiNode 建议。", null));
    insertDraftWikiNodeSuggestion(superseded);
    insertDraftWikiNodeSuggestion(replacement);

    return new DraftWikiNodeSuggestionRetryResult(
      superseded.suggestionId(),
      superseded.status(),
      "已重新生成 WikiNode 建议，旧建议已标记为被新建议替代。",
      superseded.reviewNote(),
      replacement.suggestionId(),
      replacement.status(),
      operationId
    );
  }

  @Override
  public WikiGraphOverview graphOverview() {
    return new WikiGraphOverview(
      listNodes().stream().map(this::graphNode).toList(),
      allLinks().stream().map(this::graphEdge).toList()
    );
  }

  private Optional<DraftWikiNodeSuggestionGenerationResult> generationSkipResult(
    ParsedDocument parsedDocument,
    DraftWikiNodeSuggestionGenerationRequest request,
    String operationId
  ) {
    if (!"parsed".equals(parsedDocument.parseStatus())) {
      return Optional.of(generationResult(operationId, parsedDocument.parsedDocumentId(), "skipped", "Parsed Document 尚未解析完成，不能生成 WikiNode 建议。", null));
    }
    if (parsedDocument.normalizedContent() == null || parsedDocument.normalizedContent().isBlank()) {
      return Optional.of(generationResult(operationId, parsedDocument.parsedDocumentId(), "skipped", "解析内容为空，不能生成 WikiNode 建议。", null));
    }
    if (parsedDocument.sourceRefs() == null || parsedDocument.sourceRefs().isEmpty()) {
      return Optional.of(generationResult(operationId, parsedDocument.parsedDocumentId(), "skipped", "缺少 SourceRef 证据，不能生成 WikiNode 建议。", null));
    }
    if (!isSupportedConversionProfile(parsedDocument, request)) {
      return Optional.of(generationResult(operationId, parsedDocument.parsedDocumentId(), "skipped", "当前内容没有可用的 WikiNode 建议规则。", null));
    }
    if (hasExistingActiveSuggestion(parsedDocument.parsedDocumentId())) {
      return Optional.of(generationResult(operationId, parsedDocument.parsedDocumentId(), "skipped", "该 Parsed Document 已有待审核 WikiNode 建议。", null));
    }
    if (loadNodes().stream().anyMatch(node -> node.title().equals(suggestedTitle(parsedDocument)))) {
      return Optional.of(generationResult(operationId, parsedDocument.parsedDocumentId(), "skipped", "已有 WikiNode 使用相同来源证据，请先确认是否需要更新。", null));
    }
    return Optional.empty();
  }

  private DraftWikiNodeSuggestionGenerationResult generationResult(
    String operationId,
    String parsedDocumentId,
    String status,
    String summary,
    String suggestionId
  ) {
    return new DraftWikiNodeSuggestionGenerationResult(operationId, parsedDocumentId, status, summary, suggestionId);
  }

  private boolean isSupportedConversionProfile(
    ParsedDocument parsedDocument,
    DraftWikiNodeSuggestionGenerationRequest request
  ) {
    String requestedProfile = request == null ? null : request.conversionProfile();
    String profile = requestedProfile == null || requestedProfile.isBlank()
      ? parsedDocument.parserProfile()
      : requestedProfile;
    return Set.of("feishu_article_v1", "pdf_manual_article_v1", "excel_fee_table_v1").contains(profile);
  }

  private boolean hasExistingActiveSuggestion(String parsedDocumentId) {
    return loadDraftWikiNodeSuggestions().stream()
      .anyMatch(suggestion -> parsedDocumentId.equals(suggestion.parsedDocumentId())
        && Set.of("draft", "needs_review", "accepted").contains(suggestion.status()));
  }

  private DraftWikiNodeSuggestion buildDraftWikiNodeSuggestion(ParsedDocument parsedDocument, String operationId) {
    String suggestedTitle = suggestedTitle(parsedDocument);
    String objectType = suggestedObjectType(parsedDocument);
    String subtype = suggestedSubtype(parsedDocument);
    List<DraftWikiNodeRelationCandidate> relationCandidates = suggestedRelationCandidates(parsedDocument);
    return new DraftWikiNodeSuggestion(
      suggestionIdFor(parsedDocument),
      parsedDocument.parsedDocumentId(),
      parsedDocument.rawMaterialId(),
      parsedDocument.sourceId(),
      operationId,
      suggestedTitle,
      objectType,
      subtype,
      contentDraft(parsedDocument, suggestedTitle),
      parsedDocument.metadata(),
      parsedDocument.sourceRefs(),
      relationCandidates,
      suggestedConfidence(parsedDocument),
      "draft",
      null,
      "none",
      List.of(),
      List.of(),
      List.of(),
      parsedDocument.sourceRefs().size(),
      relationCandidates.size(),
      today(),
      today()
    );
  }

  private DraftWikiNodeSuggestion buildReplacementDraftWikiNodeSuggestion(
    ParsedDocument parsedDocument,
    String operationId,
    DraftWikiNodeSuggestion sourceSuggestion
  ) {
    DraftWikiNodeSuggestion suggestion = buildDraftWikiNodeSuggestion(parsedDocument, operationId);
    List<ParsedDocumentSourceRef> sourceRefs = suggestion.sourceRefs().isEmpty()
      ? sourceSuggestion.sourceRefs()
      : suggestion.sourceRefs();
    List<DraftWikiNodeRelationCandidate> relationCandidates = suggestion.relationCandidates().isEmpty()
      ? sourceSuggestion.relationCandidates()
      : suggestion.relationCandidates();
    return new DraftWikiNodeSuggestion(
      retrySuggestionIdFor(parsedDocument),
      suggestion.parsedDocumentId(),
      suggestion.rawMaterialId(),
      suggestion.sourceId(),
      suggestion.operationId(),
      suggestion.title(),
      suggestion.objectType(),
      suggestion.subtype(),
      suggestion.contentDraft(),
      suggestion.metadataDraft(),
      sourceRefs,
      relationCandidates,
      suggestion.confidence(),
      suggestion.status(),
      null,
      suggestion.conflictStatus(),
      suggestion.conflictReasons(),
      suggestion.matchedWikiNodeIds(),
      List.of(sourceSuggestion.suggestionId()),
      sourceRefs.size(),
      relationCandidates.size(),
      today(),
      today()
    );
  }

  private WikiNode acceptedDraftWikiNode(DraftWikiNodeSuggestion suggestion, String nodeId) {
    return new WikiNode(
      nodeId,
      nodeId,
      suggestion.title(),
      nodeTypeForSuggestion(suggestion),
      summaryForSuggestion(suggestion),
      suggestion.contentDraft(),
      tagsForSuggestion(suggestion),
      "draft",
      sourceRefsForSuggestion(suggestion),
      "not_indexed",
      0,
      0,
      0,
      today(),
      today(),
      null
    );
  }

  private String acceptedNodeIdFor(DraftWikiNodeSuggestion suggestion) {
    return "wn-from-%s".formatted(suggestion.suggestionId());
  }

  private String nodeTypeForSuggestion(DraftWikiNodeSuggestion suggestion) {
    String subtype = Optional.ofNullable(suggestion.subtype()).orElse("");
    if (subtype.contains("troubleshooting")) {
      return "troubleshooting";
    }
    if (subtype.contains("procedure")) {
      return "procedure";
    }
    if (subtype.contains("guide")) {
      return "guide";
    }
    if (subtype.contains("fee")) {
      return "fee_rule";
    }
    if (subtype.contains("regulation")) {
      return "regulation";
    }
    if ("Procedure".equals(suggestion.objectType())) {
      return "procedure";
    }
    if ("Rule".equals(suggestion.objectType())) {
      return "fee_rule";
    }
    return "policy";
  }

  private String summaryForSuggestion(DraftWikiNodeSuggestion suggestion) {
    return suggestion.contentDraft().lines()
      .map(String::trim)
      .filter(line -> !line.isBlank())
      .filter(line -> !line.startsWith("#"))
      .findFirst()
      .orElse("由 WikiNode 建议采纳生成的草稿，等待人工编辑和发布。");
  }

  private List<String> tagsForSuggestion(DraftWikiNodeSuggestion suggestion) {
    List<String> tags = new ArrayList<>();
    tags.add("draft-suggestion");
    if (suggestion.subtype() != null && !suggestion.subtype().isBlank()) {
      tags.add(suggestion.subtype());
    }
    return tags;
  }

  private List<SourceRef> sourceRefsForSuggestion(DraftWikiNodeSuggestion suggestion) {
    return suggestion.sourceRefs().stream()
      .map(sourceRef -> new SourceRef(
        sourceRef.sourceId(),
        "parsed_document",
        "Parsed Document %s".formatted(sourceRef.parsedDocumentId()),
        null,
        "%s:%s".formatted(sourceRef.locatorType(), sourceRef.locator()),
        sourceRef.rawMaterialId()
      ))
      .toList();
  }

  private SourceOperation sourceOperation(
    ParsedDocument parsedDocument,
    String operationId,
    String status,
    String summary,
    String errorSummary
  ) {
    String now = OffsetDateTime.now(ZoneOffset.ofHours(8)).toString();
    return new SourceOperation(
      operationId,
      "suggest_wikinode",
      parsedDocument.sourceId(),
      parsedDocument.rawMaterialId(),
      parsedDocument.parsedDocumentId(),
      status,
      "system",
      now,
      now,
      summary,
      errorSummary
    );
  }

  private String operationIdFor(ParsedDocument parsedDocument) {
    return "op-%s-suggest-%s".formatted(parsedDocument.parsedDocumentId(), System.currentTimeMillis());
  }

  private String retryOperationIdFor(ParsedDocument parsedDocument) {
    return "op-%s-retry-%s".formatted(parsedDocument.parsedDocumentId(), System.currentTimeMillis());
  }

  private String suggestionIdFor(ParsedDocument parsedDocument) {
    return "sug-%s".formatted(parsedDocument.parsedDocumentId());
  }

  private String retrySuggestionIdFor(ParsedDocument parsedDocument) {
    long retryCount = loadDraftWikiNodeSuggestions().stream()
      .filter(suggestion -> parsedDocument.parsedDocumentId().equals(suggestion.parsedDocumentId()))
      .filter(suggestion -> suggestion.suggestionId().startsWith("sug-%s-retry-".formatted(parsedDocument.parsedDocumentId())))
      .count();
    return "sug-%s-retry-%d".formatted(parsedDocument.parsedDocumentId(), retryCount + 1);
  }

  private String suggestedTitle(ParsedDocument parsedDocument) {
    String title = parsedDocument.title() == null ? "" : parsedDocument.title().trim();
    title = title.replaceAll("\\s*解析结果$", "").trim();
    if (!title.isBlank()) {
      return title;
    }
    String content = Optional.ofNullable(parsedDocument.normalizedContent()).orElse("");
    Matcher heading = Pattern.compile("(?m)^#\\s+(.+)$").matcher(content);
    return heading.find() ? heading.group(1).trim() : parsedDocument.parsedDocumentId();
  }

  private String suggestedObjectType(ParsedDocument parsedDocument) {
    return switch (parsedDocument.parserProfile()) {
      case "excel_fee_table_v1" -> "DataRecord";
      case "pdf_manual_article_v1" -> "Article";
      default -> "Article";
    };
  }

  private String suggestedSubtype(ParsedDocument parsedDocument) {
    return switch (parsedDocument.parserProfile()) {
      case "excel_fee_table_v1" -> "fee_table";
      case "pdf_manual_article_v1" -> "guide";
      default -> "service_policy";
    };
  }

  private Double suggestedConfidence(ParsedDocument parsedDocument) {
    return parsedDocument.sourceRefs().stream()
      .map(ParsedDocumentSourceRef::confidence)
      .filter(value -> value != null)
      .findFirst()
      .orElse(0.72);
  }

  private List<DraftWikiNodeRelationCandidate> suggestedRelationCandidates(ParsedDocument parsedDocument) {
    Matcher matcher = DOUBLE_LINK_PATTERN.matcher(Optional.ofNullable(parsedDocument.normalizedContent()).orElse(""));
    List<DraftWikiNodeRelationCandidate> candidates = new ArrayList<>();
    while (matcher.find()) {
      candidates.add(new DraftWikiNodeRelationCandidate(matcher.group(1).trim(), "references", "inferred_from_source_ref", 0.64));
    }
    return candidates;
  }

  private String contentDraft(ParsedDocument parsedDocument, String suggestedTitle) {
    String content = Optional.ofNullable(parsedDocument.normalizedContent()).orElse("").trim();
    if (content.startsWith("# ")) {
      return "%s\n\n该内容仍是待审核 WikiNode 建议，不会自动创建 WikiNode、发布或索引。".formatted(content);
    }
    return "# %s\n\n%s\n\n该内容仍是待审核 WikiNode 建议，不会自动创建 WikiNode、发布或索引。".formatted(suggestedTitle, content);
  }

  private String today() {
    return LocalDate.now().toString();
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
