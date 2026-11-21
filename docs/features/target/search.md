# Search (target)

Differentiator 1. Design: `architecture-target/search.md`.

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| Phrase search overlay (Cmd/Ctrl+K) with clip player (feature review #58) | UI | Every page | 🟡 | Works today on Meilisearch |
| Postgres full-text search, per user, for free-text phrases | Backend + Data | Server | ⬜ | D-011, D-049; words are found through lemma arrays (D-067); Meilisearch removed |
| "Find other cases" from a card | UI | Decks | ✅ | |
| Connections: every moment a saved word appears in your library (feature review #59) | UI + Data | Vocabulary, cards | ⬜ | Differentiator 2 |
| Create a card from any search clip (feature review #58) | UI | Search | ⬜ |  |
| Word graph view (feature review #59) | UI | Vocabulary | ⏳ | Bottom of the list |
