# Feature queue

Every feature from `features/target/`, placed in a section by necessity and ordered within it. The section files link each feature back to its target file, where the details and decisions live. Numbers like (#18) are the rows of `Inspiration/feature-review.md`. Build steps that group these features: `roadmap/steps.md`.

Status keys as in `features/target/`: ⬜ not started · 🟡 partly there · ❔ undefined · ⏳ deferred/postponed. Features already working (✅) are listed at the bottom.

| # | Section | Goal | Features |
|---|---|---|---|
| 1 | [Foundation](1-foundation.md) | Monorepo and data model: nothing visible, everything depends on it | 4 |
| 2 | [Core](2-core.md) | The smallest version that works end to end: API → capture → watch → look up → save → review | 40 |
| 3 | [Essential](3-essential.md) | What makes friends stay, and the differentiators | 16 |
| 4 | [Demo](4-demo.md) | Going live: deployment and operations, friends, the public read-only demo | 14 |
| 5 | [Important](5-important.md) | Clear value, not blocking | 28 |
| 6 | [Nice to have](6-nice-to-have.md) | Polish | 12 |
| 7 | [Later](7-later.md) | Bottom of the list, later, public edition | 20 |

**How the order was set:** first what other features depend on, then what the core loop needs, then the differentiators (`vision/differentiators.md`), then the rest. Within a section, a feature never comes before one it depends on.

**Keeping it in sync:** a new feature gets a row in `features/target/` first, then a place here. When a feature is done, its target row turns ✅ and it moves to the list below.

## Already working (✅)
- [Email + password sign-in](../../features/target/account.md), [route protection](../../features/target/account.md)
- [Personal library: list, filter, search, delete](../../features/target/library.md)
- [YouTube player with custom subtitle overlay](../../features/target/watching.md), [dual subtitles](../../features/target/watching.md), [subtitle sidebar](../../features/target/watching.md)
- [Clickable words → word panel](../../features/target/word-lookup.md)
- [Study sessions](../../features/target/review.md), ["Find other cases" from a card](../../features/target/search.md)
- [Unit and component tests](../../features/target/platform.md), [CI: lint, typecheck, coverage](../../features/target/platform.md)
