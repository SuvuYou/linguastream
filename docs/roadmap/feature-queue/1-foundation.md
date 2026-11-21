# 1. Foundation

Nothing a user sees; everything else depends on it. Roadmap steps A1–A4.

| # | Feature | Target file | Status | Why here / depends on |
|---|---|---|---|---|
| 1 | Monorepo: Next.js and NestJS share the Prisma schema | [platform](../../features/target/platform.md) | ⬜ | First: every later feature lives in it (D-049, D-054) |
| 2 | Integration tests against real Postgres | [platform](../../features/target/platform.md) | ⬜ | Before the new data model, so migrations are tested from the start |
| 3 | Indexes on `SubtitleLine`, `Card`, `MediaContent` | [platform](../../features/target/platform.md) | ⬜ | With the data model; windowed loading and search need them |
| 4 | Rate limits on routes that call paid or free-tier APIs | [platform](../../features/target/platform.md) | ⬜ | In the API from day one (D-082) |
| 5 | Docker Compose deployment on a VPS | [platform](../../features/target/platform.md) | ⬜ | Needs 1 |
| 6 | CI builds and deploys | [platform](../../features/target/platform.md) | ⬜ | Needs 5 |
| 7 | Nightly `pg_dump` off the server + snapshots; one practised restore | [platform](../../features/target/platform.md) | ⬜ | Before anyone's data is on the server |
| 8 | Sentry (scrubbed), structured logs, health check | [platform](../../features/target/platform.md) | ⬜ | Before friends use it |
| 9 | Account and data deletion (#60) | [account](../../features/target/account.md) | ⬜ | Promised in the privacy note (D-066); needs the data model |
