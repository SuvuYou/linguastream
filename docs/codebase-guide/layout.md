# Layout

| Path | What's in it |
|---|---|
| `app/` | Next.js routes. Pages are thin and render a component from `components/pages/`. |
| `app/api/**/route.ts` | API routes, each with a colocated `route.test.ts` |
| `components/pages/` | One component per page (`LibraryPage`, `WatchPage`, `DeckDetailsPage`, …) |
| `components/features/<area>/` | Feature components: `watch`, `player`, `overlay-player` (phrase search), `study`, `deck`, `deck-details`, `library`, `personal-library`, `admin`, `signin` |
| `components/ui/` | shadcn/ui primitives. Don't edit except to restyle; excluded from coverage. |
| `components/primitives/` | Own reusable pieces (`SearchBar`, `PaginationControls`) |
| `components/layout/` | `Navbar`, `Providers`, search overlay provider |
| `hooks/` | TanStack Query hooks and UI hooks, one per file, each with a test |
| `lib/db-helpers/` | Data-access layer (Prisma queries) per domain |
| `lib/algorithms/` | `sm2.ts` (in use), `fsrs.ts` (not wired in yet) |
| `lib/gemini/caller.ts` | Gemini client with retry and model fallback |
| `lib/firebase/session.ts` | `getCurrentUser()` and session handling |
| `lib/initializations/` | Singletons: Prisma `db`, Firebase, Meilisearch, Zustand `store` |
| `lib/scripts/` | `spawn-ingest.ts`, `subtitle-parser.ts` |
| `helpers/` | Constants (`const.ts`), Zod schemas (`params-schema.ts`), language helpers, test mocks (`helpers/tests/`) |
| `events/` | Typed event bus |
| `types/` | Shared TS types |
| `ml/` | Python ingest script, WhisperX service, start/stop scripts. The venv lives outside the repo at `~/linguastream-ml`. |
| `prisma/` | Schema and migrations |
| `docs/` | This knowledge base |

Routes: `/` redirects to `/dashboard` (Jellyfin library, being removed). `/dashboard/personal`, `/dashboard/decks`, `/dashboard/decks/[deckId]`, `/dashboard/study`, `/watch/[mediaContentId]`, `/account`, `/auth/signin`.
