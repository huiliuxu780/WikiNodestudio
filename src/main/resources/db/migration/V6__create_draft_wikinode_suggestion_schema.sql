create table if not exists draft_wikinode_suggestions (
  suggestion_id varchar(160) primary key,
  parsed_document_id varchar(160) not null references parsed_documents (parsed_document_id),
  raw_material_id varchar(160) not null references raw_materials (raw_material_id),
  source_id varchar(160) not null references source_items (source_id),
  operation_id varchar(160) not null references source_operations (operation_id),
  title varchar(240) not null,
  object_type varchar(80) not null,
  subtype varchar(120),
  content_draft text not null,
  metadata_language varchar(40) not null,
  metadata_business_domain varchar(120) not null,
  confidence double precision not null,
  status varchar(80) not null,
  review_note text,
  conflict_status varchar(80) not null,
  conflict_reasons text,
  matched_wiki_node_ids text,
  matched_suggestion_ids text,
  created_at varchar(32) not null,
  updated_at varchar(32) not null
);

create index if not exists idx_draft_wikinode_suggestions_parsed_document_id
  on draft_wikinode_suggestions (parsed_document_id);
create index if not exists idx_draft_wikinode_suggestions_raw_material_id
  on draft_wikinode_suggestions (raw_material_id);
create index if not exists idx_draft_wikinode_suggestions_source_id
  on draft_wikinode_suggestions (source_id);

create table if not exists draft_wikinode_suggestion_source_refs (
  suggestion_id varchar(160) not null references draft_wikinode_suggestions (suggestion_id) on delete cascade,
  position integer not null,
  source_id varchar(160) not null,
  raw_material_id varchar(160) not null,
  parsed_document_id varchar(160) not null,
  locator_type varchar(80) not null,
  locator varchar(240) not null,
  excerpt text not null,
  confidence double precision not null,
  primary key (suggestion_id, position)
);

create table if not exists draft_wikinode_relation_candidates (
  suggestion_id varchar(160) not null references draft_wikinode_suggestions (suggestion_id) on delete cascade,
  position integer not null,
  target_title varchar(240) not null,
  relation_type varchar(80) not null,
  source varchar(120) not null,
  confidence double precision not null,
  primary key (suggestion_id, position)
);

insert into source_operations (
  operation_id, operation_type, source_id, raw_material_id, parsed_document_id, status,
  requested_by, started_at, finished_at, summary, error_summary
)
select 'op-src-feishu-suggest-001', 'suggest_wikinode', 'src-feishu-cc', 'rm-001', 'pd-001', 'succeeded',
       'system', '2026-06-20T10:38:00+08:00', '2026-06-20T10:39:00+08:00',
       'Created read-only Draft WikiNode Suggestion seed evidence.', null
where not exists (select 1 from source_operations where operation_id = 'op-src-feishu-suggest-001');

insert into source_operations (
  operation_id, operation_type, source_id, raw_material_id, parsed_document_id, status,
  requested_by, started_at, finished_at, summary, error_summary
)
select 'op-pdf-suggest-001', 'suggest_wikinode', 'src-pdf-dishwasher', 'rm-002', 'pd-002', 'succeeded',
       'system', '2026-06-18T15:20:00+08:00', '2026-06-18T15:21:00+08:00',
       'Created read-only Draft WikiNode Suggestion seed evidence.', null
where not exists (select 1 from source_operations where operation_id = 'op-pdf-suggest-001');

insert into draft_wikinode_suggestions (
  suggestion_id, parsed_document_id, raw_material_id, source_id, operation_id, title,
  object_type, subtype, content_draft, metadata_language, metadata_business_domain,
  confidence, status, review_note, conflict_status, conflict_reasons,
  matched_wiki_node_ids, matched_suggestion_ids, created_at, updated_at
)
select 'sug-001', 'pd-001', 'rm-001', 'src-feishu-cc', 'op-src-feishu-suggest-001',
       '保修期内维修服务政策', 'Article', 'service_fee_policy',
       '# 保修期内维修服务政策

保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。

该内容仍是待审核 WikiNode 建议，不会自动发布或索引。',
       'zh-CN', 'after_sales', 0.88, 'draft', null, 'title_match',
       '标题可能重复', 'wn-001', '', '2026-06-20', '2026-06-20'
where not exists (select 1 from draft_wikinode_suggestions where suggestion_id = 'sug-001');

insert into draft_wikinode_suggestions (
  suggestion_id, parsed_document_id, raw_material_id, source_id, operation_id, title,
  object_type, subtype, content_draft, metadata_language, metadata_business_domain,
  confidence, status, review_note, conflict_status, conflict_reasons,
  matched_wiki_node_ids, matched_suggestion_ids, created_at, updated_at
)
select 'sug-002', 'pd-002', 'rm-002', 'src-pdf-dishwasher', 'op-pdf-suggest-001',
       '洗碗机基础排查建议', 'Procedure', 'troubleshooting_flow',
       '# 洗碗机基础排查建议

排查时先确认电源、水路和错误码。

该内容仍需人工复核后才能进入 WikiNode。',
       'zh-CN', 'product_support', 0.76, 'needs_review', '需要产品培训负责人复核标题和适用范围。', 'none',
       '', '', '', '2026-06-18', '2026-06-18'
where not exists (select 1 from draft_wikinode_suggestions where suggestion_id = 'sug-002');

insert into draft_wikinode_suggestion_source_refs (
  suggestion_id, position, source_id, raw_material_id, parsed_document_id, locator_type, locator, excerpt, confidence
)
select 'sug-001', 0, 'src-feishu-cc', 'rm-001', 'pd-001', 'heading', '保修政策/收费例外',
       '保修期内维修不收取人工费', 0.92
where not exists (select 1 from draft_wikinode_suggestion_source_refs where suggestion_id = 'sug-001' and position = 0);

insert into draft_wikinode_suggestion_source_refs (
  suggestion_id, position, source_id, raw_material_id, parsed_document_id, locator_type, locator, excerpt, confidence
)
select 'sug-002', 0, 'src-pdf-dishwasher', 'rm-002', 'pd-002', 'page', 'P-8',
       '先检查电源、水路和错误码', 0.88
where not exists (select 1 from draft_wikinode_suggestion_source_refs where suggestion_id = 'sug-002' and position = 0);

insert into draft_wikinode_relation_candidates (
  suggestion_id, position, target_title, relation_type, source, confidence
)
select 'sug-001', 0, '收费政策', 'references', 'inferred_from_source_ref', 0.74
where not exists (select 1 from draft_wikinode_relation_candidates where suggestion_id = 'sug-001' and position = 0);

insert into draft_wikinode_relation_candidates (
  suggestion_id, position, target_title, relation_type, source, confidence
)
select 'sug-002', 0, '保修期内维修服务政策', 'references', 'inferred_from_source_ref', 0.62
where not exists (select 1 from draft_wikinode_relation_candidates where suggestion_id = 'sug-002' and position = 0);
