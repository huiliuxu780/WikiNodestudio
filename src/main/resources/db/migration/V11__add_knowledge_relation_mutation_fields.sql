alter table wiki_node_relations add column if not exists relation_status varchar(40) not null default 'active';
alter table wiki_node_relations add column if not exists relation_source varchar(40) not null default 'system';
alter table wiki_node_relations add column if not exists anchor_text varchar(500);
alter table wiki_node_relations add column if not exists note varchar(1000);
alter table wiki_node_relations add column if not exists created_at varchar(40);
alter table wiki_node_relations add column if not exists updated_at varchar(40);

update wiki_node_relations
set relation_status = coalesce(relation_status, 'active'),
    relation_source = coalesce(relation_source, case when created_by = 'user' then 'manual' else 'system' end),
    created_at = coalesce(created_at, '2026-06-27'),
    updated_at = coalesce(updated_at, '2026-06-27');
