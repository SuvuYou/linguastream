# Features

The feature set is split the same way as the architecture:

- **`legacy/`**: what the code does today, verified against commit `5e043e7` (2026-11-14). Each row says what happens to it: **Keep**, **Change**, **Disable** or **Remove**.
- **`target/`**: the feature set we are building towards. Each row has a status against that target.

When a change lands, update both in the same PR (see `changes/README.md`): the legacy row now describes the new behaviour, and the target row's status moves. A legacy row marked Remove is deleted once the code is gone.

Both are organised by **capability** (one file per area), not by page, because most features appear on several pages and pages move. Each target row has a **Where** column; `by-page.md` is the page view built from it.

Candidate features from the competitor review, rated and ordered but not yet assigned to areas: `Inspiration/feature-review.md`.

The feature set is **not final**. Files marked ⚠ are under discussion: they describe what exists or was proposed, not what will be built. Rows apply to the private instance unless they say Demo (D-038).

## Target status

✅ built and matches the target · 🟡 partial or inconsistent · ⬜ planned · ❔ undecided · ⏳ deferred (with the public edition, D-038, or postponed, e.g. uploads, D-066)

## Type

- **UI**: something the user sees or clicks
- **Backend**: server logic, jobs, APIs
- **Data**: data sources, models, schema
- **Compliance**: legal and privacy duties
- **Infra**: deployment, operations, tests

## Areas

| Area | Target | Legacy |
|---|---|---|
| Capture and transfer (extension, paste, add by URL) | `target/capture.md` | none built |
| Processing pipeline | `target/processing.md` | (ingest script: `legacy/library.md`) |
| Library | `target/library.md` | `legacy/library.md` |
| Watching ⚠ | `target/watching.md` | `legacy/watching.md` |
| Word lookup ⚠ | `target/word-lookup.md` | `legacy/word-lookup.md` |
| Vocabulary ⚠ | `target/vocabulary.md` | none built |
| Review ⚠ | `target/review.md` | `legacy/review.md` |
| Search | `target/search.md` | `legacy/search.md` |
| Grammar | `target/grammar.md` | none built |
| Account | `target/account.md` | `legacy/account.md` |
| Demo | `target/demo.md` | none built |
| Platform | `target/platform.md` | `legacy/platform.md` |
