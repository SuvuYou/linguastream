# Block B: Foundation: monorepo and database

**When:** sections 3 (pnpm + Turborepo) and 5 (local Docker) before A1, about 6 hours; the rest before A2. This is all the study Foundation needs (D-090). **Hours:** about 32.
**Block exercise:** write the migration for the new vocabulary model (D-045, D-047, D-052, D-063) on a copy of the data, with `EXPLAIN ANALYZE` before and after the new indexes.

## 1. SQL + PostgreSQL, part 1 (#3) · ~18 h

**Learn**
- Joins, grouping, window functions, CTEs.
- Indexes: B-tree, GIN; composite and partial indexes; reading `EXPLAIN ANALYZE`.
- Transactions and isolation levels; when a deletion must be one transaction (D-066 deletion log).
- `jsonb` and arrays, with GIN indexes on them (the per-line word JSON and lemma arrays, D-052).
- Prisma migrations: writing raw SQL inside them when Prisma can't express it.

**Exercise:** pgexercises up to the joins and aggregates sections, then load 1,000 lines of word JSON and find every line containing a lemma, with and without a GIN index.

**Resources**
- [PostgreSQL documentation](https://www.postgresql.org/docs/current/)
- [Indexes](https://www.postgresql.org/docs/current/indexes.html), [Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [JSON types](https://www.postgresql.org/docs/current/datatype-json.html), [Arrays](https://www.postgresql.org/docs/current/arrays.html), [GIN](https://www.postgresql.org/docs/current/gin.html)
- [Use The Index, Luke](https://use-the-index-luke.com/)
- [PostgreSQL Exercises](https://pgexercises.com/)
- [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)

**You know it when** you can read a query plan and say why it is slow, and fix it with an index.

**Later parts of #3:** `COPY` for bulk loading is in Block E (before the Wiktextract import, B3); full-text search and `pg_trgm` are in Block H (before library search, C2).

## 2. Backend testing (#5) · ~6 h

**Learn**
- Unit vs integration tests; what to mock and what not to.
- Integration tests against a real Postgres: Testcontainers locally, a service container in GitHub Actions.
- Test data: factories, resetting the database between tests.
- HTTP tests with Supertest (NestJS uses it too).

**Exercise:** an integration test that runs the new migration on an empty database, saves a word twice and checks that the second save adds a connection, not a card (D-047).

**Resources**
- [Vitest guide](https://vitest.dev/guide/)
- [Testcontainers for Node](https://node.testcontainers.org/)
- [GitHub Actions docs](https://docs.github.com/en/actions) (service containers)
- [Supertest](https://github.com/ladjs/supertest)

**You know it when** CI runs your integration tests against a real database on every PR.

## 3. pnpm + Turborepo · ~4 h

**Learn**
- pnpm workspaces: `pnpm-workspace.yaml`, `workspace:` dependencies, filtering.
- Turborepo: task pipelines, `dependsOn`, caching, what makes a cache hit.
- Sharing the Prisma schema in `packages/db` (D-054).

**Exercise:** turn the repo into `apps/web` + `packages/db`, with `turbo run build test` cached on the second run.

**Resources**
- [pnpm workspaces](https://pnpm.io/workspaces)
- [Turborepo docs](https://turborepo.com/docs)

**You know it when** a change in `packages/db` rebuilds both apps and a change in `apps/web` rebuilds only that.

## 4. Spaced repetition (FSRS) · ~2 h

**Learn**
- Stability, difficulty, retrievability; how a rating changes the next interval.
- The `ts-fsrs` API; storing the review log (needed for "undo last review").
- Converting SM-2 data (D-004).

**Exercise:** simulate 30 days of reviews for 20 cards with `ts-fsrs` and plot the intervals.

**Resources**
- [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)
- [ABC of FSRS](https://github.com/open-spaced-repetition/fsrs4anki/wiki/ABC-of-FSRS)

**You know it when** you can explain why one schedule per word (D-047) still works with several meanings (D-063).

## 5. Docker for local development · ~2 h

**Learn**
- What an image and a container are, just enough to use them.
- A `compose.yaml` with one `postgres` service: image tag, environment variables, a named volume, a published port.
- `docker compose up -d`, `down`, `logs`, `ps`; connecting Prisma to it with `DATABASE_URL`.
- Adding Redis the same way later (B2).

Building images, multi-stage Dockerfiles and deployment are in Block D, before the first deployment (Demo, D1).

**Exercise:** `docker compose up -d` starts Postgres, `prisma migrate dev` runs against it, and the data is still there after `docker compose down` and `up` again.

**Resources**
- [Docker get started](https://docs.docker.com/get-started/)
- [Postgres image](https://hub.docker.com/_/postgres)
- [Compose file reference](https://docs.docker.com/reference/compose-file/)

**You know it when** a fresh clone of the repo has a working database after one command.
