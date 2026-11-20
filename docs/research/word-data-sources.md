# Word data: sources, tools, languages and how competitors do it

Research behind D-056 to D-060 and D-065 (former Q-13 and Q-17), done 2026-11-17. Prices and licences come from third-party pages unless noted; check them on the provider's own page before relying on them. Competitor internals are mostly not public: where this says "inferred", it is read from their UI and store pages, not confirmed.

## 1. Summary and recommendation

- **Almost everything the popups and sidebar show (D-056) can come from Wiktextract** (meanings, examples, forms, gender, IPA, etymology, phrases, related words, syllable breaks), plus **spaCy** for the grammar of the word in this sentence and **FrequencyWords** for frequency. All free; the cost is one import.
- **The two things that need a model:** the translation of the word *in this sentence* (full popup) and glosses in **Ukrainian** (English Wiktionary only has English glosses). Both are small, cacheable calls.
- **Speed comes from precomputing, not from faster APIs.** At transfer time, build a per-video *word pack*: every lemma in the video with a short gloss in the user's native language, part of speech and gender. The watch page loads it once; the small popup then needs no request at all. The full popup makes one cached call; the sidebar loads on demand from Postgres.
- **Ukrainian glosses:** translate the English glosses once per sense, lazily on first lookup, and cache them for everyone (dictionary data, not user content, so sharing is allowed). Machine translation (Azure Translator's free tier) or the LLM both work; see section 5.

## 2. What each lookup level needs (D-056)

| Level | Shows | Source | How it stays fast |
|---|---|---|---|
| Page-word popup (any site) | 1–3 translations, status, save | Wiktextract gloss in the native language; lemma found through Wiktextract's inflected-forms list (no spaCy, since the page is not analysed) | One small API call, cached in Redis and in the extension |
| Small popup (subtitles) | 1–3 translations, status, save | The video's word pack | Already in the browser: zero requests |
| Full popup | Dictionary translation (v1, D-058), grammar badges, status, save. Later: translation in this sentence | Badges from the line's word JSON (spaCy, D-052); dictionary translation from the word pack / Wiktextract. Later: the LLM picks or phrases the translation in context | v1 needs no extra call. Later: one call, cached per user and sentence (user content, so the cache key includes `user_id`) |
| Sidebar | Word with syllable dots and badges; tabs: Meanings, Forms, Phrases and related, Etymology | Wiktextract (+ glosses translated as in section 5) | One Postgres query per tab, loaded when opened |

**Note on the Trancy example:** the dots in *aus·schließ·lich* are **syllable breaks** (hyphenation), not etymology. English Wiktionary lists hyphenation for many German entries, and Wiktextract extracts it; Pyphen (hyphenation patterns) is the fallback for words without it. Etymology stays its own tab.

## 3. Grammar badges and how saved words get them

Badges come in two kinds, and that answers "how is the data filled when a word is saved":

| Kind | Examples | Stored on | Filled from |
|---|---|---|---|
| **Word-level** (true for the word itself) | Part of speech, gender, plural type, separable or reflexive verb | The vocabulary word | Wiktextract, at save time; works for any word, even without a subtitle line |
| **Occurrence-level** (true for this use of the word) | Tense, person, number, case, mood | The connection | The line's word JSON (spaCy, D-052), copied at save time; no extra call |

- **Sorting and filtering the vocabulary:** word-level badges filter words directly; occurrence-level badges filter as "words with a saved moment in the past tense" (that is how Lingopie's tense filter has to work too).
- **Right-click to change status on a subtitle word:** the line is already analysed, so nothing is fetched. Setting a status does not save the word (D-047), so nothing is copied either.
- **Page-word popup and word lists:** no subtitle line, so only word-level badges, from Wiktextract. A form that maps to more than one lemma (*sein*: "be" or "his") shows the candidates.

## 4. Data sources

| Source | Gives | Languages | Licence | Cost |
|---|---|---|---|---|
| **Wiktextract / kaikki.org**, English Wiktionary | Senses, examples, forms and inflection tables, gender, IPA, hyphenation, etymology, derived and related terms, synonyms, multi-word expressions, translations | German, English, Portuguese, Ukrainian entries; glosses in English. For English words, a translations section lists equivalents in many languages, Ukrainian included | CC BY-SA + GFDL: attribution required | Free; one import. Measure the German subset's size before sizing the server |
| **Other Wiktionary editions via kaikki.org** | The same, with glosses in that edition's language | kaikki.org now extracts several non-English editions (German, French, Spanish, Russian, Chinese were the first; later counts list 21). Whether a Ukrainian edition is included needs checking | CC BY-SA | Free; one import per edition; structure differs per edition |
| **Wikidata lexemes** | Lexemes, forms, senses with glosses in several languages | Coverage is thin for German, and sense glosses are often only in the word's own language | CC0 (no attribution needed) | Free |
| **spaCy** | Lemma, POS, morphology, dependencies for the word in context | `de`, `en`, `pt`, `uk` pipelines exist | MIT | Free, local |
| **FrequencyWords** (OpenSubtitles) | Word frequency rank | Many languages incl. de, en, pt, uk | Check the data licence (attribution) | Free |
| **wordfreq** (Python) | Frequency from several corpora | Many incl. de, en, pt, uk | Data CC BY-SA 4.0 | Free; no longer updated |
| **DWDS Wortprofil** | Collocations for German (statistical, by grammatical relation) | German only | Terms to check; the listed web service is marked "development" | Free if allowed |
| **Tatoeba** | Example sentences with translations | Many | CC BY | Free |
| **The LLM** (Gemini today) | Translation in context, usage tips, gloss translation | Any | Provider terms | Per call; cached |

## 5. Tools and packages, with options

**Linguistic analysis (lemma, POS, morphology)**
- **spaCy** (chosen, `sm` first, D-050): fast, one API for all four languages.
- **Stanza** (Stanford): more accurate in published benchmarks, Apache-2.0, supports de/en/pt/uk; slower and heavier. The upgrade path if `sm` is not accurate enough.
- **simplemma:** lemmatisation only, tiny and fast, many languages. A candidate for the page-word popup if a server-side lemma lookup is needed without spaCy.
- UDPipe 2: good accuracy, but its models are licensed CC BY-NC-SA (non-commercial). Avoid.

**Word translation and gloss translation**
- **Gemini** (current provider, D-023): already in the stack, handles context best.
- **Azure Translator:** the most generous permanent free tier found, 2 million characters a month, then about $10 per million. Ukrainian supported. Good for translating dictionary glosses in bulk.
- **Google Cloud Translation:** about $20 per million characters; trial credit only.
- **DeepL:** strongest on European languages; one source reports its free and Pro API plans closed to new sign-ups in mid-2026. Treat as unavailable until checked. Removed from the design anyway (D-017).
- **LibreTranslate** (self-hosted): free, no third party, but lower quality and more memory on the server.

**Audio (later)**
- **Browser speech synthesis** (Web Speech API): free, nothing to host; quality depends on the user's system voices.
- **Piper** (self-hosted, CPU): the engine is MIT, but each voice has its own licence, and several (the German "Thorsten" voice among them, per one listing) are marked non-commercial. Fine for a private, non-commercial instance; check before anything public.
- **Wiktionary recordings** (Wikimedia Commons): real speakers, patchy coverage, attribution required.
- **Azure or Google speech:** paid per character.

**Other**
- **Pyphen:** syllable breaks for words Wiktionary lacks.
- **next-intl:** UI translation for Next.js (D-057: in place from the start, English only in v1).
- **Redis** (already planned): cache for page-word lookups and context translations.

## 6. Languages (D-057)

| Job | German (learning) | English (learning later; native; UI) | Ukrainian (native; UI) | Portuguese (learning later) |
|---|---|---|---|---|
| Analysis | spaCy `de` | spaCy `en` | not needed (never a learning language) | spaCy `pt` |
| Dictionary entries | Wiktextract | Wiktextract | – | Wiktextract |
| Glosses in this native language | English: Wiktextract directly | English Wiktionary is monolingual for English words (definitions in English) | Translated English glosses, cached (section 1) | – |
| Subtitle translation into it | LLM | LLM | LLM | LLM |
| Frequency | FrequencyWords `de` | `en` | – | `pt` |
| UI | – | next-intl, v1 | next-intl, later | – |

## 7. How the competitors do it

| | Language Reactor | FluentAI | Lingopie | Trancy |
|---|---|---|---|---|
| Word translation | Machine translation plus its own dictionary panel; an AI dictionary ("Lexa") and chat ("Aria") | Engine fallback order you can set: its AI translation, a basic translation, Google Translate (seen in its settings); "free translation" = Google Translate and a dictionary | Translations in the popup; Lingopie makes its own subtitles and says they are verified by native speakers | Free Google and Microsoft engines; premium GPT, Claude, Gemini, DeepSeek; bring-your-own-key engines |
| Definitions | Dictionary entries with links out to external dictionaries (seen in the panel); frequency rank per word | "Word explanation" with grammar, word forms, etymology, collocations (store page) | AI explanation of why the word is used in this context | "AI definition" written for the exact context rather than a list of dictionary entries |
| Grammar | AI "Grammar" button per word | AI grammar analysis | Grammar tags (gender, number, person, case) on every word and phrase; AI notes | AI grammar parsing of sentences |
| Audio | – | Pronunciation per word | Audio per word | Microsoft voices ("Choose Microsoft pronunciation") |
| Frequency and levels | Its own frequency ranks; vocabulary level set by frequency bands | Known % per video in its catalog | Level filters in its catalog | – |
| Speed (inferred) | Known-word list kept in the browser; colouring is local | Hover = instant translation, click = details: two tiers like D-056 | Own content, so translations can be prepared in advance | Changelog mentions an "optimized word data synchronization mechanism" and faster word highlighting: word data synced to the client |

**Common pattern:** word colouring and the first popup come from data already in the browser; only the detailed or AI view makes a network call. The word-pack design in section 1 is the same idea, built at transfer time.

**Network traffic (2026-11-18):** what Language Reactor and FluentAI actually call is in `research/competitors/language-reactor-and-fluentai-api.md`.

**What none of them shows publicly:** their storage or backend stack. Trancy and FluentAI lean on LLMs for definitions; Language Reactor is the most dictionary-driven; Lingopie controls its own content and pre-translates it.

## 8. Costs

| Item | Estimate |
|---|---|
| Wiktextract, FrequencyWords, spaCy, Pyphen | €0 (import and server memory only) |
| Ukrainian glosses | One-off. My estimate: the most frequent ~20,000 German lemmas × ~2 senses × ~40 characters ≈ 1.6 million characters, inside Azure's monthly free tier, or a few cents of LLM tokens. Lazily, only looked-up senses get translated |
| Translation in context (full popup, later: D-058) | One short LLM call per new sentence and word, cached per user; under the existing AI limiter (D-010) |
| Word pack per video | Built at transfer from data already computed; €0 |
| Audio | €0 with browser speech or Piper; paid with cloud speech |

## 9. Status

Decided since (D-058): dictionary translation in the full popup for v1, Gemini, spaCy, no audio for now, "Save" and "connection".


1. ~~Ukrainian glosses~~ decided (D-060): Gemini translates the English glosses, batch-filled when a word pack is built; no Ukrainian extractor.
2. **The word for the save action** in the glossary. Options: **Save** (plain, matches most apps), **Link**, **Collect**. Suggested: the button says *Save*; the saved moment is a *connection*.
3. **Audio** source when it is added: browser speech first, Piper or Wiktionary recordings later.
4. **Collocations** (later): Wiktextract multi-word expressions first; DWDS if its terms allow.

## Sources

- [Wiktextract](https://github.com/tatuylonen/wiktextract) and [kaikki.org](https://kaikki.org/dictionary/); [non-English editions on kaikki.org](https://git.tdem.in/tatuylonen/wiktextract/issues); [wty docs: 21 editions](https://docs.rs/crate/wty/0.8.2/source/docs/language.md)
- [Wikidata lexicographical data](https://www.wikidata.org/wiki/Wikidata:Lexicographical_data); [sense glosses often only in the lexeme's language](https://meta.wikimedia.org/wiki/Abstract_Wikipedia/Updates/2021-02-10/uk)
- [spaCy Ukrainian pipeline](https://huggingface.co/spacy/uk_core_news_sm/tree/main/morphologizer); [Stanza paper](https://arxiv.org/pdf/2003.07082); [Stanza Ukrainian model](https://huggingface.co/stanfordnlp/stanza-uk/blame/main/README.md); [Ukrainian NLP tools](https://k-centre.uacorpus.org/tools.html)
- [wordfreq](https://pypi.python.org/pypi/wordfreq)
- [DWDS Wortprofil web service](https://clarin.bbaw.de:8088/fedora/objects/WebLichtWebServices:5/datastreams/cmdi/content)
- [Translation API free tiers](https://www.edenai.co/post/top-10-machine-translation-apis); [Azure free tier](https://apiscout.dev/blog/best-translation-language-apis-2026); [DeepL plan changes](https://simplelocalize.io/blog/posts/ai-machine-translation-cost-comparison/)
- [Piper voices and licences](https://tts.ai/voices/piper/?lang=mk)
- Language Reactor: [AI features](https://immersivetranslate.com/en/compare/immersive-translate-vs-language-reactor/), [frequency ranking](https://forum.languagelearningwithnetflix.com/t/how-to-install-language-reactor-oxford-3000-words/26831)
- FluentAI: [tutorial](https://fluentai.pro/tutorial), [store page](https://extpose.com/ext/300473/en-AU), [Firefox listing](https://addons.mozilla.org/fr/firefox/addon/fluentai-app)
- Lingopie: [llms-full.txt](https://lingopie.com/llms-full.txt), [review](https://lingtuitive.com/blog/lingopie-review)
- Trancy: [manual index](https://manual.trancy.org/en/llms.txt), [changelog](https://cf.trancy.org/changelog), [older changelog](https://www.trancy.org/changelog?page=3), [Firefox listing](https://addons.mozilla.org/addon/trancyfordesktop/)
