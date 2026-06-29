package com.wikinode.studio.api;

import com.wikinode.studio.model.IndexStatusSummary;
import com.wikinode.studio.model.IndexSegment;
import com.wikinode.studio.model.KnowledgeBase;
import com.wikinode.studio.model.KnowledgeBaseLifecycleResult;
import com.wikinode.studio.model.KnowledgeBaseRequest;
import com.wikinode.studio.model.KnowledgeRelation;
import com.wikinode.studio.model.KnowledgeRelationRequest;
import com.wikinode.studio.model.ParsedDocument;
import com.wikinode.studio.model.ParsedDocumentSegment;
import com.wikinode.studio.model.ParserProfile;
import com.wikinode.studio.model.RawMaterial;
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
import com.wikinode.studio.model.RetrievalLog;
import com.wikinode.studio.model.RetrievalQuery;
import com.wikinode.studio.model.RetrievalResult;
import com.wikinode.studio.model.SourceItem;
import com.wikinode.studio.model.SourceIngestionRunRequest;
import com.wikinode.studio.model.SourceIngestionRunResult;
import com.wikinode.studio.model.SourceImportResult;
import com.wikinode.studio.model.SourceOperation;
import com.wikinode.studio.model.WikiGraphOverview;
import com.wikinode.studio.model.WikiLink;
import com.wikinode.studio.model.WikiNode;
import com.wikinode.studio.model.WikiNodeLifecycleResult;
import com.wikinode.studio.model.WikiNodeUpsertRequest;
import com.wikinode.studio.repository.WikiNodeRepository;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
})
public class WikiNodeController {

  private final WikiNodeRepository repository;

  public WikiNodeController(WikiNodeRepository repository) {
    this.repository = repository;
  }

  @GetMapping("/knowledge-bases")
  public List<KnowledgeBase> listKnowledgeBases(
    @RequestParam(required = false) String keyword,
    @RequestParam(required = false) String status,
    @RequestParam(required = false) String visibility
  ) {
    return repository.listKnowledgeBases(keyword, status, visibility);
  }

  @GetMapping("/knowledge-bases/{kbId}")
  public KnowledgeBase getKnowledgeBase(@PathVariable String kbId) {
    return repository.findKnowledgeBase(kbId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Knowledge Base not found"));
  }

  @PostMapping("/knowledge-bases")
  public KnowledgeBase createKnowledgeBase(@RequestBody KnowledgeBaseRequest request) {
    try {
      return repository.createKnowledgeBase(request);
    } catch (IllegalArgumentException error) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, error.getMessage());
    }
  }

  @PutMapping("/knowledge-bases/{kbId}")
  public KnowledgeBase updateKnowledgeBase(@PathVariable String kbId, @RequestBody KnowledgeBaseRequest request) {
    ensureKnowledgeBaseExists(kbId);
    try {
      return repository.updateKnowledgeBase(kbId, request);
    } catch (IllegalArgumentException error) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, error.getMessage());
    }
  }

  @PostMapping("/knowledge-bases/{kbId}/disable")
  public KnowledgeBaseLifecycleResult disableKnowledgeBase(@PathVariable String kbId) {
    ensureKnowledgeBaseExists(kbId);
    return repository.disableKnowledgeBase(kbId);
  }

  @PostMapping("/knowledge-bases/{kbId}/archive")
  public KnowledgeBaseLifecycleResult archiveKnowledgeBase(@PathVariable String kbId) {
    ensureKnowledgeBaseExists(kbId);
    return repository.archiveKnowledgeBase(kbId);
  }

  @PostMapping("/knowledge-bases/{kbId}/restore")
  public KnowledgeBaseLifecycleResult restoreKnowledgeBase(@PathVariable String kbId) {
    ensureKnowledgeBaseExists(kbId);
    return repository.restoreKnowledgeBase(kbId);
  }

  @GetMapping("/wiki-nodes")
  public List<WikiNode> listWikiNodes() {
    return repository.listNodes();
  }

  @GetMapping("/wiki-nodes/{id}")
  public WikiNode getWikiNode(@PathVariable String id) {
    return repository.findNode(id)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "WikiNode not found"));
  }

  @PostMapping("/wiki-nodes")
  public WikiNode createWikiNode(@RequestBody WikiNodeUpsertRequest request) {
    try {
      return repository.createNode(request);
    } catch (IllegalArgumentException error) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, error.getMessage());
    }
  }

  @PutMapping("/wiki-nodes/{id}")
  public WikiNode updateWikiNode(@PathVariable String id, @RequestBody WikiNodeUpsertRequest request) {
    if (repository.findNode(id).isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "WikiNode not found");
    }
    try {
      return repository.updateNode(id, request);
    } catch (IllegalArgumentException error) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, error.getMessage());
    }
  }

  @PostMapping("/wiki-nodes/{id}/publish")
  public WikiNodeLifecycleResult publishWikiNode(@PathVariable String id) {
    ensureNodeExists(id);
    try {
      return repository.publishWikiNode(id);
    } catch (IllegalArgumentException error) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, error.getMessage());
    }
  }

  @PostMapping("/wiki-nodes/{id}/reindex")
  public WikiNodeLifecycleResult reindexWikiNode(@PathVariable String id) {
    ensureNodeExists(id);
    try {
      return repository.reindexWikiNode(id);
    } catch (IllegalArgumentException error) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, error.getMessage());
    }
  }

  @GetMapping("/wiki-nodes/{id}/relations")
  public List<KnowledgeRelation> listKnowledgeRelations(@PathVariable String id) {
    ensureNodeExists(id);
    return repository.listKnowledgeRelations(id);
  }

  @PostMapping("/wiki-nodes/{id}/relations")
  public KnowledgeRelation createKnowledgeRelation(@PathVariable String id, @RequestBody KnowledgeRelationRequest request) {
    ensureNodeExists(id);
    try {
      return repository.createKnowledgeRelation(id, request);
    } catch (IllegalArgumentException error) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, error.getMessage());
    }
  }

  @PatchMapping("/wiki-nodes/{id}/relations/{relationId}")
  public KnowledgeRelation updateKnowledgeRelation(
    @PathVariable String id,
    @PathVariable String relationId,
    @RequestBody KnowledgeRelationRequest request
  ) {
    ensureNodeExists(id);
    try {
      return repository.updateKnowledgeRelation(id, relationId, request);
    } catch (IllegalArgumentException error) {
      throw new ResponseStatusException(
        "Knowledge Relation not found".equals(error.getMessage()) ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST,
        error.getMessage()
      );
    }
  }

  @DeleteMapping("/wiki-nodes/{id}/relations/{relationId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteKnowledgeRelation(@PathVariable String id, @PathVariable String relationId) {
    ensureNodeExists(id);
    try {
      repository.deleteKnowledgeRelation(id, relationId);
    } catch (IllegalArgumentException error) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, error.getMessage());
    }
  }

  @GetMapping("/wiki-nodes/{id}/links")
  public List<WikiLink> getWikiNodeLinks(@PathVariable String id) {
    ensureNodeExists(id);
    return repository.outgoingLinks(id);
  }

  @GetMapping("/wiki-nodes/{id}/backlinks")
  public List<WikiLink> getWikiNodeBacklinks(@PathVariable String id) {
    ensureNodeExists(id);
    return repository.backlinks(id);
  }

  @GetMapping("/broken-links")
  public List<WikiLink> listBrokenLinks() {
    return repository.brokenLinks();
  }

  @GetMapping("/wiki-graph/overview")
  public WikiGraphOverview getWikiGraphOverview() {
    return repository.graphOverview();
  }

  @GetMapping("/wiki-graph/ego/{id}")
  public WikiGraphOverview getWikiGraphEgo(@PathVariable String id) {
    ensureNodeExists(id);
    return repository.graphEgo(id);
  }

  @PostMapping("/retrieval-test")
  public List<RetrievalResult> retrievalTest(@RequestBody RetrievalQuery query) {
    return repository.search(query);
  }

  @GetMapping("/retrieval-test/logs")
  public List<RetrievalLog> listRetrievalLogs() {
    return repository.listRetrievalLogs();
  }

  @GetMapping("/retrieval-test/evaluation-cases")
  public List<RetrievalEvaluationCase> listRetrievalEvaluationCases() {
    return repository.listRetrievalEvaluationCases();
  }

  @PostMapping("/retrieval-test/evaluation-cases")
  public RetrievalEvaluationCase createRetrievalEvaluationCase(@RequestBody RetrievalEvaluationCaseRequest request) {
    return repository.createRetrievalEvaluationCase(request);
  }

  @GetMapping("/sources")
  public List<SourceItem> listSources() {
    return repository.listSources();
  }

  @GetMapping("/sources/{sourceId}")
  public SourceItem getSource(@PathVariable String sourceId) {
    return repository.findSource(sourceId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Source not found"));
  }

  @GetMapping("/sources/{sourceId}/raw-materials")
  public List<RawMaterial> listSourceRawMaterials(@PathVariable String sourceId) {
    ensureSourceExists(sourceId);
    return repository.listRawMaterialsForSource(sourceId);
  }

  @GetMapping("/sources/{sourceId}/operations")
  public List<SourceOperation> listSourceOperations(@PathVariable String sourceId) {
    ensureSourceExists(sourceId);
    return repository.listSourceOperationsForSource(sourceId);
  }

  @PostMapping("/sources/{sourceId}/ingestion-runs")
  public SourceIngestionRunResult runSourceIngestion(
    @PathVariable String sourceId,
    @RequestBody(required = false) SourceIngestionRunRequest request
  ) {
    ensureSourceExists(sourceId);
    return repository.runSourceIngestion(sourceId, request);
  }

  @PostMapping(value = "/sources/{sourceId}/raw-materials/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public SourceImportResult importSourceFile(
    @PathVariable String sourceId,
    @RequestPart("file") MultipartFile file,
    @RequestParam(required = false) String requestedBy,
    @RequestParam(defaultValue = "true") boolean generateSuggestion
  ) throws IOException {
    ensureSourceExists(sourceId);
    if (file == null || file.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
    }
    return repository.importSourceFile(sourceId, file.getOriginalFilename(), file.getBytes(), requestedBy, generateSuggestion);
  }

  @GetMapping("/raw-materials")
  public List<RawMaterial> listRawMaterials() {
    return repository.listRawMaterials();
  }

  @GetMapping("/raw-materials/{rawMaterialId}")
  public RawMaterial getRawMaterial(@PathVariable String rawMaterialId) {
    return repository.findRawMaterial(rawMaterialId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Raw Material not found"));
  }

  @GetMapping("/raw-materials/{rawMaterialId}/parsed-documents")
  public List<ParsedDocument> listRawMaterialParsedDocuments(@PathVariable String rawMaterialId) {
    ensureRawMaterialExists(rawMaterialId);
    return repository.listParsedDocumentsForRawMaterial(rawMaterialId);
  }

  @GetMapping("/raw-materials/{rawMaterialId}/operations")
  public List<SourceOperation> listRawMaterialOperations(@PathVariable String rawMaterialId) {
    ensureRawMaterialExists(rawMaterialId);
    return repository.listSourceOperationsForRawMaterial(rawMaterialId);
  }

  @GetMapping("/parsed-documents/{parsedDocumentId}")
  public ParsedDocument getParsedDocument(@PathVariable String parsedDocumentId) {
    return repository.findParsedDocument(parsedDocumentId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parsed Document not found"));
  }

  @GetMapping("/parsed-documents/{parsedDocumentId}/segments")
  public List<ParsedDocumentSegment> listParsedDocumentSegments(@PathVariable String parsedDocumentId) {
    ensureParsedDocumentExists(parsedDocumentId);
    return repository.listParsedDocumentSegments(parsedDocumentId);
  }

  @GetMapping("/source-operations/{operationId}")
  public SourceOperation getSourceOperation(@PathVariable String operationId) {
    return repository.findSourceOperation(operationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Source Operation not found"));
  }

  @GetMapping("/parser-profiles")
  public List<ParserProfile> listParserProfiles() {
    return repository.listParserProfiles();
  }

  @GetMapping("/index-segments")
  public List<IndexSegment> listIndexSegments() {
    return repository.listIndexSegments();
  }

  @GetMapping("/index-segments/{segmentId}")
  public IndexSegment getIndexSegment(@PathVariable String segmentId) {
    return repository.findIndexSegment(segmentId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Index Segment not found"));
  }

  @GetMapping("/wiki-nodes/{id}/index-segments")
  public List<IndexSegment> listWikiNodeIndexSegments(@PathVariable String id) {
    ensureNodeExists(id);
    return repository.listIndexSegmentsForNode(id);
  }

  @PostMapping("/wiki-nodes/{id}/index-segments/generate")
  public List<IndexSegment> generateWikiNodeIndexSegments(@PathVariable String id) {
    ensureNodeExists(id);
    return repository.generateIndexSegmentsForNode(id);
  }

  @GetMapping("/draft-wikinode-suggestions")
  public List<DraftWikiNodeSuggestion> listDraftWikiNodeSuggestions() {
    return repository.listDraftWikiNodeSuggestions();
  }

  @GetMapping("/draft-wikinode-suggestions/{suggestionId}")
  public DraftWikiNodeSuggestion getDraftWikiNodeSuggestion(@PathVariable String suggestionId) {
    return repository.findDraftWikiNodeSuggestion(suggestionId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Draft WikiNode Suggestion not found"));
  }

  @GetMapping("/parsed-documents/{parsedDocumentId}/draft-wikinode-suggestions")
  public List<DraftWikiNodeSuggestion> listParsedDocumentDraftWikiNodeSuggestions(@PathVariable String parsedDocumentId) {
    ensureParsedDocumentExists(parsedDocumentId);
    return repository.listDraftWikiNodeSuggestionsForParsedDocument(parsedDocumentId);
  }

  @PostMapping("/parsed-documents/{parsedDocumentId}/suggest-wikinode")
  public DraftWikiNodeSuggestionGenerationResult generateDraftWikiNodeSuggestion(
    @PathVariable String parsedDocumentId,
    @RequestBody(required = false) DraftWikiNodeSuggestionGenerationRequest request
  ) {
    return repository.generateDraftWikiNodeSuggestion(parsedDocumentId, request);
  }

  @PostMapping("/draft-wikinode-suggestions/{suggestionId}/reject")
  public DraftWikiNodeSuggestionReviewResult rejectDraftWikiNodeSuggestion(
    @PathVariable String suggestionId,
    @RequestBody(required = false) DraftWikiNodeSuggestionRejectRequest request
  ) {
    try {
      return repository.rejectDraftWikiNodeSuggestion(suggestionId, request);
    } catch (IllegalArgumentException error) {
      HttpStatus status = repository.findDraftWikiNodeSuggestion(suggestionId).isEmpty()
        ? HttpStatus.NOT_FOUND
        : HttpStatus.BAD_REQUEST;
      throw new ResponseStatusException(status, error.getMessage());
    }
  }

  @PostMapping("/draft-wikinode-suggestions/{suggestionId}/accept")
  public DraftWikiNodeSuggestionAcceptResult acceptDraftWikiNodeSuggestion(
    @PathVariable String suggestionId,
    @RequestBody(required = false) DraftWikiNodeSuggestionAcceptRequest request
  ) {
    try {
      return repository.acceptDraftWikiNodeSuggestion(suggestionId, request);
    } catch (IllegalArgumentException error) {
      HttpStatus status = repository.findDraftWikiNodeSuggestion(suggestionId).isEmpty()
        ? HttpStatus.NOT_FOUND
        : HttpStatus.BAD_REQUEST;
      throw new ResponseStatusException(status, error.getMessage());
    }
  }

  @PostMapping("/draft-wikinode-suggestions/{suggestionId}/retry")
  public DraftWikiNodeSuggestionRetryResult retryDraftWikiNodeSuggestion(
    @PathVariable String suggestionId,
    @RequestBody(required = false) DraftWikiNodeSuggestionRetryRequest request
  ) {
    try {
      return repository.retryDraftWikiNodeSuggestion(suggestionId, request);
    } catch (IllegalArgumentException error) {
      HttpStatus status = repository.findDraftWikiNodeSuggestion(suggestionId).isEmpty()
        ? HttpStatus.NOT_FOUND
        : HttpStatus.BAD_REQUEST;
      throw new ResponseStatusException(status, error.getMessage());
    }
  }

  @GetMapping("/raw-materials/{rawMaterialId}/draft-wikinode-suggestions")
  public List<DraftWikiNodeSuggestion> listRawMaterialDraftWikiNodeSuggestions(@PathVariable String rawMaterialId) {
    ensureRawMaterialExists(rawMaterialId);
    return repository.listDraftWikiNodeSuggestionsForRawMaterial(rawMaterialId);
  }

  @GetMapping("/index-status")
  public IndexStatusSummary getIndexStatus() {
    return repository.indexStatus();
  }

  private void ensureNodeExists(String id) {
    if (repository.findNode(id).isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "WikiNode not found");
    }
  }

  private void ensureKnowledgeBaseExists(String kbId) {
    if (repository.findKnowledgeBase(kbId).isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Knowledge Base not found");
    }
  }

  private void ensureSourceExists(String sourceId) {
    if (repository.findSource(sourceId).isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Source not found");
    }
  }

  private void ensureRawMaterialExists(String rawMaterialId) {
    if (repository.findRawMaterial(rawMaterialId).isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Raw Material not found");
    }
  }

  private void ensureParsedDocumentExists(String parsedDocumentId) {
    if (repository.findParsedDocument(parsedDocumentId).isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Parsed Document not found");
    }
  }
}
