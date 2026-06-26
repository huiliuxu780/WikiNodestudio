package com.wikinode.studio.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.wikinode.studio.model.RetrievalEvaluationCase;
import com.wikinode.studio.model.RetrievalEvaluationRunResult;
import com.wikinode.studio.model.RetrievalLog;
import com.wikinode.studio.model.RetrievalQuery;
import com.wikinode.studio.model.SourceItem;
import com.wikinode.studio.model.SourceOperation;
import com.wikinode.studio.model.SourceRef;
import com.wikinode.studio.model.WikiNode;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Profile("!test & !mock")
public class JdbcWikiNodeRepository extends AbstractWikiNodeRepository {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
  private static final TypeReference<Map<String, Object>> METADATA_TYPE = new TypeReference<>() {
  };

  private final JdbcTemplate jdbcTemplate;

  public JdbcWikiNodeRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @Override
  protected List<WikiNode> loadNodes() {
    return jdbcTemplate.query(
      """
      select node_id, slug, title, node_type, object_type, subtype, metadata_json, processing_profile,
             summary, content_markdown, status, index_status, created_at, updated_at, last_indexed_at
      from wiki_nodes
      order by created_at, node_id
      """,
      (resultSet, rowNumber) -> mapNodeBase(resultSet)
    ).stream().map(this::hydrateNode).toList();
  }

  @Override
  protected Optional<WikiNode> loadNode(String nodeId) {
    try {
      return Optional.ofNullable(jdbcTemplate.queryForObject(
        """
        select node_id, slug, title, node_type, object_type, subtype, metadata_json, processing_profile,
               summary, content_markdown, status, index_status, created_at, updated_at, last_indexed_at
        from wiki_nodes
        where node_id = ?
        """,
        (resultSet, rowNumber) -> mapNodeBase(resultSet),
        nodeId
      )).map(this::hydrateNode);
    } catch (EmptyResultDataAccessException error) {
      return Optional.empty();
    }
  }

  @Override
  @Transactional
  protected void insertNode(WikiNode node) {
    try {
      jdbcTemplate.update(
        """
        insert into wiki_nodes (
          node_id, slug, title, node_type, object_type, subtype, metadata_json, processing_profile,
          summary, content_markdown, status, index_status, created_at, updated_at, last_indexed_at
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        node.nodeId(),
        node.slug(),
        node.title(),
        node.nodeType(),
        node.objectType(),
        node.subtype(),
        toJson(node.metadata()),
        node.processingProfile(),
        node.summary(),
        node.contentMarkdown(),
        node.status(),
        node.indexStatus(),
        node.createdAt(),
        node.updatedAt(),
        node.lastIndexedAt()
      );
      replaceTags(node);
      replaceSourceRefs(node);
      replaceRelations(node);
    } catch (DuplicateKeyException error) {
      throw new IllegalArgumentException("WikiNode slug already exists", error);
    }
  }

  @Override
  @Transactional
  protected void replaceNode(String nodeId, WikiNode node) {
    try {
      int updated = jdbcTemplate.update(
        """
        update wiki_nodes
        set slug = ?, title = ?, node_type = ?, object_type = ?, subtype = ?, metadata_json = ?,
            processing_profile = ?, summary = ?, content_markdown = ?, status = ?, index_status = ?,
            created_at = ?, updated_at = ?, last_indexed_at = ?
        where node_id = ?
        """,
        node.slug(),
        node.title(),
        node.nodeType(),
        node.objectType(),
        node.subtype(),
        toJson(node.metadata()),
        node.processingProfile(),
        node.summary(),
        node.contentMarkdown(),
        node.status(),
        node.indexStatus(),
        node.createdAt(),
        node.updatedAt(),
        node.lastIndexedAt(),
        nodeId
      );
      if (updated == 0) {
        throw new IllegalArgumentException("WikiNode not found");
      }
      jdbcTemplate.update("delete from wiki_node_tags where node_id = ?", nodeId);
      jdbcTemplate.update("delete from wiki_node_source_refs where node_id = ?", nodeId);
      jdbcTemplate.update("delete from wiki_node_relations where source_node_id = ?", nodeId);
      replaceTags(node);
      replaceSourceRefs(node);
      replaceRelations(node);
    } catch (DuplicateKeyException error) {
      throw new IllegalArgumentException("WikiNode slug already exists", error);
    }
  }

  @Override
  protected List<SourceItem> loadSources() {
    return jdbcTemplate.query(
      """
      select s.source_id, s.source_type, s.title, s.owner, s.sync_status, s.last_synced_at, s.generated_nodes,
             (select count(*) from raw_materials rm where rm.source_id = s.source_id) as raw_material_count
      from source_items s
      order by s.source_id
      """,
      (resultSet, rowNumber) -> new SourceItem(
        resultSet.getString("source_id"),
        resultSet.getString("source_type"),
        resultSet.getString("title"),
        resultSet.getString("owner"),
        resultSet.getString("sync_status"),
        resultSet.getString("last_synced_at"),
        resultSet.getInt("generated_nodes"),
        resultSet.getInt("raw_material_count")
      )
    );
  }

  @Override
  protected List<RawMaterial> loadRawMaterials() {
    return jdbcTemplate.query(
      """
      select rm.raw_material_id, rm.source_id, rm.title, rm.raw_material_type, rm.source_version,
             rm.captured_at, rm.content_hash, rm.storage_provider, rm.storage_ref, rm.parse_status,
             (select count(*) from parsed_documents pd where pd.raw_material_id = rm.raw_material_id) as parsed_document_count,
             rm.created_at, rm.updated_at
      from raw_materials rm
      order by rm.created_at, rm.raw_material_id
      """,
      (resultSet, rowNumber) -> new RawMaterial(
        resultSet.getString("raw_material_id"),
        resultSet.getString("source_id"),
        resultSet.getString("title"),
        resultSet.getString("raw_material_type"),
        resultSet.getString("source_version"),
        resultSet.getString("captured_at"),
        resultSet.getString("content_hash"),
        resultSet.getString("storage_provider"),
        resultSet.getString("storage_ref"),
        resultSet.getString("parse_status"),
        resultSet.getInt("parsed_document_count"),
        resultSet.getString("created_at"),
        resultSet.getString("updated_at")
      )
    );
  }

  @Override
  protected List<ParsedDocument> loadParsedDocuments() {
    return jdbcTemplate.query(
      """
      select parsed_document_id, raw_material_id, source_id, title, content_format, normalized_content,
             metadata_language, metadata_business_domain, parser_profile, parse_status, parse_error_summary,
             created_at, updated_at
      from parsed_documents
      order by created_at, parsed_document_id
      """,
      (resultSet, rowNumber) -> {
        String parsedDocumentId = resultSet.getString("parsed_document_id");
        return new ParsedDocument(
          parsedDocumentId,
          resultSet.getString("raw_material_id"),
          resultSet.getString("source_id"),
          resultSet.getString("title"),
          resultSet.getString("content_format"),
          resultSet.getString("normalized_content"),
          metadata(resultSet),
          loadParsedDocumentSourceRefs(parsedDocumentId),
          resultSet.getString("parser_profile"),
          resultSet.getString("parse_status"),
          resultSet.getString("parse_error_summary"),
          resultSet.getString("created_at"),
          resultSet.getString("updated_at")
        );
      }
    );
  }

  @Override
  protected List<SourceOperation> loadSourceOperations() {
    return jdbcTemplate.query(
      """
      select operation_id, operation_type, source_id, raw_material_id, parsed_document_id, status,
             requested_by, started_at, finished_at, summary, error_summary
      from source_operations
      order by started_at desc, operation_id
      """,
      (resultSet, rowNumber) -> new SourceOperation(
        resultSet.getString("operation_id"),
        resultSet.getString("operation_type"),
        resultSet.getString("source_id"),
        resultSet.getString("raw_material_id"),
        resultSet.getString("parsed_document_id"),
        resultSet.getString("status"),
        resultSet.getString("requested_by"),
        resultSet.getString("started_at"),
        resultSet.getString("finished_at"),
        resultSet.getString("summary"),
        resultSet.getString("error_summary")
      )
    );
  }

  @Override
  protected List<ParserProfile> loadParserProfiles() {
    return jdbcTemplate.query(
      """
      select parser_profile, display_name, supported_raw_material_types, supported_source_types,
             content_format, enabled, version
      from parser_profiles
      order by parser_profile
      """,
      (resultSet, rowNumber) -> new ParserProfile(
        resultSet.getString("parser_profile"),
        resultSet.getString("display_name"),
        splitCsv(resultSet.getString("supported_raw_material_types")),
        splitCsv(resultSet.getString("supported_source_types")),
        resultSet.getString("content_format"),
        resultSet.getBoolean("enabled"),
        resultSet.getString("version")
      )
    );
  }

  @Override
  protected List<IndexSegment> loadIndexSegments() {
    return jdbcTemplate.query(
      """
      select segment_id, node_id, node_title, object_type, subtype, segment_type, content, title,
             content_preview, token_count, enabled, index_status, vector_doc_id, last_indexed_at,
             retrieval_hits, avg_score, processing_profile, metadata_node_type, metadata_status,
             metadata_tags, metadata_json, created_at, updated_at
      from index_segments
      order by created_at, segment_id
      """,
      (resultSet, rowNumber) -> mapIndexSegment(resultSet)
    );
  }

  @Override
  @Transactional
  protected void replaceGeneratedIndexSegments(String nodeId, List<IndexSegment> segments) {
    jdbcTemplate.update(
      "delete from index_segments where node_id = ? and segment_id in (?, ?, ?)",
      nodeId,
      "seg-%s-title".formatted(nodeId),
      "seg-%s-summary".formatted(nodeId),
      "seg-%s-body".formatted(nodeId)
    );
    for (IndexSegment segment : segments) {
      insertIndexSegment(segment);
    }
  }

  @Override
  protected List<RetrievalLog> loadRetrievalLogs() {
    return jdbcTemplate.query(
      """
      select log_id, query_text, filters_json, returned_node_ids, matched_segment_ids,
             latency_ms, status, error_summary, created_at
      from retrieval_query_logs
      order by created_at desc
      """,
      (resultSet, rowNumber) -> new RetrievalLog(
        resultSet.getString("log_id"),
        resultSet.getString("query_text"),
        filtersFromJson(resultSet.getString("filters_json")),
        splitCsv(resultSet.getString("returned_node_ids")),
        splitCsv(resultSet.getString("matched_segment_ids")),
        resultSet.getLong("latency_ms"),
        resultSet.getString("status"),
        resultSet.getString("error_summary"),
        resultSet.getString("created_at")
      )
    );
  }

  @Override
  protected void insertRetrievalLog(RetrievalLog log) {
    jdbcTemplate.update(
      """
      insert into retrieval_query_logs (
        log_id, query_text, filters_json, returned_node_ids, matched_segment_ids,
        latency_ms, status, error_summary, created_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)
      """,
      log.logId(),
      log.query(),
      filtersToJson(log.filters()),
      joinCsv(log.returnedNodeIds()),
      joinCsv(log.matchedSegmentIds()),
      log.latencyMs(),
      log.status(),
      log.errorSummary(),
      log.createdAt()
    );
  }

  @Override
  protected List<RetrievalEvaluationCase> loadRetrievalEvaluationCases() {
    return jdbcTemplate.query(
      """
      select case_id, query_text, filters_json, top_k, expected_node_ids,
             returned_node_ids, matched_segment_ids, run_status, run_summary,
             created_at, updated_at
      from retrieval_evaluation_cases
      order by created_at desc, case_id
      """,
      (resultSet, rowNumber) -> mapRetrievalEvaluationCase(resultSet)
    );
  }

  @Override
  protected void insertRetrievalEvaluationCase(RetrievalEvaluationCase evaluationCase) {
    jdbcTemplate.update(
      "delete from retrieval_evaluation_cases where case_id = ?",
      evaluationCase.caseId()
    );
    jdbcTemplate.update(
      """
      insert into retrieval_evaluation_cases (
        case_id, query_text, filters_json, top_k, expected_node_ids,
        returned_node_ids, matched_segment_ids, run_status, run_summary,
        created_at, updated_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      """,
      evaluationCase.caseId(),
      evaluationCase.query(),
      filtersToJson(evaluationCase.filters()),
      evaluationCase.topK(),
      joinCsv(evaluationCase.expectedNodeIds()),
      joinCsv(evaluationCase.runResult().returnedNodeIds()),
      joinCsv(evaluationCase.runResult().matchedSegmentIds()),
      evaluationCase.runResult().status(),
      evaluationCase.runResult().summary(),
      evaluationCase.createdAt(),
      evaluationCase.updatedAt()
    );
  }

  @Override
  protected List<DraftWikiNodeSuggestion> loadDraftWikiNodeSuggestions() {
    return jdbcTemplate.query(
      """
      select suggestion_id, parsed_document_id, raw_material_id, source_id, operation_id, title,
             object_type, subtype, content_draft, metadata_language, metadata_business_domain,
             confidence, status, review_note, conflict_status, conflict_reasons,
             matched_wiki_node_ids, matched_suggestion_ids, created_at, updated_at
      from draft_wikinode_suggestions
      order by created_at, suggestion_id
      """,
      (resultSet, rowNumber) -> {
        String suggestionId = resultSet.getString("suggestion_id");
        List<ParsedDocumentSourceRef> sourceRefs = loadDraftWikiNodeSuggestionSourceRefs(suggestionId);
        List<DraftWikiNodeRelationCandidate> relationCandidates = loadDraftWikiNodeRelationCandidates(suggestionId);
        return new DraftWikiNodeSuggestion(
          suggestionId,
          resultSet.getString("parsed_document_id"),
          resultSet.getString("raw_material_id"),
          resultSet.getString("source_id"),
          resultSet.getString("operation_id"),
          resultSet.getString("title"),
          resultSet.getString("object_type"),
          resultSet.getString("subtype"),
          resultSet.getString("content_draft"),
          suggestionMetadata(resultSet),
          sourceRefs,
          relationCandidates,
          resultSet.getDouble("confidence"),
          resultSet.getString("status"),
          resultSet.getString("review_note"),
          resultSet.getString("conflict_status"),
          splitCsv(resultSet.getString("conflict_reasons")),
          splitCsv(resultSet.getString("matched_wiki_node_ids")),
          splitCsv(resultSet.getString("matched_suggestion_ids")),
          sourceRefs.size(),
          relationCandidates.size(),
          resultSet.getString("created_at"),
          resultSet.getString("updated_at")
        );
      }
    );
  }

  @Override
  protected void insertSourceOperation(SourceOperation operation) {
    int updated = jdbcTemplate.update(
      """
      update source_operations
      set operation_type = ?, source_id = ?, raw_material_id = ?, parsed_document_id = ?, status = ?,
          requested_by = ?, started_at = ?, finished_at = ?, summary = ?, error_summary = ?
      where operation_id = ?
      """,
      operation.operationType(),
      operation.sourceId(),
      operation.rawMaterialId(),
      operation.parsedDocumentId(),
      operation.status(),
      operation.requestedBy(),
      operation.startedAt(),
      operation.finishedAt(),
      operation.summary(),
      operation.errorSummary(),
      operation.operationId()
    );
    if (updated == 0) {
      jdbcTemplate.update(
        """
        insert into source_operations (
          operation_id, operation_type, source_id, raw_material_id, parsed_document_id, status,
          requested_by, started_at, finished_at, summary, error_summary
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        operation.operationId(),
        operation.operationType(),
        operation.sourceId(),
        operation.rawMaterialId(),
        operation.parsedDocumentId(),
        operation.status(),
        operation.requestedBy(),
        operation.startedAt(),
        operation.finishedAt(),
        operation.summary(),
        operation.errorSummary()
      );
    }
  }

  @Override
  @Transactional
  protected void insertDraftWikiNodeSuggestion(DraftWikiNodeSuggestion suggestion) {
    int updated = jdbcTemplate.update(
      """
      update draft_wikinode_suggestions
      set operation_id = ?, title = ?, object_type = ?, subtype = ?, content_draft = ?,
          metadata_language = ?, metadata_business_domain = ?, confidence = ?, status = ?,
          review_note = ?, conflict_status = ?, conflict_reasons = ?, matched_wiki_node_ids = ?,
          matched_suggestion_ids = ?, updated_at = ?
      where suggestion_id = ?
      """,
      suggestion.operationId(),
      suggestion.title(),
      suggestion.objectType(),
      suggestion.subtype(),
      suggestion.contentDraft(),
      suggestion.metadataDraft().get("language"),
      suggestion.metadataDraft().get("businessDomain"),
      suggestion.confidence(),
      suggestion.status(),
      suggestion.reviewNote(),
      suggestion.conflictStatus(),
      String.join(",", suggestion.conflictReasons()),
      String.join(",", suggestion.matchedWikiNodeIds()),
      String.join(",", suggestion.matchedSuggestionIds()),
      suggestion.updatedAt(),
      suggestion.suggestionId()
    );
    if (updated == 0) {
      jdbcTemplate.update(
        """
        insert into draft_wikinode_suggestions (
          suggestion_id, parsed_document_id, raw_material_id, source_id, operation_id, title,
          object_type, subtype, content_draft, metadata_language, metadata_business_domain,
          confidence, status, review_note, conflict_status, conflict_reasons,
          matched_wiki_node_ids, matched_suggestion_ids, created_at, updated_at
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        suggestion.suggestionId(),
        suggestion.parsedDocumentId(),
        suggestion.rawMaterialId(),
        suggestion.sourceId(),
        suggestion.operationId(),
        suggestion.title(),
        suggestion.objectType(),
        suggestion.subtype(),
        suggestion.contentDraft(),
        suggestion.metadataDraft().get("language"),
        suggestion.metadataDraft().get("businessDomain"),
        suggestion.confidence(),
        suggestion.status(),
        suggestion.reviewNote(),
        suggestion.conflictStatus(),
        String.join(",", suggestion.conflictReasons()),
        String.join(",", suggestion.matchedWikiNodeIds()),
        String.join(",", suggestion.matchedSuggestionIds()),
        suggestion.createdAt(),
        suggestion.updatedAt()
      );
    }
    jdbcTemplate.update("delete from draft_wikinode_suggestion_source_refs where suggestion_id = ?", suggestion.suggestionId());
    jdbcTemplate.update("delete from draft_wikinode_relation_candidates where suggestion_id = ?", suggestion.suggestionId());
    insertDraftWikiNodeSuggestionSourceRefs(suggestion);
    insertDraftWikiNodeRelationCandidates(suggestion);
  }

  private WikiNode mapNodeBase(ResultSet resultSet) throws SQLException {
    String nodeId = resultSet.getString("node_id");
    return new WikiNode(
      nodeId,
      resultSet.getString("slug"),
      resultSet.getString("title"),
      resultSet.getString("node_type"),
      resultSet.getString("object_type"),
      resultSet.getString("subtype"),
      metadataFromJson(resultSet.getString("metadata_json")),
      List.of(),
      resultSet.getString("processing_profile"),
      resultSet.getString("summary"),
      resultSet.getString("content_markdown"),
      List.of(),
      resultSet.getString("status"),
      List.of(),
      resultSet.getString("index_status"),
      0,
      0,
      0,
      resultSet.getString("created_at"),
      resultSet.getString("updated_at"),
      resultSet.getString("last_indexed_at")
    );
  }

  private WikiNode hydrateNode(WikiNode node) {
    return new WikiNode(
      node.nodeId(),
      node.slug(),
      node.title(),
      node.nodeType(),
      node.objectType(),
      node.subtype(),
      node.metadata(),
      loadRelations(node.nodeId()),
      node.processingProfile(),
      node.summary(),
      node.contentMarkdown(),
      loadTags(node.nodeId()),
      node.status(),
      loadSourceRefs(node.nodeId()),
      node.indexStatus(),
      node.incomingCount(),
      node.outgoingCount(),
      node.brokenLinkCount(),
      node.createdAt(),
      node.updatedAt(),
      node.lastIndexedAt()
    );
  }

  private IndexSegment mapIndexSegment(ResultSet resultSet) throws SQLException {
    String segmentId = resultSet.getString("segment_id");
    List<SourceRef> sourceRefs = loadIndexSegmentSourceRefs(segmentId);
    Map<String, Object> metadata = new LinkedHashMap<>(metadataFromJson(resultSet.getString("metadata_json")));
    metadata.putIfAbsent("nodeType", resultSet.getString("metadata_node_type"));
    metadata.putIfAbsent("status", resultSet.getString("metadata_status"));
    metadata.putIfAbsent("tags", splitCsv(resultSet.getString("metadata_tags")));
    metadata.putIfAbsent("objectType", resultSet.getString("object_type"));
    metadata.putIfAbsent("subtype", resultSet.getString("subtype"));
    return new IndexSegment(
      segmentId,
      resultSet.getString("node_id"),
      resultSet.getString("node_title"),
      resultSet.getString("object_type"),
      resultSet.getString("subtype"),
      resultSet.getString("segment_type"),
      resultSet.getString("content"),
      resultSet.getString("title"),
      resultSet.getString("content_preview"),
      resultSet.getInt("token_count"),
      resultSet.getBoolean("enabled"),
      resultSet.getString("index_status"),
      resultSet.getString("vector_doc_id"),
      resultSet.getString("last_indexed_at"),
      resultSet.getInt("retrieval_hits"),
      getNullableDouble(resultSet, "avg_score"),
      sourceRefs,
      sourceRefs.stream().map(SourceRef::sourceId).toList(),
      resultSet.getString("processing_profile"),
      loadIndexSegmentMetadataSummary(segmentId),
      resultSet.getString("created_at"),
      resultSet.getString("updated_at"),
      metadata
    );
  }

  private List<String> loadTags(String nodeId) {
    return jdbcTemplate.query(
      "select tag from wiki_node_tags where node_id = ? order by position",
      (resultSet, rowNumber) -> resultSet.getString("tag"),
      nodeId
    );
  }

  private List<SourceRef> loadSourceRefs(String nodeId) {
    return jdbcTemplate.query(
      """
      select source_id, source_type, source_title, source_url, paragraph_ref, version
      from wiki_node_source_refs
      where node_id = ?
      order by position
      """,
      (resultSet, rowNumber) -> new SourceRef(
        resultSet.getString("source_id"),
        resultSet.getString("source_type"),
        resultSet.getString("source_title"),
        resultSet.getString("source_url"),
        resultSet.getString("paragraph_ref"),
        resultSet.getString("version")
      ),
      nodeId
    );
  }

  private List<KnowledgeRelation> loadRelations(String nodeId) {
    return jdbcTemplate.query(
      """
      select relation_id, source_node_id, target_node_id, relation_type, direction,
             confidence, created_by, evidence_source_ref_id
      from wiki_node_relations
      where source_node_id = ?
      order by position
      """,
      (resultSet, rowNumber) -> new KnowledgeRelation(
        resultSet.getString("relation_id"),
        resultSet.getString("source_node_id"),
        resultSet.getString("target_node_id"),
        resultSet.getString("relation_type"),
        resultSet.getString("direction"),
        getNullableDouble(resultSet, "confidence"),
        resultSet.getString("created_by"),
        resultSet.getString("evidence_source_ref_id") == null
          ? null
          : new KnowledgeRelationEvidence(resultSet.getString("evidence_source_ref_id"))
      ),
      nodeId
    );
  }

  private List<SourceRef> loadIndexSegmentSourceRefs(String segmentId) {
    return jdbcTemplate.query(
      """
      select source_id, source_type, source_title, source_url, paragraph_ref, version
      from index_segment_source_refs
      where segment_id = ?
      order by position
      """,
      (resultSet, rowNumber) -> new SourceRef(
        resultSet.getString("source_id"),
        resultSet.getString("source_type"),
        resultSet.getString("source_title"),
        resultSet.getString("source_url"),
        resultSet.getString("paragraph_ref"),
        resultSet.getString("version")
      ),
      segmentId
    );
  }

  private List<IndexSegmentMetadataSummaryItem> loadIndexSegmentMetadataSummary(String segmentId) {
    return jdbcTemplate.query(
      """
      select label, value
      from index_segment_metadata_summary
      where segment_id = ?
      order by position
      """,
      (resultSet, rowNumber) -> new IndexSegmentMetadataSummaryItem(
        resultSet.getString("label"),
        resultSet.getString("value")
      ),
      segmentId
    );
  }

  private List<ParsedDocumentSourceRef> loadParsedDocumentSourceRefs(String parsedDocumentId) {
    return jdbcTemplate.query(
      """
      select source_id, raw_material_id, parsed_document_id, locator_type, locator, excerpt, confidence
      from parsed_document_source_refs
      where parsed_document_id = ?
      order by position
      """,
      (resultSet, rowNumber) -> new ParsedDocumentSourceRef(
        resultSet.getString("source_id"),
        resultSet.getString("raw_material_id"),
        resultSet.getString("parsed_document_id"),
        resultSet.getString("locator_type"),
        resultSet.getString("locator"),
        resultSet.getString("excerpt"),
        resultSet.getDouble("confidence")
      ),
      parsedDocumentId
    );
  }

  private Map<String, String> metadata(ResultSet resultSet) throws SQLException {
    return Map.of(
      "language", resultSet.getString("metadata_language"),
      "businessDomain", resultSet.getString("metadata_business_domain")
    );
  }

  private Map<String, String> suggestionMetadata(ResultSet resultSet) throws SQLException {
    return Map.of(
      "language", resultSet.getString("metadata_language"),
      "businessDomain", resultSet.getString("metadata_business_domain")
    );
  }

  private List<ParsedDocumentSourceRef> loadDraftWikiNodeSuggestionSourceRefs(String suggestionId) {
    return jdbcTemplate.query(
      """
      select source_id, raw_material_id, parsed_document_id, locator_type, locator, excerpt, confidence
      from draft_wikinode_suggestion_source_refs
      where suggestion_id = ?
      order by position
      """,
      (resultSet, rowNumber) -> new ParsedDocumentSourceRef(
        resultSet.getString("source_id"),
        resultSet.getString("raw_material_id"),
        resultSet.getString("parsed_document_id"),
        resultSet.getString("locator_type"),
        resultSet.getString("locator"),
        resultSet.getString("excerpt"),
        resultSet.getDouble("confidence")
      ),
      suggestionId
    );
  }

  private List<DraftWikiNodeRelationCandidate> loadDraftWikiNodeRelationCandidates(String suggestionId) {
    return jdbcTemplate.query(
      """
      select target_title, relation_type, source, confidence
      from draft_wikinode_relation_candidates
      where suggestion_id = ?
      order by position
      """,
      (resultSet, rowNumber) -> new DraftWikiNodeRelationCandidate(
        resultSet.getString("target_title"),
        resultSet.getString("relation_type"),
        resultSet.getString("source"),
        resultSet.getDouble("confidence")
      ),
      suggestionId
    );
  }

  private List<String> splitCsv(String value) {
    if (value == null || value.isBlank()) {
      return List.of();
    }
    return Arrays.stream(value.split(",")).map(String::trim).filter(item -> !item.isBlank()).toList();
  }

  private String joinCsv(List<String> values) {
    if (values == null || values.isEmpty()) {
      return "";
    }
    return String.join(",", values);
  }

  private RetrievalEvaluationCase mapRetrievalEvaluationCase(ResultSet resultSet) throws SQLException {
    RetrievalEvaluationRunResult runResult = new RetrievalEvaluationRunResult(
      splitCsv(resultSet.getString("returned_node_ids")),
      splitCsv(resultSet.getString("matched_segment_ids")),
      resultSet.getString("run_status"),
      resultSet.getString("run_summary")
    );
    return new RetrievalEvaluationCase(
      resultSet.getString("case_id"),
      resultSet.getString("query_text"),
      filtersFromJson(resultSet.getString("filters_json")),
      resultSet.getInt("top_k"),
      splitCsv(resultSet.getString("expected_node_ids")),
      runResult,
      resultSet.getString("created_at"),
      resultSet.getString("updated_at")
    );
  }

  @SuppressWarnings("unchecked")
  private RetrievalQuery.RetrievalFilters filtersFromJson(String json) {
    Map<String, Object> values = metadataFromJson(json);
    Object tags = values.get("tags");
    return new RetrievalQuery.RetrievalFilters(
      stringValue(values.get("nodeType")),
      stringValue(values.get("status")),
      tags instanceof List<?> tagList ? tagList.stream().map(String::valueOf).toList() : List.of()
    );
  }

  private String filtersToJson(RetrievalQuery.RetrievalFilters filters) {
    if (filters == null) {
      return "{}";
    }
    Map<String, Object> values = new LinkedHashMap<>();
    values.put("nodeType", filters.nodeType());
    values.put("status", filters.status());
    values.put("tags", filters.tags() == null ? List.of() : filters.tags());
    return toJson(values);
  }

  private String stringValue(Object value) {
    return value == null ? null : String.valueOf(value);
  }

  private Double getNullableDouble(ResultSet resultSet, String columnLabel) throws SQLException {
    double value = resultSet.getDouble(columnLabel);
    return resultSet.wasNull() ? null : value;
  }

  private void replaceTags(WikiNode node) {
    for (int index = 0; index < node.tags().size(); index++) {
      jdbcTemplate.update(
        "insert into wiki_node_tags (node_id, position, tag) values (?, ?, ?)",
        node.nodeId(),
        index,
        node.tags().get(index)
      );
    }
  }

  private void replaceSourceRefs(WikiNode node) {
    for (int index = 0; index < node.sourceRefs().size(); index++) {
      SourceRef sourceRef = node.sourceRefs().get(index);
      jdbcTemplate.update(
        """
        insert into wiki_node_source_refs (
          node_id, position, source_id, source_type, source_title, source_url, paragraph_ref, version
        ) values (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        node.nodeId(),
        index,
        sourceRef.sourceId(),
        sourceRef.sourceType(),
        sourceRef.sourceTitle(),
        sourceRef.sourceUrl(),
        sourceRef.paragraphRef(),
        sourceRef.version()
      );
    }
  }

  private void replaceRelations(WikiNode node) {
    for (int index = 0; index < node.relations().size(); index++) {
      KnowledgeRelation relation = node.relations().get(index);
      jdbcTemplate.update(
        """
        insert into wiki_node_relations (
          source_node_id, position, relation_id, target_node_id, relation_type,
          direction, confidence, created_by, evidence_source_ref_id
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        node.nodeId(),
        index,
        relation.id() == null || relation.id().isBlank()
          ? "%s-rel-%d".formatted(node.nodeId(), index)
          : relation.id(),
        relation.targetNodeId(),
        relation.relationType(),
        relation.direction() == null ? "outgoing" : relation.direction(),
        relation.confidence(),
        relation.createdBy() == null ? "system" : relation.createdBy(),
        relation.evidence() == null ? null : relation.evidence().sourceRefId()
      );
    }
  }

  private void insertIndexSegment(IndexSegment segment) {
    jdbcTemplate.update(
      """
      insert into index_segments (
        segment_id, node_id, node_title, object_type, subtype, segment_type, content, title,
        content_preview, token_count, enabled, index_status, vector_doc_id, last_indexed_at,
        retrieval_hits, avg_score, processing_profile, metadata_node_type, metadata_status,
        metadata_tags, metadata_json, created_at, updated_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      """,
      segment.segmentId(),
      segment.nodeId(),
      segment.nodeTitle(),
      segment.objectType(),
      segment.subtype(),
      segment.segmentType(),
      segment.content(),
      segment.title(),
      segment.contentPreview(),
      segment.tokenCount(),
      segment.enabled(),
      segment.indexStatus(),
      segment.vectorDocId(),
      segment.lastIndexedAt(),
      segment.retrievalHits(),
      segment.avgScore(),
      segment.processingProfile(),
      String.valueOf(segment.metadata().getOrDefault("nodeType", "")),
      String.valueOf(segment.metadata().getOrDefault("status", "")),
      metadataTags(segment),
      toJson(segment.metadata()),
      segment.createdAt(),
      segment.updatedAt()
    );
    insertIndexSegmentSourceRefs(segment);
    insertIndexSegmentMetadataSummary(segment);
  }

  private String metadataTags(IndexSegment segment) {
    Object tags = segment.metadata().get("tags");
    if (tags instanceof List<?> tagList) {
      return tagList.stream().map(String::valueOf).reduce((left, right) -> left + "," + right).orElse("");
    }
    return String.valueOf(tags == null ? "" : tags);
  }

  private void insertIndexSegmentSourceRefs(IndexSegment segment) {
    for (int index = 0; index < segment.sourceRefs().size(); index++) {
      SourceRef sourceRef = segment.sourceRefs().get(index);
      jdbcTemplate.update(
        """
        insert into index_segment_source_refs (
          segment_id, position, source_id, source_type, source_title, source_url, paragraph_ref, version
        ) values (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        segment.segmentId(),
        index,
        sourceRef.sourceId(),
        sourceRef.sourceType(),
        sourceRef.sourceTitle(),
        sourceRef.sourceUrl(),
        sourceRef.paragraphRef(),
        sourceRef.version()
      );
    }
  }

  private void insertIndexSegmentMetadataSummary(IndexSegment segment) {
    for (int index = 0; index < segment.metadataSummary().size(); index++) {
      IndexSegmentMetadataSummaryItem item = segment.metadataSummary().get(index);
      jdbcTemplate.update(
        """
        insert into index_segment_metadata_summary (segment_id, position, label, value)
        values (?, ?, ?, ?)
        """,
        segment.segmentId(),
        index,
        item.label(),
        item.value()
      );
    }
  }

  private Map<String, Object> metadataFromJson(String json) {
    if (json == null || json.isBlank()) {
      return Map.of();
    }
    try {
      return OBJECT_MAPPER.readValue(json, METADATA_TYPE);
    } catch (JsonProcessingException error) {
      throw new IllegalArgumentException("Invalid WikiNode metadata JSON", error);
    }
  }

  private String toJson(Map<String, Object> metadata) {
    try {
      return OBJECT_MAPPER.writeValueAsString(metadata == null ? Map.of() : metadata);
    } catch (JsonProcessingException error) {
      throw new IllegalArgumentException("Invalid WikiNode metadata", error);
    }
  }

  private void insertDraftWikiNodeSuggestionSourceRefs(DraftWikiNodeSuggestion suggestion) {
    for (int index = 0; index < suggestion.sourceRefs().size(); index++) {
      ParsedDocumentSourceRef sourceRef = suggestion.sourceRefs().get(index);
      jdbcTemplate.update(
        """
        insert into draft_wikinode_suggestion_source_refs (
          suggestion_id, position, source_id, raw_material_id, parsed_document_id,
          locator_type, locator, excerpt, confidence
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        suggestion.suggestionId(),
        index,
        sourceRef.sourceId(),
        sourceRef.rawMaterialId(),
        sourceRef.parsedDocumentId(),
        sourceRef.locatorType(),
        sourceRef.locator(),
        sourceRef.excerpt(),
        sourceRef.confidence()
      );
    }
  }

  private void insertDraftWikiNodeRelationCandidates(DraftWikiNodeSuggestion suggestion) {
    for (int index = 0; index < suggestion.relationCandidates().size(); index++) {
      DraftWikiNodeRelationCandidate candidate = suggestion.relationCandidates().get(index);
      jdbcTemplate.update(
        """
        insert into draft_wikinode_relation_candidates (
          suggestion_id, position, target_title, relation_type, source, confidence
        ) values (?, ?, ?, ?, ?, ?)
        """,
        suggestion.suggestionId(),
        index,
        candidate.targetTitle(),
        candidate.relationType(),
        candidate.source(),
        candidate.confidence()
      );
    }
  }
}
