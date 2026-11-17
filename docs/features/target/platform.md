# Platform (target)

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| Unit and component tests (Vitest) | Infra | Repository | ✅ | DB mocked |
| Integration tests against real Postgres | Infra | CI | ⬜ | |
| CI: lint, typecheck, coverage on PRs | Infra | CI | ✅ | |
| CI builds and deploys | Infra | CI | ⬜ | |
| Docker Compose deployment on a VPS | Infra | Server | ⬜ | D-006 |
| Sentry (scrubbed), structured logs, health check, backups | Infra | Server | ⬜ | `architecture-target/observability.md` |
| Rate limits on routes that call paid or free-tier APIs | Backend | Server | ⬜ | Quotas: `target/processing.md` |
| Indexes on `SubtitleLine`, `Card`, `MediaContent` | Data | Server | ⬜ | With before/after `EXPLAIN ANALYZE` |
| Playwright E2E, accessibility checks | Infra | CI | ⬜ | |
