# Platform (legacy)

What the code does today, verified against commit `5e043e7` (2026-11-14). Fate: **Keep**, **Change**, **Disable** or **Remove**. Target: `features/target/platform.md`.

| Feature | Fate | Notes |
|---|---|---|
| Unit and component tests (Vitest), 129 files, DB mocked | Keep | |
| CI: lint, prisma generate, typecheck, coverage on PRs | Change | No build or deploy step yet |
| Runs only on the developer's Mac | Change | VPS deployment (D-006) |
| No rate limits on routes calling paid or free-tier APIs | Change | |
| Missing indexes on `SubtitleLine`, `Card`, `MediaContent` | Change | |
