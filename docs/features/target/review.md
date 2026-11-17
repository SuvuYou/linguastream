# Review (target) ⚠ under discussion

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| Decks, deck detail, save and delete cards | UI | Decks | 🟡 | Max 50 decks (D-E8). Target (D-045): one global vocabulary, a word can be in several decks; decks get description, icon and colour. Today a card belongs to one deck. |
| Duplicate cards | Backend | Decks | 🟡 | TODO in `api/cards/route.ts`. Target: saving a word again adds a connection, not a card (D-047) |
| Card editing | UI | Decks | ⬜ | |
| Study sessions | UI | Study | ✅ | |
| FSRS scheduling | Backend | Study | 🟡 | `fsrs.ts` exists, production uses SM-2 (D-004) |
| One schedule per vocabulary word | Data | Server | ⬜ | D-047; status stays independent (D-041) |
| Card back: all meanings, the meanings of the word's connections marked | UI + Data | Study | ⬜ | D-063; how a connection gets its meaning: Q-34 |
| Card front: a random connection with its clip; back: button to view all connections | UI | Study | ⬜ | D-047. Uploads whose file is missing are skipped |
| Words without connections: card shows a Wiktextract example, no clip | UI + Data | Study | ⬜ | D-047 |
| Anki export (one context sentence per card) | UI | Decks | ⬜ | Later; guardrail 6 |
