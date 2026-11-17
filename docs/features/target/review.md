# Review (target) ⚠ under discussion

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| Decks, deck detail, save and delete cards | UI | Decks | ✅ | Max 50 decks (D-E8) |
| Duplicate cards | Backend | Decks | 🟡 | TODO in `api/cards/route.ts`; one card per lemma or per occurrence is Q-04 |
| Card editing | UI | Decks | ⬜ | |
| Study sessions | UI | Study | ✅ | |
| FSRS scheduling | Backend | Study | 🟡 | `fsrs.ts` exists, production uses SM-2 (D-004) |
| Cards linked to word status (`UserWord`) | Data | Server | ⬜ | D-004, D-005, Q-04 |
| Anki export (one context sentence per card) | UI | Decks | ⬜ | Later; guardrail 6 |
