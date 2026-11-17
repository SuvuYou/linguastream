# Conventions

- **Language codes:** `LANGUAGES` in `helpers/const.ts` (currently `en`, `de`). `UNKNOWN_SOURCE_LANGUAGE = "unknown"` is a placeholder value, not null.
- **Naming:** DB columns in snake_case; TS in camelCase.
- **Route params** in Next 16 are Promises and must be awaited.
- **Migrations:** always `prisma migrate dev`. Never `db push` (the project moved off it after drift).
- **Tests:** colocated `*.test.ts(x)`. DB access is mocked via `helpers/tests/mocks/`. Integration tests against a real DB don't exist yet.
- **npm audit:** never `--force` (it downgrades Next.js and firebase-admin).
- **Line endings:** the repo has no `.gitattributes`, and Windows checkouts show CRLF-only diffs. Add `.gitattributes` with `* text=auto eol=lf`.

## Request flow rules

- Client components fetch through API routes with TanStack Query hooks (`hooks/`).
- Every API route calls `getCurrentUser()` and returns 401 without a session.
- DB access lives in `lib/db-helpers/*`.
- Request params are validated with Zod schemas in `helpers/params-schema.ts`.
- Player ↔ subtitles ↔ word panel communicate through a typed event bus (`events/`).
