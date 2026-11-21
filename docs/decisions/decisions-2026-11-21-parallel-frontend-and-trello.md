# Decisions 2026-11-21: parallel frontend, Trello boards, visual design

## D-090 · The roadmap follows the study plan: Foundation needs only Block B; deployment moves to Demo · 2026-11-21 · accepted
**Problem:** Foundation (A1–A4) needed study blocks B, C and D (about 113 of the app track's 210 hours) before its last step, so most of the study plan came before any visible progress.
**Decision:**
1. **Foundation** is the monorepo and the data model only (A0–A2). Study: Block B, re-scoped: pnpm + Turborepo and local Docker (~6 h) before A1, Postgres part 1, testing and FSRS before A2.
2. **API and auth** (was A3) is the first Core step, **B0**, with Block C. The web app's data calls move to the API there.
3. **Deployment and operations** (was A4: VPS, Compose, Caddy, CI deploy, backups, Sentry, logs, CSP, account deletion, privacy note) is the first Demo step, **D1**, with Block D. Until then everything runs locally (Postgres and Redis in Compose).
4. **Friends get access after D1**, not after Core (chosen over deploying at the end of Core). Core ends with "it works for you": daily use on your own machine.
5. Study blocks are split to match: `COPY` moves to Block E (B3), full-text search and `pg_trgm` to a new **Block H** (before C2), load testing before D2, Playwright before E5. Total hours unchanged.
**Cost:** friends wait about 7 more weeks (~27.5 weeks from A1 instead of ~20). **Why:** study stays just in time (D-062): about 6 hours before the first line of Foundation code.
**Updates** `study/plan.md`, `roadmap/steps.md`, `roadmap/feature-queue/` (Foundation, Core, Demo) and the Trello boards.

## D-089 · Visual design: graphite with a blue accent; the Theme Studio is the reference · 2026-11-21 · accepted
**Decision:** Dark-first graphite surfaces (#141416 page, #1A1A1D panels), one accent **#83BAE7** that is also used on play buttons, active tabs and the current transcript line, font Onest (Cyrillic included) with JetBrains Mono for times and numbers. Word statuses as tinted backgrounds: unknown #FFB4A3, learning #FFE08A, known #9EE6B8. Translation language in the designs: English. Transcript lines are grouped under time markers (variant E), text 13 px by default; the size switch lives in the player settings panel and in Settings, not in the sidebar. Rank numbers are coloured by usefulness (accent = worth learning, green = known, grey = rare).
**Reference:** LinguaStream Theme Studio (claude.ai artifact https://claude.ai/artifact/6s5x73XGns2eUGkGTRHWpF): every screen with an editor for the tokens; "Copy CSS variables" gives the `:root` block for `globals.css`. Earlier explorations: the design canvas https://claude.ai/artifact/CAEmL8iQQEMB4XKJStRy7g. Small visual bugs are fixed during development.
**Screens (21):** sign-in, onboarding placement, extension (send button on YouTube, known-% badge, popup states), library (preparing and failed videos), add video (link or pasted transcript), watch page (reading, word details, subtitles + Words tab, theater, consent + Saved), search (Ctrl/Cmd K), vocabulary (bulk actions as a bottom overlay), connections (every place a word appears, which go on the card), lists, review, card editor (fields and layout), session summary, account, two settings pages, demo label and attributions. Not drawn: deferred features (uploads, discovery, stats, word graph, engine picker) and the undefined grammar view (only "Grammar in this line").
**Ends** phase 5 (designs).

## D-088 · Trello boards track the build order of every section · 2026-11-21 · accepted
**Decision:** One board per feature-queue section: Foundation, Core, Essential, Demo, Important, Nice to have. (Started with "LinguaStream Foundation" and "Lingua Stream Core"; the rest were added the same day.) Lists: TODO Frontend, TODO Backend, In progress, Done. Extension work and non-code tasks go in TODO Backend. Frontend cards link to their screen in the Theme Studio (D-089). `[N]` in a card title is its place in the build order on that board. Each card names its roadmap step and decisions. `roadmap/steps.md` and `roadmap/feature-queue/` stay the source for scope and reasons; the boards track what is being worked on. Started as a test.
**Links:** https://trello.com/b/I42rzyAa/linguastream-foundation · https://trello.com/b/OEXM7Lks/lingua-stream-core

## D-087 · Frontend built on mock data in parallel with the backend · 2026-11-21 · accepted
**Decision:** After the monorepo exists (Foundation [2]–[4]), the web frontend is built in parallel with the backend, against mock data:
1. **Contract first.** Before a screen is built, its request/response shapes are written as Zod schemas in `packages/contracts` (D-054). Frontend mocks and backend implementation both follow the schema; a change to a shape is a change to the schema.
2. **Mocks at the network level** with MSW (Mock Service Worker). Components call the real API client from the start; switching to the backend means turning MSW off for that route.
3. **Mock data is real data** from the spikes (spike 002's processed `4Ja5iJtYOPw`, spike 004 dictionary entries and word packs), plus worst cases for `break-ui`.
4. **A signed-in user is mocked** until the auth guard (B0, was A3 before D-090) works.
5. **Not mocked:** the extension (capture, sign-in handoff, transfer button). It needs real YouTube and a real API, so it follows the backend track.
6. Screens are designed (phase 5) right before they are built on mocks.
**Why:** one developer, so "parallel" means alternating tracks, not a shorter total (A + B stays ~20 weeks). It removes waiting on the backend and gives time to learn React and Next.js on real screens.
**Updates** the order in `roadmap/steps.md` (frontend steps no longer wait for their backend step).
