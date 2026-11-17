# Word lookup (legacy)

What the code does today, verified against commit `5e043e7` (2026-11-14). Fate: **Keep**, **Change**, **Disable** or **Remove**. Target: `features/target/word-lookup.md`.

| Feature | Fate | Notes |
|---|---|---|
| Clickable words → word panel | Keep | |
| Panel translation from a live Gemini call | Change | Slow: the panel waits on Gemini. Becomes the instant layer from Postgres |
| Word profile from the Wiktionary REST API + Gemini; definitions not saved | Remove | Replaced by Wiktextract + Gemini sense selection (D-010) |
| DeepL calls (`DEEPL_API_KEY`) | Remove | D-017 |
