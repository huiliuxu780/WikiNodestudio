create table if not exists knowledge_bases (
  kb_id varchar(160) primary key,
  name varchar(240) not null,
  description text not null,
  business_domain varchar(120) not null,
  kb_type varchar(80) not null,
  status varchar(40) not null,
  visibility varchar(40) not null,
  owner varchar(160) not null,
  settings_json text not null,
  archived_at varchar(32),
  created_at varchar(32) not null,
  updated_at varchar(32) not null
);

create index if not exists idx_knowledge_bases_status on knowledge_bases (status);
create index if not exists idx_knowledge_bases_visibility on knowledge_bases (visibility);

insert into knowledge_bases (
  kb_id, name, description, business_domain, kb_type, status, visibility, owner,
  settings_json, archived_at, created_at, updated_at
)
select 'kb-cc-after-sales', 'CC After-sales KB', '客服售后政策、流程、收费和升级处理知识库。',
       'after_sales', 'wikinode', 'active', 'internal', 'Rivers',
       '{"defaultNodeType":"policy","defaultParserEngine":"markdown","defaultStorageProvider":"workspace","defaultVectorStore":"external_vector_store","defaultPublishingPolicy":"manual","defaultRetrievalStrategy":"wikinode_first"}',
       null, '2026-06-01', '2026-06-22'
where not exists (select 1 from knowledge_bases where kb_id = 'kb-cc-after-sales');

insert into knowledge_bases (
  kb_id, name, description, business_domain, kb_type, status, visibility, owner,
  settings_json, archived_at, created_at, updated_at
)
select 'kb-product-guide', 'Product Guide KB', '产品说明、安装指导和常见故障处理知识库。',
       'product_support', 'mixed', 'active', 'internal', 'Product Docs',
       '{"defaultNodeType":"guide","defaultParserEngine":"pdf_manual_article_v1","defaultStorageProvider":"object_storage","defaultVectorStore":"external_vector_store","defaultPublishingPolicy":"manual","defaultRetrievalStrategy":"wikinode_first"}',
       null, '2026-05-18', '2026-06-20'
where not exists (select 1 from knowledge_bases where kb_id = 'kb-product-guide');

alter table wiki_nodes add column if not exists knowledge_base_id varchar(160);
alter table source_items add column if not exists knowledge_base_id varchar(160);

update wiki_nodes
set knowledge_base_id = 'kb-product-guide'
where node_type in ('product', 'guide', 'troubleshooting')
  and (knowledge_base_id is null or knowledge_base_id = '');

update wiki_nodes
set knowledge_base_id = 'kb-cc-after-sales'
where knowledge_base_id is null or knowledge_base_id = '';

update source_items
set knowledge_base_id = 'kb-product-guide'
where source_id in ('src-pdf-dishwasher', 'src-word-manual')
  and (knowledge_base_id is null or knowledge_base_id = '');

update source_items
set knowledge_base_id = 'kb-cc-after-sales'
where knowledge_base_id is null or knowledge_base_id = '';

alter table wiki_nodes
  add constraint fk_wiki_nodes_knowledge_base
  foreign key (knowledge_base_id) references knowledge_bases (kb_id);

alter table source_items
  add constraint fk_source_items_knowledge_base
  foreign key (knowledge_base_id) references knowledge_bases (kb_id);

create index if not exists idx_wiki_nodes_knowledge_base_id on wiki_nodes (knowledge_base_id);
create index if not exists idx_source_items_knowledge_base_id on source_items (knowledge_base_id);
