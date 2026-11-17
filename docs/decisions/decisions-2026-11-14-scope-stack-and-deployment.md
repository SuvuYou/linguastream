# Decisions · 2026-11-14

Newest first. Rules and index: `decisions/README.md`.

## D-006 · Deploy to one VPS with Docker Compose · 2026-11-14 · accepted
**Decision:** Next.js (standalone build), worker, Redis and Caddy on one EU VPS with Docker Compose. Postgres stays on Neon. One environment until there are users.
**Why:** The worker and Redis need a long-running host anyway. Splitting the web app onto Vercel adds cross-domain session cookies, exposes Redis and runs into serverless limits for SSE.
**Replaces:** Vercel; AWS ECS + Terraform + staging (deferred).

## D-005 · Word status per lemma, marked by hand, with a placement step · 2026-11-14 · accepted
**Decision:** Each user has a status per (language, lemma): unknown, learning, known, ignored. Set by hand. On first visit the user estimates their vocabulary size and the top N lemmas by frequency are marked known. Store where each status came from (`placement` vs `manual`).
**Open follow-ups:** Q-04, Q-05.

## D-004 · Replace SM-2 with FSRS · 2026-11-14 · accepted
**Decision:** Cards are scheduled with FSRS. Existing SM-2 data is converted in a migration, designed together with D-005.

## D-003 · Scope: private libraries, YouTube + own uploads · 2026-11-14, updated 2026-11-15 · accepted (uploads reopened: D-030)
**Decision:** Content is YouTube videos captured by each user and the user's own uploaded videos, private to them. No public library.
**Replaces:** Public Jellyfin library, the three-source model from the original plan.

## D-002 · YouTube captions through a browser extension · 2026-11-14 · superseded by D-009

## D-001 · Drop Jellyfin and video file storage · 2026-11-14, updated 2026-11-15 · accepted (upload parts reopened: D-030)
**Decision:** Remove Jellyfin (library, sync, admin unregistered mode, Plyr player, stream route). Uploaded videos are not stored: only the audio goes to the server for transcription and is deleted afterwards; the video plays from the user's disk.
**Why:** Can't legally stream personal media to strangers; video storage costs money. Also removes the Jellyfin API key leak.
