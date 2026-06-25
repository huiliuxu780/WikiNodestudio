create table if not exists raw_materials (
  raw_material_id varchar(160) primary key,
  source_id varchar(160) not null references source_items (source_id),
  title varchar(240) not null,
  raw_material_type varchar(80) not null,
  source_version varchar(80),
  captured_at varchar(40) not null,
  content_hash varchar(160) not null,
  storage_provider varchar(80) not null,
  storage_ref text not null,
  parse_status varchar(80) not null,
  created_at varchar(32) not null,
  updated_at varchar(32) not null
);

create index if not exists idx_raw_materials_source_id on raw_materials (source_id);

create table if not exists parsed_documents (
  parsed_document_id varchar(160) primary key,
  raw_material_id varchar(160) not null references raw_materials (raw_material_id) on delete cascade,
  source_id varchar(160) not null references source_items (source_id),
  title varchar(240) not null,
  content_format varchar(80) not null,
  normalized_content text not null,
  metadata_language varchar(40) not null,
  metadata_business_domain varchar(120) not null,
  parser_profile varchar(120) not null,
  parse_status varchar(80) not null,
  parse_error_summary text,
  created_at varchar(32) not null,
  updated_at varchar(32) not null
);

create index if not exists idx_parsed_documents_raw_material_id on parsed_documents (raw_material_id);
create index if not exists idx_parsed_documents_source_id on parsed_documents (source_id);

create table if not exists parsed_document_source_refs (
  parsed_document_id varchar(160) not null references parsed_documents (parsed_document_id) on delete cascade,
  position integer not null,
  source_id varchar(160) not null,
  raw_material_id varchar(160) not null,
  locator_type varchar(80) not null,
  locator varchar(240) not null,
  excerpt text not null,
  confidence double precision not null,
  primary key (parsed_document_id, position)
);

insert into source_items (source_id, source_type, title, owner, sync_status, last_synced_at, generated_nodes)
select 'src-feishu-cc', 'feishu', 'CC 售后政策飞书空间', '售后运营', 'synced', '2026-06-18', 4
where not exists (select 1 from source_items where source_id = 'src-feishu-cc');

insert into source_items (source_id, source_type, title, owner, sync_status, last_synced_at, generated_nodes)
select 'src-pdf-dishwasher', 'pdf', '洗碗机培训 PDF', '产品培训', 'synced', '2026-06-17', 2
where not exists (select 1 from source_items where source_id = 'src-pdf-dishwasher');

insert into source_items (source_id, source_type, title, owner, sync_status, last_synced_at, generated_nodes)
select 'src-excel-fee', 'excel', '维修收费标准 Excel', '服务财务', 'pending', '2026-06-16', 1
where not exists (select 1 from source_items where source_id = 'src-excel-fee');

insert into source_items (source_id, source_type, title, owner, sync_status, last_synced_at, generated_nodes)
select 'src-word-manual', 'word', '产品说明书 Word', '产品资料', 'synced', '2026-06-15', 1
where not exists (select 1 from source_items where source_id = 'src-word-manual');

insert into raw_materials (
  raw_material_id, source_id, title, raw_material_type, source_version, captured_at, content_hash,
  storage_provider, storage_ref, parse_status, created_at, updated_at
)
select 'rm-001', 'src-feishu-cc', '售后政策空间快照', 'document_snapshot', '2026.06',
       '2026-06-20T10:35:00+08:00', 'sha256:rm001', 'workspace', 'workspace://snapshots/rm-001',
       'parsed', '2026-06-20', '2026-06-20'
where not exists (select 1 from raw_materials where raw_material_id = 'rm-001');

insert into raw_materials (
  raw_material_id, source_id, title, raw_material_type, source_version, captured_at, content_hash,
  storage_provider, storage_ref, parse_status, created_at, updated_at
)
select 'rm-007', 'src-feishu-cc', '投诉升级案例补充', 'document_snapshot', '2026.06',
       '2026-06-22T09:00:00+08:00', 'sha256:rm007', 'workspace', 'workspace://snapshots/rm-007',
       'parsing', '2026-06-22', '2026-06-22'
where not exists (select 1 from raw_materials where raw_material_id = 'rm-007');

insert into raw_materials (
  raw_material_id, source_id, title, raw_material_type, source_version, captured_at, content_hash,
  storage_provider, storage_ref, parse_status, created_at, updated_at
)
select 'rm-002', 'src-pdf-dishwasher', '洗碗机培训 PDF', 'file', '2026.05',
       '2026-06-18T15:12:00+08:00', 'sha256:rm002', 'object_storage', 'object://training/rm-002.pdf',
       'parsed', '2026-06-18', '2026-06-18'
where not exists (select 1 from raw_materials where raw_material_id = 'rm-002');

insert into raw_materials (
  raw_material_id, source_id, title, raw_material_type, source_version, captured_at, content_hash,
  storage_provider, storage_ref, parse_status, created_at, updated_at
)
select 'rm-003', 'src-excel-fee', '维修收费标准 Excel', 'file', '2026.06',
       '2026-06-16T09:00:00+08:00', 'sha256:rm003', 'object_storage', 'object://finance/rm-003.xlsx',
       'parsed', '2026-06-16', '2026-06-16'
where not exists (select 1 from raw_materials where raw_material_id = 'rm-003');

insert into raw_materials (
  raw_material_id, source_id, title, raw_material_type, source_version, captured_at, content_hash,
  storage_provider, storage_ref, parse_status, created_at, updated_at
)
select 'rm-004', 'src-word-manual', '产品说明书 Word', 'file', '2026.05',
       '2026-06-12T18:20:00+08:00', 'sha256:rm004', 'object_storage', 'object://manuals/rm-004.docx',
       'failed', '2026-06-12', '2026-06-12'
where not exists (select 1 from raw_materials where raw_material_id = 'rm-004');

insert into parsed_documents (
  parsed_document_id, raw_material_id, source_id, title, content_format, normalized_content,
  metadata_language, metadata_business_domain, parser_profile, parse_status, parse_error_summary,
  created_at, updated_at
)
select 'pd-001', 'rm-001', 'src-feishu-cc', '售后政策空间快照解析结果', 'markdown',
       '# 保修政策

保修期内维修不收取人工费，收费例外需要关联人为损坏判定规则。',
       'zh-CN', 'after_sales', 'feishu_article_v1', 'parsed', null, '2026-06-20', '2026-06-20'
where not exists (select 1 from parsed_documents where parsed_document_id = 'pd-001');

insert into parsed_documents (
  parsed_document_id, raw_material_id, source_id, title, content_format, normalized_content,
  metadata_language, metadata_business_domain, parser_profile, parse_status, parse_error_summary,
  created_at, updated_at
)
select 'pd-002', 'rm-002', 'src-pdf-dishwasher', '洗碗机培训 PDF 解析结果', 'markdown',
       '# 洗碗机培训

排查时先确认电源、水路和错误码。',
       'zh-CN', 'product_support', 'pdf_manual_article_v1', 'parsed', null, '2026-06-18', '2026-06-18'
where not exists (select 1 from parsed_documents where parsed_document_id = 'pd-002');

insert into parsed_documents (
  parsed_document_id, raw_material_id, source_id, title, content_format, normalized_content,
  metadata_language, metadata_business_domain, parser_profile, parse_status, parse_error_summary,
  created_at, updated_at
)
select 'pd-003', 'rm-003', 'src-excel-fee', '维修收费标准 Excel 解析结果', 'structured_table',
       '| 项目 | 费用 |
| --- | --- |
| 上门检测 | 按服务单收费 |',
       'zh-CN', 'service_fee', 'excel_fee_table_v1', 'parsed', null, '2026-06-16', '2026-06-16'
where not exists (select 1 from parsed_documents where parsed_document_id = 'pd-003');

insert into parsed_document_source_refs (
  parsed_document_id, position, source_id, raw_material_id, locator_type, locator, excerpt, confidence
)
select 'pd-001', 0, 'src-feishu-cc', 'rm-001', 'heading', '保修政策/收费例外', '保修期内维修不收取人工费', 0.92
where not exists (select 1 from parsed_document_source_refs where parsed_document_id = 'pd-001' and position = 0);

insert into parsed_document_source_refs (
  parsed_document_id, position, source_id, raw_material_id, locator_type, locator, excerpt, confidence
)
select 'pd-002', 0, 'src-pdf-dishwasher', 'rm-002', 'page', 'P-8', '先检查电源、水路和错误码', 0.88
where not exists (select 1 from parsed_document_source_refs where parsed_document_id = 'pd-002' and position = 0);

insert into parsed_document_source_refs (
  parsed_document_id, position, source_id, raw_material_id, locator_type, locator, excerpt, confidence
)
select 'pd-003', 0, 'src-excel-fee', 'rm-003', 'row', 'Sheet1:R2', '上门检测按服务单收费', 0.9
where not exists (select 1 from parsed_document_source_refs where parsed_document_id = 'pd-003' and position = 0);
