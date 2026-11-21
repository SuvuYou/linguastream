# Platform (target)

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| Unit and component tests (Vitest) | Infra | Repository | ✅ | DB mocked |
| Integration tests against real Postgres | Infra | CI | ⬜ | |
| CI: lint, typecheck, coverage on PRs | Infra | CI | ✅ | |
| CI builds and deploys | Infra | CI | ⬜ | GitHub Actions builds images; the server pulls and restarts (D-051) |
| Docker Compose deployment on a VPS | Infra | Server | ⬜ | D-006; Postgres self-hosted (D-049) |
| Monorepo: Next.js and NestJS share the Prisma schema | Infra | Repository | ⬜ | D-049; pnpm + Turborepo (D-054) |
| Nightly `pg_dump` off the server + server snapshots; one practised restore | Infra | Server | ⬜ | D-051 |
| Sentry (scrubbed), structured logs, health check, backups | Infra | Server | ⬜ | `architecture-target/observability.md` |
| NestJS API with one auth guard (session cookie + extension ID token) | Backend | Server | ⬜ | D-049, D-053, D-080 |
| Rate limits on routes that call paid or free-tier APIs | Backend | Server | ⬜ | Quotas: `target/processing.md` |
| Indexes on `SubtitleLine`, `Card`, `MediaContent` | Data | Server | ⬜ | With before/after `EXPLAIN ANALYZE` |
| Playwright E2E, accessibility checks | Infra | CI | ⬜ | |
| Design tokens and base components from the Theme Studio | UI | Repository | ⬜ | D-089; CSS variables in `globals.css`, shadcn theme |
