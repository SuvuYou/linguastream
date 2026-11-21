# 3. Essential

What makes friends keep using it, and the differentiators. Roadmap steps C1–C4.

| # | Feature | Target file | Status | Why here / depends on |
|---|---|---|---|---|
| 1 | Placement on first visit (#53) | [vocabulary](../../features/target/vocabulary.md) | ⬜ | Without it every word starts unknown (Q-05) |
| 2 | Onboarding: learning, native (and UI) language in one step (#54) | [account](../../features/target/account.md) | ⬜ | With placement |
| 3 | Word coloring by status and frequency | [vocabulary](../../features/target/vocabulary.md) | ⬜ | Needs placement |
| 4b | Rank coloured by usefulness (D-089) | [vocabulary](../../features/target/vocabulary.md) | ⬜ | With the colouring |
| 4 | Status colours: per status, light and dark, background or text (#33) | [vocabulary](../../features/target/vocabulary.md) | ⬜ | Basic settings for the colouring |
| 5 | Transcript: words coloured by status, current word highlighted, translation on hover (#16) | [watching](../../features/target/watching.md) | ⬜ | Must |
| 6 | Postgres full-text search, per user | [search](../../features/target/search.md) | ⬜ | Differentiator 1; lemma arrays for words (D-067) |
| 7 | Phrase search overlay (Cmd/Ctrl+K) with clip player (#58) | [search](../../features/target/search.md) | 🟡 | Rebuilt on Postgres |
| 8 | Create a card from any search clip (#58) | [search](../../features/target/search.md) | ⬜ | Turns search into vocabulary |
| 9 | Connections: every moment a saved word appears in your library (#59) | [search](../../features/target/search.md) | ⬜ | Differentiator 2 |
| 10 | Per-video ranked word list and known-word coverage (#32) | [vocabulary](../../features/target/vocabulary.md) | ⬜ | Differentiator 3 |
| 11 | Known-% score on the YouTube watch page | [vocabulary](../../features/target/vocabulary.md) | ⬜ | Differentiator 3 in the extension (D-024) |
| 12 | Notebook: filters and sort (#38) | [vocabulary](../../features/target/vocabulary.md) | ⬜ | Must; the notebook gets long fast |
| 13 | "Mark as known?" prompt for mature cards | [vocabulary](../../features/target/vocabulary.md) | ⬜ | Keeps statuses current (D-041) |
| 14 | Playback modes: normal / pause after each line / repeat each line (#3) | [watching](../../features/target/watching.md) | ⬜ | Must |
| 15 | Add YouTube video by URL | [capture](../../features/target/capture.md) | 🟡 | Capture inside our embed (D-028); confirm F-01 first |
| 16 | "Paste transcript" fallback | [capture](../../features/target/capture.md) | ⬜ | For videos where capture fails (D-014) |
