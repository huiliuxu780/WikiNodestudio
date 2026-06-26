package com.wikinode.studio.repository;

import com.wikinode.studio.model.IndexStatusSummary;
import com.wikinode.studio.model.IndexSegment;
import com.wikinode.studio.model.ParsedDocument;
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
import com.wikinode.studio.model.RetrievalQuery;
import com.wikinode.studio.model.RetrievalEvaluationCase;
import com.wikinode.studio.model.RetrievalEvaluationCaseRequest;
import com.wikinode.studio.model.RetrievalLog;
import com.wikinode.studio.model.RetrievalResult;
import com.wikinode.studio.model.SourceItem;
import com.wikinode.studio.model.SourceOperation;
import com.wikinode.studio.model.WikiGraphOverview;
import com.wikinode.studio.model.WikiLink;
import com.wikinode.studio.model.WikiNode;
import com.wikinode.studio.model.WikiNodeUpsertRequest;
import java.util.List;
import java.util.Optional;

public interface WikiNodeRepository {

  List<WikiNode> listNodes();

  Optional<WikiNode> findNode(String nodeId);

  WikiNode createNode(WikiNodeUpsertRequest request);

  WikiNode updateNode(String nodeId, WikiNodeUpsertRequest request);

  List<WikiLink> outgoingLinks(String nodeId);

  List<WikiLink> backlinks(String nodeId);

  List<WikiLink> brokenLinks();

  WikiGraphOverview graphOverview();

  WikiGraphOverview graphEgo(String nodeId);

  List<RetrievalResult> search(RetrievalQuery query);

  List<RetrievalLog> listRetrievalLogs();

  List<RetrievalEvaluationCase> listRetrievalEvaluationCases();

  RetrievalEvaluationCase createRetrievalEvaluationCase(RetrievalEvaluationCaseRequest request);

  List<SourceItem> listSources();

  Optional<SourceItem> findSource(String sourceId);

  List<RawMaterial> listRawMaterials();

  List<RawMaterial> listRawMaterialsForSource(String sourceId);

  Optional<RawMaterial> findRawMaterial(String rawMaterialId);

  List<ParsedDocument> listParsedDocumentsForRawMaterial(String rawMaterialId);

  Optional<ParsedDocument> findParsedDocument(String parsedDocumentId);

  List<SourceOperation> listSourceOperationsForSource(String sourceId);

  List<SourceOperation> listSourceOperationsForRawMaterial(String rawMaterialId);

  Optional<SourceOperation> findSourceOperation(String operationId);

  List<ParserProfile> listParserProfiles();

  List<IndexSegment> listIndexSegments();

  Optional<IndexSegment> findIndexSegment(String segmentId);

  List<IndexSegment> listIndexSegmentsForNode(String nodeId);

  List<IndexSegment> generateIndexSegmentsForNode(String nodeId);

  List<DraftWikiNodeSuggestion> listDraftWikiNodeSuggestions();

  List<DraftWikiNodeSuggestion> listDraftWikiNodeSuggestionsForParsedDocument(String parsedDocumentId);

  List<DraftWikiNodeSuggestion> listDraftWikiNodeSuggestionsForRawMaterial(String rawMaterialId);

  Optional<DraftWikiNodeSuggestion> findDraftWikiNodeSuggestion(String suggestionId);

  DraftWikiNodeSuggestionGenerationResult generateDraftWikiNodeSuggestion(
    String parsedDocumentId,
    DraftWikiNodeSuggestionGenerationRequest request
  );

  DraftWikiNodeSuggestionReviewResult rejectDraftWikiNodeSuggestion(
    String suggestionId,
    DraftWikiNodeSuggestionRejectRequest request
  );

  DraftWikiNodeSuggestionRetryResult retryDraftWikiNodeSuggestion(
    String suggestionId,
    DraftWikiNodeSuggestionRetryRequest request
  );

  DraftWikiNodeSuggestionAcceptResult acceptDraftWikiNodeSuggestion(
    String suggestionId,
    DraftWikiNodeSuggestionAcceptRequest request
  );

  IndexStatusSummary indexStatus();
}
