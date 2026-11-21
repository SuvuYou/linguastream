# Review (target) ⚠ under discussion

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| Decks, deck detail, save and delete cards | UI | Decks | 🟡 | Max 50 decks (D-E8). Target (D-045): one global vocabulary, a word can be in several decks; decks get description, icon and colour. Today a card belongs to one deck. |
| Duplicate cards | Backend | Decks | 🟡 | TODO in `api/cards/route.ts`. Target: saving a word again adds a connection, not a card (D-047) |
| Card editing (feature review #48) | UI | Decks | ⬜ | |
| Study sessions | UI | Study | ✅ | |
| FSRS scheduling | Backend | Study | 🟡 | `fsrs.ts` exists, production uses SM-2 (D-004) |
| One schedule per vocabulary word | Data | Server | ⬜ | D-047; status stays independent (D-041) |
| Card back: all meanings, the meanings of the word's connections marked | UI + Data | Study | ⬜ | D-063; how a connection gets its meaning: Q-34 |
| Card front: a random connection with its clip; back: button to view all connections | UI | Study | ⬜ | D-047. Uploads whose file is missing are skipped |
| Words without connections: card shows a Wiktextract example, no clip | UI + Data | Study | ⬜ | D-047 |
| Anki export (one context sentence per card) | UI | Decks | ⬜ | Later; guardrail 6 |
| Lists (decks) with name, description, icon and colour (feature review #44) | UI | Decks | ⬜ | Lists are decks (D-045) |
| Session direction: word → meaning or meaning → word (feature review #49) | UI | Study | ⬜ | Display only (D-042) |
| Session summary with undo last review (feature review #50) | UI | Study | ⬜ |  |
| Card layout: reorder and hide sections (feature review #51) | UI | Study | ⬜ |  |
| Book-cover hover animation for lists (feature review #46) | UI | Decks | ⬜ |  |
| Stats: streak, accuracy, heatmap (feature review #68) | UI | Study | ⏳ | Later |
