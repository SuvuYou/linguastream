# Word data (D-010)

| Data | Source | Where | Cost |
|---|---|---|---|
| Meanings, POS, forms, gender, inflection tables, multiword expressions | Wiktextract (English Wiktionary as JSON) | Imported into Postgres | one-off import |
| Tokens, lemmas, morphology, dependency tree | **spaCy `de_core_news_sm`**, locally in the worker (D-019) | Whole video, on transfer | €0 |
| Frequency rank per lemma | FrequencyWords (OpenSubtitles), converted to lemma counts | Postgres table | one-off import |
| Translation track | Cheap LLM behind a provider interface, whole track at transfer (D-018, D-023) | Cached per video | ~$0.03 / 1-hour video on gemini-3.1-flash-lite |
| Sense in context | Gemini, choosing among dictionary senses | Cached per (user, lemma, sentence hash) | negligible |

Costs and reference figures: `architecture-target/cost.md`.

**Score sync to the extension:** the server expands the user's known lemmas into inflected forms and ships that set (~300–500 KB, or ~50 KB as a Bloom filter). The browser only does set membership (D-024). The score is approximate and labelled as such.

**Known constraint:** the score needs the player to have loaded a German track, which happens only when the user has captions switched on in that language. With captions off, the extension prompts the user to enable them and does not toggle them itself.

**Instant layer:** a word click shows the line translation and the dictionary entry immediately from Postgres (target under 200 ms); the Gemini sense selection loads afterwards. No external call is on the critical path.

**Word pack (D-058, D-060):** at transfer, one bundle per video from the imported dictionary: each lemma with a short gloss in the user's native language, POS and gender. Missing non-English glosses are translated in one Gemini batch and cached for everyone; the prompt carries the German word, part of speech, English gloss and an example (D-065).

**AI limiter:** per-user daily quotas and a global monthly cap in Redis; fall back to dictionary-only data.
