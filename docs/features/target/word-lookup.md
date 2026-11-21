# Word lookup (target) ⚠ under discussion

Design: `architecture-target/word-data.md`.

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| Clickable words → word panel | UI | Watch page | ✅ | |
| Instant layer: line translation and dictionary entry from Postgres, under 200 ms | UI + Backend | Watch page | ⬜ | Today the panel waits for Gemini (legacy). |
| Hover translation | UI | Watch page | ⬜ | Never committed |
| Dictionary data: Wiktextract, frequency table | Data | Server | ⬜ | D-010, D-017 (no DeepL) |
| Sense in context: Gemini picks the dictionary sense, cached | Backend | Watch page | ⬜ | Replaces the Gemini-generated word profile (D-010) |
| AI limiter with dictionary-only fallback | Backend | Server | ⬜ | D-010 |
| Word translation and analysis on hover and click | UI | Extension on youtube.com | ⬜ | Later, after the thin extension (D-021). Source track only. |
| Word lookup on any website (feature review #31) | UI | Extension, any site | ⬜ | Later (D-043). Sends only the selected word or phrase. |
| Small popup on click: gloss, status buttons, Save; the clicked word stays marked (feature review #18) | UI | Watch page | ⬜ | D-056, D-058 |
| Full view after the popup: details in a sidebar (feature review #19) | UI | Watch page | ⬜ | D-056 |
| Details in tabs: Meanings, Forms, Phrases & related, Etymology (feature review #20) | UI | Watch page | ⬜ | D-056 |
| Meanings, each with an example; forms (feature review #23) | UI + Data | Watch page | ⬜ | From Wiktextract |
| Status toggle and frequency rank in the details (feature review #21) | UI | Watch page | ⬜ |  |
| Right-click cycles status: unknown → learning → known → ignored (feature review #22) | UI | Watch page | ⬜ |  |
| Compact grammar badges: part of speech, gender, number, case (feature review #25) | UI + Data | Watch page | ⬜ | Word-level from Wiktextract, occurrence-level from spaCy (D-056) |
| Etymology and pronunciation (IPA) (feature review #23) | UI + Data | Watch page | ⬜ | The "rest" of #23 |
| Phrases, synonyms / antonyms, related words (feature review #24) | UI + Data | Watch page | ⬜ |  |
| Phrase detection: verb phrases and separable verbs as one item, with a breakdown (feature review #26) | Data + UI | Watch page | ⬜ | Separable verbs via spaCy's `svp` label (spike 004) |
| Usage tips, only when there is something real to say (feature review #28) | UI + AI | Watch page | ⬜ |  |
| Customisable gestures: hover / click / right-click / Shift-click → action (feature review #29) | UI | Settings | ⬜ |  |
| Popup size setting (feature review #30) | UI | Settings | ⬜ |  |
| Pick a phrase by hand (Shift-click words, save as one) (feature review #27) | UI | Watch page | ⏳ | Bottom of the list |
| "Explain" a line or word with AI (feature review #17) | UI + AI | Watch page | ⏳ | One-shot exception (D-044); bottom of the list |
| Keyboard shortcuts for status (feature review #67) | UI | Watch page | ⏳ | Later |
