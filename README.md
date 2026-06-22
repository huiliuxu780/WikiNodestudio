# WikiNode Studio

WikiNode Studio is a React + Spring Boot MVP for editing WikiNode knowledge units, resolving double links, checking broken links, and testing retrieval results that return `WikiNode` objects.

## Local Development

### PostgreSQL

Default backend configuration expects a local PostgreSQL database:

```bash
createdb wikinode_studio
psql postgres -c "create user wikinode with password 'wikinode';"
psql postgres -c "grant all privileges on database wikinode_studio to wikinode;"
psql wikinode_studio -c "grant all on schema public to wikinode;"
```

Override the defaults when needed:

```bash
export WIKINODE_DB_URL=jdbc:postgresql://localhost:5432/wikinode_studio
export WIKINODE_DB_USERNAME=wikinode
export WIKINODE_DB_PASSWORD=wikinode
```

Flyway runs automatically on Spring Boot startup and creates/seeds the schema.

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
