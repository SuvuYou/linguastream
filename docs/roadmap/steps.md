# Roadmap: feature order (phase 4)

> **Proposed 2026-11-20, for review.** The feature order itself, section by section with links to `features/target/`, is in `roadmap/feature-queue/`; this file groups those features into build steps. Replaces the earlier draft. Built from `Inspiration/feature-review.md` (numbers like #18 refer to it), `features/target/`, the spike results and the decisions up to D-086.

Sections are ordered by necessity. Within a section, steps are in build order. Each step starts with its study block (D-062) and becomes a folder under `docs/changes/` with a spec when work starts (`changes/README.md`). Spike gaps to close first are listed per step (`roadmap/spike-follow-ups.md`).

**Study fits the sections (D-090):** each section needs only the study blocks named in its steps (`study/plan.md`, Order). Foundation needs only Block B; deployment and operations come with the Demo, so until then everything runs on your machine.

**Two tracks (D-087):** after A1, the web frontend is built on mock data (Zod contracts + MSW) in parallel with the backend; each frontend item connects to the real API when its backend item is done. The extension follows the backend track. Cards for every section are on the Trello boards (D-088). Designs for every screen: the Theme Studio (D-089).

Estimates assume about 25 hours of building a week (`study/plan.md`). They are rough and usually optimistic.

| Section | Goal | Steps | Estimate |
|---|---|---|---|
| **A. Foundation** | Nothing visible: the monorepo and the data model | A0–A2 | ~4 weeks |
| **B. Core** | The smallest version that works end to end on your machine: API → capture → watch → look up → save → review | B0–B6 | ~14.5 weeks |
| **C. Essential** | What makes it worth using, and the differentiators | C1–C4 | ~7 weeks |
| **D. Demo** | Going live: deployment and operations, then friends, then the public read-only demo | D1–D2 | ~4 weeks |
| **E. Important** | Clear value, not blocking | E1–E5 | ~9 weeks |
| **F. Nice to have** | Polish | F1 | as time allows |
| **G. Later** | Bottom list and deferred | – | – |

**Honest timing:** A + B is about 18.5 weeks, and you use the app yourself every day from the end of B. Friends get it after D1, the first deployment: A + B + C + D1 is about 27.5 weeks, roughly six and a half months from starting A1 (D-090). Deploying earlier would mean studying Block D before Core, which is what this order avoids.

## A. Foundation

| # | Step | Contents | Study | Depends on | Est. |
|---|---|---|---|---|---|
| A0 | **Dev tooling** | Claude Code, the hooks, the claude.ai skills, impeccable, taste-skill, graphify. Checklist and commands: `roadmap/dev-tooling.md`. Strix comes later (see the friends milestone). | – | – | 1 day |
| A1 | **Monorepo and cleanup** | pnpm + Turborepo (D-054), Postgres in Docker Compose for local development: `apps/web` (the current Next.js app), `apps/api` (NestJS skeleton), `packages/db` (Prisma), `packages/contracts` (Zod schemas, published for the extension). Remove Jellyfin, the local ingest pipeline (`ml/`, LibreTranslate, WhisperX), server yt-dlp, DeepL, Meilisearch. Update the app's `CLAUDE.md` (it points to old doc paths). | B (pnpm, Turborepo, local Docker: ~6 h) | – | 2 weeks |
| A2 | **Data model** | One migration set: videos and tracks (raw json3 compressed, content hash, processing version: D-070), lines with per-word JSON and lemma arrays (D-052), lemma counts per video, vocabulary words with status (D-041), connections (D-047), decks ↔ words (D-045), FSRS schedule per word with SM-2 backfill (D-004), dictionary tables (from spike 004). Indexes checked with `EXPLAIN ANALYZE`. Integration tests against real Postgres in CI. | B (SQL, Postgres, testing, FSRS) | A1 | 2 weeks |

## B. Core: the first version that works end to end

| # | Step | Contents | Study | Spike gaps first | Depends on | Est. |
|---|---|---|---|---|---|---|
| B0 | **API and auth** | NestJS: one auth guard for the session cookie and the extension's ID token (D-053), revocation check cached per user (D-080), CSRF via `SameSite=Strict` + Origin check, Zod validation, rate limits, input limits (D-082). First routes moved from Next.js; the web app's data calls point at the API. | C | – | A2 | 1.5 weeks |
| B1 | **Capture and transfer** | Extension in its own private repo (D-039): passive hook (D-014), player control in the private instance (D-071, D-073, D-075), transfer button that page scripts can't click (D-082) and the button in the YouTube player (#52), sign-in handoff with a one-time code (D-053, D-079), hash check per user (D-070), embeddability (D-027) and music check (D-036), minimum-version check, paste fallback. `POST /api/captures`. | C (publishing a package) | F-01–F-11, F-16–F-20 | B0 | 2.5 weeks |
| B2 | **Processing pipeline** | BullMQ worker: normalisation with YouTube's punctuation, the join rule with the Wiktextract verb check, and the LLM step for unpunctuated tracks (D-077, D-078, D-081; test on `4Ja5iJtYOPw`); spaCy after normalisation, separable verbs joined; translation of sentences with neighbouring context (D-077); per-line word data and lemma counts (D-052); SSE progress and the progress toast (#15); quotas and spend cap (D-022). | E | F-12–F-15 | B1 | 3 weeks |
| B3 | **Dictionary and word packs** | Wiktextract import and form index (spike 004 code), frequency ranks, word pack per video (D-058) with Ukrainian glosses (D-060, D-065). Decide here: missing words (Q-40), default glosses (Q-41), compounds (Q-42). | E (LLM in production) | – | A2 | 1.5 weeks |
| B4 | **Watch page** | Player with transcript sidebar (#4, basic), dual subtitles (exists), show / blur / hide per track (#1), previous / repeat / next line (#2), windowed subtitle loading. | F | – | B2 | 1.5 weeks |
| B5 | **Word lookup** | Small popup on click (#18): gloss, status buttons, Save. Full view (#19) in tabs (#20): meanings and forms (#23), badges (#25, D-058), status and frequency (#21). Right-click cycles status (#22). Served from Postgres under 200 ms, timing logged. Levels as in D-056. | F | – | B3, B4 | 2 weeks |
| B6 | **Save and review** | Save → vocabulary word + connection with the sentence, translation and meaning (D-047; how the meaning is picked: Q-34). Cards with one FSRS schedule per word; front: a random connection with its clip; back: all meanings, the connection's meaning marked (D-063). Study sessions (exist), edit a word (#40), edit a card (#48), link from saved context to the moment (#39). | B (FSRS) | – | B5 | 2.5 weeks |

**Milestone: it works for you.** The whole loop runs on your machine (local Postgres and Redis in Compose, the extension loaded unpacked). Use it daily and keep notes; they shape C. Friends come after the first deployment (D1).

## C. Essential: what makes it worth using

| # | Step | Contents | Est. |
|---|---|---|---|
| C1 | **Word status everywhere** | Placement by frequency band with live preview (#53), onboarding languages (#54), status colours on subtitles and a coloured transcript with the current word highlighted (#16, #33 basic). | 2 weeks |
| C2 | **Library search and connections** (differentiators 1 and 2) | Search a word or phrase across your library → clips, card from any clip (#58; lemma arrays + full-text search, D-067). Connections: every moment a saved word appears in your library (#59, list part). | 2 weeks |
| C3 | **Vocabulary notebook and coverage** (differentiator 3) | Notebook filters and sort (#38). Words of this video by frequency band (#32). Known-word coverage per video in the app and on YouTube (D-024). "Mark as known?" for mature cards. | 2 weeks |
| C4 | **Playback modes** | Normal / pause after each line / repeat each line (#3). | 0.5 week |

## D. Demo: going live

| # | Step | Contents | Study | Est. |
|---|---|---|---|---|
| D1 | **Deployment and operations** | EU VPS (8 GB fits spike 004's 735 MB dictionary; Q-30), Docker Compose, Caddy path split, CI build and deploy, backups with one practised restore, Sentry (scrubbed), logs, health check, uptime check, CSP (D-082). Account and data deletion (#60). Privacy note for friends (D-066). | D | 2 weeks |
| D2 | **Read-only demo** | Separate deployment, rights-cleared videos, no login, changes discarded, no paid calls; Impressum, privacy note, consent prompt, attributions (Wiktextract CC BY-SA, FrequencyWords). Everything in `roadmap/before-demo.md`, including Q-20 (name) and Q-21 (YouTube policies). README, screen recording, load-test numbers. | G (load testing) | 2 weeks |

**Milestone: friends** (after D1). Accounts by hand, the extension handed over, the privacy note. Before handing it over: set up Strix and scan the API and the extension (`roadmap/dev-tooling.md` §6). Collect feedback while D2 is built.

## E. Important

| # | Step | Contents | Est. |
|---|---|---|---|
| E1 | **Player polish** | Subtitle styles per track (#5) with the −/+ number input (#6), quick menu (#8), action buttons on subtitle hover (#7), pause on hover (#9), A–B loop (#10), collapsible sidebar (#11). | 2 weeks |
| E2 | **Deeper lookup** | Phrases and related words (#24), phrase detection with separable verbs as one item (#26), word lookup on any website in the extension (#31, D-043). | 2.5 weeks |
| E3 | **Vocabulary and review polish** | Suggested words (#34), saved words of this video (#35), quick status change (#41), hide meanings (#42), bulk actions (#43), lists with name, icon, colour (#44), session direction (#49), session summary with undo (#50). | 2 weeks |
| E4 | **Grammar view v1** (differentiator 4) | Scope still undefined (`features/target/grammar.md`): define it first. | 2 weeks |
| E5 | **Platform** | Themes (#62), translation fallback order (#61), Google sign-in, Playwright end-to-end tests and accessibility checks, the daily breakage check for the extension (D-082). | 1.5 weeks |

## F. Nice to have

Read-along word highlight (#12), hide controls when idle (#13), fullscreen with our subtitles (#14, research first), usage tips (#28), custom gestures (#29), popup size (#30), colour picker (#36), colour by part of speech (#37), grammar filters in the notebook (#45), list hover animation (#46), card layout settings (#51), usage page (#64).

## G. Later

**Bottom list, in order:** your uploads (#57, D-066), pick a phrase by hand (#27), discovery page (#55, #56), word graph view (#59), translation engine picker (#63), "Explain" with AI (#17), ready-made word lists from an open source (#47), signed-in devices (#65), compound splitting if not solved in B3 (D-055, Q-42), word fix suggestions (#69, D-076).

**Also later:** separate interface language (#66), status shortcuts (#67), stats (#68), Anki export, curated catalog (Q-08). Public edition (deferred, D-038).

**Not planned:** AWS + Terraform, pgvector/RAG, MCP server, Auth0, paid tier.
