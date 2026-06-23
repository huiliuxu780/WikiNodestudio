# WikiNode Studio

WikiNode Studio is a React + Spring Boot MVP for editing WikiNode knowledge units, resolving double links, checking broken links, and testing retrieval results that return `WikiNode` objects.

## MVP Baseline

Current baseline:

- [WikiNode Studio MVP Baseline v0.1](docs/release/mvp-baseline-v0.1.md)
- [MVP v0.1 Acceptance Checklist](docs/release/mvp-acceptance-checklist.md)

Recommended acceptance order:

1. Reset the local database with `./scripts/reset-db.sh`.
2. Start the backend and frontend.
3. Run `./scripts/api-smoke.sh`.
4. Open `/`, `/wiki-nodes`, `/wiki-nodes/wn-001`, `/broken-links`, `/wiki-graph`, `/retrieval-test`, `/sources`, `/index-status`, and `/settings`.
5. Verify create, edit, broken link repair, backlinks, retrieval, persistence, and reset behavior with the checklist.

The v0.1 baseline intentionally excludes Source import, file parsing, vector database, embedding, chunk exposure, permissions, version management, publishing approval, multi-tenancy, and complex retrieval ranking.

## Project Development Rules / Codex Harness

This repository includes a lightweight Codex Harness for development governance and quality checks:

- [AGENTS.md](AGENTS.md) is the Codex development rules entry point.
- [docs/current/](docs/current/) stores current project state, story queue, active tasks, and blockers.
- [docs/quality/](docs/quality/) stores quality gates, Done Report format, Gate Plan format, and workflow rules.
- [Frontend UX Guidelines](docs/quality/frontend-ux-guidelines.md) defines user-facing copy, status labels, operation feedback, form validation, and loading/empty/error-state rules.
- [docs/registry/](docs/registry/) stores lookup indexes for current state, decisions, and traceability.
- [scripts/check.sh](scripts/check.sh) is the local Harness quality check entry point.
- [scripts/check-state.sh](scripts/check-state.sh) validates current/registry state consistency.
- [scripts/tests/](scripts/tests/) stores script-level tests and validation helpers.

Before non-trivial development, read `AGENTS.md` and the current state files. Before finishing a task, run the relevant product checks plus:

```bash
bash scripts/check.sh
```

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
pnpm run dev --host 127.0.0.1 --port 3001
```

Frontend runs on `http://127.0.0.1:3001` and proxies `/api` to `http://localhost:8080`.

Keep `VITE_USE_MOCK_FALLBACK=false` for real backend integration.

## Verification

Local quality checks:

```bash
mvn test
pnpm run lint
pnpm run build
```

GitHub Actions runs the same baseline on `push` and `pull_request`:

- Backend CI: sets up JDK 21 with Maven cache, then runs `mvn test`.
- Frontend CI: sets up Node.js 22 and pnpm 11 with pnpm cache, then runs `pnpm install --frozen-lockfile`, `pnpm run lint`, and `pnpm run build`.

The CI baseline does not require local PostgreSQL. Repository/API tests use the test profile and in-memory or H2-backed test setup.

Run repeatable API smoke against a running backend:

```bash
./scripts/api-smoke.sh
```

These local checks are intentionally not part of the basic CI workflow because they require a running PostgreSQL-backed backend:

- `./scripts/reset-db.sh`
- `./scripts/api-smoke.sh`
- Manual persistence smoke

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

### Playwright Smoke

Install the Chromium browser used by local Playwright smoke:

```bash
pnpm exec playwright install chromium
```

Run the minimal browser smoke after PostgreSQL is running, the database has been reset, and the backend is available on `http://127.0.0.1:8080`.

Reset the database:

```bash
./scripts/reset-db.sh
```

Start the backend in one terminal:

```bash
mvn spring-boot:run
```

Run the browser smoke in another terminal:

```bash
pnpm run test:e2e
```

`pnpm run test:e2e` starts or reuses the Vite dev server at `http://127.0.0.1:3001`, keeps `VITE_USE_MOCK_FALLBACK=false`, and covers:

- `/wiki-nodes`
- WikiNode create success and duplicate slug failure feedback
- WikiNode edit save feedback
- `/retrieval-test` success and no-result states
- `/broken-links`
- `/settings`

Playwright smoke is not part of the basic GitHub Actions workflow yet because it depends on local PostgreSQL, a running backend, and the frontend dev server.

## Manual Persistence Smoke

1. Start PostgreSQL and the backend.
2. Create a WikiNode with `POST /api/wiki-nodes`.
3. Update it with `PUT /api/wiki-nodes/{id}`.
4. Stop and restart Spring Boot.
5. Query `GET /api/wiki-nodes/{id}` and confirm the updated title/content remain.
6. Run `POST /api/retrieval-test` with a keyword from the updated node and confirm the result contains `node`.
7. Confirm the retrieval result does not include `chunk` or `document`.
