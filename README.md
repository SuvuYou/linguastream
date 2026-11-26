<div align="center">

# LinguaStream

**Learn languages from the videos you actually want to watch.**

A personal language-learning web app with double subtitles, clickable words, AI word profiles, spaced-repetition flashcards, and a PlayPhrase-style search across your whole library.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-shadcn%2Fui-06B6D4?logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)

![Watch page with a clickable word and its profile](readme_screenshots/word-definitions.png)

</div>

---

## Table of contents

- [About](#about)
- [Features](#features)
- [Screenshots](#screenshots)
- [Pages](#pages)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Testing](#testing)

---

## About

LinguaStream is a language-learning platform. You watch YouTube videos with the original subtitles and a translation overlaid at the same time. Click any word to see what it means *in context*, then save it to a flashcard deck. Cards are scheduled with the SM-2 spaced repetition algorithm, and every card keeps a link back to the exact clip it came from.

> **Being rebuilt.** The old ingest stack (Jellyfin, Meilisearch, WhisperX, LibreTranslate, DeepL, server-side yt-dlp) has been removed. Adding videos comes back with the browser extension, and library-wide phrase search comes back on PostgreSQL; both are on the roadmap.

## Features

- **Personal library** - your private YouTube videos. *(Adding new videos is disabled until the browser extension lands.)*
- **Double subtitles** - original language and translation overlaid on the video, each independently toggleable.
- **Clickable words** - every word in the subtitles is interactive and opens a word panel with a contextual translation.
- **AI word profiles** - part of speech, definition, verb/noun forms, lexical family, and collocations, generated on first access and cached.
- **Flashcard decks** - save words to decks (up to 50 per user, enforced on both client and server).
- **Spaced repetition** - SM-2 scheduling with Again / Hard / Good / Easy ratings.
- **PlayPhrase-style search** - find any word or phrase across your library and jump to that moment. *(The search UI is there; results return once search is rebuilt on PostgreSQL.)*
- **Subtitle sidebar** - a collapsible list of all snippets, click to seek, with a local filter.

## Screenshots

### Watching and searching

| Word panel | Subtitle sidebar search |
| :---: | :---: |
| ![Watch page with word panel](readme_screenshots/word-definitions.png) | ![Watch page with subtitle search](readme_screenshots/word-search.png) |
| Click a word to get its translation, definition, lexical family, and collocations. | Filter every subtitle snippet in the video; matches are highlighted and clickable. |

### Decks

| Deck list | Deck detail |
| :---: | :---: |
| ![Decks](readme_screenshots/deck-selection.png) | ![Deck detail](readme_screenshots/deck-card-overview.png) |
| Each deck shows its card count and learning progress. | Cards expand to show definition, forms, lexical family, collocations, subtitle context, and the original clip. |

## Pages

| Page | Description |
| --- | --- |
| **Personal** | Your library (`/dashboard` redirects here), with search and source/translation language filters. |
| **Decks** | All decks with name, card count, due count, and language breakdown. |
| **Deck** | Deck detail with a list of all cards. Filter by source language and search by word. Each item expands to show translation, subtitle context, verb/noun forms, lexical family, collocations. |
| **Study** | Step 1: pick a source language. Step 2: pick a deck (filtered to decks containing cards in that language). Flip the card to see the translation, subtitle context, clip button, and word profile, then rate your recall. SM-2 schedules the next review. |
| **Watch** | YouTube IFrame player with a two-track subtitle overlay, a collapsible and searchable subtitle sidebar. A global search bar opens a full overlay (`Cmd/Ctrl + K`). |

## Tech stack

### Frontend
- [Next.js 16](https://nextjs.org/) (App Router)
- TypeScript throughout
- Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://zustand-demo.pmnd.rs/) for global state and session-level caches
- [TanStack Query](https://tanstack.com/query) for server state and caching
- [Plyr](https://plyr.io/) for uploaded videos (kept for when uploads return; no source at the moment)
- YouTube IFrame API for YouTube content (with a custom subtitle overlay on top)

### Backend
- Next.js API routes
- [NestJS](https://nestjs.com/) API in `apps/api`, served under `/api` (Next.js forwards `/api/*` to it in development)
- [Prisma](https://www.prisma.io/) ORM (v7)
- [Zod](https://zod.dev/) for schema validation

### Data
- PostgreSQL 17 (Docker Compose locally)
- [Firebase Auth](https://firebase.google.com/docs/auth)

### Infrastructure and services
- Gemini API for word profile generation

### Testing
- [Vitest](https://vitest.dev/) for unit tests

## Getting started

### Prerequisites

- Node.js 24+ and pnpm (`corepack enable` or `npm install -g pnpm`)
- Docker (for the local PostgreSQL in `compose.yaml`)
- A [Firebase](https://console.firebase.google.com/) project with Authentication enabled
- A [Gemini](https://ai.google.dev/) API key (word profiles)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. Install dependencies (also generates the Prisma client)
pnpm install

# 3. Start the local database
docker compose up -d

# 4. Create the environment files
cp .env.example .env                              # DATABASE_URL (shared)
cp apps/web/.env.example apps/web/.env.local      # web app variables
cp apps/api/.env.example apps/api/.env            # API variables
# ...then fill in the values (see the next section)

# 5. Apply migrations
pnpm db:migrate

# 6. Start the dev server (web on :3000, API on :3001)
pnpm dev
```

The repository is a pnpm + Turborepo monorepo: `apps/web` (Next.js), `apps/api` (NestJS), `packages/contracts` (shared Zod schemas) and `packages/db` (Prisma schema, migrations and client).

### First run checklist

1. Sign in with Firebase Auth. Your user and a default deck are created on first sign-in.
2. The local database starts empty, and adding videos is disabled until the browser extension lands, so there is nothing to watch yet on a fresh setup.

## Environment variables

`DATABASE_URL` lives in the repo-root `.env` (shared by `packages/db` and the web app; see `/.env.example`). The web app's live in `apps/web/.env.local` (see `apps/web/.env.example`), the API's in `apps/api/.env` (see `apps/api/.env.example`).

| Variable | Required | Description |
| --- | :---: | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma. Locally: `postgresql://linguastream_user:linguastream_pass@localhost:5432/linguastream_db` (the `compose.yaml` database). |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase web app API key (from **Project settings > General**). |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase web app ID. |
| `FIREBASE_ADMIN_PROJECT_ID` | Yes | Project ID from your Firebase service account JSON. |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Yes | `client_email` from your Firebase service account JSON. |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Yes | `private_key` from your service account JSON. Wrap it in double quotes and keep the `\n` escapes. Also needed in `apps/api/.env`. |
| `API_URL` | No | Where Next.js forwards `/api/*` in development. Default `http://localhost:3001`. |
| `GEMINI_API_KEY` | Yes | In `apps/api/.env`. API key for the LLM behind `/api/definition`. |
| `WEB_ORIGIN` | Yes | In `apps/api/.env`. The web app's origin, e.g. `http://localhost:3000` (CSRF check). |
| `EXTENSION_ID` | Yes | In `apps/api/.env`. The extension's fixed ID; only `chrome-extension://<id>` may exchange sign-in codes. |

## Testing

```bash
# Run all tests (every workspace, via Turborepo)
pnpm test

# Run with coverage (web app thresholds are enforced)
pnpm test:coverage
```
