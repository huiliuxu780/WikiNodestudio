alter table raw_materials add column if not exists knowledge_base_id varchar(160);
alter table parsed_documents add column if not exists knowledge_base_id varchar(160);
alter table parsed_document_segments add column if not exists knowledge_base_id varchar(160);
alter table source_operations add column if not exists knowledge_base_id varchar(160);
alter table draft_wikinode_suggestions add column if not exists knowledge_base_id varchar(160);

update raw_materials rm
set knowledge_base_id = si.knowledge_base_id
from source_items si
where rm.source_id = si.source_id
  and (rm.knowledge_base_id is null or rm.knowledge_base_id = '');

update parsed_documents pd
set knowledge_base_id = si.knowledge_base_id
from source_items si
where pd.source_id = si.source_id
  and (pd.knowledge_base_id is null or pd.knowledge_base_id = '');

update parsed_document_segments pds
set knowledge_base_id = si.knowledge_base_id
from source_items si
where pds.source_id = si.source_id
  and (pds.knowledge_base_id is null or pds.knowledge_base_id = '');

update source_operations so
set knowledge_base_id = si.knowledge_base_id
from source_items si
where so.source_id = si.source_id
  and (so.knowledge_base_id is null or so.knowledge_base_id = '');

update draft_wikinode_suggestions dws
set knowledge_base_id = si.knowledge_base_id
from source_items si
where dws.source_id = si.source_id
  and (dws.knowledge_base_id is null or dws.knowledge_base_id = '');

create index if not exists idx_raw_materials_knowledge_base_id
  on raw_materials (knowledge_base_id);
create index if not exists idx_parsed_documents_knowledge_base_id
  on parsed_documents (knowledge_base_id);
create index if not exists idx_parsed_document_segments_knowledge_base_id
  on parsed_document_segments (knowledge_base_id);
create index if not exists idx_source_operations_knowledge_base_id
  on source_operations (knowledge_base_id);
create index if not exists idx_draft_wikinode_suggestions_knowledge_base_id
  on draft_wikinode_suggestions (knowledge_base_id);
