# 004 – Word-data spike
Status: draft
Roadmap step: phase 4, before the feature order (D-083)

## Problem
Word data is where the product's value is: the popups (D-056), the badges, the word pack per video (D-058), coverage scores, the vocabulary and the cards all depend on it. It is designed (D-047, D-052, D-056–D-060, D-063, D-065) but nothing of it has run:
- How big the German part of Wiktextract is, how long the import takes, and what it costs in disk and memory on the VPS.
- How many lemmas in real captions it covers, and how good its short English glosses are for a popup.
- Whether a word form can be looked up reliably (form → lemma, part of speech, gender), which the join rule now needs (D-081).
- How large a word pack per video is and how long it takes to build.
- How a saved word gets its meaning (Q-34): Gemini picking the sense in context, at what accuracy and cost.
- What Ukrainian glosses translated from English look like (D-060, D-065).

## Goal
Numbers and a yes/no for each of the above, from the 7 caption files of spike 002 (and the videos added in F-13). Time-box: three days.

## Setup
Outside the app repository (`linguastream-spikes`):
- **Data:** the German Wiktextract dump from kaikki.org (JSON lines, extracted from English Wiktionary); FrequencyWords German (OpenSubtitles).
- **Postgres** locally in Docker, the version planned for the VPS.
- **Import script:** keep only what the popups need (word, POS, gender, plural, forms, senses with glosses and examples, separable/reflexive flags); build a **form index** (every inflected form → lemma + POS).
- **Analysis:** spaCy `de_core_news_sm` on the normalised text of each video (D-081 order), joined to the import by lemma and form.

## Checks
1. **Import:** file size, rows kept, Postgres size with indexes, import time, peak memory.
2. **Coverage:** share of distinct lemmas per video found in Wiktextract (all words; words without names and numbers); list the 30 most frequent misses (names, slang, English words, compounds, spaCy errors).
3. **Form index:** for 200 sampled caption words, is form → lemma + POS right? Compare with spaCy's lemma. How often does a lowercase form have a verb reading (D-081)? Rerun `npm run rule` with the Wiktextract verb check (F-14).
4. **Gloss quality:** for 100 frequent lemmas, is the first short English gloss usable in the small popup? Mark: good / too long / misleading / missing.
5. **Badges:** for 50 nouns and 50 verbs, are gender, plural and separable/reflexive flags present and right (D-056, D-058)?
6. **Word pack:** size per video (JSON, gzipped) and build time; per-video lemma counts and the coverage score against a sample "known" list.
7. **Sense in context (Q-34):** for 50 occurrences of words with several senses, Gemini picks the sense; mark right or wrong; tokens and cost per pick. Compare with "the most common sense" (first sense) as the free baseline.
8. **Ukrainian glosses (D-060, D-065):** translate the glosses of one word pack with the context prompt; a Ukrainian-speaking friend marks 50 as good / wrong / awkward; cost per pack.
9. **Frequency:** FrequencyWords mapped to lemmas: how many lemmas get a rank; spot-check 20.

## Out of scope
The UI, NestJS, the real worker, audio, compounds (D-055), other learning languages.

## Acceptance criteria
- [ ] Each check has a result with numbers in `results.md`.
- [ ] A recommendation per open point: Q-34 (how a connection gets its meaning), whether glosses need an LLM layer, VPS memory and disk for Q-30.
- [ ] The import script and the form index kept for reuse.
- [ ] Results recorded in that day's decisions file; `architecture-target/word-data.md` and `cost.md` updated.

## Needs before starting
- Docker on your machine.
- A Ukrainian-speaking friend for check 8 (half an hour).
- Study: Block B (database) helps; the spike is also a hands-on start to it.
