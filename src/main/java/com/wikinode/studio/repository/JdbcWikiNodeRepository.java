package com.wikinode.studio.repository;

import com.wikinode.studio.model.SourceItem;
import com.wikinode.studio.model.SourceRef;
import com.wikinode.studio.model.WikiNode;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
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

  private final JdbcTemplate jdbcTemplate;

  public JdbcWikiNodeRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @Override
  protected List<WikiNode> loadNodes() {
    return jdbcTemplate.query(
      """
      select node_id, slug, title, node_type, summary, content_markdown, status, index_status,
             created_at, updated_at, last_indexed_at
      from wiki_nodes
      order by created_at, node_id
      """,
      (resultSet, rowNumber) -> mapNode(resultSet)
    );
  }

  @Override
  protected Optional<WikiNode> loadNode(String nodeId) {
    try {
      return Optional.ofNullable(jdbcTemplate.queryForObject(
        """
        select node_id, slug, title, node_type, summary, content_markdown, status, index_status,
               created_at, updated_at, last_indexed_at
        from wiki_nodes
        where node_id = ?
        """,
        (resultSet, rowNumber) -> mapNode(resultSet),
        nodeId
      ));
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
          node_id, slug, title, node_type, summary, content_markdown, status, index_status,
          created_at, updated_at, last_indexed_at
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        node.nodeId(),
        node.slug(),
        node.title(),
        node.nodeType(),
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
        set slug = ?, title = ?, node_type = ?, summary = ?, content_markdown = ?, status = ?,
            index_status = ?, created_at = ?, updated_at = ?, last_indexed_at = ?
        where node_id = ?
        """,
        node.slug(),
        node.title(),
        node.nodeType(),
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
      replaceTags(node);
      replaceSourceRefs(node);
    } catch (DuplicateKeyException error) {
      throw new IllegalArgumentException("WikiNode slug already exists", error);
    }
  }

  @Override
  protected List<SourceItem> loadSources() {
    return jdbcTemplate.query(
      """
      select source_id, source_type, title, owner, sync_status, last_synced_at, generated_nodes
      from source_items
      order by source_id
      """,
      (resultSet, rowNumber) -> new SourceItem(
        resultSet.getString("source_id"),
        resultSet.getString("source_type"),
        resultSet.getString("title"),
        resultSet.getString("owner"),
        resultSet.getString("sync_status"),
        resultSet.getString("last_synced_at"),
        resultSet.getInt("generated_nodes")
      )
    );
  }

  private WikiNode mapNode(ResultSet resultSet) throws SQLException {
    String nodeId = resultSet.getString("node_id");
    return new WikiNode(
      nodeId,
      resultSet.getString("slug"),
      resultSet.getString("title"),
      resultSet.getString("node_type"),
      resultSet.getString("summary"),
      resultSet.getString("content_markdown"),
      loadTags(nodeId),
      resultSet.getString("status"),
      loadSourceRefs(nodeId),
      resultSet.getString("index_status"),
      0,
      0,
      0,
      resultSet.getString("created_at"),
      resultSet.getString("updated_at"),
      resultSet.getString("last_indexed_at")
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
}
