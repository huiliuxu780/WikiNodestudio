# WikiNode Studio MVP Baseline v0.1

## Version

WikiNode Studio MVP Baseline v0.1

## Current Scope

This baseline fixes the current WikiNode Studio MVP as a repeatable, locally verifiable product prototype.

- WikiNode list
- WikiNode creation
- WikiNode edit and save
- Double-link parsing
- Outgoing links
- Backlinks
- Broken link detection
- Creating a target node to repair a broken link
- Wiki Graph
- Sources display
- Index Status display
- Retrieval Test
- PostgreSQL persistence
- Flyway schema and seed data
- `scripts/reset-db.sh`
- `scripts/api-smoke.sh`
- GitHub Actions baseline CI

## Out Of Scope

The following items are intentionally outside v0.1:

- Source import
- File parsing
- Vector database
- Embedding
- Chunk exposure
- Permissions
- Version management
- Publishing or approval flow
- Multi-tenancy
- Complex retrieval ranking

## Local Startup

Start PostgreSQL:

```bash
brew services start postgresql@14
createdb wikinode_studio
psql postgres -c "create user wikinode with password 'wikinode';"
psql postgres -c "grant all privileges on database wikinode_studio to wikinode;"
psql wikinode_studio -c "grant all on schema public to wikinode;"
psql wikinode_studio -c "alter schema public owner to wikinode;"
```

Start the backend:

```bash
mvn spring-boot:run
```

Backend URL:

```text
http://127.0.0.1:8080
```

Start the frontend:

```bash
pnpm install
pnpm run dev -- --host 127.0.0.1 --port 3001
```

Frontend URL:

```text
http://127.0.0.1:3001
```

For real backend validation, keep:

```bash
VITE_USE_MOCK_FALLBACK=false
```

## Database Reset

Reset the local PostgreSQL database to the clean seed baseline:

```bash
./scripts/reset-db.sh
```

Expected result:

- Flyway recreates the schema.
- Seed data is restored.
- The database returns to 5 seed WikiNodes.

`reset-db.sh` is a destructive local development script. Do not run it against shared, staging, or production data.

## API Smoke

Run repeatable API smoke against a running PostgreSQL-backed backend:

```bash
./scripts/api-smoke.sh
```

The smoke script validates:

- `GET /api/wiki-nodes`
- `GET /api/wiki-nodes/{id}`
- `POST /api/wiki-nodes`
- `PUT /api/wiki-nodes/{id}`
- `GET /api/broken-links`
- `POST /api/retrieval-test`
- Retrieval responses include `node`
- Retrieval responses do not expose `chunk`
- Retrieval responses do not expose `document`

By default, the script cleans up its own temporary `api-smoke-*` nodes.

## CI

GitHub Actions runs on:

- `push`
- `pull_request`

Backend CI:

- Set up JDK 21
- Cache Maven dependencies
- Run `mvn test`

Frontend CI:

- Set up Node.js 22
- Set up pnpm 11
- Cache pnpm dependencies
- Run `pnpm install --frozen-lockfile`
- Run `pnpm run lint`
- Run `pnpm run build`

The basic CI workflow does not require PostgreSQL and does not run:

- `./scripts/reset-db.sh`
- `./scripts/api-smoke.sh`
- Manual persistence smoke

Those checks remain local MVP validation steps because they require a running PostgreSQL-backed backend.

## Product Demo Paths

Recommended demo path order:

- `/`
- `/wiki-nodes`
- `/wiki-nodes/wn-001`
- `/broken-links`
- `/wiki-graph`
- `/retrieval-test`
- `/sources`
- `/index-status`
- `/settings`

## Core Acceptance Scenarios

Use the acceptance checklist in `docs/release/mvp-acceptance-checklist.md` for step-by-step execution. The core scenarios are:

- View a WikiNode.
- Create a WikiNode.
- Edit and save a WikiNode.
- Add a broken double link to an existing WikiNode.
- Create the target node to repair the broken link.
- View backlinks from the target node.
- Run Retrieval Test and confirm it can return the new or edited WikiNode.
- Restart Spring Boot and confirm persisted data still exists.
- Run database reset and confirm seed data is restored.

## Current Risks And Known Limits

- Local default backend startup depends on PostgreSQL.
- Vite production build currently reports a chunk size warning.
- Retrieval is keyword-based MVP retrieval, not vector retrieval.
- The database schema is simplified for MVP validation.
- `reset-db.sh` is destructive and only suitable for local development databases.
- GitHub Actions currently covers baseline test/lint/build only; PostgreSQL integration smoke remains local.

## Recommended Next Stage

1. Add minimal Playwright smoke for the main demo routes.
2. Add a minimal Source import entry after the v0.1 baseline is stable.
3. Add PostgreSQL integration CI when the team wants CI to validate persistence flows.
4. Consider a real retrieval engine only after the product loop remains stable on persisted WikiNodes.
