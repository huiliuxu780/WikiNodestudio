#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

DB_HOST="${WIKINODE_DB_HOST:-localhost}"
DB_PORT="${WIKINODE_DB_PORT:-5432}"
DB_NAME="${WIKINODE_DB_NAME:-wikinode_studio}"
DB_USER="${WIKINODE_DB_USERNAME:-wikinode}"
DB_PASSWORD="${WIKINODE_DB_PASSWORD:-wikinode}"
DB_URL="${WIKINODE_DB_URL:-jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}}"

command -v psql >/dev/null 2>&1 || {
  echo "FAIL reset-db: psql is not installed or not on PATH" >&2
  exit 1
}

echo "reset-db: resetting ${DB_NAME} on ${DB_HOST}:${DB_PORT} as ${DB_USER}"

export PGPASSWORD="${DB_PASSWORD}"

psql \
  --set=ON_ERROR_STOP=1 \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname="${DB_NAME}" <<SQL
drop schema if exists public cascade;
create schema public authorization "${DB_USER}";
grant all on schema public to "${DB_USER}";
SQL

(
  cd "${ROOT_DIR}"
  WIKINODE_DB_URL="${DB_URL}" \
  WIKINODE_DB_USERNAME="${DB_USER}" \
  WIKINODE_DB_PASSWORD="${DB_PASSWORD}" \
    mvn -q -DskipTests spring-boot:run \
      -Dspring-boot.run.arguments=--spring.main.web-application-type=none
)

seed_count="$(
  psql \
    --tuples-only \
    --no-align \
    --host="${DB_HOST}" \
    --port="${DB_PORT}" \
    --username="${DB_USER}" \
    --dbname="${DB_NAME}" \
    --command="select count(*) from wiki_nodes;"
)"

if [[ "${seed_count}" != "5" ]]; then
  echo "FAIL reset-db: expected 5 seed WikiNodes, got ${seed_count}" >&2
  exit 1
fi

echo "PASS reset-db: restored ${seed_count} seed WikiNodes"
