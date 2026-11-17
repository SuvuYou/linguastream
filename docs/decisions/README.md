# Decisions

One file per day: `decisions-{date}-{topic}.md`, where the topic sums up that day. Inside a file, entries are newest first. New decisions go into the file for the day they are made (create it if needed; the topic is chosen then and not renamed later). IDs (D-0xx) keep counting across days and are how other docs refer to decisions. Each entry: what was decided, why, and what it replaced. Never edit an old entry's decision; add a new entry that supersedes it. Legal reasoning is research, not legal advice; open legal points are listed in `legal/unverified-assumptions.md`.

## Index

Newest first.

| ID (links to the day file) | Decision | Date | Status |
|---|---|---|---|
| [D-040](decisions-2026-11-17-uploads.md) | Uploads: audio processed and discarded, no media stored, files matched by fingerprint | 2026-11-17 | accepted |
| [D-039](decisions-2026-11-16-legal-design-and-deployments.md) | Legal design final; extension in a separate private repository | 2026-11-16 | accepted |
| [D-038](decisions-2026-11-16-legal-design-and-deployments.md) | Private instance for friends plus a read-only demo; public edition deferred | 2026-11-16 | accepted |
| [D-037](decisions-2026-11-16-legal-design-and-deployments.md) | Launch conditions for the public edition | 2026-11-16 | accepted (public edition deferred: D-038) |
| [D-036](decisions-2026-11-16-legal-design-and-deployments.md) | Unlawful sources: music blocked, video-ID blocklist, terms clause | 2026-11-16 | accepted |
| [D-035](decisions-2026-11-16-legal-design-and-deployments.md) | Two-edition design confirmed; recruiter showcase; accepted risks | 2026-11-16 | accepted |
| [D-034](decisions-2026-11-16-legal-design-and-deployments.md) | Legal risk position after the 2026-11-16 review | 2026-11-16 | accepted |
| [D-033](decisions-2026-11-16-legal-design-and-deployments.md) | Model provider terms: adults only, paid tier | 2026-11-16 | accepted |
| [D-032](decisions-2026-11-16-legal-design-and-deployments.md) | Public edition: extension capture, accounts for quota only | 2026-11-16 | accepted (public edition deferred: D-038) |
| [D-031](decisions-2026-11-16-legal-design-and-deployments.md) | Two editions | 2026-11-16 | accepted (public edition deferred: D-038) |
| [D-030](decisions-2026-11-16-legal-design-and-deployments.md) | Uploads, subtitle-file import and the Plyr/WhisperX components reopened | 2026-11-16 | accepted (resolved by D-040) |
| [D-029](decisions-2026-11-16-legal-design-and-deployments.md) | No transcript without a capture or a paste | 2026-11-16 | accepted |
| [D-028](decisions-2026-11-16-legal-design-and-deployments.md) | Adding by URL opens the embedded player and captures there | 2026-11-16 | proposed (needs spike) |
| [D-027](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Check embeddability before offering transfer | 2026-11-15 | accepted |
| [D-026](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Translate sentences, not caption cues | 2026-11-15 | accepted |
| [D-025](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Normalisation returns a verifiable edit list, never rewritten text | 2026-11-15 | accepted |
| [D-024](decisions-2026-11-15-capture-pipeline-and-word-data.md) | The browser gets the user's known word forms, not a form→lemma table | 2026-11-15 | accepted |
| [D-023](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Translation goes behind a provider interface; cost corrected | 2026-11-15 | accepted |
| [D-022](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Transfer quota is counted in characters, server-side | 2026-11-15 | accepted |
| [D-021](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Two surfaces, one source of truth: capture vs transfer | 2026-11-15 | accepted (capture-only-on-youtube.com part: see D-028) |
| [D-020](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Sentence segmentation is a precondition for parsing | 2026-11-15 | accepted |
| [D-019](decisions-2026-11-15-capture-pipeline-and-word-data.md) | spaCy `de_core_news_sm` in the worker, replacing Google Cloud Natural Language | 2026-11-15 | accepted (pending spike) |
| [D-018](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Translation by Gemini Flash-Lite, lazily per watched window | 2026-11-15 | accepted |
| [D-017](decisions-2026-11-15-capture-pipeline-and-word-data.md) | No DeepL; word meanings come from the dictionary | 2026-11-15 | accepted |
| [D-016](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Capture the source track only | 2026-11-15 | accepted |
| [D-015](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Corrected legal basis; real address; no lawyer review | 2026-11-15 | accepted |
| [D-014](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Capture method: passive copy of the player's own caption response | 2026-11-15 | accepted (pending spike) |
| [D-013](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Login as a modal on a third-party-free landing page | 2026-11-15 | accepted |
| [D-012](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Captured transcripts are processed asynchronously through a queue | 2026-11-15 | accepted |
| [D-011](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Postgres full-text search replaces Meilisearch | 2026-11-15 | proposed |
| [D-010](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Word data: dictionary first, AI only where needed | 2026-11-15 | accepted |
| [D-009](decisions-2026-11-15-capture-pipeline-and-word-data.md) | YouTube captions captured by the user, stored per user on the server | 2026-11-15 | accepted |
| [D-008](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Hosting and legal setup | 2026-11-15 | accepted |
| [D-007](decisions-2026-11-15-capture-pipeline-and-word-data.md) | The server never fetches from YouTube | 2026-11-15 | accepted |
| [D-006](decisions-2026-11-14-scope-stack-and-deployment.md) | Deploy to one VPS with Docker Compose | 2026-11-14 | accepted |
| [D-005](decisions-2026-11-14-scope-stack-and-deployment.md) | Word status per lemma, marked by hand, with a placement step | 2026-11-14 | accepted |
| [D-004](decisions-2026-11-14-scope-stack-and-deployment.md) | Replace SM-2 with FSRS | 2026-11-14 | accepted |
| [D-003](decisions-2026-11-14-scope-stack-and-deployment.md) | Scope: private libraries, YouTube + own uploads | 2026-11-14, updated 2026-11-15 | accepted (uploads reopened: D-030) |
| [D-002](decisions-2026-11-14-scope-stack-and-deployment.md) | YouTube captions through a browser extension | 2026-11-14 | superseded by D-009 |
| [D-001](decisions-2026-11-14-scope-stack-and-deployment.md) | Drop Jellyfin and video file storage | 2026-11-14, updated 2026-11-15 | accepted (upload parts reopened: D-030) |

## Earlier decisions (from planning chats, still in force)

| ID | Decision | Notes |
|---|---|---|
| D-E1 | Next.js App Router + API routes, Prisma, Postgres (Neon), Firebase Auth | Firebase stays; Auth0 swap rejected |
| D-E2 | Client components + TanStack Query for data pages | |
| D-E3 | Translations stored as separate `SubtitleTrack`s, one `text` per line | |
| D-E4 | Cards copy their context sentence and translation; no FK to MediaContent | Cards survive video deletion |
| D-E5 | Gemini-generated word profiles as the main source of word data | Superseded by D-010. Row reconstructed: D-010 cites it, the original row was missing |
| D-E6 | Meilisearch for phrase search | Superseded by D-011 (proposed) |
| D-E7 | Source language auto-detected by default | |
| D-E8 | Max 50 decks per user | |
| D-E9 | Branches `feature/*` → `development` → `master`; CI must pass on PRs | |

## Superseded

| Was | Replaced by |
|---|---|
| Entity `Project` | `MediaContent` |
| Bazarr / OpenSubtitles; WhisperX + LibreTranslate on the developer's Mac | User capture (D-009), Groq for uploads, DeepL (Groq and DeepL later dropped: D-017, D-030) |
| Anthropic API, then Gemini-generated word profiles | D-010 |
| Routes `/`, `/personal`, `/decks`, `/study` | `/dashboard/*` |
| `middleware.ts`, `is_admin` cookie | `proxy.ts`, `is_admin` from DB |
| Design: Geist, sage `#7a9e87`, grid | Abandoned; full redesign later |
| Local-only deployment (DuckDNS, tunnels) | D-006 |
| YouTube text kept only in the browser (IndexedDB, browser search) | D-009, D-011 |
| Shared transcript cache across users | Rejected: would make the app a publisher |
