create table if not exists source_operations (
  operation_id varchar(160) primary key,
  operation_type varchar(80) not null,
  source_id varchar(160) not null references source_items (source_id),
  raw_material_id varchar(160) references raw_materials (raw_material_id),
  parsed_document_id varchar(160) references parsed_documents (parsed_document_id),
  status varchar(80) not null,
  requested_by varchar(160) not null,
  started_at varchar(40) not null,
  finished_at varchar(40),
  summary text not null,
  error_summary text
);

create index if not exists idx_source_operations_source_id on source_operations (source_id);
create index if not exists idx_source_operations_raw_material_id on source_operations (raw_material_id);

insert into source_operations (
  operation_id, operation_type, source_id, raw_material_id, parsed_document_id, status,
  requested_by, started_at, finished_at, summary, error_summary
)
select 'op-src-feishu-sync-001', 'source_sync', 'src-feishu-cc', null, null, 'succeeded',
       'system', '2026-06-20T10:30:00+08:00', '2026-06-20T10:35:00+08:00',
       'Completed read-only Source sync evidence capture for 2 Raw Materials.', null
where not exists (select 1 from source_operations where operation_id = 'op-src-feishu-sync-001');

insert into source_operations (
  operation_id, operation_type, source_id, raw_material_id, parsed_document_id, status,
  requested_by, started_at, finished_at, summary, error_summary
)
select 'op-src-feishu-parse-001', 'parse_raw_material', 'src-feishu-cc', 'rm-001', 'pd-001', 'succeeded',
       'system', '2026-06-20T10:36:00+08:00', '2026-06-20T10:37:00+08:00',
       'Completed read-only Parsed Document evidence preview.', null
where not exists (select 1 from source_operations where operation_id = 'op-src-feishu-parse-001');

insert into source_operations (
  operation_id, operation_type, source_id, raw_material_id, parsed_document_id, status,
  requested_by, started_at, finished_at, summary, error_summary
)
select 'op-word-parse-001', 'parse_raw_material', 'src-word-manual', 'rm-004', null, 'failed',
       'system', '2026-06-12T18:21:00+08:00', '2026-06-12T18:22:00+08:00',
       'Parser profile rejected this Raw Material in the read-only seed baseline.',
       'Unsupported document structure in seed evidence.'
where not exists (select 1 from source_operations where operation_id = 'op-word-parse-001');
