Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.


## LinguaStream
Language-learning web app plus a Chrome extension: YouTube videos with dual subtitles, click-to-translate with dictionary data, clip-linked flashcards (FSRS), word coloring by known status, phrase search across the user's private library. Solo developer; a portfolio and learning project used by a few friends (D-061). Deployed from Germany as a private instance; a read-only demo comes later (D-038).

## Read first
`docs/README.md` maps the knowledge base. The parts to know:
- `docs/legal/` – **rules every change must respect** (copyright, extension, data protection, public pages, DSA)
- `docs/vision/` – product, scope, differentiators, glossary
- `docs/features/target/` – the features we build towards, with status; `docs/features/legacy/` – what the code does today
- `docs/architecture-target/` – the target design, including `security.md` and `cost.md`; `docs/architecture-legacy/` – how the app works today
- `docs/codebase-guide/` – layout, commands, conventions, git workflow
- `docs/decisions/` – why things are the way they are (check before proposing alternatives)
- `docs/roadmap/` – `feature-queue/` (features in order by section), `steps.md` (build steps), `spike-follow-ups.md`
- `docs/open-questions.md` – what's undecided

## How to work
- Work from a change folder in `docs/changes/NNN-*/` (spec → plan → tasks, templates in `docs/changes/README.md`). Don't start coding a roadmap step without an approved spec.
- Only do what the current task asks. Note unrelated problems in the change's notes instead of fixing them.
- **Update the docs in the same change:** feature status in `docs/features/target/` and `docs/features/legacy/`, the feature queue in `docs/roadmap/feature-queue/`, architecture in `docs/architecture-target/` and `docs/architecture-legacy/`.
- **Decisions:** one file per day in `docs/decisions/`, newest entry first, plus a row in the index (`docs/decisions/README.md`). Re-read the index right before adding one and take the next free number: other sessions may have added entries. Never edit an old entry; supersede it with a new one and note that in the index.
- If the code and the docs disagree, the code is the truth: say so and update the docs.
- Don't reopen a decision unless asked or you have new evidence. Then say so explicitly.

## Hard rules (details in `docs/legal/` and `docs/architecture-target/security.md`)
- **The extension is not part of this repository.** It lives in a separate private repository (D-039); do not add capture code here.
- **Deployments (D-038).** Private instance: friends only, no public sign-up, address never published. Demo: separate, read-only, rights-cleared content only, no paid API calls. The public edition is deferred; keep storage and search behind interfaces.
- **The server never fetches anything from YouTube.** Content only arrives from the user.
- **The extension only copies what YouTube's player already loaded.** It never makes its own caption requests, generates or reuses tokens, or touches video or audio streams. In the private instance it may switch on the learning-language caption track after a user action (D-071); never in the demo or public edition.
- **No manual handling of user transcripts.** The pipeline is fully automated, and no admin screen shows transcript text.
- **Every query and cache key on user content includes `user_id`.** Nothing is shared between users (D-070).
- **No transcript text or personal data in logs or Sentry.**
- **Public pages make no third-party requests**; Firebase loads only when the sign-in modal opens.
- **A new table with user data → add it to account deletion in the same PR.**
- **A new third-party service → update the privacy note and processor list in the same PR.**
- No paid features, ads or public transcript pages without a legal review.

## Code rules
- Target stack (D-049, D-054, D-085): pnpm + Turborepo monorepo with `apps/web` (Next.js), `apps/api` (NestJS + BullMQ worker), `packages/db` (Prisma), `packages/contracts` (Zod); Postgres self-hosted on the VPS. Until roadmap step A1 lands, this repository is still the single Next.js app.
- Jellyfin, Meilisearch, LibreTranslate, DeepL, server yt-dlp and the `ml/` ingest script are being removed. Don't extend them. Uploads are postponed (D-066): don't extend or remove Plyr or video upload yet.
- Migrations: `npx prisma migrate dev`. Never `db push`. Never edit an applied migration.
- Queries Prisma can't express well (lemma arrays, full-text search, bulk imports) use raw SQL, kept in one place per module (D-085).
- Every API route: authenticate (→ 401), validate input with Zod, keep DB queries in the data layer (`lib/db-helpers/` today).
- Await route `params` (Next 16).
- New code needs tests; keep coverage thresholds passing.
- Never put API keys in URLs or responses sent to the browser.
- Don't run `npm audit fix --force`.
- Don't restyle components unless the task is about styling (a redesign is planned).
- Don't commit or push unless asked.

## Checks before finishing a task
`npm run lint && npm run typecheck && npm run test:run`

Hooks in `.claude/settings.json` lint and run related tests after each edit, and block edits to secrets, lock files and applied migrations.
