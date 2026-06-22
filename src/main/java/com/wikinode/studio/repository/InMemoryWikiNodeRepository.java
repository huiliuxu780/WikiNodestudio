package com.wikinode.studio.repository;

import com.wikinode.studio.model.SourceItem;
import com.wikinode.studio.model.WikiNode;
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
}
