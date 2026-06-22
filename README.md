# WikiNode Studio

WikiNode Studio is a React + Spring Boot MVP for editing WikiNode knowledge units, resolving double links, checking broken links, and testing retrieval results that return `WikiNode` objects.

## Local Development

### PostgreSQL

Default backend configuration expects a local PostgreSQL database:

```bash
brew services start postgresql@14
createdb wikinode_studio
psql postgres -c "create user wikinode with password 'wikinode';"
psql postgres -c "grant all privileges on database wikinode_studio to wikinode;"
psql wikinode_studio -c "grant all on schema public to wikinode;"
psql wikinode_studio -c "alter schema public owner to wikinode;"
```

Override the defaults when needed:

```bash
export WIKINODE_DB_URL=jdbc:postgresql://localhost:5432/wikinode_studio
export WIKINODE_DB_USERNAME=wikinode
export WIKINODE_DB_PASSWORD=wikinode
```

Flyway runs automatically on Spring Boot startup and creates/seeds the schema.

Reset the local database back to clean seed data:

```bash
./scripts/reset-db.sh
```

The reset script drops and recreates the local `public` schema, runs Flyway migration in non-web Spring Boot mode, and verifies that the database has the 5 seed WikiNodes.

### Backend

```bash
mvn spring-boot:run
```

Backend runs on `http://127.0.0.1:8080`.

### Frontend

```bash
pnpm install
pnpm run dev -- --host 127.0.0.1 --port 3001
```

Frontend runs on `http://127.0.0.1:3001` and proxies `/api` to `http://localhost:8080`.

Keep `VITE_USE_MOCK_FALLBACK=false` for real backend integration.

## Verification

```bash
mvn test
pnpm run lint
pnpm run build
```

Run repeatable API smoke against a running backend:

```bash
./scripts/api-smoke.sh
```

The API smoke script validates:

- `GET /api/wiki-nodes`
- `GET /api/wiki-nodes/{id}`
- `POST /api/wiki-nodes`
- `PUT /api/wiki-nodes/{id}`
- `GET /api/broken-links`
- `POST /api/retrieval-test`
- Retrieval response includes `node`
- Retrieval response does not expose `chunk` or `document`

By default, API smoke deletes the temporary `api-smoke-*` nodes it creates so smoke runs do not pollute long-term validation data. Set `CLEANUP_ON_EXIT=false` only when you intentionally want to inspect smoke data:

```bash
CLEANUP_ON_EXIT=false ./scripts/api-smoke.sh
```

To force a full database reset after smoke:

```bash
RESET_AFTER_SMOKE=true ./scripts/api-smoke.sh
```

## Manual Persistence Smoke

1. Start PostgreSQL and the backend.
2. Create a WikiNode with `POST /api/wiki-nodes`.
3. Update it with `PUT /api/wiki-nodes/{id}`.
4. Stop and restart Spring Boot.
5. Query `GET /api/wiki-nodes/{id}` and confirm the updated title/content remain.
6. Run `POST /api/retrieval-test` with a keyword from the updated node and confirm the result contains `node`.
7. Confirm the retrieval result does not include `chunk` or `document`.
