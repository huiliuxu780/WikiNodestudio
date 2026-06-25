package com.wikinode.studio.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.wikinode.studio.model.ParsedDocument;
import com.wikinode.studio.model.RawMaterial;
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
}
