# LinguaStream – instructions for AI assistants

Language-learning web app plus a Chrome extension: YouTube videos (own uploads undecided) with dual subtitles, click-to-translate with dictionary data, clip-linked flashcards (FSRS), word coloring by known status, phrase search across the user's private library. Solo developer project, being prepared for public deployment from Germany.

## Read first
- `docs/legal-guardrails.md` – **rules every change must respect** (copyright, public pages, GDPR, extension, DSA)
- `docs/00-vision.md` – product, scope, non-goals
- `docs/01-features.md` – what exists and its status
- `docs/02a-architecture-current.md` – how the app works today
- `docs/02b-architecture-target.md` – the provisional target design
- `docs/03-codebase-guide.md` – layout, commands, conventions
- `docs/decisions.md` – why things are the way they are (check before proposing alternatives)
- `docs/roadmap.md` and `docs/open-questions.md` – what's next and what's undecided

## How to work
- Work from a change folder in `docs/changes/NNN-*/` (spec → plan → tasks). Don't start coding a roadmap step without an approved spec.
- Only do what the current task asks. Note unrelated problems in the change's notes instead of fixing them.
- **Update the docs in the same change:** feature status in `01-features.md`, architecture in `02a-architecture-current.md` / `02b-architecture-target.md`, new decisions in `decisions.md`.
- If the code and the docs disagree, the code is the truth: say so and update the docs.
- Don't reopen a decision in `decisions.md` unless asked or you have new evidence. Then say so explicitly.

## Hard rules (details in `docs/legal-guardrails.md`)
- **The extension is not part of this repository.** It lives in a separate private repository (D-039); do not add capture code here.
- **Deployments (D-038).** Private instance: friends only, no public sign-up, address never published. Demo: separate, read-only, rights-cleared content only, no paid API calls. The public edition is deferred; keep storage and search behind interfaces.
- **The server never fetches anything from YouTube.** Content only arrives from the user.
- **The extension only copies what YouTube's player already loaded.** It never makes its own caption requests, generates or reuses tokens, or touches video or audio streams.
- **No manual handling of user transcripts.** The pipeline is fully automated, and no admin screen shows transcript text.
- **Every query and cache key on user content includes `user_id`.** Nothing is shared between users.
- **No transcript text or personal data in logs or Sentry.**
- **Public pages make no third-party requests**; Firebase loads only when the sign-in modal opens.
- **A new table with user data → add it to account deletion in the same PR.**
- **A new third-party service → update the privacy policy and processor list in the same PR.**
- No paid features, ads or public transcript pages without a legal review.

## Code rules
- Jellyfin, Meilisearch, LibreTranslate and the `ml/` ingest script are being removed. Don't extend them. Plyr and video upload are undecided (Q-19): don't extend or remove them yet.
- Migrations: `npx prisma migrate dev`. Never `db push`.
- Every API route: `getCurrentUser()` → 401; validate input with Zod; DB queries in `lib/db-helpers/`.
- Await route `params` (Next 16).
- New code needs tests; keep coverage thresholds passing.
- Never put API keys in URLs or responses sent to the browser.
- Don't run `npm audit fix --force`.
- Don't restyle components unless the task is about styling (a redesign is planned).
- Don't commit or push unless asked.

## Checks before finishing a task
`npm run lint && npm run typecheck && npm run test:run`
