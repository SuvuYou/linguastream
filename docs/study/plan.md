# Study plan (D-048, D-062)

Built from the frontend → backend transition plan (topic numbers **#1–#15** below are that plan's numbers). Two tracks:

- **App track:** technologies LinguaStream uses. Learned **just in time**: each block is studied right before the work that uses it, then learned for real by building it (D-062).
- **Separate track:** technologies job postings ask for that the app does not use (D-048). Studied on their own, never built into the app (D-061).

Hours are focused study, not build time. They come from the transition plan where the topic matches; topics it does not cover are my estimates.

**Time:** about 40 hours a week in total: **15 hours of study** and about **25 hours of building**. Suggested split of the study hours: about 10 on the app track (the current block), about 5 on the separate track. Adjust when interviews come up.

At that pace the app track (~210 h) takes about 21 weeks of study time and the first part of the separate track (~56 h) about 11 weeks, running side by side.

**Study guides with resources, one per block:**
- [Block A: before the spikes](block-a-before-the-spikes.md)
- [Block B: cleanup and database](block-b-database.md)
- [Block C: NestJS API and auth](block-c-api-and-auth.md)
- [Block D: deployment and operations](block-d-deployment.md)
- [Block E: processing pipeline](block-e-pipeline.md)
- [Block F: learner-facing app](block-f-app.md)
- [Block G: quality](block-g-quality.md)
- [Separate track](separate-track.md)

## How each block works

1. **Study** the block's topics (official docs first; one small exercise outside the app if the topic is new).
2. **Build** the roadmap step that uses them.
3. **Write down** in the step's `changes/` folder what you learned and what you would do differently. That note is also interview material.

## App track

### Block A: before the spikes (phase 3)

The spikes (D-062) need these, and nothing in the transition plan covers them.

| Topic | What to cover | Used in | Hours |
|---|---|---|---|
| Browser extensions (MV3) | Manifest V3, content scripts, `world: "MAIN"` vs isolated, `all_frames`, service worker lifecycle, messaging, `externally_connectable`, permissions, loading unpacked | Embed capture spike (Q-06), extension sign-in | 8 (estimate) |
| Firebase Auth beyond the basics (part of **#4 Auth**) | Session cookies, ID tokens, custom tokens, revocation, the Admin SDK; whether the web SDK runs in an MV3 service worker | Extension sign-in spike (D-053) | 4 (estimate) |
| LLM APIs in practice (part of the transition plan's "AI tooling") | Gemini API, prompts with structured (JSON) output, token counting and cost, retries, rate limits | Punctuation spike (D-064) | 5 (estimate) |
| Sequence alignment | Word-level diff / LCS (e.g. `diff` or `fast-diff` in TS, `difflib` in Python), mapping edits back to positions | Punctuation spike: deriving the edit list (D-064) | 2 (estimate) |

### Block B: cleanup and database

| Topic | What to cover | Used in | Hours |
|---|---|---|---|
| **#3 SQL + PostgreSQL** (highest value) | Joins, indexes and `EXPLAIN ANALYZE`, transactions, migrations with Prisma, `jsonb`, arrays with GIN indexes, full-text search and `pg_trgm`, `COPY` for bulk import | New data model (D-045, D-047, D-052, D-063), indexes, search (D-067), Wiktextract import | 30 |
| **#5 Backend testing** | Vitest, integration tests against a real Postgres (Testcontainers or a CI service container), test data | Integration tests in CI | 6 |
| pnpm + Turborepo (frontend refresher) | Workspaces, shared packages, task pipelines and caching | Monorepo (D-054) | 4 |
| Spaced repetition (FSRS) | How FSRS schedules; the `ts-fsrs` library; migrating SM-2 data | FSRS migration (D-004) | 2 (estimate) |

### Block C: NestJS API and auth

| Topic | What to cover | Used in | Hours |
|---|---|---|---|
| **#1 Node.js + TS server** | Request lifecycle, middleware, error handling, config and env, async patterns (study Express briefly, then NestJS) | `apps/api` | 15 |
| **#2 REST API design** | Resources, status codes, pagination, validation with Zod, idempotency, versioning | Every NestJS route; `POST /api/captures` | 8 |
| **#8 NestJS** | Modules, dependency injection, controllers, guards, pipes (Zod), interceptors, config module, testing | `apps/api`, moving routes over (D-049) | 10 |
| **#4 Auth** (rest of it) | Sessions vs tokens, guards, cookie forwarding from server components, revocation on account deletion | Shared auth check (D-053) | 8 |
| Publishing a package | Versioning, GitHub Packages or npm, consuming it from another repo | `packages/contracts` for the extension (D-054) | 2 (estimate) |

### Block D: deployment and operations

| Topic | What to cover | Used in | Hours |
|---|---|---|---|
| **#6 Docker** | Dockerfiles (multi-stage, Next.js standalone), Compose, networks, volumes, health checks, memory limits | Everything on the VPS | 8 |
| Linux server basics | SSH keys, firewall, unattended upgrades, users, logs; Caddy for TLS and path routing | VPS setup, Caddy split (D-053) | 6 (estimate) |
| **#7 CI/CD with GitHub Actions** | Build and test pipeline, building images, pushing to a registry, deploying over SSH, secrets | Deployment (D-051) | 6 |
| Postgres operations | `pg_dump` / restore, off-server backup storage, a practised restore, the deletion log | Backups (D-051) | 3 (estimate) |
| **#12 Observability** | Structured logs (e.g. pino), Sentry with scrubbing, health checks, uptime checks | Operations | 5 |

### Block E: the processing pipeline

| Topic | What to cover | Used in | Hours |
|---|---|---|---|
| **#9 Redis** | Data types, caching, rate limiting, persistence (AOF), memory limits | Cache, quotas (D-022), BullMQ | 5 |
| **#10 Queues + event-driven basics** | BullMQ: producers, workers, retries and backoff, failed jobs, idempotent jobs, concurrency; SSE for progress | Worker (D-049), progress | 10 |
| Python and spaCy basics (part of the transition plan's Python topic) | Enough Python to run a script or small service; spaCy tokens, lemmas, morphology, `Doc` → JSON | Analysis (D-050), per-line word JSON (D-052) | 6 (estimate) |
| LLM in production | Batching, cost caps, caching results, failure handling | Translation, punctuation, gloss batches (D-060, D-064, D-065) | 3 (estimate) |

### Block F: the learner-facing app

| Topic | What to cover | Used in | Hours |
|---|---|---|---|
| Next.js (frontend refresher) | App Router, server components, data fetching and caching, calling NestJS from server components | Pages only after D-049 | 10 |
| React + TS + CSS refresh | Rendering behaviour, effects pitfalls, generics, utility types | Watch page, popups, review | 12 |
| TanStack Query | Caching, invalidation, optimistic updates | Status changes, saving words | 3 |
| Tailwind + shadcn/ui + Radix | Popovers, tabs, dialogs, theming | Popups and sidebar (D-056), redesign | 5 |
| i18n | `next-intl`: messages, locale routing, formatting | UI translation support (D-057) | 2 (estimate) |
| Perf and a11y | Core Web Vitals, code splitting, keyboard navigation, ARIA for popups | Watch page, demo | 8 |

### Block G: quality

| Topic | What to cover | Used in | Hours |
|---|---|---|---|
| Frontend testing | Vitest + Testing Library for components | Components | 6 |
| Playwright | E2E for the core flow (the transition plan lists Cypress; Playwright is the roadmap's choice and the concepts transfer) | Core flow E2E | 4 |
| Load testing (estimate) | k6 or similar: realistic scenarios, reading results | Published load-test numbers for the demo (D-038) | 4 (estimate) |

**App track total:** about 210 hours, most of it overlapping with building.

## Separate track (not in the app)

Ordered by value for job applications, following the transition plan's flags.

| # | Topic | Why separate | Hours |
|---|---|---|---|
| **#11** | AWS: IAM, S3, EC2/ECS or Lambda, RDS, VPC basics, CloudWatch | The app runs on one VPS (D-006) | 20 |
| **#15** | Distributed systems / system design | Partly practised in the app (caching, queues, idempotency); the rest is interview prep | 20, ongoing |
| **#14** | GraphQL: schema, resolvers, N+1 and dataloader | The app uses REST | 8 |
| **#13** | MongoDB and NoSQL modelling | The app uses Postgres | 8 |
| Later | RAG, embeddings, vector databases | No RAG in the app | ~15 |
| Later | Terraform / AWS CDK (after AWS by hand) | No cloud infrastructure in the app | ~15 |
| Later | Kubernetes, ArgoCD (concepts) | One VPS with Compose | ~25 |
| Skip | MySQL, Azure/GCP specifics, Jenkins/CircleCI, microfrontends, Vue | As the transition plan says | – |

**Separate track total:** about 56 hours for the first four, then the later items as needed.

## Order

1. **Block A**, then the spikes (phase 3).
2. After the spikes, the feature order with its Core section (phase 4) decides the order of blocks B–G. The blocks above follow the most likely order: database, API, deployment, pipeline, app, quality.
3. The separate track runs alongside throughout.

## Progress

| Block | Status |
|---|---|
| A: before the spikes | Not started |
| B: cleanup and database | Not started |
| C: NestJS API and auth | Not started |
| D: deployment and operations | Not started |
| E: processing pipeline | Not started |
| F: learner-facing app | Not started |
| G: quality | Not started |
| Separate track | Not started |
