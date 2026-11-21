# 1. Foundation

Nothing a user sees; everything else depends on it. Roadmap steps A1–A2. Study: Block B only (D-090). The API moved to Core (B0), deployment and operations to Demo (D1).

| # | Feature | Target file | Status | Why here / depends on |
|---|---|---|---|---|
| 1 | Monorepo: Next.js and NestJS share the Prisma schema | [platform](../../features/target/platform.md) | ⬜ | First: every later feature lives in it (D-049, D-054) |
| 2 | Integration tests against real Postgres | [platform](../../features/target/platform.md) | ⬜ | Before the new data model, so migrations are tested from the start |
| 3 | Indexes on `SubtitleLine`, `Card`, `MediaContent` | [platform](../../features/target/platform.md) | ⬜ | With the data model; windowed loading and search need them |
| 4 | Design tokens and base components from the Theme Studio | [platform](../../features/target/platform.md) | ⬜ | First frontend step on mocks (D-087, D-089) |
