package com.wikinode.studio.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

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
}
