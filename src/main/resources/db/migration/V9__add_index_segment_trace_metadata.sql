alter table index_segments add column if not exists metadata_json text;

update index_segments
set metadata_json = concat(
  '{"nodeType":"', metadata_node_type,
  '","status":"', metadata_status,
  '","tags":"', metadata_tags,
  '","objectType":"', object_type,
  '","subtype":"', subtype,
  '"}'
)
where metadata_json is null;
