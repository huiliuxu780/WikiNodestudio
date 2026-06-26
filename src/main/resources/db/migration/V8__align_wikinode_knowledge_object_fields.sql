alter table wiki_nodes add column if not exists object_type varchar(80);
alter table wiki_nodes add column if not exists subtype varchar(160);
alter table wiki_nodes add column if not exists metadata_json text;
alter table wiki_nodes add column if not exists processing_profile varchar(160);

create table if not exists wiki_node_relations (
  source_node_id varchar(120) not null references wiki_nodes (node_id) on delete cascade,
  position integer not null,
  relation_id varchar(160) not null,
  target_node_id varchar(120),
  relation_type varchar(80) not null,
  direction varchar(32) not null,
  confidence double precision,
  created_by varchar(80),
  evidence_source_ref_id varchar(160),
  primary key (source_node_id, position)
);

create index if not exists idx_wiki_node_relations_target_node_id on wiki_node_relations (target_node_id);

update wiki_nodes
set object_type = 'Article',
    subtype = 'service_fee_policy',
    metadata_json = '{"businessDomain":"after_sales","language":"zh-CN","lifecycleStatus":"published"}',
    processing_profile = 'web_article_policy_v1'
where node_id = 'wn-001';

update wiki_nodes
set object_type = 'Article',
    subtype = 'fee_policy',
    metadata_json = '{"businessDomain":"after_sales","language":"zh-CN","lifecycleStatus":"published"}',
    processing_profile = 'web_article_policy_v1'
where node_id = 'wn-002';

update wiki_nodes
set object_type = 'Procedure',
    subtype = 'procedure',
    metadata_json = '{"businessDomain":"after_sales","language":"zh-CN","lifecycleStatus":"published"}',
    processing_profile = 'feishu_service_process_v1'
where node_id = 'wn-003';

update wiki_nodes
set object_type = 'Procedure',
    subtype = 'troubleshooting_flow',
    metadata_json = '{"businessDomain":"after_sales","language":"zh-CN","lifecycleStatus":"published"}',
    processing_profile = 'feishu_service_process_v1'
where node_id = 'wn-004';

update wiki_nodes
set object_type = 'Article',
    subtype = 'term',
    metadata_json = '{"businessDomain":"after_sales","language":"zh-CN","lifecycleStatus":"published"}',
    processing_profile = 'web_article_policy_v1'
where node_id = 'wn-005';

insert into wiki_node_relations (
  source_node_id, position, relation_id, target_node_id, relation_type,
  direction, confidence, created_by, evidence_source_ref_id
)
select 'wn-001', 0, 'rel-wn-001-wn-002', 'wn-002', 'has_policy',
       'outgoing', 0.92, 'system', 'ref-web-service-fee'
where not exists (
  select 1 from wiki_node_relations where source_node_id = 'wn-001' and position = 0
)
and exists (
  select 1 from wiki_nodes where node_id = 'wn-001'
);

insert into wiki_node_relations (
  source_node_id, position, relation_id, target_node_id, relation_type,
  direction, confidence, created_by, evidence_source_ref_id
)
select 'wn-001', 1, 'rel-wn-001-wn-003', 'wn-003', 'references',
       'outgoing', 0.88, 'system', 'ref-web-service-fee'
where not exists (
  select 1 from wiki_node_relations where source_node_id = 'wn-001' and position = 1
)
and exists (
  select 1 from wiki_nodes where node_id = 'wn-001'
);
