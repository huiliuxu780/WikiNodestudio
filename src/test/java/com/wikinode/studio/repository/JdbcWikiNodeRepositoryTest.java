package com.wikinode.studio.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.wikinode.studio.model.ParsedDocument;
import com.wikinode.studio.model.ParserProfile;
import com.wikinode.studio.model.RawMaterial;
import com.wikinode.studio.model.DraftWikiNodeSuggestion;
import com.wikinode.studio.model.DraftWikiNodeSuggestionGenerationRequest;
import com.wikinode.studio.model.DraftWikiNodeSuggestionGenerationResult;
import com.wikinode.studio.model.SourceOperation;
import com.wikinode.studio.model.WikiNode;
import com.wikinode.studio.model.WikiNodeUpsertRequest;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;

class JdbcWikiNodeRepositoryTest {

  @Test
  void createAndUpdatePersistAcrossRepositoryInstances() {
    JdbcTemplate jdbcTemplate = jdbcTemplate();
    JdbcWikiNodeRepository firstRepository = new JdbcWikiNodeRepository(jdbcTemplate);

    WikiNode created = firstRepository.createNode(new WikiNodeUpsertRequest(
      null,
      "persistent-node",
      "Persistent Node",
      "term",
      "Created in repository test",
      "Content that should survive repository recreation.",
      List.of("persisted"),
      "draft",
      List.of(),
      "not_indexed",
      null,
      null,
      null
    ));
    WikiNode updated = firstRepository.updateNode(created.nodeId(), new WikiNodeUpsertRequest(
      created.nodeId(),
      "persistent-node",
      "Persistent Node Updated",
      "term",
      "Updated in repository test",
      "Updated content survives repository recreation.",
      List.of("persisted", "updated"),
      "published",
      List.of(),
      "indexed",
      created.createdAt(),
      null,
      "2026-06-22"
    ));

    JdbcWikiNodeRepository secondRepository = new JdbcWikiNodeRepository(jdbcTemplate);

    assertThat(updated.title()).isEqualTo("Persistent Node Updated");
    assertThat(secondRepository.findNode("persistent-node")).hasValueSatisfying(node -> {
      assertThat(node.title()).isEqualTo("Persistent Node Updated");
      assertThat(node.tags()).containsExactly("persisted", "updated");
      assertThat(node.status()).isEqualTo("published");
      assertThat(node.indexStatus()).isEqualTo("indexed");
    });
  }

  @Test
  void duplicateSlugIsRejectedByPersistentRepository() {
    JdbcTemplate jdbcTemplate = jdbcTemplate();
    JdbcWikiNodeRepository repository = new JdbcWikiNodeRepository(jdbcTemplate);

    WikiNodeUpsertRequest request = new WikiNodeUpsertRequest(
      null,
      "duplicate-node",
      "Duplicate Node",
      "term",
      "",
      "",
      List.of(),
      "draft",
      List.of(),
      "not_indexed",
      null,
      null,
      null
    );

    repository.createNode(request);

    assertThatThrownBy(() -> repository.createNode(request))
      .isInstanceOf(IllegalArgumentException.class)
      .hasMessageContaining("slug");
  }

  @Test
  void loadsSourceRawMaterialAndParsedDocumentEvidenceChain() {
    JdbcTemplate jdbcTemplate = jdbcTemplateWithSourceEvidence();
    JdbcWikiNodeRepository repository = new JdbcWikiNodeRepository(jdbcTemplate);

    assertThat(repository.listSources())
      .anySatisfy(source -> {
        assertThat(source.sourceId()).isEqualTo("src-feishu-cc");
        assertThat(source.rawMaterialCount()).isEqualTo(2);
      });

    List<RawMaterial> rawMaterials = repository.listRawMaterialsForSource("src-feishu-cc");
    assertThat(rawMaterials).extracting(RawMaterial::rawMaterialId).contains("rm-001");
    assertThat(repository.findRawMaterial("rm-001")).hasValueSatisfying(rawMaterial -> {
      assertThat(rawMaterial.sourceId()).isEqualTo("src-feishu-cc");
      assertThat(rawMaterial.parseStatus()).isEqualTo("parsed");
      assertThat(rawMaterial.parsedDocumentCount()).isEqualTo(1);
    });

    assertThat(repository.listParsedDocumentsForRawMaterial("rm-001"))
      .extracting(ParsedDocument::parsedDocumentId)
      .containsExactly("pd-001");
    assertThat(repository.findParsedDocument("pd-001")).hasValueSatisfying(parsedDocument -> {
      assertThat(parsedDocument.rawMaterialId()).isEqualTo("rm-001");
      assertThat(parsedDocument.normalizedContent()).contains("保修政策");
      assertThat(parsedDocument.sourceRefs()).hasSize(1);
      assertThat(parsedDocument.sourceRefs().getFirst().locatorType()).isEqualTo("heading");
    });
  }

  @Test
  void loadsSourceOperationReadOnlyLogs() {
    JdbcTemplate jdbcTemplate = jdbcTemplateWithSourceOperations();
    JdbcWikiNodeRepository repository = new JdbcWikiNodeRepository(jdbcTemplate);

    assertThat(repository.listSourceOperationsForSource("src-feishu-cc"))
      .extracting(SourceOperation::operationId)
      .contains("op-src-feishu-sync-001", "op-src-feishu-parse-001");

    assertThat(repository.listSourceOperationsForRawMaterial("rm-001"))
      .extracting(SourceOperation::operationType)
      .containsExactly("parse_raw_material");

    assertThat(repository.findSourceOperation("op-src-feishu-sync-001"))
      .hasValueSatisfying(operation -> {
        assertThat(operation.sourceId()).isEqualTo("src-feishu-cc");
        assertThat(operation.operationType()).isEqualTo("source_sync");
        assertThat(operation.status()).isEqualTo("succeeded");
        assertThat(operation.summary()).contains("read-only");
        assertThat(operation.errorSummary()).isNull();
      });
  }

  @Test
  void loadsParserProfileReadOnlyRegistry() {
    JdbcTemplate jdbcTemplate = jdbcTemplateWithParserProfiles();
    JdbcWikiNodeRepository repository = new JdbcWikiNodeRepository(jdbcTemplate);

    assertThat(repository.listParserProfiles())
      .extracting(ParserProfile::parserProfile)
      .contains("feishu_article_v1", "pdf_manual_article_v1", "excel_fee_table_v1");

    assertThat(repository.listParserProfiles())
      .anySatisfy(profile -> {
        assertThat(profile.parserProfile()).isEqualTo("feishu_article_v1");
        assertThat(profile.displayName()).isEqualTo("飞书文章解析 Profile");
        assertThat(profile.supportedRawMaterialTypes()).containsExactly("document_snapshot");
        assertThat(profile.supportedSourceTypes()).containsExactly("feishu");
        assertThat(profile.contentFormat()).isEqualTo("markdown");
        assertThat(profile.enabled()).isTrue();
        assertThat(profile.version()).isEqualTo("v1");
      });
  }

  @Test
  void loadsDraftWikiNodeSuggestionReadOnlyContract() {
    JdbcTemplate jdbcTemplate = jdbcTemplateWithDraftWikiNodeSuggestions();
    JdbcWikiNodeRepository repository = new JdbcWikiNodeRepository(jdbcTemplate);

    assertThat(repository.listDraftWikiNodeSuggestions())
      .extracting(DraftWikiNodeSuggestion::suggestionId)
      .contains("sug-001", "sug-002");

    assertThat(repository.listDraftWikiNodeSuggestionsForParsedDocument("pd-001"))
      .extracting(DraftWikiNodeSuggestion::suggestionId)
      .containsExactly("sug-001");

    assertThat(repository.listDraftWikiNodeSuggestionsForRawMaterial("rm-001"))
      .extracting(DraftWikiNodeSuggestion::suggestionId)
      .containsExactly("sug-001");

    assertThat(repository.findDraftWikiNodeSuggestion("sug-001"))
      .hasValueSatisfying(suggestion -> {
        assertThat(suggestion.parsedDocumentId()).isEqualTo("pd-001");
        assertThat(suggestion.rawMaterialId()).isEqualTo("rm-001");
        assertThat(suggestion.sourceId()).isEqualTo("src-feishu-cc");
        assertThat(suggestion.operationId()).isEqualTo("op-src-feishu-suggest-001");
        assertThat(suggestion.title()).isEqualTo("保修期内维修服务政策");
        assertThat(suggestion.objectType()).isEqualTo("Article");
        assertThat(suggestion.subtype()).isEqualTo("service_fee_policy");
        assertThat(suggestion.sourceRefs()).hasSize(1);
        assertThat(suggestion.relationCandidates()).hasSize(1);
        assertThat(suggestion.sourceRefCount()).isEqualTo(1);
        assertThat(suggestion.relationCandidateCount()).isEqualTo(1);
        assertThat(suggestion.conflictStatus()).isEqualTo("title_match");
        assertThat(suggestion.matchedWikiNodeIds()).containsExactly("wn-001");
        assertThat(suggestion.matchedSuggestionIds()).isEmpty();
      });
  }

  @Test
  void persistsDraftWikiNodeSuggestionGenerationWithSourceOperationEvidence() {
    JdbcTemplate jdbcTemplate = jdbcTemplateWithDraftWikiNodeSuggestions();
    JdbcWikiNodeRepository repository = new JdbcWikiNodeRepository(jdbcTemplate);

    DraftWikiNodeSuggestionGenerationResult result = repository.generateDraftWikiNodeSuggestion(
      "pd-003",
      new DraftWikiNodeSuggestionGenerationRequest("excel_fee_table_v1", "repo-pd-003")
    );

    assertThat(result.status()).isEqualTo("succeeded");
    assertThat(result.operationId()).startsWith("op-pd-003-suggest-");
    assertThat(result.suggestionId()).isEqualTo("sug-pd-003");
    assertThat(repository.findSourceOperation(result.operationId()))
      .hasValueSatisfying(operation -> {
        assertThat(operation.operationType()).isEqualTo("suggest_wikinode");
        assertThat(operation.parsedDocumentId()).isEqualTo("pd-003");
        assertThat(operation.status()).isEqualTo("succeeded");
        assertThat(operation.summary()).isEqualTo("已生成待审核 WikiNode 建议。");
      });
    assertThat(repository.listDraftWikiNodeSuggestionsForParsedDocument("pd-003"))
      .singleElement()
      .satisfies(suggestion -> {
        assertThat(suggestion.suggestionId()).isEqualTo("sug-pd-003");
        assertThat(suggestion.operationId()).isEqualTo(result.operationId());
        assertThat(suggestion.title()).isEqualTo("维修收费标准 Excel");
        assertThat(suggestion.objectType()).isEqualTo("DataRecord");
        assertThat(suggestion.subtype()).isEqualTo("fee_table");
        assertThat(suggestion.status()).isEqualTo("draft");
        assertThat(suggestion.sourceRefs()).hasSize(1);
        assertThat(suggestion.relationCandidates()).isEmpty();
      });
  }

  @Test
  void skipsDraftWikiNodeSuggestionGenerationForDuplicateSuggestion() {
    JdbcTemplate jdbcTemplate = jdbcTemplateWithDraftWikiNodeSuggestions();
    JdbcWikiNodeRepository repository = new JdbcWikiNodeRepository(jdbcTemplate);

    DraftWikiNodeSuggestionGenerationResult result = repository.generateDraftWikiNodeSuggestion(
      "pd-001",
      new DraftWikiNodeSuggestionGenerationRequest("feishu_article_v1", "repo-pd-001")
    );

    assertThat(result.status()).isEqualTo("skipped");
    assertThat(result.summary()).isEqualTo("该 Parsed Document 已有待审核 WikiNode 建议。");
    assertThat(result.suggestionId()).isNull();
    assertThat(repository.findSourceOperation(result.operationId()))
      .hasValueSatisfying(operation -> {
        assertThat(operation.operationType()).isEqualTo("suggest_wikinode");
        assertThat(operation.status()).isEqualTo("skipped");
        assertThat(operation.errorSummary()).isNull();
      });
    assertThat(repository.listDraftWikiNodeSuggestionsForParsedDocument("pd-001")).hasSize(1);
  }

  @Test
  void skipsDraftWikiNodeSuggestionGenerationWhenParsedDocumentIsNotParsed() {
    JdbcTemplate jdbcTemplate = jdbcTemplateWithDraftWikiNodeSuggestions();
    jdbcTemplate.update(
      """
      insert into parsed_documents (
        parsed_document_id, raw_material_id, source_id, title, content_format, normalized_content,
        metadata_language, metadata_business_domain, parser_profile, parse_status, parse_error_summary,
        created_at, updated_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      """,
      "pd-not-ready",
      "rm-001",
      "src-feishu-cc",
      "未完成解析结果",
      "markdown",
      "# 未完成",
      "zh-CN",
      "after_sales",
      "feishu_article_v1",
      "parsing",
      null,
      "2026-06-25",
      "2026-06-25"
    );
    JdbcWikiNodeRepository repository = new JdbcWikiNodeRepository(jdbcTemplate);

    DraftWikiNodeSuggestionGenerationResult result = repository.generateDraftWikiNodeSuggestion(
      "pd-not-ready",
      new DraftWikiNodeSuggestionGenerationRequest("feishu_article_v1", "repo-pd-not-ready")
    );

    assertThat(result.status()).isEqualTo("skipped");
    assertThat(result.summary()).isEqualTo("Parsed Document 尚未解析完成，不能生成 WikiNode 建议。");
    assertThat(repository.listDraftWikiNodeSuggestionsForParsedDocument("pd-not-ready")).isEmpty();
  }

  @Test
  void skipsDraftWikiNodeSuggestionGenerationWithoutSourceRefs() {
    JdbcTemplate jdbcTemplate = jdbcTemplateWithDraftWikiNodeSuggestions();
    jdbcTemplate.update(
      """
      insert into parsed_documents (
        parsed_document_id, raw_material_id, source_id, title, content_format, normalized_content,
        metadata_language, metadata_business_domain, parser_profile, parse_status, parse_error_summary,
        created_at, updated_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      """,
      "pd-no-source-ref",
      "rm-001",
      "src-feishu-cc",
      "缺少证据解析结果",
      "markdown",
      "# 缺少证据",
      "zh-CN",
      "after_sales",
      "feishu_article_v1",
      "parsed",
      null,
      "2026-06-25",
      "2026-06-25"
    );
    JdbcWikiNodeRepository repository = new JdbcWikiNodeRepository(jdbcTemplate);

    DraftWikiNodeSuggestionGenerationResult result = repository.generateDraftWikiNodeSuggestion(
      "pd-no-source-ref",
      new DraftWikiNodeSuggestionGenerationRequest("feishu_article_v1", "repo-pd-no-source-ref")
    );

    assertThat(result.status()).isEqualTo("skipped");
    assertThat(result.summary()).isEqualTo("缺少 SourceRef 证据，不能生成 WikiNode 建议。");
    assertThat(repository.listDraftWikiNodeSuggestionsForParsedDocument("pd-no-source-ref")).isEmpty();
  }

  private JdbcTemplate jdbcTemplate() {
    SingleConnectionDataSource dataSource = new SingleConnectionDataSource(
      "jdbc:h2:mem:wikinode-%s;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH".formatted(System.nanoTime()),
      "sa",
      "",
      true
    );
    ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
      new ClassPathResource("db/migration/V1__create_wikinode_schema.sql")
    );
    populator.execute(dataSource);
    return new JdbcTemplate(dataSource);
  }

  private JdbcTemplate jdbcTemplateWithSourceEvidence() {
    SingleConnectionDataSource dataSource = new SingleConnectionDataSource(
      "jdbc:h2:mem:wikinode-source-%s;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH".formatted(System.nanoTime()),
      "sa",
      "",
      true
    );
    ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
      new ClassPathResource("db/migration/V1__create_wikinode_schema.sql"),
      new ClassPathResource("db/migration/V3__create_source_evidence_schema.sql")
    );
    populator.execute(dataSource);
    return new JdbcTemplate(dataSource);
  }

  private JdbcTemplate jdbcTemplateWithSourceOperations() {
    SingleConnectionDataSource dataSource = new SingleConnectionDataSource(
      "jdbc:h2:mem:wikinode-source-op-%s;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH".formatted(System.nanoTime()),
      "sa",
      "",
      true
    );
    ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
      new ClassPathResource("db/migration/V1__create_wikinode_schema.sql"),
      new ClassPathResource("db/migration/V3__create_source_evidence_schema.sql"),
      new ClassPathResource("db/migration/V4__create_source_operation_schema.sql")
    );
    populator.execute(dataSource);
    return new JdbcTemplate(dataSource);
  }

  private JdbcTemplate jdbcTemplateWithParserProfiles() {
    SingleConnectionDataSource dataSource = new SingleConnectionDataSource(
      "jdbc:h2:mem:wikinode-parser-profile-%s;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH".formatted(System.nanoTime()),
      "sa",
      "",
      true
    );
    ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
      new ClassPathResource("db/migration/V1__create_wikinode_schema.sql"),
      new ClassPathResource("db/migration/V3__create_source_evidence_schema.sql"),
      new ClassPathResource("db/migration/V4__create_source_operation_schema.sql"),
      new ClassPathResource("db/migration/V5__create_parser_profile_schema.sql")
    );
    populator.execute(dataSource);
    return new JdbcTemplate(dataSource);
  }

  private JdbcTemplate jdbcTemplateWithDraftWikiNodeSuggestions() {
    SingleConnectionDataSource dataSource = new SingleConnectionDataSource(
      "jdbc:h2:mem:wikinode-suggestion-%s;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH".formatted(System.nanoTime()),
      "sa",
      "",
      true
    );
    ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
      new ClassPathResource("db/migration/V1__create_wikinode_schema.sql"),
      new ClassPathResource("db/migration/V3__create_source_evidence_schema.sql"),
      new ClassPathResource("db/migration/V4__create_source_operation_schema.sql"),
      new ClassPathResource("db/migration/V5__create_parser_profile_schema.sql"),
      new ClassPathResource("db/migration/V6__create_draft_wikinode_suggestion_schema.sql")
    );
    populator.execute(dataSource);
    return new JdbcTemplate(dataSource);
  }
}
