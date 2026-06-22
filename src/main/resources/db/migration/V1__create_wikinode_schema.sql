create table if not exists wiki_nodes (
  node_id varchar(120) primary key,
  slug varchar(160) not null,
  title varchar(240) not null,
  node_type varchar(80) not null,
  summary text not null,
  content_markdown text not null,
  status varchar(80) not null,
  index_status varchar(80) not null,
  created_at varchar(32) not null,
  updated_at varchar(32) not null,
  last_indexed_at varchar(32),
  constraint uq_wiki_nodes_slug unique (slug)
);

create index if not exists idx_wiki_nodes_slug on wiki_nodes (slug);

create table if not exists wiki_node_tags (
  node_id varchar(120) not null references wiki_nodes (node_id) on delete cascade,
  position integer not null,
  tag varchar(120) not null,
  primary key (node_id, position)
);

create index if not exists idx_wiki_node_tags_tag on wiki_node_tags (tag);

create table if not exists source_items (
  source_id varchar(160) primary key,
  source_type varchar(80) not null,
  title varchar(240) not null,
  owner varchar(160) not null,
  sync_status varchar(80) not null,
  last_synced_at varchar(32) not null,
  generated_nodes integer not null
);

create table if not exists wiki_node_source_refs (
  node_id varchar(120) not null references wiki_nodes (node_id) on delete cascade,
  position integer not null,
  source_id varchar(160) not null,
  source_type varchar(80) not null,
  source_title varchar(240) not null,
  source_url text,
  paragraph_ref varchar(120),
  version varchar(80),
  primary key (node_id, position)
);

create index if not exists idx_wiki_node_source_refs_source_id on wiki_node_source_refs (source_id);
