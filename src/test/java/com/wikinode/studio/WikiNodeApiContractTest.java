package com.wikinode.studio;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@ActiveProfiles("test")
class WikiNodeApiContractTest {

  @LocalServerPort
  private int port;

  private final HttpClient httpClient = HttpClient.newHttpClient();

  @Test
  void listsWikiNodesWithFrontendDtoShape() throws Exception {
    HttpResponse<String> response = get("/api/wiki-nodes");

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.body()).contains("\"nodeId\"");
    assertThat(response.body()).contains("\"contentMarkdown\"");
    assertThat(response.body()).contains("\"sourceRefs\"");
    assertThat(response.body()).contains("\"indexStatus\"");
  }

  @Test
  void exposesWikiNodeKnowledgeObjectFieldsInListAndDetail() throws Exception {
    HttpResponse<String> list = get("/api/wiki-nodes");
    HttpResponse<String> detail = get("/api/wiki-nodes/wn-001");

    assertThat(list.statusCode()).isEqualTo(200);
    assertThat(list.body()).contains("\"objectType\":\"Article\"");
    assertThat(list.body()).contains("\"subtype\":\"service_fee_policy\"");
    assertThat(list.body()).contains("\"processingProfile\":\"web_article_policy_v1\"");
    assertThat(list.body()).contains("\"metadata\":");
    assertThat(list.body()).contains("\"businessDomain\":\"after_sales\"");

    assertThat(detail.statusCode()).isEqualTo(200);
    assertThat(detail.body()).contains("\"relations\"");
    assertThat(detail.body()).contains("\"relationType\":\"has_policy\"");
    assertThat(detail.body()).contains("\"targetNodeId\":\"wn-002\"");
    assertThat(detail.body()).contains("\"evidence\"");
  }

  @Test
  void managesOneKnowledgeRelationThroughWikiNodeApi() throws Exception {
    String createBody = """
      {
        "targetNodeId": "wn-002",
        "relationType": "applies_to",
        "status": "active",
        "source": "manual",
        "confidence": 0.77,
        "anchorText": "适用于收费政策",
        "note": "人工确认的适用范围关系。",
        "evidenceSourceRefId": "ref-web-service-fee"
      }
      """;

    HttpResponse<String> created = post("/api/wiki-nodes/wn-001/relations", createBody);
    assertThat(created.statusCode()).isEqualTo(200);
    assertThat(created.body()).contains("\"targetNodeId\":\"wn-002\"");
    assertThat(created.body()).contains("\"relationType\":\"applies_to\"");
    assertThat(created.body()).contains("\"status\":\"active\"");
    assertThat(created.body()).contains("\"source\":\"manual\"");
    assertThat(created.body()).contains("\"anchorText\":\"适用于收费政策\"");

    String relationId = created.body().replaceAll(".*\\\"id\\\":\\\"([^\\\"]+)\\\".*", "$1");
    String updateBody = """
      {
        "targetNodeId": "wn-003",
        "relationType": "conflicts_with",
        "status": "pending_review",
        "source": "manual",
        "confidence": 0.66,
        "anchorText": "冲突待确认",
        "note": "业务专家需要复核。",
        "evidenceSourceRefId": "ref-web-service-fee"
      }
      """;

    HttpResponse<String> updated = patch("/api/wiki-nodes/wn-001/relations/%s".formatted(relationId), updateBody);
    HttpResponse<String> relations = get("/api/wiki-nodes/wn-001/relations");

    assertThat(updated.statusCode()).isEqualTo(200);
    assertThat(updated.body()).contains("\"targetNodeId\":\"wn-003\"");
    assertThat(updated.body()).contains("\"relationType\":\"conflicts_with\"");
    assertThat(updated.body()).contains("\"status\":\"pending_review\"");
    assertThat(updated.body()).contains("\"note\":\"业务专家需要复核。\"");
    assertThat(relations.statusCode()).isEqualTo(200);
    assertThat(relations.body()).contains(relationId);
    assertThat(relations.body()).contains("\"source\":\"manual\"");

    HttpResponse<String> deleted = delete("/api/wiki-nodes/wn-001/relations/%s".formatted(relationId));
    HttpResponse<String> afterDelete = get("/api/wiki-nodes/wn-001/relations");

    assertThat(deleted.statusCode()).isEqualTo(204);
    assertThat(afterDelete.statusCode()).isEqualTo(200);
    assertThat(afterDelete.body()).doesNotContain(relationId);
  }

  @Test
  void returnsWikiNodeDetailsAndLinks() throws Exception {
    HttpResponse<String> detail = get("/api/wiki-nodes/wn-001");
    HttpResponse<String> links = get("/api/wiki-nodes/wn-001/links");
    HttpResponse<String> backlinks = get("/api/wiki-nodes/wn-002/backlinks");

    assertThat(detail.statusCode()).isEqualTo(200);
    assertThat(detail.body()).contains("\"nodeId\":\"wn-001\"");
    assertThat(detail.body()).contains("\"title\":\"保修政策\"");
    assertThat(links.statusCode()).isEqualTo(200);
    assertThat(links.body()).contains("\"fromNodeId\":\"wn-001\"");
    assertThat(links.body()).contains("\"relationType\":\"reference\"");
    assertThat(backlinks.statusCode()).isEqualTo(200);
    assertThat(backlinks.body()).contains("\"toNodeId\":\"wn-002\"");
  }

  @Test
  void listsBrokenLinksAsUnresolvedWikiLinks() throws Exception {
    HttpResponse<String> response = get("/api/broken-links");

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.body()).contains("\"resolved\":false");
    assertThat(response.body()).contains("\"targetTitle\"");
  }

  @Test
  void exposesSourceRawMaterialAndParsedDocumentReadOnlyEvidenceChain() throws Exception {
    HttpResponse<String> sources = get("/api/sources");
    HttpResponse<String> sourceDetail = get("/api/sources/src-feishu-cc");
    HttpResponse<String> sourceRawMaterials = get("/api/sources/src-feishu-cc/raw-materials");
    HttpResponse<String> rawMaterials = get("/api/raw-materials");
    HttpResponse<String> rawMaterialDetail = get("/api/raw-materials/rm-001");
    HttpResponse<String> parsedDocuments = get("/api/raw-materials/rm-001/parsed-documents");
    HttpResponse<String> parsedDocumentDetail = get("/api/parsed-documents/pd-001");

    assertThat(sources.statusCode()).isEqualTo(200);
    assertThat(sources.body()).contains("\"sourceId\":\"src-feishu-cc\"");
    assertThat(sources.body()).contains("\"rawMaterialCount\":");
    assertThat(sourceDetail.statusCode()).isEqualTo(200);
    assertThat(sourceDetail.body()).contains("\"sourceType\":\"feishu\"");

    assertThat(sourceRawMaterials.statusCode()).isEqualTo(200);
    assertThat(sourceRawMaterials.body()).contains("\"rawMaterialId\":\"rm-001\"");
    assertThat(rawMaterials.statusCode()).isEqualTo(200);
    assertThat(rawMaterials.body()).contains("\"parseStatus\":\"parsed\"");
    assertThat(rawMaterialDetail.statusCode()).isEqualTo(200);
    assertThat(rawMaterialDetail.body()).contains("\"sourceId\":\"src-feishu-cc\"");
    assertThat(rawMaterialDetail.body()).contains("\"parsedDocumentCount\":1");

    assertThat(parsedDocuments.statusCode()).isEqualTo(200);
    assertThat(parsedDocuments.body()).contains("\"parsedDocumentId\":\"pd-001\"");
    assertThat(parsedDocumentDetail.statusCode()).isEqualTo(200);
    assertThat(parsedDocumentDetail.body()).contains("\"normalizedContent\"");
    assertThat(parsedDocumentDetail.body()).contains("\"sourceRefs\"");
    assertThat(parsedDocumentDetail.body()).contains("\"locatorType\":\"heading\"");
    assertThat(parsedDocumentDetail.body()).doesNotContain("\"chunk\"");
    assertThat(parsedDocumentDetail.body()).doesNotContain("\"document\":{\"");
  }

  @Test
  void importsLocalSourceFileIntoRawMaterialParsedDocumentAndDocumentSegments() throws Exception {
    String boundary = "----wikinode-test-boundary";
    String markdown = """
      # 安装服务资料

      安装前需要确认上下水、电源和橱柜尺寸。

      ## 收费提示

      特殊材料或二次上门收费请参考收费政策。
      """;

    HttpResponse<String> imported = postMultipart(
      "/api/sources/src-pdf-dishwasher/raw-materials/import",
      boundary,
      "dishwasher-install.md",
      markdown
    );

    assertThat(imported.statusCode()).isEqualTo(200);
    assertThat(imported.body()).contains("\"sourceId\":\"src-pdf-dishwasher\"");
    assertThat(imported.body()).contains("\"rawMaterialId\":\"");
    assertThat(imported.body()).contains("\"parsedDocumentId\":\"");
    assertThat(imported.body()).contains("\"segmentCount\":");
    assertThat(imported.body()).contains("\"suggestionId\":\"");
    assertThat(imported.body()).contains("\"status\":\"succeeded\"");
    assertThat(imported.body()).doesNotContain("\"embedding\"");
    assertThat(imported.body()).doesNotContain("\"vector");
    assertThat(imported.body()).doesNotContain("\"nodeId\"");

    String rawMaterialId = extract(imported.body(), "rawMaterialId");
    String parsedDocumentId = extract(imported.body(), "parsedDocumentId");
    String suggestionId = extract(imported.body(), "suggestionId");

    HttpResponse<String> rawMaterial = get("/api/raw-materials/%s".formatted(rawMaterialId));
    HttpResponse<String> parsedDocuments = get("/api/raw-materials/%s/parsed-documents".formatted(rawMaterialId));
    HttpResponse<String> parsedDocument = get("/api/parsed-documents/%s".formatted(parsedDocumentId));
    HttpResponse<String> segments = get("/api/parsed-documents/%s/segments".formatted(parsedDocumentId));
    HttpResponse<String> suggestions = get("/api/parsed-documents/%s/draft-wikinode-suggestions".formatted(parsedDocumentId));
    HttpResponse<String> suggestionDetail = get("/api/draft-wikinode-suggestions/%s".formatted(suggestionId));
    HttpResponse<String> operations = get("/api/raw-materials/%s/operations".formatted(rawMaterialId));

    assertThat(rawMaterial.statusCode()).isEqualTo(200);
    assertThat(rawMaterial.body()).contains("\"parseStatus\":\"parsed\"");
    assertThat(rawMaterial.body()).contains("\"parsedDocumentCount\":1");
    assertThat(parsedDocuments.statusCode()).isEqualTo(200);
    assertThat(parsedDocuments.body()).contains(parsedDocumentId);
    assertThat(parsedDocument.statusCode()).isEqualTo(200);
    assertThat(parsedDocument.body()).contains("安装前需要确认上下水");
    assertThat(parsedDocument.body()).contains("\"contentFormat\":\"markdown\"");
    assertThat(segments.statusCode()).isEqualTo(200);
    assertThat(segments.body()).contains("\"segmentId\"");
    assertThat(segments.body()).contains("\"parsedDocumentId\":\"%s\"".formatted(parsedDocumentId));
    assertThat(segments.body()).contains("收费提示");
    assertThat(segments.body()).doesNotContain("\"embedding\"");
    assertThat(segments.body()).doesNotContain("\"vector");
    assertThat(suggestions.statusCode()).isEqualTo(200);
    assertThat(suggestions.body()).contains(suggestionId);
    assertThat(suggestionDetail.statusCode()).isEqualTo(200);
    assertThat(suggestionDetail.body()).contains("\"parsedDocumentId\":\"%s\"".formatted(parsedDocumentId));
    assertThat(suggestionDetail.body()).contains("\"status\":\"draft\"");
    assertThat(suggestionDetail.body()).doesNotContain("\"indexSegmentId\"");
    assertThat(suggestionDetail.body()).doesNotContain("\"nodeId\"");
    assertThat(operations.statusCode()).isEqualTo(200);
    assertThat(operations.body()).contains("\"operationType\":\"import_source_file\"");
    assertThat(operations.body()).contains("\"operationType\":\"parse_raw_material\"");
    assertThat(operations.body()).contains("\"operationType\":\"suggest_wikinode\"");
  }

  @Test
  void importedSourceCanReachWikiGraphAndRetrievalAsWikiNode() throws Exception {
    String boundary = "----wikinode-e2e-boundary";
    String markdown = """
      # 端到端验收排查规范

      端到端验收排查用于确认导入、拆分、图谱和召回链路。

      ## 处理口径

      端到端验收排查需要参考 [[收费政策]]，并保留图谱关系。
      """;

    HttpResponse<String> imported = postMultipart(
      "/api/sources/src-pdf-dishwasher/raw-materials/import",
      boundary,
      "e2e-acceptance.md",
      markdown
    );

    assertThat(imported.statusCode()).isEqualTo(200);
    assertThat(imported.body()).contains("\"segmentCount\":");
    assertThat(imported.body()).contains("\"suggestionId\":\"");

    String parsedDocumentId = extract(imported.body(), "parsedDocumentId");
    String suggestionId = extract(imported.body(), "suggestionId");

    HttpResponse<String> documentSegments = get("/api/parsed-documents/%s/segments".formatted(parsedDocumentId));
    assertThat(documentSegments.statusCode()).isEqualTo(200);
    assertThat(documentSegments.body()).contains("\"parsedDocumentId\":\"%s\"".formatted(parsedDocumentId));
    assertThat(documentSegments.body()).contains("端到端验收排查");
    assertThat(documentSegments.body()).doesNotContain("\"chunk\"");

    HttpResponse<String> accepted = post(
      "/api/draft-wikinode-suggestions/%s/accept".formatted(suggestionId),
      """
        {
          "reviewNote": "端到端验收链路通过后进入草稿 WikiNode。"
        }
        """
    );

    assertThat(accepted.statusCode()).isEqualTo(200);
    assertThat(accepted.body()).contains("\"status\":\"accepted\"");
    assertThat(accepted.body()).contains("\"nodeId\":\"");
    assertThat(accepted.body()).contains("\"indexSegmentCount\":3");

    String nodeId = extract(accepted.body(), "nodeId");

    HttpResponse<String> published = post("/api/wiki-nodes/%s/publish".formatted(nodeId), "{}");
    HttpResponse<String> indexSegments = get("/api/wiki-nodes/%s/index-segments".formatted(nodeId));
    HttpResponse<String> graph = get("/api/wiki-graph/overview");
    HttpResponse<String> retrieval = post(
      "/api/retrieval-test",
      """
        {
          "query": "端到端验收排查 图谱 召回",
          "filters": {},
          "topK": 5,
          "debug": true
        }
        """
    );

    assertThat(published.statusCode()).isEqualTo(200);
    assertThat(published.body()).contains("\"nodeId\":\"%s\"".formatted(nodeId));
    assertThat(published.body()).contains("\"status\":\"published\"");
    assertThat(published.body()).contains("\"indexStatus\":\"outdated\"");

    assertThat(indexSegments.statusCode()).isEqualTo(200);
    assertThat(indexSegments.body()).contains("\"nodeId\":\"%s\"".formatted(nodeId));
    assertThat(indexSegments.body()).contains("\"traceSource\":\"wiki_node\"");
    assertThat(indexSegments.body()).contains("\"vectorDocId\":null");

    assertThat(graph.statusCode()).isEqualTo(200);
    assertThat(graph.body()).contains("\"nodeId\":\"%s\"".formatted(nodeId));
    assertThat(graph.body()).contains("\"title\":\"端到端验收排查规范\"");
    assertThat(graph.body()).contains("\"fromNodeId\":\"%s\"".formatted(nodeId));
    assertThat(graph.body()).contains("\"targetTitle\":\"收费政策\"");
    assertThat(graph.body()).contains("\"resolved\":true");

    assertThat(retrieval.statusCode()).isEqualTo(200);
    assertThat(retrieval.body()).contains("\"node\":");
    assertThat(retrieval.body()).contains("\"nodeId\":\"%s\"".formatted(nodeId));
    assertThat(retrieval.body()).contains("\"matchedSegments\"");
    assertThat(retrieval.body()).contains("\"segmentId\":\"seg-%s-title\"".formatted(nodeId));
    assertThat(retrieval.body()).doesNotContain("\"chunk\"");
    assertThat(retrieval.body()).doesNotContain("\"document\"");
  }

  @Test
  void exposesSourceOperationLogsAsReadOnlyEvidence() throws Exception {
    HttpResponse<String> sourceOperations = get("/api/sources/src-feishu-cc/operations");
    HttpResponse<String> rawMaterialOperations = get("/api/raw-materials/rm-001/operations");
    HttpResponse<String> operationDetail = get("/api/source-operations/op-src-feishu-sync-001");

    assertThat(sourceOperations.statusCode()).isEqualTo(200);
    assertThat(sourceOperations.body()).contains("\"operationId\":\"op-src-feishu-sync-001\"");
    assertThat(sourceOperations.body()).contains("\"operationType\":\"source_sync\"");
    assertThat(sourceOperations.body()).contains("\"status\":\"succeeded\"");

    assertThat(rawMaterialOperations.statusCode()).isEqualTo(200);
    assertThat(rawMaterialOperations.body()).contains("\"operationType\":\"parse_raw_material\"");
    assertThat(rawMaterialOperations.body()).contains("\"rawMaterialId\":\"rm-001\"");

    assertThat(operationDetail.statusCode()).isEqualTo(200);
    assertThat(operationDetail.body()).contains("\"summary\"");
    assertThat(operationDetail.body()).contains("\"requestedBy\":\"system\"");
    assertThat(operationDetail.body()).doesNotContain("\"credential\"");
    assertThat(operationDetail.body()).doesNotContain("\"secret\"");
    assertThat(operationDetail.body()).doesNotContain("\"chunk\"");
  }

  @Test
  void exposesParserProfilesAsReadOnlyRegistry() throws Exception {
    HttpResponse<String> response = get("/api/parser-profiles");

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.body()).contains("\"parserProfile\":\"feishu_article_v1\"");
    assertThat(response.body()).contains("\"displayName\":\"飞书文章解析 Profile\"");
    assertThat(response.body()).contains("\"supportedRawMaterialTypes\"");
    assertThat(response.body()).contains("\"supportedSourceTypes\"");
    assertThat(response.body()).contains("\"contentFormat\":\"markdown\"");
    assertThat(response.body()).contains("\"enabled\":true");
    assertThat(response.body()).doesNotContain("\"credential\"");
    assertThat(response.body()).doesNotContain("\"plugin\"");
    assertThat(response.body()).doesNotContain("\"chunk\"");
  }

  @Test
  void exposesIndexSegmentsAsReadOnlyWikiNodeEvidence() throws Exception {
    HttpResponse<String> segments = get("/api/index-segments");
    HttpResponse<String> detail = get("/api/index-segments/seg-001");
    HttpResponse<String> nodeSegments = get("/api/wiki-nodes/wn-001/index-segments");

    assertThat(segments.statusCode()).isEqualTo(200);
    assertThat(segments.body()).contains("\"segmentId\":\"seg-001\"");
    assertThat(segments.body()).contains("\"nodeId\":\"wn-001\"");
    assertThat(segments.body()).contains("\"nodeTitle\":\"保修政策\"");
    assertThat(segments.body()).contains("\"objectType\":\"Article\"");
    assertThat(segments.body()).contains("\"segmentType\":\"body\"");
    assertThat(segments.body()).contains("\"indexStatus\":\"indexed\"");
    assertThat(segments.body()).contains("\"sourceRefs\"");
    assertThat(segments.body()).contains("\"processingProfile\":\"feishu_article_v1\"");
    assertThat(segments.body()).doesNotContain("\"chunk\"");
    assertThat(segments.body()).doesNotContain("\"embedding\"");

    assertThat(detail.statusCode()).isEqualTo(200);
    assertThat(detail.body()).contains("\"segmentId\":\"seg-001\"");
    assertThat(detail.body()).contains("\"contentPreview\":\"保修期内维修不收取人工费");
    assertThat(detail.body()).contains("\"metadataSummary\"");
    assertThat(detail.body()).contains("\"vectorDocId\":\"vec-wn-001-body\"");

    assertThat(nodeSegments.statusCode()).isEqualTo(200);
    assertThat(nodeSegments.body()).contains("\"segmentId\":\"seg-001\"");
    assertThat(nodeSegments.body()).contains("\"nodeId\":\"wn-001\"");
    assertThat(nodeSegments.body()).doesNotContain("\"chunk\"");
  }

  @Test
  void generatesIndexSegmentsLocallyWithoutVectorSync() throws Exception {
    HttpResponse<String> generate = post("/api/wiki-nodes/wn-001/index-segments/generate", "{}");
    HttpResponse<String> nodeSegments = get("/api/wiki-nodes/wn-001/index-segments");

    assertThat(generate.statusCode()).isEqualTo(200);
    assertThat(generate.body()).contains("\"segmentId\":\"seg-wn-001-title\"");
    assertThat(generate.body()).contains("\"segmentId\":\"seg-wn-001-summary\"");
    assertThat(generate.body()).contains("\"segmentId\":\"seg-wn-001-body\"");
    assertThat(generate.body()).contains("\"indexStatus\":\"not_indexed\"");
    assertThat(generate.body()).contains("\"generationMode\":\"local_deterministic\"");
    assertThat(generate.body()).contains("\"traceSource\":\"wiki_node\"");
    assertThat(generate.body()).contains("\"sourceRefs\"");
    assertThat(generate.body()).doesNotContain("\"vectorDocId\":\"vec-");
    assertThat(generate.body()).doesNotContain("\"embedding\"");
    assertThat(generate.body()).doesNotContain("\"chunk\"");

    assertThat(nodeSegments.statusCode()).isEqualTo(200);
    assertThat(nodeSegments.body()).contains("\"segmentId\":\"seg-wn-001-title\"");
    assertThat(nodeSegments.body()).contains("\"segmentId\":\"seg-wn-001-summary\"");
    assertThat(nodeSegments.body()).contains("\"segmentId\":\"seg-wn-001-body\"");
  }

  @Test
  void publishesWikiNodeAndPreparesIndexSegmentsWithoutVectorSync() throws Exception {
    HttpResponse<String> accept = post("/api/draft-wikinode-suggestions/sug-002/accept", """
      {
        "reviewNote": "确认进入草稿 WikiNode，后续人工编辑。"
      }
      """);
    HttpResponse<String> publish = post("/api/wiki-nodes/wn-from-sug-002/publish", "{}");
    HttpResponse<String> node = get("/api/wiki-nodes/wn-from-sug-002");
    HttpResponse<String> segments = get("/api/wiki-nodes/wn-from-sug-002/index-segments");
    HttpResponse<String> reindex = post("/api/wiki-nodes/wn-from-sug-002/reindex", "{}");

    assertThat(accept.statusCode()).isEqualTo(200);
    assertThat(publish.statusCode()).isEqualTo(200);
    assertThat(publish.body()).contains("\"nodeId\":\"wn-from-sug-002\"");
    assertThat(publish.body()).contains("\"status\":\"published\"");
    assertThat(publish.body()).contains("\"indexStatus\":\"outdated\"");
    assertThat(publish.body()).contains("\"indexSegmentCount\":3");
    assertThat(publish.body()).contains("外部向量库同步待后续执行");
    assertThat(publish.body()).doesNotContain("\"indexSegmentId\"");
    assertThat(publish.body()).doesNotContain("\"vectorDocId\"");
    assertThat(publish.body()).doesNotContain("\"embedding\"");
    assertThat(publish.body()).doesNotContain("\"chunk\"");

    assertThat(node.statusCode()).isEqualTo(200);
    assertThat(node.body()).contains("\"status\":\"published\"");
    assertThat(node.body()).contains("\"indexStatus\":\"outdated\"");
    assertThat(node.body()).contains("\"lifecycleStatus\":\"published\"");
    assertThat(node.body()).doesNotContain("\"published\":true");

    assertThat(segments.statusCode()).isEqualTo(200);
    assertThat(segments.body()).contains("\"nodeId\":\"wn-from-sug-002\"");
    assertThat(segments.body()).contains("\"indexStatus\":\"not_indexed\"");
    assertThat(segments.body()).contains("\"vectorDocId\":null");
    assertThat(segments.body()).contains("\"status\":\"published\"");
    assertThat(segments.body()).doesNotContain("\"embedding\"");
    assertThat(segments.body()).doesNotContain("\"chunk\"");

    assertThat(reindex.statusCode()).isEqualTo(200);
    assertThat(reindex.body()).contains("\"nodeId\":\"wn-from-sug-002\"");
    assertThat(reindex.body()).contains("\"indexStatus\":\"outdated\"");
    assertThat(reindex.body()).contains("\"indexSegmentCount\":3");
    assertThat(reindex.body()).contains("外部向量库同步待后续执行");
    assertThat(reindex.body()).doesNotContain("\"vectorDocId\"");
    assertThat(reindex.body()).doesNotContain("\"embedding\"");
  }

  @Test
  void exposesDraftWikiNodeSuggestionsAsReadOnlyReviewEvidence() throws Exception {
    HttpResponse<String> suggestions = get("/api/draft-wikinode-suggestions");
    HttpResponse<String> detail = get("/api/draft-wikinode-suggestions/sug-001");
    HttpResponse<String> parsedDocumentSuggestions = get("/api/parsed-documents/pd-001/draft-wikinode-suggestions");
    HttpResponse<String> rawMaterialSuggestions = get("/api/raw-materials/rm-001/draft-wikinode-suggestions");

    assertThat(suggestions.statusCode()).isEqualTo(200);
    assertThat(suggestions.body()).contains("\"suggestionId\":\"sug-001\"");
    assertThat(suggestions.body()).contains("\"title\":\"保修期内维修服务政策\"");
    assertThat(suggestions.body()).contains("\"status\":\"draft\"");
    assertThat(suggestions.body()).contains("\"sourceRefCount\":1");
    assertThat(suggestions.body()).contains("\"relationCandidateCount\":1");

    assertThat(detail.statusCode()).isEqualTo(200);
    assertThat(detail.body()).contains("\"parsedDocumentId\":\"pd-001\"");
    assertThat(detail.body()).contains("\"operationId\":\"op-src-feishu-suggest-001\"");
    assertThat(detail.body()).contains("\"contentDraft\"");
    assertThat(detail.body()).contains("\"sourceRefs\"");
    assertThat(detail.body()).contains("\"relationCandidates\"");
    assertThat(detail.body()).contains("\"conflictStatus\":\"title_match\"");
    assertThat(detail.body()).contains("\"matchedWikiNodeIds\"");
    assertThat(detail.body()).doesNotContain("\"published\":true");
    assertThat(detail.body()).doesNotContain("\"indexSegmentId\"");
    assertThat(detail.body()).doesNotContain("\"chunk\"");
    assertThat(detail.body()).doesNotContain("\"signedUrl\"");

    assertThat(parsedDocumentSuggestions.statusCode()).isEqualTo(200);
    assertThat(parsedDocumentSuggestions.body()).contains("\"suggestionId\":\"sug-001\"");
    assertThat(rawMaterialSuggestions.statusCode()).isEqualTo(200);
    assertThat(rawMaterialSuggestions.body()).contains("\"suggestionId\":\"sug-001\"");
  }

  @Test
  void generatesOneDraftWikiNodeSuggestionFromOneParsedDocument() throws Exception {
    String body = """
      {
        "conversionProfile": "excel_fee_table_v1",
        "idempotencyKey": "api-contract-pd-003"
      }
      """;

    HttpResponse<String> generate = post("/api/parsed-documents/pd-003/suggest-wikinode", body);
    HttpResponse<String> suggestions = get("/api/parsed-documents/pd-003/draft-wikinode-suggestions");

    assertThat(generate.statusCode()).isEqualTo(200);
    assertThat(generate.body()).contains("\"parsedDocumentId\":\"pd-003\"");
    assertThat(generate.body()).contains("\"status\":\"succeeded\"");
    assertThat(generate.body()).contains("\"summary\":\"已生成待审核 WikiNode 建议。\"");
    assertThat(generate.body()).contains("\"suggestionId\":\"sug-pd-003\"");
    assertThat(generate.body()).doesNotContain("\"nodeId\"");
    assertThat(generate.body()).doesNotContain("\"indexSegmentId\"");
    assertThat(generate.body()).doesNotContain("\"chunk\"");

    assertThat(suggestions.statusCode()).isEqualTo(200);
    assertThat(suggestions.body()).contains("\"suggestionId\":\"sug-pd-003\"");
    assertThat(suggestions.body()).contains("\"operationId\":\"op-pd-003-suggest-");
    assertThat(suggestions.body()).contains("\"title\":\"维修收费标准 Excel\"");
    assertThat(suggestions.body()).contains("\"objectType\":\"DataRecord\"");
    assertThat(suggestions.body()).contains("\"subtype\":\"fee_table\"");
    assertThat(suggestions.body()).contains("\"status\":\"draft\"");
    assertThat(suggestions.body()).contains("\"sourceRefs\"");
    assertThat(suggestions.body()).doesNotContain("\"published\":true");
    assertThat(suggestions.body()).doesNotContain("\"indexSegmentId\"");
  }

  @Test
  void runsLocalSourceIngestionToGenerateDraftWikiNodeSuggestionsWithoutCreatingWikiNodes() throws Exception {
    String body = """
      {
        "conversionProfile": "excel_fee_table_v1",
        "requestedBy": "api-contract"
      }
      """;

    HttpResponse<String> run = post("/api/sources/src-excel-fee/ingestion-runs", body);
    HttpResponse<String> suggestions = get("/api/draft-wikinode-suggestions");
    HttpResponse<String> sourceOperations = get("/api/sources/src-excel-fee/operations");
    HttpResponse<String> missingNode = get("/api/wiki-nodes/wn-from-sug-pd-003");

    assertThat(run.statusCode()).isEqualTo(200);
    assertThat(run.body()).contains("\"sourceId\":\"src-excel-fee\"");
    assertThat(run.body()).contains("\"status\":\"succeeded\"");
    assertThat(run.body()).contains("\"parsedDocumentCount\":1");
    assertThat(run.body()).contains("\"generatedSuggestionIds\":[\"sug-pd-003\"]");
    assertThat(run.body()).contains("\"skippedParsedDocumentIds\":[]");
    assertThat(run.body()).contains("\"summary\":\"已从 Source 生成 1 条待审核 WikiNode 建议。\"");
    assertThat(run.body()).doesNotContain("\"nodeId\"");
    assertThat(run.body()).doesNotContain("\"indexSegmentId\"");
    assertThat(run.body()).doesNotContain("\"chunk\"");

    assertThat(suggestions.statusCode()).isEqualTo(200);
    assertThat(suggestions.body()).contains("\"suggestionId\":\"sug-pd-003\"");
    assertThat(suggestions.body()).contains("\"sourceId\":\"src-excel-fee\"");
    assertThat(suggestions.body()).contains("\"status\":\"draft\"");

    assertThat(sourceOperations.statusCode()).isEqualTo(200);
    assertThat(sourceOperations.body()).contains("\"operationType\":\"source_ingestion_run\"");
    assertThat(sourceOperations.body()).contains("\"operationType\":\"suggest_wikinode\"");
    assertThat(sourceOperations.body()).doesNotContain("\"embedding\"");
    assertThat(sourceOperations.body()).doesNotContain("\"chunk\"");

    assertThat(missingNode.statusCode()).isEqualTo(404);
  }

  @Test
  void skipsDraftWikiNodeSuggestionGenerationForExistingSuggestion() throws Exception {
    String body = """
      {
        "conversionProfile": "feishu_article_v1",
        "idempotencyKey": "api-contract-pd-001"
      }
      """;

    HttpResponse<String> generate = post("/api/parsed-documents/pd-001/suggest-wikinode", body);

    assertThat(generate.statusCode()).isEqualTo(200);
    assertThat(generate.body()).contains("\"parsedDocumentId\":\"pd-001\"");
    assertThat(generate.body()).contains("\"status\":\"skipped\"");
    assertThat(generate.body()).contains("\"summary\":\"该 Parsed Document 已有待审核 WikiNode 建议。\"");
    assertThat(generate.body()).doesNotContain("\"nodeId\"");
    assertThat(generate.body()).doesNotContain("\"indexSegmentId\"");
  }

  @Test
  void rejectsOneDraftWikiNodeSuggestionWithoutCreatingWikiNode() throws Exception {
    String body = """
      {
        "reviewNote": "培训资料暂不进入 WikiNode。"
      }
      """;

    HttpResponse<String> reject = post("/api/draft-wikinode-suggestions/sug-002/reject", body);
    HttpResponse<String> detail = get("/api/draft-wikinode-suggestions/sug-002");

    assertThat(reject.statusCode()).isEqualTo(200);
    assertThat(reject.body()).contains("\"suggestionId\":\"sug-002\"");
    assertThat(reject.body()).contains("\"status\":\"rejected\"");
    assertThat(reject.body()).contains("\"summary\":\"已拒绝 WikiNode 建议。\"");
    assertThat(reject.body()).contains("\"reviewNote\":\"培训资料暂不进入 WikiNode。\"");
    assertThat(reject.body()).doesNotContain("\"nodeId\"");
    assertThat(reject.body()).doesNotContain("\"indexSegmentId\"");
    assertThat(reject.body()).doesNotContain("\"chunk\"");

    assertThat(detail.statusCode()).isEqualTo(200);
    assertThat(detail.body()).contains("\"status\":\"rejected\"");
    assertThat(detail.body()).contains("\"reviewNote\":\"培训资料暂不进入 WikiNode。\"");
    assertThat(detail.body()).contains("\"sourceRefs\"");
    assertThat(detail.body()).contains("\"relationCandidates\"");
    assertThat(detail.body()).doesNotContain("\"published\":true");
    assertThat(detail.body()).doesNotContain("\"indexSegmentId\"");
  }

  @Test
  void rejectsDraftWikiNodeSuggestionRequiresReviewNote() throws Exception {
    String body = """
      {
        "reviewNote": " "
      }
      """;

    HttpResponse<String> reject = post("/api/draft-wikinode-suggestions/sug-001/reject", body);

    assertThat(reject.statusCode()).isEqualTo(400);
    assertThat(reject.body()).contains("拒绝原因不能为空");
  }

  @Test
  void retriesOneDraftWikiNodeSuggestionAndReplacesTheOldSuggestion() throws Exception {
    String body = """
      {
        "reviewNote": "当前建议范围不准，基于同一 Parsed Document 重新生成。"
      }
      """;

    HttpResponse<String> retry = post("/api/draft-wikinode-suggestions/sug-002/retry", body);
    HttpResponse<String> oldDetail = get("/api/draft-wikinode-suggestions/sug-002");
    HttpResponse<String> newDetail = get("/api/draft-wikinode-suggestions/sug-pd-002-retry-1");

    assertThat(retry.statusCode()).isEqualTo(200);
    assertThat(retry.body()).contains("\"suggestionId\":\"sug-002\"");
    assertThat(retry.body()).contains("\"status\":\"superseded\"");
    assertThat(retry.body()).contains("\"replacementSuggestionId\":\"sug-pd-002-retry-1\"");
    assertThat(retry.body()).contains("\"replacementStatus\":\"draft\"");
    assertThat(retry.body()).contains("\"summary\":\"已重新生成 WikiNode 建议，旧建议已标记为被新建议替代。\"");
    assertThat(retry.body()).doesNotContain("\"nodeId\"");
    assertThat(retry.body()).doesNotContain("\"indexSegmentId\"");
    assertThat(retry.body()).doesNotContain("\"chunk\"");

    assertThat(oldDetail.statusCode()).isEqualTo(200);
    assertThat(oldDetail.body()).contains("\"status\":\"superseded\"");
    assertThat(oldDetail.body()).contains("\"reviewNote\":\"当前建议范围不准，基于同一 Parsed Document 重新生成。\"");
    assertThat(oldDetail.body()).contains("\"matchedSuggestionIds\":[\"sug-pd-002-retry-1\"]");

    assertThat(newDetail.statusCode()).isEqualTo(200);
    assertThat(newDetail.body()).contains("\"suggestionId\":\"sug-pd-002-retry-1\"");
    assertThat(newDetail.body()).contains("\"status\":\"draft\"");
    assertThat(newDetail.body()).contains("\"matchedSuggestionIds\":[\"sug-002\"]");
    assertThat(newDetail.body()).contains("\"operationId\":\"op-pd-002-retry-");
    assertThat(newDetail.body()).contains("\"sourceRefs\"");
    assertThat(newDetail.body()).contains("\"relationCandidates\"");
    assertThat(newDetail.body()).doesNotContain("\"published\":true");
    assertThat(newDetail.body()).doesNotContain("\"indexSegmentId\"");
  }

  @Test
  void skipsDraftWikiNodeSuggestionRetryAfterAccept() throws Exception {
    String acceptBody = """
      {
        "reviewNote": "确认进入草稿 WikiNode，后续人工编辑。"
      }
      """;
    String retryBody = """
      {
        "reviewNote": "已采纳后不允许重新生成。"
      }
      """;

    HttpResponse<String> accept = post("/api/draft-wikinode-suggestions/sug-002/accept", acceptBody);
    HttpResponse<String> retry = post("/api/draft-wikinode-suggestions/sug-002/retry", retryBody);

    assertThat(accept.statusCode()).isEqualTo(200);
    assertThat(retry.statusCode()).isEqualTo(200);
    assertThat(retry.body()).contains("\"suggestionId\":\"sug-002\"");
    assertThat(retry.body()).contains("\"status\":\"skipped\"");
    assertThat(retry.body()).contains("\"summary\":\"已采纳的 WikiNode 建议不能重新生成。\"");
    assertThat(retry.body()).contains("\"replacementSuggestionId\":null");
    assertThat(retry.body()).doesNotContain("\"indexSegmentId\"");
    assertThat(retry.body()).doesNotContain("\"chunk\"");
  }

  @Test
  void acceptsOneDraftWikiNodeSuggestionAsDraftWikiNodeAndPreparesIndexSegmentsWithoutPublishingOrSyncing() throws Exception {
    String body = """
      {
        "reviewNote": "确认进入草稿 WikiNode，后续人工编辑。"
      }
      """;

    HttpResponse<String> accept = post("/api/draft-wikinode-suggestions/sug-002/accept", body);
    HttpResponse<String> detail = get("/api/draft-wikinode-suggestions/sug-002");
    HttpResponse<String> node = get("/api/wiki-nodes/wn-from-sug-002");
    HttpResponse<String> segments = get("/api/wiki-nodes/wn-from-sug-002/index-segments");

    assertThat(accept.statusCode()).isEqualTo(200);
    assertThat(accept.body()).contains("\"suggestionId\":\"sug-002\"");
    assertThat(accept.body()).contains("\"status\":\"accepted\"");
    assertThat(accept.body()).contains("\"summary\":\"已采纳为草稿 WikiNode，并准备 3 条 Index Segment。\"");
    assertThat(accept.body()).contains("\"reviewNote\":\"确认进入草稿 WikiNode，后续人工编辑。\"");
    assertThat(accept.body()).contains("\"nodeId\":\"wn-from-sug-002\"");
    assertThat(accept.body()).contains("\"nodeStatus\":\"draft\"");
    assertThat(accept.body()).contains("\"indexSegmentCount\":3");
    assertThat(accept.body()).doesNotContain("\"wikiLinkId\"");
    assertThat(accept.body()).doesNotContain("\"indexSegmentId\"");
    assertThat(accept.body()).doesNotContain("\"chunk\"");
    assertThat(accept.body()).doesNotContain("\"embedding\"");
    assertThat(accept.body()).doesNotContain("\"vector");

    assertThat(detail.statusCode()).isEqualTo(200);
    assertThat(detail.body()).contains("\"status\":\"accepted\"");
    assertThat(detail.body()).contains("\"reviewNote\":\"确认进入草稿 WikiNode，后续人工编辑。\"");
    assertThat(detail.body()).contains("\"matchedWikiNodeIds\":[\"wn-from-sug-002\"]");

    assertThat(node.statusCode()).isEqualTo(200);
    assertThat(node.body()).contains("\"nodeId\":\"wn-from-sug-002\"");
    assertThat(node.body()).contains("\"title\":\"洗碗机基础排查建议\"");
    assertThat(node.body()).contains("\"status\":\"draft\"");
    assertThat(node.body()).contains("\"indexStatus\":\"not_indexed\"");
    assertThat(node.body()).contains("\"sourceRefs\"");
    assertThat(node.body()).doesNotContain("\"published\":true");
    assertThat(node.body()).doesNotContain("\"indexSegmentId\"");

    assertThat(segments.statusCode()).isEqualTo(200);
    assertThat(segments.body()).contains("\"nodeId\":\"wn-from-sug-002\"");
    assertThat(segments.body()).contains("\"indexStatus\":\"not_indexed\"");
    assertThat(segments.body()).contains("\"vectorDocId\":null");
    assertThat(segments.body()).contains("\"traceSource\":\"wiki_node\"");
    assertThat(segments.body()).doesNotContain("\"embedding\"");
  }

  @Test
  void skipsDraftWikiNodeSuggestionAcceptWhenConflictExists() throws Exception {
    String body = """
      {
        "reviewNote": "尝试采纳冲突建议。"
      }
      """;

    HttpResponse<String> accept = post("/api/draft-wikinode-suggestions/sug-001/accept", body);

    assertThat(accept.statusCode()).isEqualTo(200);
    assertThat(accept.body()).contains("\"suggestionId\":\"sug-001\"");
    assertThat(accept.body()).contains("\"status\":\"skipped\"");
    assertThat(accept.body()).contains("\"summary\":\"存在冲突，不能直接采纳为 WikiNode。\"");
    assertThat(accept.body()).doesNotContain("\"nodeId\"");
    assertThat(accept.body()).doesNotContain("\"indexSegmentId\"");
  }

  @Test
  void retrievalReturnsWikiNodeObjectsNotChunks() throws Exception {
    String body = """
      {
        "query": "洗碗机保修期内维修收费吗？",
        "filters": {},
        "topK": 5
      }
      """;

    HttpResponse<String> response = post("/api/retrieval-test", body);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.body()).contains("\"node\":");
    assertThat(response.body()).contains("\"nodeId\"");
    assertThat(response.body()).contains("\"contentMarkdown\"");
    assertThat(response.body()).doesNotContain("\"chunk\"");
    assertThat(response.body()).doesNotContain("\"document\"");
  }

  @Test
  void retrievalDebugAddsMatchedSegmentsAndWritesQueryLogEvidence() throws Exception {
    String normalBody = """
      {
        "query": "保修期内维修",
        "filters": {},
        "topK": 3,
        "debug": false
      }
      """;
    String debugBody = """
      {
        "query": "保修期内维修",
        "filters": {},
        "topK": 3,
        "debug": true
      }
      """;

    HttpResponse<String> normal = post("/api/retrieval-test", normalBody);
    HttpResponse<String> debug = post("/api/retrieval-test", debugBody);
    HttpResponse<String> logs = get("/api/retrieval-test/logs");

    assertThat(normal.statusCode()).isEqualTo(200);
    assertThat(normal.body()).contains("\"node\":");
    assertThat(normal.body()).doesNotContain("\"matchedSegments\"");
    assertThat(normal.body()).doesNotContain("\"chunk\"");

    assertThat(debug.statusCode()).isEqualTo(200);
    assertThat(debug.body()).contains("\"node\":");
    assertThat(debug.body()).contains("\"matchedSegments\"");
    assertThat(debug.body()).contains("\"segmentId\":\"seg-001\"");
    assertThat(debug.body()).contains("\"sourceRefIds\":[\"src-feishu-cc\"]");
    assertThat(debug.body()).doesNotContain("\"chunk\"");

    assertThat(logs.statusCode()).isEqualTo(200);
    assertThat(logs.body()).contains("\"query\":\"保修期内维修\"");
    assertThat(logs.body()).contains("\"returnedNodeIds\"");
    assertThat(logs.body()).contains("\"matchedSegmentIds\"");
    assertThat(logs.body()).contains("\"latencyMs\"");
    assertThat(logs.body()).contains("\"status\":\"succeeded\"");
    assertThat(logs.body()).doesNotContain("\"Chat API\"");
    assertThat(logs.body()).doesNotContain("\"chunk\"");
  }

  @Test
  void retrievalEvaluationCaseStoresExpectedWikiNodesAndRunEvidence() throws Exception {
    String body = """
      {
        "caseId": "eval-api-warranty",
        "query": "保修期内维修",
        "filters": {},
        "topK": 3,
        "expectedNodeIds": ["wn-001"]
      }
      """;

    HttpResponse<String> created = post("/api/retrieval-test/evaluation-cases", body);
    HttpResponse<String> cases = get("/api/retrieval-test/evaluation-cases");

    assertThat(created.statusCode()).isEqualTo(200);
    assertThat(created.body()).contains("\"caseId\":\"eval-api-warranty\"");
    assertThat(created.body()).contains("\"query\":\"保修期内维修\"");
    assertThat(created.body()).contains("\"expectedNodeIds\":[\"wn-001\"]");
    assertThat(created.body()).contains("\"runResult\"");
    assertThat(created.body()).contains("\"returnedNodeIds\"");
    assertThat(created.body()).contains("\"matchedSegmentIds\"");
    assertThat(created.body()).contains("\"status\":\"passed\"");
    assertThat(created.body()).doesNotContain("\"Chat API\"");
    assertThat(created.body()).doesNotContain("\"chunk\"");

    assertThat(cases.statusCode()).isEqualTo(200);
    assertThat(cases.body()).contains("\"caseId\":\"eval-api-warranty\"");
    assertThat(cases.body()).contains("\"expectedNodeIds\":[\"wn-001\"]");
  }

  @Test
  void updatesWikiNodeContentAndRecalculatesBrokenLinks() throws Exception {
    String updatedNode = """
      {
        "nodeId": "wn-001",
        "slug": "wn-001",
        "title": "保修政策",
        "nodeType": "policy",
        "summary": "保修期内产品故障的维修原则和例外条件。",
        "contentMarkdown": "## 适用范围\\n\\n保修期内的产品故障原则上提供免费维修。\\n\\n请参考 [[new-node|新节点]]。",
        "tags": ["保修", "售后", "政策"],
        "status": "published",
        "sourceRefs": [],
        "indexStatus": "indexed",
        "incomingCount": 0,
        "outgoingCount": 0,
        "brokenLinkCount": 0,
        "createdAt": "2026-06-10",
        "updatedAt": "2026-06-18",
        "lastIndexedAt": "2026-06-18"
      }
      """;

    HttpResponse<String> update = put("/api/wiki-nodes/wn-001", updatedNode);
    HttpResponse<String> links = get("/api/wiki-nodes/wn-001/links");
    HttpResponse<String> brokenLinks = get("/api/broken-links");

    assertThat(update.statusCode()).isEqualTo(200);
    assertThat(update.body()).contains("\"nodeId\":\"wn-001\"");
    assertThat(update.body()).contains("\"slug\":\"wn-001\"");
    assertThat(update.body()).contains("\"brokenLinkCount\":1");
    assertThat(links.statusCode()).isEqualTo(200);
    assertThat(links.body()).contains("\"targetTitle\":\"new-node\"");
    assertThat(links.body()).contains("\"resolved\":false");
    assertThat(brokenLinks.statusCode()).isEqualTo(200);
    assertThat(brokenLinks.body()).contains("\"targetTitle\":\"new-node\"");
  }

  @Test
  void createsWikiNodeAndRepairsSlugBacklinksAndRetrieval() throws Exception {
    String updatedNode = """
      {
        "nodeId": "wn-001",
        "slug": "wn-001",
        "title": "保修政策",
        "nodeType": "policy",
        "summary": "保修期内产品故障的维修原则和例外条件。",
        "contentMarkdown": "## 适用范围\\n\\n请参考 [[new-node|新节点]]。",
        "tags": ["保修", "售后", "政策"],
        "status": "published",
        "sourceRefs": [],
        "indexStatus": "indexed",
        "incomingCount": 0,
        "outgoingCount": 0,
        "brokenLinkCount": 0,
        "createdAt": "2026-06-10",
        "updatedAt": "2026-06-18",
        "lastIndexedAt": "2026-06-18"
      }
      """;
    String newNode = """
      {
        "slug": "new-node",
        "title": "新节点",
        "nodeType": "term",
        "summary": "用于验证创建节点后修复断链。",
        "contentMarkdown": "## 新内容\\n\\n新节点保存后可以被 Retrieval 命中。",
        "tags": ["联调", "新节点"],
        "status": "draft",
        "sourceRefs": [],
        "indexStatus": "not_indexed"
      }
      """;
    String retrievalQuery = """
      {
        "query": "新节点保存",
        "filters": {},
        "topK": 5
      }
      """;

    HttpResponse<String> update = put("/api/wiki-nodes/wn-001", updatedNode);
    HttpResponse<String> create = post("/api/wiki-nodes", newNode);
    HttpResponse<String> links = get("/api/wiki-nodes/wn-001/links");
    HttpResponse<String> backlinks = get("/api/wiki-nodes/new-node/backlinks");
    HttpResponse<String> brokenLinks = get("/api/broken-links");
    HttpResponse<String> retrieval = post("/api/retrieval-test", retrievalQuery);

    assertThat(update.statusCode()).isEqualTo(200);
    assertThat(create.statusCode()).isEqualTo(200);
    assertThat(create.body()).contains("\"nodeId\":\"new-node\"");
    assertThat(create.body()).contains("\"slug\":\"new-node\"");
    assertThat(links.body()).contains("\"toNodeId\":\"new-node\"");
    assertThat(links.body()).contains("\"toTitle\":\"新节点\"");
    assertThat(links.body()).contains("\"targetTitle\":\"new-node\"");
    assertThat(links.body()).contains("\"resolved\":true");
    assertThat(backlinks.statusCode()).isEqualTo(200);
    assertThat(backlinks.body()).contains("\"fromNodeId\":\"wn-001\"");
    assertThat(brokenLinks.body()).doesNotContain("\"targetTitle\":\"new-node\"");
    assertThat(retrieval.statusCode()).isEqualTo(200);
    assertThat(retrieval.body()).contains("\"node\":");
    assertThat(retrieval.body()).contains("\"nodeId\":\"new-node\"");
    assertThat(retrieval.body()).doesNotContain("\"chunk\"");
  }

  @Test
  void createAndUpdatePreserveKnowledgeObjectFields() throws Exception {
    String newNode = """
      {
        "slug": "api-knowledge-object-node",
        "title": "API Knowledge Object 节点",
        "nodeType": "product",
        "objectType": "Product",
        "subtype": "product_model",
        "metadata": {
          "brand": "Siemens",
          "productCategory": "washing_machine",
          "modelCode": "WM14U",
          "businessDomain": "after_sales"
        },
        "relations": [
          {
            "targetNodeId": "wn-001",
            "relationType": "has_policy",
            "confidence": 0.81,
            "createdBy": "user",
            "evidence": {
              "sourceRefId": "ref-api-product"
            }
          }
        ],
        "processingProfile": "db_product_master_v1",
        "summary": "用于验证 Knowledge Object 字段通过 API 保存。",
        "contentMarkdown": "## 产品主数据\\n\\n关联 [[保修政策]]。",
        "tags": ["产品", "主数据"],
        "status": "draft",
        "sourceRefs": [],
        "indexStatus": "not_indexed"
      }
      """;
    String updatedNode = """
      {
        "nodeId": "api-knowledge-object-node",
        "slug": "api-knowledge-object-node",
        "title": "API Knowledge Object 节点",
        "nodeType": "product",
        "objectType": "Product",
        "subtype": "product_model",
        "metadata": {
          "brand": "Siemens",
          "productCategory": "washing_machine",
          "modelCode": "WM14U",
          "businessDomain": "after_sales",
          "scenario": "warranty_service"
        },
        "relations": [
          {
            "targetNodeId": "wn-001",
            "relationType": "has_policy",
            "confidence": 0.86,
            "createdBy": "user",
            "evidence": {
              "sourceRefId": "ref-api-product"
            }
          }
        ],
        "processingProfile": "db_product_master_v2",
        "summary": "用于验证 Knowledge Object 字段更新后仍通过 API 保存。",
        "contentMarkdown": "## 产品主数据\\n\\n继续关联 [[保修政策]]。",
        "tags": ["产品", "主数据"],
        "status": "draft",
        "sourceRefs": [],
        "indexStatus": "not_indexed"
      }
      """;

    HttpResponse<String> create = post("/api/wiki-nodes", newNode);
    HttpResponse<String> update = put("/api/wiki-nodes/api-knowledge-object-node", updatedNode);
    HttpResponse<String> detail = get("/api/wiki-nodes/api-knowledge-object-node");

    assertThat(create.statusCode()).isEqualTo(200);
    assertThat(create.body()).contains("\"objectType\":\"Product\"");
    assertThat(create.body()).contains("\"processingProfile\":\"db_product_master_v1\"");
    assertThat(create.body()).contains("\"relationType\":\"has_policy\"");
    assertThat(update.statusCode()).isEqualTo(200);
    assertThat(update.body()).contains("\"processingProfile\":\"db_product_master_v2\"");
    assertThat(update.body()).contains("\"scenario\":\"warranty_service\"");
    assertThat(detail.statusCode()).isEqualTo(200);
    assertThat(detail.body()).contains("\"metadata\"");
    assertThat(detail.body()).contains("\"modelCode\":\"WM14U\"");
    assertThat(detail.body()).contains("\"sourceRefId\":\"ref-api-product\"");
  }

  @Test
  void createAndUpdateReturnClearErrorsForConflictsAndMissingNodes() throws Exception {
    String duplicateSlugNode = """
      {
        "nodeId": "duplicate-node",
        "slug": "wn-002",
        "title": "重复 slug 节点",
        "nodeType": "term",
        "summary": "重复 slug 应该失败。",
        "contentMarkdown": "",
        "tags": [],
        "status": "draft",
        "sourceRefs": [],
        "indexStatus": "not_indexed"
      }
      """;
    String missingNode = """
      {
        "nodeId": "missing-node",
        "slug": "missing-node",
        "title": "不存在节点",
        "nodeType": "term",
        "summary": "",
        "contentMarkdown": "",
        "tags": [],
        "status": "draft",
        "sourceRefs": [],
        "indexStatus": "not_indexed"
      }
      """;

    HttpResponse<String> duplicate = post("/api/wiki-nodes", duplicateSlugNode);
    HttpResponse<String> missing = put("/api/wiki-nodes/missing-node", missingNode);

    assertThat(duplicate.statusCode()).isEqualTo(409);
    assertThat(duplicate.body()).contains("slug");
    assertThat(missing.statusCode()).isEqualTo(404);
  }

  private HttpResponse<String> get(String path) throws Exception {
    return httpClient.send(
      HttpRequest.newBuilder(uri(path)).GET().build(),
      HttpResponse.BodyHandlers.ofString()
    );
  }

  private HttpResponse<String> post(String path, String body) throws Exception {
    return httpClient.send(
      HttpRequest.newBuilder(uri(path))
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(body))
        .build(),
      HttpResponse.BodyHandlers.ofString()
    );
  }

  private HttpResponse<String> postMultipart(String path, String boundary, String fileName, String content) throws Exception {
    String body = """
      --%s
      Content-Disposition: form-data; name="requestedBy"

      contract-test
      --%s
      Content-Disposition: form-data; name="generateSuggestion"

      true
      --%s
      Content-Disposition: form-data; name="file"; filename="%s"
      Content-Type: text/markdown

      %s
      --%s--
      """.formatted(boundary, boundary, boundary, fileName, content, boundary).replace("\n", "\r\n");
    return httpClient.send(
      HttpRequest.newBuilder(uri(path))
        .header("Content-Type", "multipart/form-data; boundary=%s".formatted(boundary))
        .POST(HttpRequest.BodyPublishers.ofString(body))
        .build(),
      HttpResponse.BodyHandlers.ofString()
    );
  }

  private String extract(String json, String field) {
    return json.replaceAll(".*\\\"%s\\\":\\\"([^\\\"]+)\\\".*".formatted(field), "$1");
  }

  private HttpResponse<String> put(String path, String body) throws Exception {
    return httpClient.send(
      HttpRequest.newBuilder(uri(path))
        .header("Content-Type", "application/json")
        .PUT(HttpRequest.BodyPublishers.ofString(body))
        .build(),
      HttpResponse.BodyHandlers.ofString()
    );
  }

  private HttpResponse<String> patch(String path, String body) throws Exception {
    return httpClient.send(
      HttpRequest.newBuilder(uri(path))
        .header("Content-Type", "application/json")
        .method("PATCH", HttpRequest.BodyPublishers.ofString(body))
        .build(),
      HttpResponse.BodyHandlers.ofString()
    );
  }

  private HttpResponse<String> delete(String path) throws Exception {
    return httpClient.send(
      HttpRequest.newBuilder(uri(path)).DELETE().build(),
      HttpResponse.BodyHandlers.ofString()
    );
  }

  private URI uri(String path) {
    return URI.create("http://127.0.0.1:%d%s".formatted(port, path));
  }
}
