package com.wikinode.studio.repository;

import com.wikinode.studio.model.GraphEdge;
import com.wikinode.studio.model.GraphNode;
import com.wikinode.studio.model.IndexStatusSummary;
import com.wikinode.studio.model.IndexSegment;
import com.wikinode.studio.model.IndexSegmentMetadataSummaryItem;
import com.wikinode.studio.model.KnowledgeBase;
import com.wikinode.studio.model.KnowledgeBaseLifecycleResult;
import com.wikinode.studio.model.KnowledgeBaseRequest;
import com.wikinode.studio.model.KnowledgeRelation;
import com.wikinode.studio.model.KnowledgeRelationEvidence;
import com.wikinode.studio.model.KnowledgeRelationRequest;
import com.wikinode.studio.model.ParsedDocument;
import com.wikinode.studio.model.ParsedDocumentSegment;
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
import com.wikinode.studio.model.RetrievalEvaluationCase;
import com.wikinode.studio.model.RetrievalEvaluationCaseRequest;
import com.wikinode.studio.model.RetrievalEvaluationRunResult;
import com.wikinode.studio.model.RetrievalLog;
import com.wikinode.studio.model.RetrievalMatchedSegment;
import com.wikinode.studio.model.RetrievalQuery;
import com.wikinode.studio.model.RetrievalResult;
import com.wikinode.studio.model.SourceItem;
import com.wikinode.studio.model.SourceIngestionRunRequest;
import com.wikinode.studio.model.SourceIngestionRunResult;
import com.wikinode.studio.model.SourceImportResult;
import com.wikinode.studio.model.SourceOperation;
import com.wikinode.studio.model.SourceRef;
import com.wikinode.studio.model.WikiGraphOverview;
import com.wikinode.studio.model.WikiLink;
import com.wikinode.studio.model.WikiNode;
import com.wikinode.studio.model.WikiNodeLifecycleResult;
import com.wikinode.studio.model.WikiNodeUpsertRequest;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
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
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

abstract class AbstractWikiNodeRepository implements WikiNodeRepository {

  private static final Pattern DOUBLE_LINK_PATTERN = Pattern.compile("\\[\\[([^\\]]+)]]");

  protected abstract List<WikiNode> loadNodes();

  protected abstract List<KnowledgeBase> loadKnowledgeBases();

  protected abstract void insertKnowledgeBase(KnowledgeBase knowledgeBase);

  protected abstract void replaceKnowledgeBase(String kbId, KnowledgeBase knowledgeBase);

  protected abstract Optional<WikiNode> loadNode(String nodeId);

  protected abstract void insertNode(WikiNode node);

  protected abstract void replaceNode(String nodeId, WikiNode node);

  protected abstract List<SourceItem> loadSources();

  protected abstract List<RawMaterial> loadRawMaterials();

  protected abstract List<ParsedDocument> loadParsedDocuments();

  protected abstract List<ParsedDocumentSegment> loadParsedDocumentSegments();

  protected abstract List<SourceOperation> loadSourceOperations();

  protected abstract List<ParserProfile> loadParserProfiles();

  protected abstract List<IndexSegment> loadIndexSegments();

  protected abstract void replaceGeneratedIndexSegments(String nodeId, List<IndexSegment> segments);

  protected abstract List<DraftWikiNodeSuggestion> loadDraftWikiNodeSuggestions();

  protected abstract List<RetrievalLog> loadRetrievalLogs();

  protected abstract void insertRetrievalLog(RetrievalLog log);

  protected abstract List<RetrievalEvaluationCase> loadRetrievalEvaluationCases();

  protected abstract void insertRetrievalEvaluationCase(RetrievalEvaluationCase evaluationCase);

  protected abstract void insertSourceOperation(SourceOperation operation);

  protected abstract void insertRawMaterial(RawMaterial rawMaterial);

  protected abstract void insertParsedDocument(ParsedDocument parsedDocument);

  protected abstract void replaceParsedDocumentSegments(String parsedDocumentId, List<ParsedDocumentSegment> segments);

  protected abstract void insertDraftWikiNodeSuggestion(DraftWikiNodeSuggestion suggestion);

  @Override
  public List<KnowledgeBase> listKnowledgeBases(String keyword, String status, String visibility) {
    String cleanKeyword = Optional.ofNullable(keyword).orElse("").trim().toLowerCase(Locale.ROOT);
    return loadKnowledgeBases().stream()
      .map(this::withKnowledgeBaseCounts)
      .filter(kb -> cleanKeyword.isBlank()
        || kb.kbId().toLowerCase(Locale.ROOT).contains(cleanKeyword)
        || kb.name().toLowerCase(Locale.ROOT).contains(cleanKeyword)
        || kb.description().toLowerCase(Locale.ROOT).contains(cleanKeyword)
        || kb.businessDomain().toLowerCase(Locale.ROOT).contains(cleanKeyword))
      .filter(kb -> status == null || status.isBlank() || status.equals(kb.status()))
      .filter(kb -> visibility == null || visibility.isBlank() || visibility.equals(kb.visibility()))
      .toList();
  }

  @Override
  public Optional<KnowledgeBase> findKnowledgeBase(String kbId) {
    return loadKnowledgeBases().stream()
      .filter(kb -> kb.kbId().equals(kbId))
      .findFirst()
      .map(this::withKnowledgeBaseCounts);
  }

  @Override
  public KnowledgeBase createKnowledgeBase(KnowledgeBaseRequest request) {
    KnowledgeBase knowledgeBase = knowledgeBaseFromRequest(null, request, null);
    if (findKnowledgeBase(knowledgeBase.kbId()).isPresent()) {
      throw new IllegalArgumentException("Knowledge Base already exists");
    }
    insertKnowledgeBase(knowledgeBase);
    return findKnowledgeBase(knowledgeBase.kbId()).orElse(knowledgeBase);
  }

  @Override
  public KnowledgeBase updateKnowledgeBase(String kbId, KnowledgeBaseRequest request) {
    KnowledgeBase existing = findKnowledgeBase(kbId)
      .orElseThrow(() -> new IllegalArgumentException("Knowledge Base not found"));
    KnowledgeBase knowledgeBase = knowledgeBaseFromRequest(kbId, request, existing);
    replaceKnowledgeBase(kbId, knowledgeBase);
    return findKnowledgeBase(kbId).orElse(knowledgeBase);
  }

  @Override
  public KnowledgeBaseLifecycleResult disableKnowledgeBase(String kbId) {
    return transitionKnowledgeBase(kbId, "disabled", "已停用知识库，现有关联 WikiNode 和 Source 保持不变。", null);
  }

  @Override
  public KnowledgeBaseLifecycleResult archiveKnowledgeBase(String kbId) {
    String today = LocalDate.now().toString();
    return transitionKnowledgeBase(kbId, "archived", "已归档知识库，现有关联 WikiNode 和 Source 保留为只读范围。", today);
  }

  @Override
  public KnowledgeBaseLifecycleResult restoreKnowledgeBase(String kbId) {
    return transitionKnowledgeBase(kbId, "active", "已恢复知识库，可继续作为 WikiNode、Source 和 Retrieval API 范围。", null);
  }

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
  public WikiNodeLifecycleResult publishWikiNode(String nodeId) {
    WikiNode existing = loadNode(nodeId).orElseThrow(() -> new IllegalArgumentException("WikiNode not found"));
    if ("archived".equals(existing.status())) {
      throw new IllegalArgumentException("已归档 WikiNode 不能发布。");
    }

    String today = LocalDate.now().toString();
    WikiNode published = nodeWithLifecycle(existing, "published", "not_indexed", today, null);
    replaceNode(nodeId, published);
    List<IndexSegment> segments = generateIndexSegmentsForNode(nodeId);

    return new WikiNodeLifecycleResult(
      nodeId,
      published.knowledgeBaseId(),
      "published",
      "not_indexed",
      "已发布 WikiNode，并准备 %d 条本地 Index Segment；本地 Index Segment 已准备，外部向量库尚未同步。".formatted(segments.size()),
      segments.size(),
      today,
      published.lastIndexedAt()
    );
  }

  @Override
  public WikiNodeLifecycleResult reindexWikiNode(String nodeId) {
    WikiNode existing = loadNode(nodeId).orElseThrow(() -> new IllegalArgumentException("WikiNode not found"));
    String nextIndexStatus = "not_indexed";
    WikiNode prepared = nodeWithLifecycle(existing, existing.status(), nextIndexStatus, null, null);
    replaceNode(nodeId, prepared);
    List<IndexSegment> segments = generateIndexSegmentsForNode(nodeId);

    return new WikiNodeLifecycleResult(
      nodeId,
      prepared.knowledgeBaseId(),
      prepared.status(),
      nextIndexStatus,
      "已重新准备 %d 条本地 Index Segment；本地 Index Segment 已重新准备，外部向量库尚未同步。".formatted(segments.size()),
      segments.size(),
      null,
      prepared.lastIndexedAt()
    );
  }

  @Override
  public List<KnowledgeRelation> listKnowledgeRelations(String nodeId) {
    WikiNode node = loadNode(nodeId).orElseThrow(() -> new IllegalArgumentException("WikiNode not found"));
    return List.copyOf(node.relations());
  }

  @Override
  public KnowledgeRelation createKnowledgeRelation(String nodeId, KnowledgeRelationRequest request) {
    WikiNode node = loadNode(nodeId).orElseThrow(() -> new IllegalArgumentException("WikiNode not found"));
    KnowledgeRelation relation = relationFromRequest(nodeId, null, request);
    List<KnowledgeRelation> relations = new ArrayList<>(node.relations());
    relations.add(relation);
    replaceNode(nodeId, nodeWithRelations(node, relations));
    return relation;
  }

  @Override
  public KnowledgeRelation updateKnowledgeRelation(String nodeId, String relationId, KnowledgeRelationRequest request) {
    WikiNode node = loadNode(nodeId).orElseThrow(() -> new IllegalArgumentException("WikiNode not found"));
    List<KnowledgeRelation> relations = new ArrayList<>(node.relations());
    int index = relationIndex(relations, relationId);
    KnowledgeRelation relation = relationFromRequest(nodeId, relationId, request);
    relations.set(index, relation);
    replaceNode(nodeId, nodeWithRelations(node, relations));
    return relation;
  }

  @Override
  public void deleteKnowledgeRelation(String nodeId, String relationId) {
    WikiNode node = loadNode(nodeId).orElseThrow(() -> new IllegalArgumentException("WikiNode not found"));
    List<KnowledgeRelation> relations = new ArrayList<>(node.relations());
    int index = relationIndex(relations, relationId);
    relations.remove(index);
    replaceNode(nodeId, nodeWithRelations(node, relations));
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
    long startedAt = System.nanoTime();
    try {
      List<RetrievalResult> results = searchResults(query);
      insertRetrievalLog(retrievalLog(query, results, startedAt, "succeeded", null));
      return results;
    } catch (RuntimeException error) {
      insertRetrievalLog(retrievalLog(query, List.of(), startedAt, "failed", error.getMessage()));
      throw error;
    }
  }

  @Override
  public List<RetrievalLog> listRetrievalLogs() {
    return loadRetrievalLogs().stream()
      .sorted(Comparator.comparing(RetrievalLog::createdAt).reversed())
      .toList();
  }

  @Override
  public List<RetrievalEvaluationCase> listRetrievalEvaluationCases() {
    return List.copyOf(loadRetrievalEvaluationCases());
  }

  @Override
  public RetrievalEvaluationCase createRetrievalEvaluationCase(RetrievalEvaluationCaseRequest request) {
    RetrievalQuery query = new RetrievalQuery(
      request.query(),
      request.filters(),
      request.topK(),
      true
    );
    List<RetrievalResult> results = searchResults(query);
    List<String> returnedNodeIds = results.stream().map(result -> result.node().nodeId()).toList();
    List<String> matchedSegmentIds = matchedSegmentIds(results);
    List<String> expectedNodeIds = request.expectedNodeIds() == null ? List.of() : request.expectedNodeIds();
    boolean passed = expectedNodeIds.isEmpty() || returnedNodeIds.containsAll(expectedNodeIds);
    RetrievalEvaluationRunResult runResult = new RetrievalEvaluationRunResult(
      returnedNodeIds,
      matchedSegmentIds,
      passed ? "passed" : "failed",
      passed ? "命中预期 WikiNode。" : "未命中全部预期 WikiNode。"
    );
    String now = today();
    RetrievalEvaluationCase evaluationCase = new RetrievalEvaluationCase(
      request.caseId() == null || request.caseId().isBlank() ? "eval-%d".formatted(System.currentTimeMillis()) : request.caseId(),
      request.query(),
      request.filters() == null ? new RetrievalQuery.RetrievalFilters(null, null, null) : request.filters(),
      request.topK() > 0 ? request.topK() : 5,
      expectedNodeIds,
      runResult,
      now,
      now
    );
    insertRetrievalEvaluationCase(evaluationCase);
    return evaluationCase;
  }

  private List<RetrievalResult> searchResults(RetrievalQuery query) {
    String cleanQuery = Optional.ofNullable(query.query()).orElse("").trim();
    RetrievalQuery.RetrievalFilters filters = query.filters() == null
      ? new RetrievalQuery.RetrievalFilters(null, null, null)
      : query.filters();
    int limit = query.topK() > 0 ? query.topK() : 5;
    boolean debug = Boolean.TRUE.equals(query.debug());

    return listNodes().stream()
      .filter(node -> filters.knowledgeBaseId() == null || filters.knowledgeBaseId().equals(node.knowledgeBaseId()))
      .filter(node -> filters.nodeType() == null || filters.nodeType().equals(node.nodeType()))
      .filter(node -> filters.status() == null || filters.status().equals(node.status()))
      .map(node -> retrievalResult(node, cleanQuery, filters, debug))
      .filter(result -> result.score() > 0.05 || cleanQuery.isBlank())
      .sorted(Comparator.comparingDouble(RetrievalResult::score).reversed())
      .limit(limit)
      .toList();
  }

  private RetrievalLog retrievalLog(
    RetrievalQuery query,
    List<RetrievalResult> results,
    long startedAt,
    String status,
    String errorSummary
  ) {
    long latencyMs = Math.max(1, (System.nanoTime() - startedAt) / 1_000_000);
    return new RetrievalLog(
      "rlog-%s".formatted(UUID.randomUUID()),
      Optional.ofNullable(query.query()).orElse(""),
      query.filters() == null ? new RetrievalQuery.RetrievalFilters(null, null, null) : query.filters(),
      results.stream().map(result -> result.node().nodeId()).toList(),
      matchedSegmentIds(results),
      latencyMs,
      status,
      errorSummary,
      OffsetDateTime.now(ZoneOffset.UTC).toString()
    );
  }

  private List<String> matchedSegmentIds(List<RetrievalResult> results) {
    return results.stream()
      .flatMap(result -> result.matchedSegments().stream())
      .map(RetrievalMatchedSegment::segmentId)
      .distinct()
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
  public SourceIngestionRunResult runSourceIngestion(String sourceId, SourceIngestionRunRequest request) {
    String operationId = sourceIngestionOperationIdFor(sourceId);
    List<RawMaterial> rawMaterials = listRawMaterialsForSource(sourceId);
    List<ParsedDocument> parsedDocuments = loadParsedDocuments().stream()
      .filter(parsedDocument -> sourceId.equals(parsedDocument.sourceId()))
      .toList();

    List<String> generatedSuggestionIds = new ArrayList<>();
    List<String> skippedParsedDocumentIds = new ArrayList<>();
    for (ParsedDocument parsedDocument : parsedDocuments) {
      DraftWikiNodeSuggestionGenerationResult result = generateDraftWikiNodeSuggestion(
        parsedDocument.parsedDocumentId(),
        new DraftWikiNodeSuggestionGenerationRequest(
          request == null ? null : request.conversionProfile(),
          "source-ingestion-%s-%s".formatted(sourceId, parsedDocument.parsedDocumentId())
        )
      );
      if ("succeeded".equals(result.status()) && result.suggestionId() != null) {
        generatedSuggestionIds.add(result.suggestionId());
      } else {
        skippedParsedDocumentIds.add(parsedDocument.parsedDocumentId());
      }
    }

    String status = generatedSuggestionIds.isEmpty() ? "skipped" : "succeeded";
    String summary = generatedSuggestionIds.isEmpty()
      ? "当前 Source 没有生成新的待审核 WikiNode 建议。"
      : "已从 Source 生成 %d 条待审核 WikiNode 建议。".formatted(generatedSuggestionIds.size());
    insertSourceOperation(new SourceOperation(
      operationId,
      "source_ingestion_run",
      sourceId,
      null,
      null,
      status,
      requestedBy(request),
      now(),
      now(),
      summary,
      null
    ));

    return new SourceIngestionRunResult(
      operationId,
      sourceId,
      status,
      summary,
      rawMaterials.size(),
      parsedDocuments.size(),
      generatedSuggestionIds,
      skippedParsedDocumentIds
    );
  }

  @Override
  public SourceImportResult importSourceFile(String sourceId, String fileName, byte[] content, String requestedBy, boolean generateSuggestion) {
    SourceItem source = findSource(sourceId).orElseThrow(() -> new IllegalArgumentException("Source not found"));
    String cleanFileName = cleanFileName(fileName);
    String normalizedContent = parseLocalDocument(cleanFileName, content);
    String now = now();
    String day = today();
    String fingerprint = shortHash(sourceId + cleanFileName + sha256(content) + now);
    String rawMaterialId = "rm-import-%s".formatted(fingerprint);
    String parsedDocumentId = "pd-import-%s".formatted(fingerprint);
    String operationId = "op-import-%s".formatted(fingerprint);
    String parseOperationId = "op-parse-%s".formatted(fingerprint);
    String contentFormat = contentFormatFor(cleanFileName);
    String parserProfile = parserProfileFor(cleanFileName);
    String title = titleFor(cleanFileName);
    String knowledgeBaseId = knowledgeBaseIdForSource(source);

    RawMaterial rawMaterial = new RawMaterial(
      rawMaterialId,
      sourceId,
      knowledgeBaseId,
      title,
      "file",
      day,
      now,
      "sha256:%s".formatted(sha256(content)),
      "local_workspace",
      "local-import://%s/%s".formatted(sourceId, cleanFileName),
      "parsed",
      1,
      day,
      day
    );
    ParsedDocument parsedDocument = new ParsedDocument(
      parsedDocumentId,
      rawMaterialId,
      sourceId,
      knowledgeBaseId,
      "%s 解析结果".formatted(title),
      contentFormat,
      normalizedContent,
      Map.of("language", "zh-CN", "businessDomain", businessDomainFor(source)),
      List.of(new ParsedDocumentSourceRef(
        sourceId,
        rawMaterialId,
        parsedDocumentId,
        "document",
        cleanFileName,
        preview(normalizedContent),
        0.92
      )),
      parserProfile,
      "parsed",
      null,
      day,
      day
    );
    List<ParsedDocumentSegment> segments = buildParsedDocumentSegments(parsedDocument, title);

    insertRawMaterial(rawMaterial);
    insertParsedDocument(parsedDocument);
    replaceParsedDocumentSegments(parsedDocumentId, segments);
    insertSourceOperation(new SourceOperation(
      operationId,
      "import_source_file",
      sourceId,
      knowledgeBaseId,
      rawMaterialId,
      parsedDocumentId,
      "succeeded",
      cleanRequestedBy(requestedBy),
      now,
      now,
      "已导入本地文件并生成 Raw Material。",
      null
    ));
    insertSourceOperation(new SourceOperation(
      parseOperationId,
      "parse_raw_material",
      sourceId,
      knowledgeBaseId,
      rawMaterialId,
      parsedDocumentId,
      "succeeded",
      cleanRequestedBy(requestedBy),
      now,
      now,
      "已解析为 Parsed Document，并生成 %d 条文档片段。".formatted(segments.size()),
      null
    ));
    String suggestionId = null;
    if (generateSuggestion) {
      DraftWikiNodeSuggestionGenerationResult result = generateDraftWikiNodeSuggestion(
        parsedDocumentId,
        new DraftWikiNodeSuggestionGenerationRequest(parserProfile, "source-import-%s".formatted(parsedDocumentId))
      );
      suggestionId = result.suggestionId();
    }

    return new SourceImportResult(
      operationId,
      sourceId,
      knowledgeBaseId,
      rawMaterialId,
      parsedDocumentId,
      "succeeded",
      suggestionId == null
        ? "已导入文件、生成 Parsed Document 和文档片段。"
        : "已导入文件、生成 Parsed Document、文档片段和待审核 WikiNode 建议。",
      segments.size(),
      segments.stream().map(ParsedDocumentSegment::segmentId).toList(),
      suggestionId
    );
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
  public List<ParsedDocumentSegment> listParsedDocumentSegments(String parsedDocumentId) {
    return loadParsedDocumentSegments().stream()
      .filter(segment -> segment.parsedDocumentId().equals(parsedDocumentId))
      .sorted(Comparator.comparingInt(ParsedDocumentSegment::position))
      .toList();
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
  public List<IndexSegment> listIndexSegments() {
    return List.copyOf(loadIndexSegments());
  }

  @Override
  public Optional<IndexSegment> findIndexSegment(String segmentId) {
    return loadIndexSegments().stream()
      .filter(segment -> segment.segmentId().equals(segmentId))
      .findFirst();
  }

  @Override
  public List<IndexSegment> listIndexSegmentsForNode(String nodeId) {
    return loadIndexSegments().stream()
      .filter(segment -> segment.nodeId().equals(nodeId))
      .toList();
  }

  @Override
  public List<IndexSegment> generateIndexSegmentsForNode(String nodeId) {
    WikiNode node = findNode(nodeId).orElseThrow(() -> new IllegalArgumentException("WikiNode not found"));
    List<IndexSegment> segments = generatedIndexSegments(node);
    replaceGeneratedIndexSegments(node.nodeId(), segments);
    return segments;
  }

  @Override
  public List<DraftWikiNodeSuggestion> listDraftWikiNodeSuggestions() {
    return loadDraftWikiNodeSuggestions().stream().map(this::cleanDraftSuggestion).toList();
  }

  @Override
  public List<DraftWikiNodeSuggestion> listDraftWikiNodeSuggestionsForParsedDocument(String parsedDocumentId) {
    return loadDraftWikiNodeSuggestions().stream()
      .filter(suggestion -> suggestion.parsedDocumentId().equals(parsedDocumentId))
      .map(this::cleanDraftSuggestion)
      .toList();
  }

  @Override
  public List<DraftWikiNodeSuggestion> listDraftWikiNodeSuggestionsForRawMaterial(String rawMaterialId) {
    return loadDraftWikiNodeSuggestions().stream()
      .filter(suggestion -> suggestion.rawMaterialId().equals(rawMaterialId))
      .map(this::cleanDraftSuggestion)
      .toList();
  }

  @Override
  public Optional<DraftWikiNodeSuggestion> findDraftWikiNodeSuggestion(String suggestionId) {
    return loadDraftWikiNodeSuggestions().stream()
      .filter(suggestion -> suggestion.suggestionId().equals(suggestionId))
      .map(this::cleanDraftSuggestion)
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
      suggestion.knowledgeBaseId(),
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
        suggestion.knowledgeBaseId(),
        "skipped",
        "该 WikiNode 建议已采纳。",
        suggestion.reviewNote(),
        existingNodeId,
        existingNodeId == null ? null : "draft",
        existingNodeId == null ? null : listIndexSegmentsForNode(existingNodeId).size()
      );
    }
    if (!Set.of("draft", "needs_review").contains(suggestion.status())) {
      return new DraftWikiNodeSuggestionAcceptResult(
        suggestion.suggestionId(),
        suggestion.knowledgeBaseId(),
        "skipped",
        "当前状态不能采纳该 WikiNode 建议。",
        suggestion.reviewNote(),
        null,
        null,
        null
      );
    }
    if (!"none".equals(suggestion.conflictStatus())) {
      return new DraftWikiNodeSuggestionAcceptResult(
        suggestion.suggestionId(),
        suggestion.knowledgeBaseId(),
        "skipped",
        "存在冲突，不能直接采纳为 WikiNode。",
        suggestion.reviewNote(),
        null,
        null,
        null
      );
    }
    if (loadNodes().stream().anyMatch(node -> suggestion.title().equals(node.title()))) {
      return new DraftWikiNodeSuggestionAcceptResult(
        suggestion.suggestionId(),
        suggestion.knowledgeBaseId(),
        "skipped",
        "已有 WikiNode 使用相同标题，不能直接采纳。",
        suggestion.reviewNote(),
        null,
        null,
        null
      );
    }

    String nodeId = acceptedNodeIdFor(suggestion);
    WikiNode node = acceptedDraftWikiNode(suggestion, nodeId);
    insertNode(node);
    List<IndexSegment> preparedSegments = generateIndexSegmentsForNode(nodeId);
    DraftWikiNodeSuggestion accepted = new DraftWikiNodeSuggestion(
      suggestion.suggestionId(),
      suggestion.parsedDocumentId(),
      suggestion.rawMaterialId(),
      suggestion.sourceId(),
      suggestion.knowledgeBaseId(),
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
      accepted.knowledgeBaseId(),
      accepted.status(),
      "已采纳为草稿 WikiNode，并准备 %d 条 Index Segment。".formatted(preparedSegments.size()),
      accepted.reviewNote(),
      node.nodeId(),
      node.status(),
      preparedSegments.size()
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
      suggestion.knowledgeBaseId(),
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
  public WikiGraphOverview graphOverview(String knowledgeBaseId) {
    String scope = knowledgeBaseId == null || knowledgeBaseId.isBlank() ? null : knowledgeBaseId;
    List<WikiNode> scopedNodes = listNodes().stream()
      .filter(node -> scope == null || scope.equals(node.knowledgeBaseId()))
      .toList();
    Set<String> scopedNodeIds = scopedNodes.stream()
      .map(WikiNode::nodeId)
      .collect(Collectors.toSet());

    return new WikiGraphOverview(
      scopedNodes.stream().map(this::graphNode).toList(),
      allLinks().stream()
        .filter(link -> scopedNodeIds.contains(link.fromNodeId()))
        .filter(link -> link.toNodeId() == null || scopedNodeIds.contains(link.toNodeId()))
        .map(this::graphEdge)
        .toList()
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

  private List<IndexSegment> generatedIndexSegments(WikiNode node) {
    List<IndexSegment> segments = new ArrayList<>();
    addGeneratedSegment(segments, node, "title", node.title());
    addGeneratedSegment(segments, node, "summary", node.summary());
    addGeneratedSegment(segments, node, "body", node.contentMarkdown());
    return segments;
  }

  private void addGeneratedSegment(List<IndexSegment> segments, WikiNode node, String segmentType, String content) {
    String normalizedContent = normalizeSegmentContent(content);
    if (normalizedContent.isBlank()) {
      return;
    }

    Map<String, Object> traceMetadata = new LinkedHashMap<>();
    if (node.metadata() != null) {
      traceMetadata.putAll(node.metadata());
    }
    traceMetadata.put("nodeType", node.nodeType());
    traceMetadata.put("status", node.status());
    traceMetadata.put("tags", node.tags());
    traceMetadata.put("objectType", node.objectType());
    traceMetadata.put("subtype", node.subtype());
    traceMetadata.put("generationMode", "local_deterministic");
    traceMetadata.put("traceSource", "wiki_node");
    traceMetadata.put("parentNodeId", node.nodeId());
    traceMetadata.put("parentNodeUpdatedAt", node.updatedAt());
    traceMetadata.put("strategyVersion", "index_segment_strategy_v1");
    traceMetadata.put("sourceRefIds", node.sourceRefs().stream().map(SourceRef::sourceId).toList());

    segments.add(new IndexSegment(
      generatedSegmentId(node.nodeId(), segmentType),
      node.nodeId(),
      node.title(),
      node.objectType(),
      node.subtype(),
      segmentType,
      normalizedContent,
      "%s / %s segment".formatted(node.title(), segmentTitle(segmentType)),
      preview(normalizedContent),
      tokenCount(normalizedContent),
      true,
      "not_indexed",
      null,
      null,
      0,
      null,
      node.sourceRefs(),
      node.sourceRefs().stream().map(SourceRef::sourceId).toList(),
      node.processingProfile(),
      generatedMetadataSummary(node, traceMetadata),
      today(),
      today(),
      traceMetadata
    ));
  }

  private List<IndexSegmentMetadataSummaryItem> generatedMetadataSummary(WikiNode node, Map<String, Object> metadata) {
    List<IndexSegmentMetadataSummaryItem> summary = new ArrayList<>();
    summary.add(new IndexSegmentMetadataSummaryItem("objectType", node.objectType()));
    summary.add(new IndexSegmentMetadataSummaryItem("subtype", node.subtype()));
    if (metadata.get("businessDomain") != null) {
      summary.add(new IndexSegmentMetadataSummaryItem("businessDomain", metadata.get("businessDomain").toString()));
    }
    summary.add(new IndexSegmentMetadataSummaryItem("generationMode", "local_deterministic"));
    summary.add(new IndexSegmentMetadataSummaryItem("traceSource", "wiki_node"));
    summary.add(new IndexSegmentMetadataSummaryItem("parentNodeId", node.nodeId()));
    return summary;
  }

  private String generatedSegmentId(String nodeId, String segmentType) {
    return "seg-%s-%s".formatted(nodeId, segmentType);
  }

  private String segmentTitle(String segmentType) {
    return switch (segmentType) {
      case "title" -> "Title";
      case "summary" -> "Summary";
      default -> "Body";
    };
  }

  private String normalizeSegmentContent(String content) {
    return Optional.ofNullable(content).orElse("").replaceAll("\\s+", " ").trim();
  }

  private String preview(String content) {
    return content.length() <= 180 ? content : content.substring(0, 180);
  }

  private int tokenCount(String content) {
    if (content.isBlank()) {
      return 0;
    }
    int latinWords = content.replaceAll("[\\p{IsHan}]", " ").trim().split("\\s+").length;
    int hanChars = (int) content.codePoints().filter(codePoint -> Character.UnicodeScript.of(codePoint) == Character.UnicodeScript.HAN).count();
    return Math.max(1, latinWords + hanChars);
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
    return Set.of(
      "feishu_article_v1",
      "pdf_manual_article_v1",
      "excel_fee_table_v1",
      "local_markdown_file_v1",
      "local_text_file_v1",
      "local_docx_file_v1"
    ).contains(profile);
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
      knowledgeBaseIdForParsedDocument(parsedDocument),
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
      suggestion.knowledgeBaseId(),
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
      suggestion.objectType(),
      suggestion.subtype(),
      Map.copyOf(suggestion.metadataDraft()),
      suggestion.relationCandidates().stream()
        .map(candidate -> new KnowledgeRelation(
          null,
          nodeId,
          null,
          candidate.relationType(),
          "outgoing",
          candidate.confidence(),
          "system",
          null
        ))
        .toList(),
      null,
      summaryForSuggestion(suggestion),
      cleanDraftContent(suggestion.contentDraft()),
      tagsForSuggestion(suggestion),
      "draft",
      sourceRefsForSuggestion(suggestion),
      "not_indexed",
      0,
      0,
      0,
      today(),
      today(),
      null,
      knowledgeBaseIdForSuggestion(suggestion)
    );
  }

  private String knowledgeBaseIdForSuggestion(DraftWikiNodeSuggestion suggestion) {
    if (suggestion.knowledgeBaseId() != null && !suggestion.knowledgeBaseId().isBlank()) {
      return suggestion.knowledgeBaseId();
    }
    return loadSources().stream()
      .filter(source -> source.sourceId().equals(suggestion.sourceId()))
      .map(SourceItem::knowledgeBaseId)
      .filter(id -> id != null && !id.isBlank())
      .findFirst()
      .orElse(defaultKnowledgeBaseId(nodeTypeForSuggestion(suggestion)));
  }

  private String knowledgeBaseIdForParsedDocument(ParsedDocument parsedDocument) {
    if (parsedDocument.knowledgeBaseId() != null && !parsedDocument.knowledgeBaseId().isBlank()) {
      return parsedDocument.knowledgeBaseId();
    }
    return loadSources().stream()
      .filter(source -> source.sourceId().equals(parsedDocument.sourceId()))
      .map(this::knowledgeBaseIdForSource)
      .findFirst()
      .orElse(defaultKnowledgeBaseId("policy"));
  }

  private String knowledgeBaseIdForSource(SourceItem source) {
    if (source.knowledgeBaseId() != null && !source.knowledgeBaseId().isBlank()) {
      return source.knowledgeBaseId();
    }
    return "kb-cc-after-sales";
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
    String now = now();
    return new SourceOperation(
      operationId,
      "suggest_wikinode",
      parsedDocument.sourceId(),
      knowledgeBaseIdForParsedDocument(parsedDocument),
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

  private String sourceIngestionOperationIdFor(String sourceId) {
    return "op-%s-ingestion-%s".formatted(sourceId, System.currentTimeMillis());
  }

  private String requestedBy(SourceIngestionRunRequest request) {
    String requestedBy = request == null ? null : request.requestedBy();
    return requestedBy == null || requestedBy.isBlank() ? "system" : requestedBy.trim();
  }

  private String cleanRequestedBy(String requestedBy) {
    return requestedBy == null || requestedBy.isBlank() ? "system" : requestedBy.trim();
  }

  private String now() {
    return OffsetDateTime.now(ZoneOffset.ofHours(8)).toString();
  }

  private String cleanFileName(String fileName) {
    String clean = Optional.ofNullable(fileName).orElse("source-document.md").trim();
    clean = clean.replace("\\", "/");
    int slash = clean.lastIndexOf('/');
    if (slash >= 0) {
      clean = clean.substring(slash + 1);
    }
    return clean.isBlank() ? "source-document.md" : clean;
  }

  private String parseLocalDocument(String fileName, byte[] content) {
    if (content == null || content.length == 0) {
      throw new IllegalArgumentException("文件内容不能为空。");
    }
    String extension = extensionOf(fileName);
    if ("docx".equals(extension)) {
      return parseDocx(content);
    }
    if (Set.of("md", "markdown", "txt").contains(extension)) {
      return new String(content, StandardCharsets.UTF_8).trim();
    }
    throw new IllegalArgumentException("仅支持 txt、md、docx 文件。");
  }

  private String parseDocx(byte[] content) {
    try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(content))) {
      ZipEntry entry;
      while ((entry = zip.getNextEntry()) != null) {
        if ("word/document.xml".equals(entry.getName())) {
          String xml = new String(zip.readAllBytes(), StandardCharsets.UTF_8);
          return xml
            .replaceAll("</w:p>", "\n\n")
            .replaceAll("<[^>]+>", "")
            .replace("&amp;", "&")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replaceAll("\\n{3,}", "\n\n")
            .trim();
        }
      }
    } catch (IOException error) {
      throw new IllegalArgumentException("DOCX 解析失败。", error);
    }
    throw new IllegalArgumentException("DOCX 缺少正文内容。");
  }

  private List<ParsedDocumentSegment> buildParsedDocumentSegments(ParsedDocument parsedDocument, String documentTitle) {
    List<String> sections = splitIntoSections(parsedDocument.normalizedContent());
    List<ParsedDocumentSegment> segments = new ArrayList<>();
    for (int index = 0; index < sections.size(); index++) {
      String content = sections.get(index).trim();
      if (content.isBlank()) {
        continue;
      }
      String title = segmentTitle(content, documentTitle, index);
      segments.add(new ParsedDocumentSegment(
        "pds-%s-%03d".formatted(parsedDocument.parsedDocumentId(), index + 1),
        parsedDocument.parsedDocumentId(),
        parsedDocument.rawMaterialId(),
        parsedDocument.sourceId(),
        knowledgeBaseIdForParsedDocument(parsedDocument),
        index,
        segmentType(content),
        title,
        content,
        preview(content),
        tokenCount(content),
        "section:%d".formatted(index + 1),
        parsedDocument.createdAt(),
        parsedDocument.updatedAt()
      ));
    }
    if (segments.isEmpty()) {
      String content = parsedDocument.normalizedContent().trim();
      segments.add(new ParsedDocumentSegment(
        "pds-%s-001".formatted(parsedDocument.parsedDocumentId()),
        parsedDocument.parsedDocumentId(),
        parsedDocument.rawMaterialId(),
        parsedDocument.sourceId(),
        knowledgeBaseIdForParsedDocument(parsedDocument),
        0,
        "body",
        documentTitle,
        content,
        preview(content),
        tokenCount(content),
        "section:1",
        parsedDocument.createdAt(),
        parsedDocument.updatedAt()
      ));
    }
    return segments;
  }

  private List<String> splitIntoSections(String content) {
    String normalized = Optional.ofNullable(content).orElse("").trim();
    if (normalized.isBlank()) {
      return List.of();
    }
    List<String> blocks = new ArrayList<>();
    StringBuilder current = new StringBuilder();
    for (String line : normalized.split("\\R")) {
      if (line.startsWith("#") && !current.isEmpty()) {
        blocks.add(current.toString().trim());
        current.setLength(0);
      }
      current.append(line).append('\n');
      if (current.length() > 900 && line.isBlank()) {
        blocks.add(current.toString().trim());
        current.setLength(0);
      }
    }
    if (!current.isEmpty()) {
      blocks.add(current.toString().trim());
    }
    return blocks;
  }

  private String segmentTitle(String content, String documentTitle, int index) {
    Matcher heading = Pattern.compile("(?m)^#{1,6}\\s+(.+)$").matcher(content);
    if (heading.find()) {
      return heading.group(1).trim();
    }
    return index == 0 ? documentTitle : "%s / 文档片段 %d".formatted(documentTitle, index + 1);
  }

  private String segmentType(String content) {
    return content.startsWith("#") ? "section" : "body";
  }

  private String titleFor(String fileName) {
    String title = fileName.replaceFirst("\\.[^.]+$", "").replaceAll("[_-]+", " ").trim();
    return title.isBlank() ? "本地导入文档" : title;
  }

  private String contentFormatFor(String fileName) {
    return switch (extensionOf(fileName)) {
      case "txt" -> "plain_text";
      case "docx" -> "markdown";
      default -> "markdown";
    };
  }

  private String parserProfileFor(String fileName) {
    return switch (extensionOf(fileName)) {
      case "txt" -> "local_text_file_v1";
      case "docx" -> "local_docx_file_v1";
      default -> "local_markdown_file_v1";
    };
  }

  private String businessDomainFor(SourceItem source) {
    String type = Optional.ofNullable(source.sourceType()).orElse("");
    return switch (type) {
      case "pdf", "word" -> "product_support";
      case "excel" -> "service_fee";
      default -> "after_sales";
    };
  }

  private String extensionOf(String fileName) {
    String clean = Optional.ofNullable(fileName).orElse("").toLowerCase(Locale.ROOT);
    int dot = clean.lastIndexOf('.');
    return dot < 0 ? "" : clean.substring(dot + 1);
  }

  private String sha256(byte[] content) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hashed = digest.digest(content == null ? new byte[0] : content);
      StringBuilder builder = new StringBuilder();
      for (byte item : hashed) {
        builder.append("%02x".formatted(item));
      }
      return builder.toString();
    } catch (NoSuchAlgorithmException error) {
      throw new IllegalStateException("SHA-256 is unavailable", error);
    }
  }

  private String shortHash(String value) {
    return sha256(value.getBytes(StandardCharsets.UTF_8)).substring(0, 12);
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
    String content = Optional.ofNullable(parsedDocument.normalizedContent()).orElse("");
    Matcher heading = Pattern.compile("(?m)^#\\s+(.+)$").matcher(content);
    if (heading.find()) {
      return heading.group(1).trim();
    }
    String title = parsedDocument.title() == null ? "" : parsedDocument.title().trim();
    title = title.replaceAll("\\s*解析结果$", "").trim();
    if (!title.isBlank()) {
      return title;
    }
    return parsedDocument.parsedDocumentId();
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
      return content;
    }
    return "# %s\n\n%s".formatted(suggestedTitle, content);
  }

  private String cleanDraftContent(String content) {
    return Optional.ofNullable(content).orElse("")
      .replace("该内容仍是待审核 WikiNode 建议，不会自动创建 WikiNode、发布或索引。", "")
      .replace("该内容仍是待审核 WikiNode 建议，不会自动发布或索引。", "")
      .trim();
  }

  private DraftWikiNodeSuggestion cleanDraftSuggestion(DraftWikiNodeSuggestion suggestion) {
    return new DraftWikiNodeSuggestion(
      suggestion.suggestionId(),
      suggestion.parsedDocumentId(),
      suggestion.rawMaterialId(),
      suggestion.sourceId(),
      suggestion.knowledgeBaseId(),
      suggestion.operationId(),
      suggestion.title(),
      suggestion.objectType(),
      suggestion.subtype(),
      cleanDraftContent(suggestion.contentDraft()),
      suggestion.metadataDraft(),
      suggestion.sourceRefs(),
      suggestion.relationCandidates(),
      suggestion.confidence(),
      suggestion.status(),
      suggestion.reviewNote(),
      suggestion.conflictStatus(),
      suggestion.conflictReasons(),
      suggestion.matchedWikiNodeIds(),
      suggestion.matchedSuggestionIds(),
      suggestion.sourceRefCount(),
      suggestion.relationCandidateCount(),
      suggestion.createdAt(),
      suggestion.updatedAt()
    );
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
    RetrievalQuery.RetrievalFilters filters,
    boolean debug
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
      outgoingLinks(node.nodeId()),
      debug ? matchedSegments(node, score) : List.of()
    );
  }

  private List<RetrievalMatchedSegment> matchedSegments(WikiNode node, double nodeScore) {
    return listIndexSegmentsForNode(node.nodeId()).stream()
      .limit(2)
      .map(segment -> new RetrievalMatchedSegment(
        segment.segmentId(),
        segment.nodeId(),
        segment.segmentType(),
        Math.max(0.55, nodeScore - 0.05),
        segment.contentPreview(),
        segment.sourceRefIds() == null ? List.of() : segment.sourceRefIds(),
        segment.metadataSummary() == null ? List.of() : segment.metadataSummary()
      ))
      .toList();
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
      node.knowledgeBaseId(),
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
      node.objectType(),
      node.subtype(),
      node.metadata(),
      node.relations(),
      node.processingProfile(),
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
      node.lastIndexedAt(),
      node.knowledgeBaseId()
    );
  }

  private WikiNode nodeWithLifecycle(
    WikiNode node,
    String status,
    String indexStatus,
    String lastPublishedAt,
    String lastIndexedAt
  ) {
    Map<String, Object> metadata = new LinkedHashMap<>(node.metadata() == null ? Map.of() : node.metadata());
    metadata.put("lifecycleStatus", status);
    if (lastPublishedAt != null) {
      metadata.put("lastPublishedAt", lastPublishedAt);
    }

    return new WikiNode(
      node.nodeId(),
      node.slug(),
      node.title(),
      node.nodeType(),
      node.objectType(),
      node.subtype(),
      metadata,
      node.relations(),
      node.processingProfile(),
      node.summary(),
      node.contentMarkdown(),
      node.tags(),
      status,
      node.sourceRefs(),
      indexStatus,
      node.incomingCount(),
      node.outgoingCount(),
      node.brokenLinkCount(),
      node.createdAt(),
      LocalDate.now().toString(),
      lastIndexedAt,
      node.knowledgeBaseId()
    );
  }

  private WikiNode buildNode(String pathNodeId, WikiNodeUpsertRequest request, WikiNode existing) {
    String today = LocalDate.now().toString();
    String nodeId = valueOrDefault(pathNodeId, valueOrDefault(request.nodeId(), valueOrDefault(request.slug(), request.title())));
    String slug = valueOrDefault(request.slug(), nodeId);
    String title = valueOrDefault(request.title(), existing == null ? slug : existing.title());
    String createdAt = valueOrDefault(request.createdAt(), existing == null ? today : existing.createdAt());
    String nodeType = valueOrDefault(request.nodeType(), existing == null ? "term" : existing.nodeType());

    return new WikiNode(
      nodeId,
      slug,
      title,
      nodeType,
      valueOrDefault(request.objectType(), existing == null ? objectTypeForNodeType(nodeType) : existing.objectType()),
      valueOrDefault(request.subtype(), existing == null ? subtypeForNodeType(nodeType) : existing.subtype()),
      mapOrDefault(request.metadata(), existing == null ? metadataForStatus(request.status()) : existing.metadata()),
      listOrDefault(request.relations(), existing == null ? List.of() : existing.relations()),
      valueOrDefault(request.processingProfile(), existing == null ? processingProfileForNodeType(nodeType) : existing.processingProfile()),
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
      request.lastIndexedAt() == null && existing != null ? existing.lastIndexedAt() : request.lastIndexedAt(),
      existing == null ? defaultKnowledgeBaseId(nodeType) : existing.knowledgeBaseId()
    );
  }

  private KnowledgeRelation relationFromRequest(String nodeId, String existingRelationId, KnowledgeRelationRequest request) {
    if (request == null) {
      throw new IllegalArgumentException("关系内容不能为空。");
    }
    String targetNodeId = Optional.ofNullable(request.targetNodeId()).orElse("").trim();
    if (targetNodeId.isBlank()) {
      throw new IllegalArgumentException("目标 WikiNode 不能为空。");
    }
    if (loadNode(targetNodeId).isEmpty()) {
      throw new IllegalArgumentException("目标 WikiNode 不存在。");
    }
    String relationType = valueOrDefault(request.relationType(), "references");
    String status = valueOrDefault(request.status(), "active");
    String source = valueOrDefault(request.source(), "manual");
    String relationId = existingRelationId == null || existingRelationId.isBlank()
      ? "rel-%s-%s".formatted(nodeId, UUID.randomUUID())
      : existingRelationId;

    return new KnowledgeRelation(
      relationId,
      nodeId,
      targetNodeId,
      relationType,
      status,
      source,
      "outgoing",
      request.confidence(),
      "manual".equals(source) ? "user" : "system",
      blankToNull(request.anchorText()),
      blankToNull(request.note()),
      blankToNull(request.evidenceSourceRefId()) == null ? null : new KnowledgeRelationEvidence(request.evidenceSourceRefId())
    );
  }

  private int relationIndex(List<KnowledgeRelation> relations, String relationId) {
    for (int index = 0; index < relations.size(); index++) {
      if (relationId.equals(relations.get(index).id())) {
        return index;
      }
    }
    throw new IllegalArgumentException("Knowledge Relation not found");
  }

  private WikiNode nodeWithRelations(WikiNode node, List<KnowledgeRelation> relations) {
    return new WikiNode(
      node.nodeId(),
      node.slug(),
      node.title(),
      node.nodeType(),
      node.objectType(),
      node.subtype(),
      node.metadata(),
      relations,
      node.processingProfile(),
      node.summary(),
      node.contentMarkdown(),
      node.tags(),
      node.status(),
      node.sourceRefs(),
      node.indexStatus(),
      0,
      0,
      0,
      node.createdAt(),
      LocalDate.now().toString(),
      node.lastIndexedAt(),
      node.knowledgeBaseId()
    );
  }

  private KnowledgeBase withKnowledgeBaseCounts(KnowledgeBase knowledgeBase) {
    int wikiNodeCount = (int) loadNodes().stream()
      .filter(node -> knowledgeBase.kbId().equals(node.knowledgeBaseId()))
      .count();
    int sourceCount = (int) loadSources().stream()
      .filter(source -> knowledgeBase.kbId().equals(source.knowledgeBaseId()))
      .count();
    return new KnowledgeBase(
      knowledgeBase.kbId(),
      knowledgeBase.name(),
      knowledgeBase.description(),
      knowledgeBase.businessDomain(),
      knowledgeBase.type(),
      knowledgeBase.status(),
      knowledgeBase.visibility(),
      knowledgeBase.owner(),
      knowledgeBase.settings(),
      wikiNodeCount,
      sourceCount,
      knowledgeBase.archivedAt(),
      knowledgeBase.createdAt(),
      knowledgeBase.updatedAt()
    );
  }

  private KnowledgeBase knowledgeBaseFromRequest(String pathKbId, KnowledgeBaseRequest request, KnowledgeBase existing) {
    if (request == null) {
      throw new IllegalArgumentException("Knowledge Base 内容不能为空。");
    }
    String today = LocalDate.now().toString();
    String kbId = valueOrDefault(pathKbId, valueOrDefault(request.kbId(), existing == null ? null : existing.kbId()));
    if (kbId == null || kbId.isBlank()) {
      throw new IllegalArgumentException("Knowledge Base ID 不能为空。");
    }
    String name = valueOrDefault(request.name(), existing == null ? null : existing.name());
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("知识库名称不能为空。");
    }
    return new KnowledgeBase(
      kbId,
      name,
      valueOrDefault(request.description(), existing == null ? "" : existing.description()),
      valueOrDefault(request.businessDomain(), existing == null ? "general" : existing.businessDomain()),
      valueOrDefault(request.type(), existing == null ? "mixed" : existing.type()),
      valueOrDefault(request.status(), existing == null ? "active" : existing.status()),
      valueOrDefault(request.visibility(), existing == null ? "internal" : existing.visibility()),
      valueOrDefault(request.owner(), existing == null ? "Knowledge Ops" : existing.owner()),
      mapOrDefault(request.settings(), existing == null ? defaultKnowledgeBaseSettings() : existing.settings()),
      existing == null ? 0 : existing.wikiNodeCount(),
      existing == null ? 0 : existing.sourceCount(),
      existing == null ? null : existing.archivedAt(),
      existing == null ? today : existing.createdAt(),
      today
    );
  }

  private KnowledgeBaseLifecycleResult transitionKnowledgeBase(String kbId, String status, String summary, String archivedAt) {
    KnowledgeBase existing = findKnowledgeBase(kbId)
      .orElseThrow(() -> new IllegalArgumentException("Knowledge Base not found"));
    String today = LocalDate.now().toString();
    KnowledgeBase next = new KnowledgeBase(
      existing.kbId(),
      existing.name(),
      existing.description(),
      existing.businessDomain(),
      existing.type(),
      status,
      existing.visibility(),
      existing.owner(),
      existing.settings(),
      existing.wikiNodeCount(),
      existing.sourceCount(),
      archivedAt,
      existing.createdAt(),
      today
    );
    replaceKnowledgeBase(kbId, next);
    return new KnowledgeBaseLifecycleResult(kbId, status, summary, archivedAt, today);
  }

  private String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value;
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

  private <T> List<T> listOrDefault(List<T> value, List<T> fallback) {
    return value == null ? fallback : value;
  }

  private Map<String, Object> mapOrDefault(Map<String, Object> value, Map<String, Object> fallback) {
    return value == null ? fallback : value;
  }

  private String objectTypeForNodeType(String nodeType) {
    return switch (nodeType == null ? "" : nodeType) {
      case "product" -> "Product";
      case "procedure", "troubleshooting" -> "Procedure";
      case "fee_rule", "regulation" -> "Rule";
      default -> "Article";
    };
  }

  private String subtypeForNodeType(String nodeType) {
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

  private Map<String, Object> metadataForStatus(String status) {
    return Map.of(
      "businessDomain", "after_sales",
      "language", "zh-CN",
      "lifecycleStatus", status == null ? "draft" : status
    );
  }

  private Map<String, Object> defaultKnowledgeBaseSettings() {
    return Map.of(
      "defaultNodeType", "policy",
      "defaultParserEngine", "markdown",
      "defaultStorageProvider", "workspace",
      "defaultVectorStore", "external_vector_store",
      "defaultPublishingPolicy", "manual",
      "defaultRetrievalStrategy", "wikinode_first"
    );
  }

  private String defaultKnowledgeBaseId(String nodeType) {
    return "troubleshooting".equals(nodeType) || "product".equals(nodeType) || "guide".equals(nodeType)
      ? "kb-product-guide"
      : "kb-cc-after-sales";
  }

  private String processingProfileForNodeType(String nodeType) {
    return switch (nodeType == null ? "" : nodeType) {
      case "product" -> "db_product_master_v1";
      case "procedure", "troubleshooting" -> "feishu_service_process_v1";
      case "fee_rule" -> "excel_fee_rule_v1";
      default -> "web_article_policy_v1";
    };
  }

  private List<SourceRef> sourceRefsOrDefault(List<SourceRef> value, List<SourceRef> fallback) {
    return value == null ? fallback : value;
  }

  private record LinkTarget(String key, String label) {
  }
}
