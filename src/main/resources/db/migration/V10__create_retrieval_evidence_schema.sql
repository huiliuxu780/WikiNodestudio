create table if not exists retrieval_query_logs (
  log_id varchar(160) primary key,
  query_text text not null,
  filters_json text,
  returned_node_ids text not null,
  matched_segment_ids text not null,
  latency_ms integer not null,
  status varchar(80) not null,
  error_summary text,
  created_at varchar(40) not null
);

create index if not exists idx_retrieval_query_logs_created_at on retrieval_query_logs (created_at);

create table if not exists retrieval_evaluation_cases (
  case_id varchar(160) primary key,
  query_text text not null,
  filters_json text,
  top_k integer not null,
  expected_node_ids text not null,
  returned_node_ids text not null,
  matched_segment_ids text not null,
  run_status varchar(80) not null,
  run_summary text not null,
  created_at varchar(40) not null,
  updated_at varchar(40) not null
);
