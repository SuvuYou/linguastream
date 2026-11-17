# Search (legacy)

What the code does today, verified against commit `5e043e7` (2026-11-14). Fate: **Keep**, **Change**, **Disable** or **Remove**. Target: `features/target/search.md`.

| Feature | Fate | Notes |
|---|---|---|
| Phrase search overlay (Cmd/Ctrl+K) with clip player | Keep | UI stays |
| Meilisearch (local) as the search backend | Remove | Replaced by Postgres full-text search (D-011, proposed) |
| "Find other cases" from a card | Keep | |
