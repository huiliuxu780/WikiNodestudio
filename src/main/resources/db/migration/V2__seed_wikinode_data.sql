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

insert into wiki_nodes (node_id, slug, title, node_type, summary, content_markdown, status, index_status, created_at, updated_at, last_indexed_at)
select 'wn-001', 'wn-001', '保修政策', 'policy', '保修期内产品故障的维修原则和例外条件。',
'## 适用范围

保修期内的产品故障原则上提供免费维修。

保修期外维修请参考 [[收费政策]]。
如涉及人为损坏，请参考 [[人为损坏判定规则]]。
如客户无法提供购买凭证，请参考 [[购买凭证规则]]。
', 'published', 'indexed', '2026-06-10', '2026-06-18', '2026-06-18'
where not exists (select 1 from wiki_nodes where node_id = 'wn-001');

insert into wiki_nodes (node_id, slug, title, node_type, summary, content_markdown, status, index_status, created_at, updated_at, last_indexed_at)
select 'wn-002', 'wn-002', '收费政策', 'policy', '保外维修、上门服务和配件费用的收费规则。',
'## 收费规则

保修期外维修按服务单收费。
费用明细来自 [[维修收费标准]]。
与保内条件冲突时，以 [[保修政策]] 为准。
', 'published', 'indexed', '2026-06-11', '2026-06-17', '2026-06-17'
where not exists (select 1 from wiki_nodes where node_id = 'wn-002');

insert into wiki_nodes (node_id, slug, title, node_type, summary, content_markdown, status, index_status, created_at, updated_at, last_indexed_at)
select 'wn-003', 'wn-003', '人为损坏判定规则', 'procedure', '判定人为损坏时需要采集的证据和处理口径。',
'## 判定流程

外观破损、进液、私拆等情况需要记录证据。
对免费维修疑问，回到 [[保修政策]] 判断。
', 'published', 'indexed', '2026-06-12', '2026-06-16', '2026-06-16'
where not exists (select 1 from wiki_nodes where node_id = 'wn-003');

insert into wiki_nodes (node_id, slug, title, node_type, summary, content_markdown, status, index_status, created_at, updated_at, last_indexed_at)
select 'wn-004', 'wn-004', '洗碗机故障排查', 'troubleshooting', '洗碗机常见故障的首轮排查步骤。',
'## 排查步骤

洗碗机不工作时先检查电源、水路和错误码。
涉及保内维修时关联 [[保修政策]]。
', 'published', 'indexed', '2026-06-13', '2026-06-18', '2026-06-18'
where not exists (select 1 from wiki_nodes where node_id = 'wn-004');

insert into wiki_nodes (node_id, slug, title, node_type, summary, content_markdown, status, index_status, created_at, updated_at, last_indexed_at)
select 'wn-005', 'wn-005', '维修收费标准', 'term', '维修费用项目和配件价格的标准说明。',
'## 标准

收费标准用于解释 [[收费政策]] 中的费用明细。
', 'published', 'indexed', '2026-06-14', '2026-06-15', '2026-06-15'
where not exists (select 1 from wiki_nodes where node_id = 'wn-005');

insert into wiki_node_tags (node_id, position, tag)
select 'wn-001', 0, '保修' where not exists (select 1 from wiki_node_tags where node_id = 'wn-001' and position = 0);
insert into wiki_node_tags (node_id, position, tag)
select 'wn-001', 1, '售后' where not exists (select 1 from wiki_node_tags where node_id = 'wn-001' and position = 1);
insert into wiki_node_tags (node_id, position, tag)
select 'wn-001', 2, '政策' where not exists (select 1 from wiki_node_tags where node_id = 'wn-001' and position = 2);

insert into wiki_node_tags (node_id, position, tag)
select 'wn-002', 0, '收费' where not exists (select 1 from wiki_node_tags where node_id = 'wn-002' and position = 0);
insert into wiki_node_tags (node_id, position, tag)
select 'wn-002', 1, '保外' where not exists (select 1 from wiki_node_tags where node_id = 'wn-002' and position = 1);
insert into wiki_node_tags (node_id, position, tag)
select 'wn-002', 2, '维修' where not exists (select 1 from wiki_node_tags where node_id = 'wn-002' and position = 2);

insert into wiki_node_tags (node_id, position, tag)
select 'wn-003', 0, '人为损坏' where not exists (select 1 from wiki_node_tags where node_id = 'wn-003' and position = 0);
insert into wiki_node_tags (node_id, position, tag)
select 'wn-003', 1, '证据' where not exists (select 1 from wiki_node_tags where node_id = 'wn-003' and position = 1);
insert into wiki_node_tags (node_id, position, tag)
select 'wn-003', 2, '售后' where not exists (select 1 from wiki_node_tags where node_id = 'wn-003' and position = 2);

insert into wiki_node_tags (node_id, position, tag)
select 'wn-004', 0, '洗碗机' where not exists (select 1 from wiki_node_tags where node_id = 'wn-004' and position = 0);
insert into wiki_node_tags (node_id, position, tag)
select 'wn-004', 1, '排查' where not exists (select 1 from wiki_node_tags where node_id = 'wn-004' and position = 1);
insert into wiki_node_tags (node_id, position, tag)
select 'wn-004', 2, '保修' where not exists (select 1 from wiki_node_tags where node_id = 'wn-004' and position = 2);

insert into wiki_node_tags (node_id, position, tag)
select 'wn-005', 0, '收费' where not exists (select 1 from wiki_node_tags where node_id = 'wn-005' and position = 0);
insert into wiki_node_tags (node_id, position, tag)
select 'wn-005', 1, '标准' where not exists (select 1 from wiki_node_tags where node_id = 'wn-005' and position = 1);
insert into wiki_node_tags (node_id, position, tag)
select 'wn-005', 2, '配件' where not exists (select 1 from wiki_node_tags where node_id = 'wn-005' and position = 2);

insert into wiki_node_source_refs (node_id, position, source_id, source_type, source_title, source_url, paragraph_ref, version)
select 'wn-001', 0, 'src-feishu-cc', 'feishu', 'CC 售后政策飞书空间', 'https://feishu.example.com/wiki/after-sales', 'P-12', '2026.06'
where not exists (select 1 from wiki_node_source_refs where node_id = 'wn-001' and position = 0);

insert into wiki_node_source_refs (node_id, position, source_id, source_type, source_title, source_url, paragraph_ref, version)
select 'wn-002', 0, 'src-excel-fee', 'excel', '维修收费标准 Excel', null, 'Sheet1:R2', '2026.06'
where not exists (select 1 from wiki_node_source_refs where node_id = 'wn-002' and position = 0);

insert into wiki_node_source_refs (node_id, position, source_id, source_type, source_title, source_url, paragraph_ref, version)
select 'wn-003', 0, 'src-feishu-cc', 'feishu', 'CC 售后政策飞书空间', 'https://feishu.example.com/wiki/after-sales', 'P-26', '2026.06'
where not exists (select 1 from wiki_node_source_refs where node_id = 'wn-003' and position = 0);

insert into wiki_node_source_refs (node_id, position, source_id, source_type, source_title, source_url, paragraph_ref, version)
select 'wn-004', 0, 'src-pdf-dishwasher', 'pdf', '洗碗机培训 PDF', null, 'P-8', '2026.05'
where not exists (select 1 from wiki_node_source_refs where node_id = 'wn-004' and position = 0);

insert into wiki_node_source_refs (node_id, position, source_id, source_type, source_title, source_url, paragraph_ref, version)
select 'wn-005', 0, 'src-excel-fee', 'excel', '维修收费标准 Excel', null, 'Sheet1:R8', '2026.06'
where not exists (select 1 from wiki_node_source_refs where node_id = 'wn-005' and position = 0);
