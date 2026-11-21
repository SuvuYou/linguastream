# 2. Core

The smallest version that works end to end: API → capture → watch → look up → save → review. Roadmap steps B0–B6. Milestone at the end: the whole loop works on your machine. Friends come after the first deployment (Demo, D1; D-090).

| # | Feature | Target file | Status | Why here / depends on |
|---|---|---|---|---|
| | **API and auth (B0)** | | | |
| 1 | NestJS API with one auth guard for the web session and the extension token | [platform](../../features/target/platform.md) | ⬜ | Every Core route sits behind it (D-049, D-053, D-080) |
| 2 | Rate limits on routes that call paid or free-tier APIs; input limits | [platform](../../features/target/platform.md) | ⬜ | In the API from day one (D-082); moved from Foundation |
| | **Capture (B1)** | | | |
| 3 | Extension sign-in (token handoff) | [capture](../../features/target/capture.md) | ⬜ | The extension can't send anything without it (D-053, D-079) |
| 4 | Capture the caption track | [capture](../../features/target/capture.md) | ⬜ | D-014, D-071, D-073; spike gaps F-01–F-11 first |
| 5 | Music check and video-ID blocklist | [capture](../../features/target/capture.md) | ⬜ | Before the first transfer (D-036) |
| 6 | Transfer button → full processing (#52) | [capture](../../features/target/capture.md) | ⬜ | The button page scripts can't click (D-082) |
| | **Processing (B2)** | | | |
| 7 | Store the raw track and enqueue a job | [processing](../../features/target/processing.md) | ⬜ | Hash check per user (D-070) |
| 8 | Transfer quota, AI quotas, monthly spend cap | [processing](../../features/target/processing.md) | ⬜ | Before any model call runs for friends (D-022) |
| 9 | Normalisation as an edit list | [processing](../../features/target/processing.md) | ⬜ | D-077, D-078, D-081 |
| 10 | Linguistic analysis with spaCy | [processing](../../features/target/processing.md) | ⬜ | After normalisation (D-081) |
| 11 | Sentence translation via the provider interface | [processing](../../features/target/processing.md) | ⬜ | Needs sentences; context sentences (D-077) |
| 12 | Lemma counts and search index update | [processing](../../features/target/processing.md) | ⬜ | Needs spaCy |
| 13 | Progress over SSE, retries, failed state | [processing](../../features/target/processing.md) | ⬜ | The user must see processing finish or fail |
| 14 | Progress toast with steps (#15) | [processing](../../features/target/processing.md) | ⬜ | The UI for the progress above |
| | **Dictionary (B3)** | | | |
| 15 | Dictionary data: Wiktextract, frequency table | [word-lookup](../../features/target/word-lookup.md) | ⬜ | Spike 004 code; decide Q-40–Q-42 here |
| | **Watching (B4)** | | | |
| 16 | Player + transcript sidebar layout, redesigned (#4) | [watching](../../features/target/watching.md) | 🟡 | The page everything else sits on |
| 17 | Windowed subtitle loading | [watching](../../features/target/watching.md) | ⬜ | Long videos; needs the indexes |
| 18 | Show / blur / hide per track, from one player control (#1) | [watching](../../features/target/watching.md) | ⬜ | Must; small |
| 19 | Previous / repeat / next line, with keys (#2) | [watching](../../features/target/watching.md) | ⬜ | Must; small |
| | **Word lookup (B5)** | | | |
| 20 | Word statuses per lemma (`UserWord`) | [vocabulary](../../features/target/vocabulary.md) | ⬜ | The popup's status buttons write it (D-005, D-041) |
| 21 | Instant layer: line translation and dictionary entry from Postgres, under 200 ms | [word-lookup](../../features/target/word-lookup.md) | ⬜ | Fast lookup before anyone else uses it |
| 22 | Small popup on click: gloss, status buttons, Save (#18) | [word-lookup](../../features/target/word-lookup.md) | ⬜ | D-056, D-058 |
| 23 | Right-click cycles status (#22) | [word-lookup](../../features/target/word-lookup.md) | ⬜ | Fastest way to mark words |
| 24 | Full view after the popup: details in a sidebar (#19) | [word-lookup](../../features/target/word-lookup.md) | ⬜ | D-056 |
| 25 | Details in tabs (#20) | [word-lookup](../../features/target/word-lookup.md) | ⬜ | With the full view |
| 26 | Meanings, each with an example; forms (#23) | [word-lookup](../../features/target/word-lookup.md) | ⬜ | Content of the Meanings and Forms tabs |
| 27 | Compact grammar badges (#25) | [word-lookup](../../features/target/word-lookup.md) | ⬜ | Badges are in v1 (D-058) |
| 28 | Status toggle and frequency rank in the details (#21) | [word-lookup](../../features/target/word-lookup.md) | ⬜ |  |
| 29 | AI limiter with dictionary-only fallback | [word-lookup](../../features/target/word-lookup.md) | ⬜ | Before Gemini is called from lookups |
| 30 | Sense in context: Gemini picks the dictionary sense, cached | [word-lookup](../../features/target/word-lookup.md) | ⬜ | Q-34 decided here |
| | **Save and review (B6)** | | | |
| 31 | Decks: one vocabulary, words in several decks | [review](../../features/target/review.md) | 🟡 | D-045; the model the rest of review builds on |
| 32 | Duplicate cards → saving again adds a connection | [review](../../features/target/review.md) | 🟡 | D-047 |
| 33 | Saved context with the word highlighted, link to the source moment (#39) | [vocabulary](../../features/target/vocabulary.md) | ⬜ | What a saved connection shows |
| 34 | Edit a word: own translation, note, reset (#40) | [vocabulary](../../features/target/vocabulary.md) | ⬜ | Friends will fix glosses |
| 35 | FSRS scheduling | [review](../../features/target/review.md) | 🟡 | Replaces SM-2 (D-004) |
| 36 | One schedule per vocabulary word | [review](../../features/target/review.md) | ⬜ | D-047 |
| 37 | Card front: a random connection with its clip; back: view all connections | [review](../../features/target/review.md) | ⬜ | Differentiator 2 in its simplest form |
| 38 | Card back: all meanings, the connections' meanings marked | [review](../../features/target/review.md) | ⬜ | Needs sense in context (D-063) |
| 39 | Words without connections: card shows a Wiktextract example | [review](../../features/target/review.md) | ⬜ | Needs the dictionary |
| 40 | Card editing (#48) | [review](../../features/target/review.md) | ⬜ |  |
