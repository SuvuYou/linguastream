# 004 – Results

Spike code: `linguastream-spikes/004-word-data`. Wiktextract file: kaikki.org German JSONL (1.1 GB). Date: 2026-11-20 (first run; rerun after the parser fixes).
Paste the generated files from `out/` next to this file, or summarise below.

| # | Check | Result |
|---|---|---|
| 1 | Import: file size, rows, Postgres size, time, peak memory | 1.1 GB JSONL, 371,793 entries (94,592 with senses, 268,911 form-of). 53 s. Postgres 735 MB (form index 683 MB, 3.8 M rows). Peak 2 GB because forms were held in memory: fixed (streamed). Nouns: gender 99%, plural 87%. Separable verbs: 0 found (bug, fixed: detected from split forms like "fängt an"). |
| 2 | Coverage per video (all lemmas / content lemmas), top misses | 16 videos: 85–97% of lemmas, 82–97% of content lemmas. Misses: names (often mis-tagged by spaCy, "Trevor" as ADV), compounds (Schulterblick, Fahrstunde, Topfdeckel, Bratensatz, Nebenmission), English/slang (ready, legit, Sidequest). |
| 3 | Form index: agreement with spaCy on 200 words; marked right / wrong | 189 of 200 agree (not marked). Bug fixed: auxiliaries ("haben", "sein") were indexed as forms of every verb. |
| 4 | Glosses: 100 frequent lemmas marked good / too long / misleading / missing | Not marked. Claude's reading: content words mostly good; frequent function words often misleading ("aber" → again, "mal" → times, "haben"/"sein" → forms the perfect, "sich" → each other, "einfach" → easily). Median short gloss 8 characters. |
| 5 | Badges: gender, plural, flags on 50 nouns and 50 verbs | 47 of 50 frequent nouns have gender and plural; misses are spaCy errors ("Okay", "bisschen" as nouns). One wrong: "Leute" n (plural-only). Reflexive flag is per word, should be per sense. |
| 6 | Word pack: size (raw / gzip), build time | 12–78 KB raw, 2–15 KB gzipped, built in 0–6 ms per video. |
| 7 | Sense in context (Q-34): Gemini vs first sense, marked; cost per pick | 50 picks, Gemini chose the first sense 31 times; $0.00007 per pick. Not marked; Claude's reading: Gemini right in most cases where the first sense is wrong (Parole → slogan, schreiben → spell, Kern → core, flüchtig → volatile, Fleisch → meat). Homographs were missing ("Gericht" dish): fixed by merging same-word entries. |
| 8 | Ukrainian glosses: 50 marked by a Ukrainian speaker; cost per pack | 175 glosses, $0.0076 per pack. Translations look faithful; errors come from the English source gloss (Gewerke → mining shareholder, sich → each other). Not yet marked by a Ukrainian speaker. |
| 9 | Frequency: lemmas ranked, spot-check | 20,000 ranked but wrong (verschießen 592, abfahren 434) because of the auxiliary bug. Fixed: single-word forms only, a shared form splits its count. Rerun needed. |
| F-14 | Join rule with the Wiktextract verb check: joins marked | 0–7 joins per video, 0–8 kept as verbs. Not marked. |

**F-12 found:** `4Ja5iJtYOPw` (auto captions) has no punctuation and no capitals at all; spaCy then treats the whole video as one sentence. A real case for the D-077 fallback.

Also measured: separable verbs joined via spaCy's `svp` label ("fangen … an" → "anfangen").

## Recommendations
- Q-34 (how a connection gets its meaning): ___
- Glosses need an LLM layer? ___
- VPS memory and disk for Q-30: ___
