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
