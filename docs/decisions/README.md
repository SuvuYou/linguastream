# Decisions

One file per day: `decisions-{date}-{topic}.md`, where the topic sums up that day. Inside a file, entries are newest first. New decisions go into the file for the day they are made (create it if needed). The topic sums up the whole day, so it may be renamed at the end of the day; update the links when it is. IDs (D-0xx) keep counting across days and are how other docs refer to decisions. Each entry: what was decided, why, and what it replaced. Never edit an old entry's decision; add a new entry that supersedes it. Legal reasoning is research, not legal advice; open legal points are listed in `legal/unverified-assumptions.md`.

## Index

Newest first.

| ID (links to the day file) | Decision | Date | Status |
|---|---|---|---|
| [D-088](decisions-2026-11-21-parallel-frontend-and-trello.md) | Trello boards track the build order of Foundation and Core | 2026-11-21 | accepted |
| [D-087](decisions-2026-11-21-parallel-frontend-and-trello.md) | Frontend built on mock data in parallel with the backend | 2026-11-21 | accepted |
| [D-086](decisions-2026-11-20-spikes-done.md) | Word-data spike closed; gap decisions made during development | 2026-11-20 | accepted |
| [D-085](decisions-2026-11-20-spikes-done.md) | Prisma stays the database library | 2026-11-20 | accepted |
| [D-084](decisions-2026-11-20-spikes-done.md) | Rejected punctuation chunks keep their punctuation; long runs split at pauses | 2026-11-20 | accepted |
| [D-083](decisions-2026-11-20-spikes-done.md) | Spike follow-ups and a word-data spike before the feature order | 2026-11-20 | accepted |
| [D-082](decisions-2026-11-20-spikes-done.md) | Security requirements | 2026-11-20 | accepted |
| [D-081](decisions-2026-11-20-spikes-done.md) | The join rule checks verbs with Wiktextract; spaCy always runs after normalisation | 2026-11-20 | accepted |
| [D-080](decisions-2026-11-20-spikes-done.md) | Revocation checked on every API call, cached briefly per user | 2026-11-20 | accepted |
| [D-079](decisions-2026-11-20-spikes-done.md) | Extension sign-in spike 003 done | 2026-11-20 | accepted |
| [D-078](decisions-2026-11-20-spikes-done.md) | Punctuation spike 002 done; the join rule skips verbs | 2026-11-20 | accepted (verb check via Wiktextract: D-081) |
| [D-077](decisions-2026-11-20-spikes-done.md) | Use YouTube's punctuation; the LLM step only for unpunctuated tracks | 2026-11-20 | accepted (rule refined by D-078) |
| [D-076](decisions-2026-11-20-spikes-done.md) | Misheard words: visible fix suggestions, bottom of the feature list | 2026-11-20 | accepted |
| [D-075](decisions-2026-11-19-capture-spike.md) | Never restore the caption setting after capture | 2026-11-19 | accepted |
| [D-074](decisions-2026-11-19-capture-spike.md) | Player control spike 001 done | 2026-11-19 | accepted |
| [D-073](decisions-2026-11-19-capture-spike.md) | Uploaded German captions first; the user's own track choice wins | 2026-11-19 | accepted |
| [D-072](decisions-2026-11-19-capture-spike.md) | Capture spike 000 done | 2026-11-19 | accepted |
| [D-071](decisions-2026-11-19-capture-spike.md) | Switching captions on: player control in the private instance, a prompt in the public edition | 2026-11-19 | accepted |
| [D-070](decisions-2026-11-18-competitor-research.md) | Caption hash check is per user | 2026-11-18 | accepted |
| [D-069](decisions-2026-11-17-backend-and-word-data.md) | D-043 limits confirmed | 2026-11-17 | accepted |
| [D-068](decisions-2026-11-17-backend-and-word-data.md) | Corrections to earlier entries | 2026-11-17 | accepted |
| [D-067](decisions-2026-11-17-backend-and-word-data.md) | Word search uses lemma arrays; full-text search only for free-text phrases | 2026-11-17 | accepted |
| [D-066](decisions-2026-11-17-backend-and-word-data.md) | Uploads postponed; a privacy note for friends | 2026-11-17 | accepted |
| [D-065](decisions-2026-11-17-backend-and-word-data.md) | Gloss translation prompt includes the word's context | 2026-11-17 | accepted |
| [D-064](decisions-2026-11-17-backend-and-word-data.md) | Punctuation: punctuated text from the LLM, edit list by word alignment | 2026-11-17 | accepted (only for unpunctuated tracks: D-077) |
| [D-063](decisions-2026-11-17-backend-and-word-data.md) | Words with several meanings: all meanings on the back, connection meanings marked | 2026-11-17 | accepted |
| [D-062](decisions-2026-11-17-backend-and-word-data.md) | Order of work: study plan, spikes, feature order; learning in parallel | 2026-11-17 | accepted |
| [D-061](decisions-2026-11-17-backend-and-word-data.md) | What this project is | 2026-11-17 | accepted |
| [D-060](decisions-2026-11-17-backend-and-word-data.md) | Ukrainian glosses: translated English glosses, filled at word-pack build | 2026-11-17 | accepted (updated by D-065) |
| [D-059](decisions-2026-11-17-backend-and-word-data.md) | Project management on GitHub Projects | 2026-11-17 | accepted |
| [D-058](decisions-2026-11-17-backend-and-word-data.md) | Word lookup v1: dictionary translation, Wiktextract, spaCy, Gemini; "Save" and "connection" | 2026-11-17 | accepted (updated by D-063) |
| [D-057](decisions-2026-11-17-backend-and-word-data.md) | Languages: learning, native and UI are separate; v1 scope | 2026-11-17 | accepted |
| [D-056](decisions-2026-11-17-backend-and-word-data.md) | Word lookup levels and what each shows | 2026-11-17 | accepted (full popup corrected by D-058, D-068) |
| [D-055](decisions-2026-11-17-backend-and-word-data.md) | German compounds: nothing for now | 2026-11-17 | accepted |
| [D-054](decisions-2026-11-17-backend-and-word-data.md) | Monorepo: pnpm workspaces with Turborepo; contracts published as a package | 2026-11-17 | accepted |
| [D-053](decisions-2026-11-17-backend-and-word-data.md) | Auth across the two apps and the extension | 2026-11-17 | accepted (confirmed by D-079) |
| [D-052](decisions-2026-11-17-backend-and-word-data.md) | Per-line word data and per-video counts | 2026-11-17 | accepted |
| [D-051](decisions-2026-11-17-backend-and-word-data.md) | Operations: backups, deployment, server choice, demo hosting | 2026-11-17 | accepted (demo reasoning corrected by D-068) |
| [D-050](decisions-2026-11-17-backend-and-word-data.md) | Models: LLM punctuation, spaCy `sm`, one translation model | 2026-11-17 | accepted (punctuation updated by D-064) |
| [D-049](decisions-2026-11-17-backend-and-word-data.md) | Backend stack: NestJS, BullMQ, Postgres on the VPS, Postgres search | 2026-11-17 | accepted |
| [D-048](decisions-2026-11-17-backend-and-word-data.md) | Study plan covers app and non-app technologies separately | 2026-11-17 | accepted (updated by D-061) |
| [D-047](decisions-2026-11-17-backend-and-word-data.md) | Vocabulary, connections and cards | 2026-11-17 | accepted (updated by D-063) |
| [D-046](decisions-2026-11-17-backend-and-word-data.md) | Planning comes before the roadmap | 2026-11-17 | accepted (superseded by D-062) |
| [D-045](decisions-2026-11-17-backend-and-word-data.md) | Lists are decks; one vocabulary, words in many decks | 2026-11-17 | accepted (open question answered by D-047) |
| [D-044](decisions-2026-11-17-backend-and-word-data.md) | One-shot AI explanation allowed as an exception to "no AI chat" | 2026-11-17 | accepted |
| [D-043](decisions-2026-11-17-backend-and-word-data.md) | Extension: word lookup on any website | 2026-11-17 | accepted (built later) (limits confirmed by D-069) |
| [D-042](decisions-2026-11-17-backend-and-word-data.md) | Review direction is a display choice | 2026-11-17 | accepted (corrected by D-068) |
| [D-041](decisions-2026-11-17-backend-and-word-data.md) | Word status is independent of cards and FSRS | 2026-11-17 | accepted |
| [D-040](decisions-2026-11-17-backend-and-word-data.md) | Uploads: audio processed and discarded, no media stored, files matched by fingerprint | 2026-11-17 | accepted (postponed by D-066) |
| [D-039](decisions-2026-11-16-legal-design-and-deployments.md) | Legal design final; extension in a separate private repository | 2026-11-16 | accepted |
| [D-038](decisions-2026-11-16-legal-design-and-deployments.md) | Private instance for friends plus a read-only demo; public edition deferred | 2026-11-16 | accepted (privacy note added by D-066) |
| [D-037](decisions-2026-11-16-legal-design-and-deployments.md) | Launch conditions for the public edition | 2026-11-16 | accepted (public edition deferred: D-038) |
| [D-036](decisions-2026-11-16-legal-design-and-deployments.md) | Unlawful sources: music blocked, video-ID blocklist, terms clause | 2026-11-16 | accepted |
| [D-035](decisions-2026-11-16-legal-design-and-deployments.md) | Two-edition design confirmed; recruiter showcase; accepted risks | 2026-11-16 | accepted |
| [D-034](decisions-2026-11-16-legal-design-and-deployments.md) | Legal risk position after the 2026-11-16 review | 2026-11-16 | accepted (lawyer recommendation set aside by D-061) |
| [D-033](decisions-2026-11-16-legal-design-and-deployments.md) | Model provider terms: adults only, paid tier | 2026-11-16 | accepted |
| [D-032](decisions-2026-11-16-legal-design-and-deployments.md) | Public edition: extension capture, accounts for quota only | 2026-11-16 | accepted (public edition deferred: D-038) |
| [D-031](decisions-2026-11-16-legal-design-and-deployments.md) | Two editions | 2026-11-16 | accepted (public edition deferred: D-038) |
| [D-030](decisions-2026-11-16-legal-design-and-deployments.md) | Uploads, subtitle-file import and the Plyr/WhisperX components reopened | 2026-11-16 | accepted (resolved by D-040) |
| [D-029](decisions-2026-11-16-legal-design-and-deployments.md) | No transcript without a capture or a paste | 2026-11-16 | accepted |
| [D-028](decisions-2026-11-16-legal-design-and-deployments.md) | Adding by URL opens the embedded player and captures there | 2026-11-16 | proposed (spike passed: D-072) |
| [D-027](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Check embeddability before offering transfer | 2026-11-15 | accepted |
| [D-026](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Translate sentences, not caption cues | 2026-11-15 | accepted |
| [D-025](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Normalisation returns a verifiable edit list, never rewritten text | 2026-11-15 | accepted (mechanism updated by D-064) |
| [D-024](decisions-2026-11-15-capture-pipeline-and-word-data.md) | The browser gets the user's known word forms, not a form→lemma table | 2026-11-15 | accepted |
| [D-023](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Translation goes behind a provider interface; cost corrected | 2026-11-15 | accepted |
| [D-022](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Transfer quota is counted in characters, server-side | 2026-11-15 | accepted |
| [D-021](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Two surfaces, one source of truth: capture vs transfer | 2026-11-15 | accepted (capture-only-on-youtube.com part: see D-028) |
| [D-020](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Sentence segmentation is a precondition for parsing | 2026-11-15 | accepted |
| [D-019](decisions-2026-11-15-capture-pipeline-and-word-data.md) | spaCy `de_core_news_sm` in the worker, replacing Google Cloud Natural Language | 2026-11-15 | accepted (pending punctuation spike) |
| [D-018](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Translation by Gemini Flash-Lite, lazily per watched window | 2026-11-15 | accepted |
| [D-017](decisions-2026-11-15-capture-pipeline-and-word-data.md) | No DeepL; word meanings come from the dictionary | 2026-11-15 | accepted |
| [D-016](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Capture the source track only | 2026-11-15 | accepted |
| [D-015](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Corrected legal basis; real address; no lawyer review | 2026-11-15 | accepted |
| [D-014](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Capture method: passive copy of the player's own caption response | 2026-11-15 | accepted (confirmed by D-072) |
| [D-013](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Login as a modal on a third-party-free landing page | 2026-11-15 | accepted |
| [D-012](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Captured transcripts are processed asynchronously through a queue | 2026-11-15 | accepted |
| [D-011](decisions-2026-11-15-capture-pipeline-and-word-data.md) | Postgres full-text search replaces Meilisearch | 2026-11-15 | accepted (D-049) (narrowed by D-067) |
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
| D-E4 | Cards copy their context sentence and translation; no FK to MediaContent | Superseded by D-047: connections keep the copied sentence but are deleted with their video; words stay |
| D-E5 | Gemini-generated word profiles as the main source of word data | Superseded by D-010. Row reconstructed: D-010 cites it, the original row was missing |
| D-E6 | Meilisearch for phrase search | Superseded by D-011 |
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
