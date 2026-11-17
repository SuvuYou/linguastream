# Legacy architecture: overview

How the app works **today** (verified against the code at commit `5e043e7`, 2026-11-14). It describes what is in the repo, not what is planned: the plan is in `architecture-target/`. When a change lands, move what it changed out of the target file and update this one.

Everything runs on the developer's Mac.

```mermaid
flowchart LR
  B[Browser] --> N[Next.js 16<br/>pages + API routes]
  N --> PG[(Neon Postgres<br/>Prisma 7)]
  N --> MS[(Meilisearch<br/>local)]
  N --> FB[Firebase Auth]
  N --> GM[Gemini API]
  N --> WK[Wiktionary API]
  N -- spawn detached --> PY[ml/ingest-subtitles.py]
  PY --> WX[WhisperX FastAPI :8001]
  PY --> LT[LibreTranslate :5000]
  PY -- psycopg2 --> PG
  N -- yt-dlp --> YT[YouTube]
  N --> JF[Jellyfin :8096]
```

**Stack:** Next.js 16 (App Router, mostly client components + TanStack Query), React 19, TypeScript, Tailwind 4 + shadcn/ui, Zustand, Zod, Prisma 7 with `@prisma/adapter-pg`, Neon Postgres, Firebase Auth (client SDK + Admin SDK, 14-day session cookie), Meilisearch, YouTube IFrame API, Plyr (Jellyfin only), Gemini, Wiktionary REST API.

Conventions that stay (request flow rules): `codebase-guide/conventions.md`.
