create table if not exists index_segments (
  segment_id varchar(160) primary key,
  node_id varchar(120) not null references wiki_nodes (node_id) on delete cascade,
  node_title varchar(240) not null,
  object_type varchar(80) not null,
  subtype varchar(120) not null,
  segment_type varchar(80) not null,
  content text not null,
  title varchar(280) not null,
  content_preview text not null,
  token_count integer not null,
  enabled boolean not null,
  index_status varchar(80) not null,
  vector_doc_id varchar(200),
  last_indexed_at varchar(32),
  retrieval_hits integer not null,
  avg_score double precision,
  processing_profile varchar(160),
  metadata_node_type varchar(80) not null,
  metadata_status varchar(80) not null,
  metadata_tags text not null,
  created_at varchar(32) not null,
  updated_at varchar(32) not null
);

create index if not exists idx_index_segments_node_id on index_segments (node_id);
create index if not exists idx_index_segments_index_status on index_segments (index_status);

create table if not exists index_segment_source_refs (
  segment_id varchar(160) not null references index_segments (segment_id) on delete cascade,
  position integer not null,
  source_id varchar(160) not null,
  source_type varchar(80) not null,
  source_title varchar(240) not null,
  source_url text,
  paragraph_ref varchar(120),
  version varchar(80),
  primary key (segment_id, position)
);

create index if not exists idx_index_segment_source_refs_source_id on index_segment_source_refs (source_id);

create table if not exists index_segment_metadata_summary (
  segment_id varchar(160) not null references index_segments (segment_id) on delete cascade,
  position integer not null,
  label varchar(120) not null,
  value varchar(240) not null,
  primary key (segment_id, position)
);

insert into index_segments (
  segment_id, node_id, node_title, object_type, subtype, segment_type, content, title,
  content_preview, token_count, enabled, index_status, vector_doc_id, last_indexed_at,
  retrieval_hits, avg_score, processing_profile, metadata_node_type, metadata_status,
  metadata_tags, created_at, updated_at
)
select
  'seg-001', 'wn-001', '保修政策', 'Article', 'service_fee_policy', 'body',
  '保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。',
  '保修政策 / Body section segment',
  '保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。',
  28, true, 'indexed', 'vec-wn-001-body', '2026-06-18',
  23, 0.88, 'feishu_article_v1', 'policy', 'published',
  '保修,售后,政策', '2026-06-18', '2026-06-18'
where not exists (select 1 from index_segments where segment_id = 'seg-001');

insert into index_segments (
  segment_id, node_id, node_title, object_type, subtype, segment_type, content, title,
  content_preview, token_count, enabled, index_status, vector_doc_id, last_indexed_at,
  retrieval_hits, avg_score, processing_profile, metadata_node_type, metadata_status,
  metadata_tags, created_at, updated_at
)
select
  'seg-002', 'wn-002', '收费政策', 'Article', 'fee_policy', 'summary',
  '保外维修、上门服务和配件费用的收费规则。',
  '收费政策 / Summary segment',
  '保外维修、上门服务和配件费用的收费规则。',
  18, true, 'indexed', 'vec-wn-002-summary', '2026-06-17',
  18, 0.81, 'excel_fee_table_v1', 'policy', 'published',
  '收费,保外,维修', '2026-06-17', '2026-06-17'
where not exists (select 1 from index_segments where segment_id = 'seg-002');

insert into index_segment_source_refs (segment_id, position, source_id, source_type, source_title, source_url, paragraph_ref, version)
select 'seg-001', 0, 'src-feishu-cc', 'feishu', 'CC 售后政策飞书空间', 'https://feishu.example.com/wiki/after-sales', 'P-12', '2026.06'
where not exists (select 1 from index_segment_source_refs where segment_id = 'seg-001' and position = 0);

insert into index_segment_source_refs (segment_id, position, source_id, source_type, source_title, source_url, paragraph_ref, version)
select 'seg-002', 0, 'src-excel-fee', 'excel', '维修收费标准 Excel', null, 'Sheet1:R2', '2026.06'
where not exists (select 1 from index_segment_source_refs where segment_id = 'seg-002' and position = 0);

insert into index_segment_metadata_summary (segment_id, position, label, value)
select 'seg-001', 0, 'objectType', 'Article'
where not exists (select 1 from index_segment_metadata_summary where segment_id = 'seg-001' and position = 0);
insert into index_segment_metadata_summary (segment_id, position, label, value)
select 'seg-001', 1, 'subtype', 'service_fee_policy'
where not exists (select 1 from index_segment_metadata_summary where segment_id = 'seg-001' and position = 1);
insert into index_segment_metadata_summary (segment_id, position, label, value)
select 'seg-001', 2, 'businessDomain', 'after_sales'
where not exists (select 1 from index_segment_metadata_summary where segment_id = 'seg-001' and position = 2);

insert into index_segment_metadata_summary (segment_id, position, label, value)
select 'seg-002', 0, 'objectType', 'Article'
where not exists (select 1 from index_segment_metadata_summary where segment_id = 'seg-002' and position = 0);
insert into index_segment_metadata_summary (segment_id, position, label, value)
select 'seg-002', 1, 'subtype', 'fee_policy'
where not exists (select 1 from index_segment_metadata_summary where segment_id = 'seg-002' and position = 1);
insert into index_segment_metadata_summary (segment_id, position, label, value)
select 'seg-002', 2, 'businessDomain', 'service_fee'
where not exists (select 1 from index_segment_metadata_summary where segment_id = 'seg-002' and position = 2);
