# 2. Core

The smallest version friends can use: capture → watch → look up → save → review. Roadmap steps B1–B6. Milestone at the end: friends get accounts and the extension.

| # | Feature | Target file | Status | Why here / depends on |
|---|---|---|---|---|
| | **Capture (B1)** | | | |
| 1 | Extension sign-in (token handoff) | [capture](../../features/target/capture.md) | ⬜ | The extension can't send anything without it (D-053, D-079) |
| 2 | Capture the caption track | [capture](../../features/target/capture.md) | ⬜ | D-014, D-071, D-073; spike gaps F-01–F-11 first |
| 3 | Music check and video-ID blocklist | [capture](../../features/target/capture.md) | ⬜ | Before the first transfer (D-036) |
| 4 | Transfer button → full processing (#52) | [capture](../../features/target/capture.md) | ⬜ | The button page scripts can't click (D-082) |
| | **Processing (B2)** | | | |
| 5 | Store the raw track and enqueue a job | [processing](../../features/target/processing.md) | ⬜ | Hash check per user (D-070) |
| 6 | Transfer quota, AI quotas, monthly spend cap | [processing](../../features/target/processing.md) | ⬜ | Before any model call runs for friends (D-022) |
| 7 | Normalisation as an edit list | [processing](../../features/target/processing.md) | ⬜ | D-077, D-078, D-081 |
| 8 | Linguistic analysis with spaCy | [processing](../../features/target/processing.md) | ⬜ | After normalisation (D-081) |
| 9 | Sentence translation via the provider interface | [processing](../../features/target/processing.md) | ⬜ | Needs sentences; context sentences (D-077) |
| 10 | Lemma counts and search index update | [processing](../../features/target/processing.md) | ⬜ | Needs spaCy |
| 11 | Progress over SSE, retries, failed state | [processing](../../features/target/processing.md) | ⬜ | The user must see processing finish or fail |
| 12 | Progress toast with steps (#15) | [processing](../../features/target/processing.md) | ⬜ | The UI for the progress above |
| | **Dictionary (B3)** | | | |
| 13 | Dictionary data: Wiktextract, frequency table | [word-lookup](../../features/target/word-lookup.md) | ⬜ | Spike 004 code; decide Q-40–Q-42 here |
| | **Watching (B4)** | | | |
| 14 | Player + transcript sidebar layout, redesigned (#4) | [watching](../../features/target/watching.md) | 🟡 | The page everything else sits on |
| 15 | Windowed subtitle loading | [watching](../../features/target/watching.md) | ⬜ | Long videos; needs the indexes |
| 16 | Show / blur / hide per track, from one player control (#1) | [watching](../../features/target/watching.md) | ⬜ | Must; small |
| 17 | Previous / repeat / next line, with keys (#2) | [watching](../../features/target/watching.md) | ⬜ | Must; small |
| | **Word lookup (B5)** | | | |
| 18 | Word statuses per lemma (`UserWord`) | [vocabulary](../../features/target/vocabulary.md) | ⬜ | The popup's status buttons write it (D-005, D-041) |
| 19 | Instant layer: line translation and dictionary entry from Postgres, under 200 ms | [word-lookup](../../features/target/word-lookup.md) | ⬜ | Fast lookup before anyone else uses it |
| 20 | Small popup on click: gloss, status buttons, Save (#18) | [word-lookup](../../features/target/word-lookup.md) | ⬜ | D-056, D-058 |
| 21 | Right-click cycles status (#22) | [word-lookup](../../features/target/word-lookup.md) | ⬜ | Fastest way to mark words |
| 22 | Full view after the popup: details in a sidebar (#19) | [word-lookup](../../features/target/word-lookup.md) | ⬜ | D-056 |
| 23 | Details in tabs (#20) | [word-lookup](../../features/target/word-lookup.md) | ⬜ | With the full view |
| 24 | Meanings, each with an example; forms (#23) | [word-lookup](../../features/target/word-lookup.md) | ⬜ | Content of the Meanings and Forms tabs |
| 25 | Compact grammar badges (#25) | [word-lookup](../../features/target/word-lookup.md) | ⬜ | Badges are in v1 (D-058) |
| 26 | Status toggle and frequency rank in the details (#21) | [word-lookup](../../features/target/word-lookup.md) | ⬜ |  |
| 27 | AI limiter with dictionary-only fallback | [word-lookup](../../features/target/word-lookup.md) | ⬜ | Before Gemini is called from lookups |
| 28 | Sense in context: Gemini picks the dictionary sense, cached | [word-lookup](../../features/target/word-lookup.md) | ⬜ | Q-34 decided here |
| | **Save and review (B6)** | | | |
| 29 | Decks: one vocabulary, words in several decks | [review](../../features/target/review.md) | 🟡 | D-045; the model the rest of review builds on |
| 30 | Duplicate cards → saving again adds a connection | [review](../../features/target/review.md) | 🟡 | D-047 |
| 31 | Saved context with the word highlighted, link to the source moment (#39) | [vocabulary](../../features/target/vocabulary.md) | ⬜ | What a saved connection shows |
| 32 | Edit a word: own translation, note, reset (#40) | [vocabulary](../../features/target/vocabulary.md) | ⬜ | Friends will fix glosses |
| 33 | FSRS scheduling | [review](../../features/target/review.md) | 🟡 | Replaces SM-2 (D-004) |
| 34 | One schedule per vocabulary word | [review](../../features/target/review.md) | ⬜ | D-047 |
| 35 | Card front: a random connection with its clip; back: view all connections | [review](../../features/target/review.md) | ⬜ | Differentiator 2 in its simplest form |
| 36 | Card back: all meanings, the connections' meanings marked | [review](../../features/target/review.md) | ⬜ | Needs sense in context (D-063) |
| 37 | Words without connections: card shows a Wiktextract example | [review](../../features/target/review.md) | ⬜ | Needs the dictionary |
| 38 | Card editing (#48) | [review](../../features/target/review.md) | ⬜ |  |
