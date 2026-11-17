# Review (legacy)

What the code does today, verified against commit `5e043e7` (2026-11-14). Fate: **Keep**, **Change**, **Disable** or **Remove**. Target: `features/target/review.md`.

| Feature | Fate | Notes |
|---|---|---|
| Decks (max 50), deck detail, save and delete cards | Keep | |
| Duplicate cards | Change | TODO in `api/cards/route.ts` |
| Study sessions | Keep | |
| SM-2 scheduling (`lib/algorithms/sm2.ts`) | Remove | Replaced by FSRS (D-004); `fsrs.ts` exists but is not wired in |
