package com.wikinode.studio.repository;

import com.wikinode.studio.model.IndexSegment;
import com.wikinode.studio.model.ParsedDocumentSegment;
import com.wikinode.studio.model.SourceItem;
import com.wikinode.studio.model.DraftWikiNodeSuggestion;
import com.wikinode.studio.model.ParsedDocument;
import com.wikinode.studio.model.ParserProfile;
import com.wikinode.studio.model.RawMaterial;
import com.wikinode.studio.model.RetrievalEvaluationCase;
import com.wikinode.studio.model.RetrievalLog;
import com.wikinode.studio.model.SourceOperation;
import com.wikinode.studio.model.WikiNode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile({"test", "mock"})
public class InMemoryWikiNodeRepository extends AbstractWikiNodeRepository {

  private final Map<String, WikiNode> nodes = new LinkedHashMap<>();
  private final List<SourceItem> sources = WikiNodeSeedData.sources();
  private final List<RawMaterial> rawMaterials = new ArrayList<>(WikiNodeSeedData.rawMaterials());
  private final List<ParsedDocument> parsedDocuments = new ArrayList<>(WikiNodeSeedData.parsedDocuments());
  private final List<ParsedDocumentSegment> parsedDocumentSegments = new ArrayList<>();
  private final List<SourceOperation> sourceOperations = new ArrayList<>(WikiNodeSeedData.sourceOperations());
  private final List<ParserProfile> parserProfiles = WikiNodeSeedData.parserProfiles();
  private final List<IndexSegment> indexSegments = new ArrayList<>(WikiNodeSeedData.indexSegments());
  private final List<RetrievalLog> retrievalLogs = new ArrayList<>();
  private final List<RetrievalEvaluationCase> retrievalEvaluationCases = new ArrayList<>();
  private final List<DraftWikiNodeSuggestion> draftWikiNodeSuggestions = new ArrayList<>(WikiNodeSeedData.draftWikiNodeSuggestions());

  public InMemoryWikiNodeRepository() {
    WikiNodeSeedData.nodes().forEach(node -> nodes.put(node.nodeId(), node));
  }

  @Override
  protected List<WikiNode> loadNodes() {
    return List.copyOf(nodes.values());
  }

  @Override
  protected Optional<WikiNode> loadNode(String nodeId) {
    return Optional.ofNullable(nodes.get(nodeId));
  }

  @Override
  protected void insertNode(WikiNode node) {
    if (nodes.containsKey(node.nodeId())) {
      throw new IllegalArgumentException("WikiNode slug already exists");
    }
    nodes.put(node.nodeId(), node);
  }

  @Override
  protected void replaceNode(String nodeId, WikiNode node) {
    if (!nodes.containsKey(nodeId)) {
      throw new IllegalArgumentException("WikiNode not found");
    }
    nodes.put(nodeId, node);
  }

  @Override
  protected List<SourceItem> loadSources() {
    return sources;
  }

  @Override
  protected List<RawMaterial> loadRawMaterials() {
    return rawMaterials;
  }

  @Override
  protected List<ParsedDocument> loadParsedDocuments() {
    return parsedDocuments;
  }

  @Override
  protected List<ParsedDocumentSegment> loadParsedDocumentSegments() {
    return parsedDocumentSegments;
  }

  @Override
  protected List<SourceOperation> loadSourceOperations() {
    return sourceOperations;
  }

  @Override
  protected List<ParserProfile> loadParserProfiles() {
    return parserProfiles;
  }

  @Override
  protected List<IndexSegment> loadIndexSegments() {
    return indexSegments;
  }

  @Override
  protected void replaceGeneratedIndexSegments(String nodeId, List<IndexSegment> segments) {
    List<String> generatedIds = List.of(
      "seg-%s-title".formatted(nodeId),
      "seg-%s-summary".formatted(nodeId),
      "seg-%s-body".formatted(nodeId)
    );
    indexSegments.removeIf(segment -> segment.nodeId().equals(nodeId) && generatedIds.contains(segment.segmentId()));
    indexSegments.addAll(segments);
  }

  @Override
  protected List<RetrievalLog> loadRetrievalLogs() {
    return retrievalLogs;
  }

  @Override
  protected void insertRetrievalLog(RetrievalLog log) {
    retrievalLogs.add(log);
  }

  @Override
  protected List<RetrievalEvaluationCase> loadRetrievalEvaluationCases() {
    return retrievalEvaluationCases;
  }

  @Override
  protected void insertRetrievalEvaluationCase(RetrievalEvaluationCase evaluationCase) {
    retrievalEvaluationCases.removeIf(existing -> existing.caseId().equals(evaluationCase.caseId()));
    retrievalEvaluationCases.add(evaluationCase);
  }

  @Override
  protected List<DraftWikiNodeSuggestion> loadDraftWikiNodeSuggestions() {
    return draftWikiNodeSuggestions;
  }

  @Override
  protected void insertSourceOperation(SourceOperation operation) {
    sourceOperations.removeIf(existing -> existing.operationId().equals(operation.operationId()));
    sourceOperations.add(operation);
  }

  @Override
  protected void insertRawMaterial(RawMaterial rawMaterial) {
    rawMaterials.removeIf(existing -> existing.rawMaterialId().equals(rawMaterial.rawMaterialId()));
    rawMaterials.add(rawMaterial);
  }

  @Override
  protected void insertParsedDocument(ParsedDocument parsedDocument) {
    parsedDocuments.removeIf(existing -> existing.parsedDocumentId().equals(parsedDocument.parsedDocumentId()));
    parsedDocuments.add(parsedDocument);
  }

  @Override
  protected void replaceParsedDocumentSegments(String parsedDocumentId, List<ParsedDocumentSegment> segments) {
    parsedDocumentSegments.removeIf(existing -> existing.parsedDocumentId().equals(parsedDocumentId));
    parsedDocumentSegments.addAll(segments);
  }

  @Override
  protected void insertDraftWikiNodeSuggestion(DraftWikiNodeSuggestion suggestion) {
    draftWikiNodeSuggestions.removeIf(existing -> existing.suggestionId().equals(suggestion.suggestionId()));
    draftWikiNodeSuggestions.add(suggestion);
  }
}
