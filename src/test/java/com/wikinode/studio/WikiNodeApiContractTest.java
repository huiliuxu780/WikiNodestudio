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

  private HttpResponse<String> put(String path, String body) throws Exception {
    return httpClient.send(
      HttpRequest.newBuilder(uri(path))
        .header("Content-Type", "application/json")
        .PUT(HttpRequest.BodyPublishers.ofString(body))
        .build(),
      HttpResponse.BodyHandlers.ofString()
    );
  }

  private URI uri(String path) {
    return URI.create("http://127.0.0.1:%d%s".formatted(port, path));
  }
}
