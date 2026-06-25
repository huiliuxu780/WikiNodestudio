package com.wikinode.studio.repository;

import com.wikinode.studio.model.IndexStatusSummary;
import com.wikinode.studio.model.ParsedDocument;
import com.wikinode.studio.model.RawMaterial;
import com.wikinode.studio.model.RetrievalQuery;
import com.wikinode.studio.model.RetrievalResult;
import com.wikinode.studio.model.SourceItem;
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

  List<SourceItem> listSources();

  Optional<SourceItem> findSource(String sourceId);

  List<RawMaterial> listRawMaterials();

  List<RawMaterial> listRawMaterialsForSource(String sourceId);

  Optional<RawMaterial> findRawMaterial(String rawMaterialId);

  List<ParsedDocument> listParsedDocumentsForRawMaterial(String rawMaterialId);

  Optional<ParsedDocument> findParsedDocument(String parsedDocumentId);

  IndexStatusSummary indexStatus();
}
