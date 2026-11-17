# Phase 1: settle the backend (D-046, done)

Everything the backend needs decided, in one place. ✅ decided · ⏳ decided later (with the trigger) · ❓ open. **Study** points to the matching topic number in the frontend → backend transition plan, for the study plan (phase 2).

## 1. Infrastructure and hosting

| Item | State | Decision or next step | Study |
|---|---|---|---|
| Hosting model | ✅ | One EU VPS, Docker Compose; everything for the private instance on it (D-006, D-051) | 6 Docker |
| Server provider and size | ⏳ after measuring the load | 8 GB ≈ €7–11/month, 16 GB+ ≈ €13–20 (Q-30) | – |
| Postgres | ✅ | Self-hosted on the VPS (D-049) | 3 SQL |
| Backups | ✅ | Nightly `pg_dump` off the server + server snapshots; one practised restore (D-051) | 3 SQL |
| CI/CD | ✅ | GitHub Actions builds images; the server pulls and restarts (D-051) | 7 CI/CD |
| Demo hosting | ⏳ when there is a demo | Vercel Hobby is the leading option (Q-32) | – |

## 2. Application stack

| Item | State | Decision or next step | Study |
|---|---|---|---|
| Web app | ✅ | Next.js, Prisma, Postgres, Firebase Auth (D-E1); Next.js ends up serving pages only | 1 Node, 3 SQL, 4 Auth |
| Backend modules | ✅ | NestJS for the worker and new modules; existing API routes move over gradually (D-049) | 8 NestJS |
| Monorepo tooling | ✅ | pnpm + Turborepo; `apps/web`, `apps/api`, `packages/db`, `packages/contracts` (published for the extension) (D-054) | Frontend refresher: pnpm + Turborepo |
| Queue | ✅ | BullMQ on Redis, persistence on, jobs carry IDs only (D-049) | 9 Redis, 10 Queues |
| spaCy integration | ⏳ once `sm` is in use | Call per video or Python sidecar (Q-29) | – |
| Progress to the UI | ✅ | SSE (D-012) | 10 Queues |
| Quotas | ⏳ not blocking | Units: Q-28. Enforced in Redis against one spend cap (D-022) | 9 Redis |
| Search | ✅ | Words: lemma arrays (D-052, D-067); free-text phrases: Postgres full-text search + `pg_trgm` (D-011) | 3 SQL |
| Extension auth | ✅ | Token handoff → Firebase sign-in in the extension → ID token to NestJS (D-053) | 4 Auth |
| Auth in two apps | ✅ | One domain split by path; shared check of the session cookie (D-053) | 4 Auth |
| Observability | ✅ | Sentry (scrubbed), JSON logs, `/health`, uptime; no tracing for now | 12 Observability |

## 3. Models and providers

| Item | State | Decision or next step |
|---|---|---|
| Punctuation and sentences | ✅ | The LLM returns punctuated text; the edit list comes from word alignment in code (D-064); another engine at the bottom of the list |
| Parser | ✅ | spaCy `de_core_news_sm` first, larger only if needed (D-050) |
| Translation | ✅ | One model behind the provider interface, retry on failure, fallback later (D-050). Confirm the price on Google's page |
| Sense in context | ✅ | Gemini picks the dictionary sense, cached (D-010) |
| Transcription | ⏳ uploads postponed (D-066) | Groq first (D-040); fallback and Groq's terms: Q-31 |
| AI explanation | ✅ | One-shot allowed, bottom of the list (D-044) |

## 4. Data model changes

Today's model: `architecture-legacy/data-model.md`. Target: `architecture-target/vocabulary-model.md`.

| Item | State | Decision |
|---|---|---|
| `UserWord` status per lemma, independent of the schedule | ✅ | D-005, D-041 |
| Global vocabulary; decks ↔ words many-to-many | ✅ | D-045 |
| Connections (saved moments with copied sentence and their meaning), deleted with their video | ✅ | D-047, D-063; how the meaning is set: Q-34 |
| One FSRS schedule per word; previous state kept for "undo last review" | ✅ | D-004, D-047, review #50 |
| Personal translation and note per word | ✅ | Columns on the vocabulary word (review #40) |
| Where words appear (coverage, ranked list, find other cases) | ✅ | Per-line word JSON + indexed lemma array + lemma counts per video (D-052) |
| Per-word timings (read-along) | ✅ | Start time per word in the per-line JSON; estimated for manual captions (D-052) |
| Upload fingerprint, local-file entries | ⏳ postponed | D-040, D-066 |
| Multi-word items (phrases) | ⏳ bottom of the list | Leave room: a vocabulary item can be a lemma or a phrase |
| Indexes on `SubtitleLine`, `Card`, `MediaContent` | ✅ | With before/after `EXPLAIN ANALYZE` |

## 5. Dictionary data

| Item | State | Decision or next step |
|---|---|---|
| Source | ✅ | Wiktextract import, FrequencyWords (D-010, D-017). Measure the German import size before choosing the server |
| Word data shown | ✅ | Four lookup levels and the sidebar tabs (D-056) |
| Word data sources, badges, word pack, save-action name | ✅ | D-058 |
| Learning, native and UI languages | ✅ | Three separate settings; v1 scope (D-057) |
| Ukrainian glosses | ✅ | Translated English glosses, batch-filled at word-pack build (D-060) |
| Compounds | ✅ | Nothing for now; splitting at the bottom of the list (D-055) |

## 6. Cost

All figures: `architecture-target/cost.md`. Roughly €10–25 a month for the server and backups, plus $5–10 of API use: under the €30 soft cap. To do: confirm the translation and Groq prices on the providers' pages, and finalise once the server is chosen.

## After phase 1

Phase 1 is done. The embed capture spike (Q-06) and the other spikes moved to phase 3 (D-062). Open: how a connection gets its meaning (Q-34).
