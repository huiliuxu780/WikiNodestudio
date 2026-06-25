package com.wikinode.studio.api;

import com.wikinode.studio.model.IndexStatusSummary;
import com.wikinode.studio.model.ParsedDocument;
import com.wikinode.studio.model.RawMaterial;
import com.wikinode.studio.model.RetrievalQuery;
import com.wikinode.studio.model.RetrievalResult;
import com.wikinode.studio.model.SourceItem;
import com.wikinode.studio.model.SourceOperation;
import com.wikinode.studio.model.WikiGraphOverview;
import com.wikinode.studio.model.WikiLink;
import com.wikinode.studio.model.WikiNode;
import com.wikinode.studio.model.WikiNodeUpsertRequest;
import com.wikinode.studio.repository.WikiNodeRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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

  @GetMapping("/source-operations/{operationId}")
  public SourceOperation getSourceOperation(@PathVariable String operationId) {
    return repository.findSourceOperation(operationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Source Operation not found"));
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
}
