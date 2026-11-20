# Roadmap steps

> **Draft.** Rebuilt after the spikes as a feature order with a Core section (D-062, `roadmap/plan.md`).

Ordered. Each step becomes a folder under `docs/changes/` when work starts (see `changes/README.md`). Estimates are rough and assume about 25 hours of building a week (40 in total, 15 of them study: `study/plan.md`). Keep applying for jobs in parallel.

Ship a small Core first, then add features in order (D-061, D-062). Fast word lookup must be in place before anyone besides the developer uses it. Public-facing compliance work applies only to the demo (D-038): `roadmap/before-demo.md`. Friends get a one-page privacy note (D-066).

| # | Step | Contents | Depends on | Est. |
|---|---|---|---|---|
| 0 | **Spikes + decisions** | ~~Test capture method 3 on youtube.com~~ **done 2026-11-15: works via an XHR hook** (see D-014). ~~Embed and real MV3 extension~~ **done 2026-11-19 (D-072).** ~~Player control~~ **done (D-074).** Check whether YouTube's German auto-captions already carry punctuation, and try the LLM edit list on a few videos (D-050). | – | 1–2 weeks |
| 1 | **Cleanup + database** | Remove Jellyfin (library, sync, admin mode, stream route), the local ingest pipeline (`spawn-ingest`, `ml/`, LibreTranslate, self-hosted WhisperX), server yt-dlp (`/api/youtube/subtitles`), DeepL calls; Meilisearch → Postgres full-text search. Keep SRT/VTT import (D-040). Plyr stays as a candidate player for local files. Add indexes with before/after `EXPLAIN ANALYZE`. One migration for FSRS + `UserWord` with SM-2 data backfill. Duplicate-card handling. Integration tests against real Postgres in CI. `.gitattributes`. | 0 | 3 weeks |
| 2 | **Deploy + operations (private instance)** | Docker Compose on a VPS (Caddy, Next.js standalone, Redis, worker). CI builds and deploys. Sentry (scrubbed), structured logs, `/health`, uptime check, backups with documented retention + deletion log. Account and data deletion. Rate limits. Accounts created by hand; a short note for friends on what is stored and how to have it deleted (D-038). | 1 | 2 weeks |
| 3 | **YouTube capture flow** | Extension in its own private repository (D-039): capture method 3, transfer button, embeddability check (D-027), music warning + video-ID blocklist (D-036); paste fallback. Token handoff for the extension (D-053). `POST /api/captures` with a shared Zod schema. Queue + worker: normalisation as an edit list (D-025), spaCy (D-019), sentence translation via the provider interface (D-023, D-026), lemma counts, search index. SSE progress. Character-based quotas and spend cap (D-022). | 0, 2 | 3 weeks |
| 4 | **Fast word lookup + dictionary data** | Timing logs first. Instant layer served from Postgres. Wiktextract import, frequency table, Gemini sense picking, AI limiter. Definitions saved. | 1, 3 | 2–3 weeks |
| 5 | **Vocabulary system** | Placement step, word coloring, per-video ranked word list, coverage score, known-% score in the extension, "mark as known?" prompt for mature cards. | 3, 4 | 2–3 weeks |
| 6 | **Grammar view v1** | Scope not yet defined (`features/target/grammar.md`); settled in the feature discussion. Case labels only if the spike showed acceptable accuracy. | 4 | 2 weeks |
| 7 | **Remaining features + quality** | Hover translation, windowed subtitle loading, card editing, Playwright E2E for the core flow, accessibility checks. | 5 | 2 weeks |
| 8 | **Friends + demo** | Give the extension and an account to a few people the developer knows; collect feedback and track the numbers. No public sign-up (D-038). Build the read-only demo deployment and work through `roadmap/before-demo.md`. | 2–7 | ongoing |
| 9 | **Upload pipeline (D-040): postponed (D-066)** | Spike browser audio extraction first. Local playback, file fingerprint, resumable audio upload, chunked parallel transcription with timestamp stitching (Groq behind a provider interface), audio deletion test; embedded/sidecar subtitles skip transcription. Reuses the step 3 worker. | 3 | 2 weeks |
| – | **Later / deferred** | Anki export (single context sentence per card), curated YouTube catalog (metadata only), grammar pattern search, recommendations by coverage score. Public edition (D-031, deferred by D-038). AWS + Terraform, pgvector/RAG, MCP server, Auth0, paid tier: not planned. | | |

Redesign: planned separately. Don't restyle components during these steps unless a step touches them anyway.
