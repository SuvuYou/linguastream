# Search (target)

Differentiator 1. Design: `architecture-target/search.md`.

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| Phrase search overlay (Cmd/Ctrl+K) with clip player | UI | Every page | 🟡 | Works today on Meilisearch |
| Postgres full-text search, per user, for free-text phrases | Backend + Data | Server | ⬜ | D-011, D-049; words are found through lemma arrays (D-067); Meilisearch removed |
| "Find other cases" from a card | UI | Decks | ✅ | |
