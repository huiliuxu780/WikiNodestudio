create table if not exists parsed_document_segments (
  segment_id varchar(180) primary key,
  parsed_document_id varchar(160) not null references parsed_documents (parsed_document_id) on delete cascade,
  raw_material_id varchar(160) not null references raw_materials (raw_material_id) on delete cascade,
  source_id varchar(160) not null references source_items (source_id),
  position integer not null,
  segment_type varchar(80) not null,
  title varchar(280) not null,
  content text not null,
  content_preview text not null,
  token_count integer not null,
  source_locator varchar(240) not null,
  created_at varchar(32) not null,
  updated_at varchar(32) not null
);

create index if not exists idx_parsed_document_segments_parsed_document_id
  on parsed_document_segments (parsed_document_id);
create index if not exists idx_parsed_document_segments_raw_material_id
  on parsed_document_segments (raw_material_id);
create unique index if not exists idx_parsed_document_segments_document_position
  on parsed_document_segments (parsed_document_id, position);
