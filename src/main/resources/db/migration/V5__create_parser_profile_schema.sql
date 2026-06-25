create table if not exists parser_profiles (
  parser_profile varchar(160) primary key,
  display_name varchar(200) not null,
  supported_raw_material_types text not null,
  supported_source_types text not null,
  content_format varchar(80) not null,
  enabled boolean not null,
  version varchar(40) not null
);

insert into parser_profiles (
  parser_profile, display_name, supported_raw_material_types, supported_source_types,
  content_format, enabled, version
)
select 'feishu_article_v1', '飞书文章解析 Profile', 'document_snapshot', 'feishu',
       'markdown', true, 'v1'
where not exists (select 1 from parser_profiles where parser_profile = 'feishu_article_v1');

insert into parser_profiles (
  parser_profile, display_name, supported_raw_material_types, supported_source_types,
  content_format, enabled, version
)
select 'pdf_manual_article_v1', 'PDF 手册解析 Profile', 'file', 'pdf',
       'markdown', true, 'v1'
where not exists (select 1 from parser_profiles where parser_profile = 'pdf_manual_article_v1');

insert into parser_profiles (
  parser_profile, display_name, supported_raw_material_types, supported_source_types,
  content_format, enabled, version
)
select 'excel_fee_table_v1', 'Excel 收费表解析 Profile', 'file,table_extract', 'excel',
       'structured_table', true, 'v1'
where not exists (select 1 from parser_profiles where parser_profile = 'excel_fee_table_v1');
