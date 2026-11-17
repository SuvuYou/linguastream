# Decisions · 2026-11-15

Newest first. Rules and index: `decisions/README.md`.

## D-027 · Check embeddability before offering transfer · 2026-11-15 · accepted
**Decision:** Before showing the transfer button, the extension checks whether the video permits embedding. A video whose uploader disabled embedding cannot play in the webapp, so it is not offered. (The player data is believed to expose this; verify in the spike.)

## D-026 · Translate sentences, not caption cues · 2026-11-15 · accepted
**Decision:** Segmentation runs before translation. Whole sentences are translated and mapped back onto cues by time, rather than translating each three-word cue in isolation.
**Why:** Cue-level fragments translate badly, especially German, where the verb often lands in a later cue than its subject.

## D-025 · Normalisation returns a verifiable edit list, never rewritten text · 2026-11-15 · accepted
**Decision:** The normaliser preserves the captured word sequence exactly and returns a list of edits against it: punctuation insertions, capitalisations, and sentence boundaries ("after word 12: full stop", "word 13: capitalise"). Output is validated by stripping formatting and comparing the word sequence case-insensitively against the input; a mismatch is rejected and retried. The raw captured text is stored alongside, so a video can be re-normalised later with a better model without re-capturing.

**Scope of normalisation:**

| Job | In scope | Note |
|---|---|---|
| Punctuation insertion | Yes | Safe, verifiable |
| **Capitalisation** | **Yes** | Not cosmetic in German: it separates nouns from verbs, *sie* from *Sie*, and spaCy's tagger uses case as a feature. Lowercased ASR output tags badly even with perfect punctuation. |
| Sentence segmentation | Yes | Uses punctuation plus inter-word timing gaps |
| Fixing misheard words | **No, not in v1** | Cannot be verified mechanically, and a wrong "fix" teaches the learner something false. If added later, show it as a correction with the original visible. |
| Numbers, fillers ("äh"), speaker marks | No | Leave as spoken |

**Why an edit list:** it makes the dangerous failure mode — a model quietly rewording the learner's source text — structurally impossible rather than merely unlikely.
**Open (Q-11):** which normaliser. The edit-list constraint removes the main objection to using the LLM (it cannot change words if it only returns positions), which would save ~1 GB of RAM and one model to maintain. German auto-captions sometimes carry punctuation and sometimes do not, so the normaliser must handle both.

## D-024 · The browser gets the user's known word forms, not a form→lemma table · 2026-11-15 · accepted
**Decision:** To compute the score locally, the server expands the user's known lemmas into their inflected forms and syncs that set to the extension. The browser answers "is this form in the set?" — no dictionary, no mapping.
**Why:** A complete German form→lemma table is millions of entries and tens of megabytes. An expanded set for ~3,000 known lemmas is ~300–500 KB, or ~50 KB as a Bloom filter.
**Consequences:**
- "New words" becomes "new word *forms*" unless a lemma map for the most frequent few thousand words is also shipped. Decide when the feature is built.
- The score is **approximate**: the browser's matching is cruder than spaCy's, so the extension and the webapp can differ by a point or two. Label it as approximate.
- German compounds ("Geschwindigkeitsbegrenzung") are in no table and spaCy does not split them by default, so some nouns always read as unknown (Q-18).

## D-023 · Translation goes behind a provider interface; cost corrected · 2026-11-15 · accepted
**Decision:** Translation calls go through a provider interface, not a hard-coded model. Disable "thinking" where the model supports it, since those tokens bill as output.
**Correction:** D-018 priced a 1-hour video at ~$0.008 using Gemini 2.5 Flash-Lite ($0.10/$0.40 per 1M tokens). That model is on Google's deprecation list (the pages disagree: one gives a shutdown of 16 Oct 2026 with 3.1 Flash-Lite as the replacement, another says none announced). The codebase already calls **gemini-3.1-flash-lite**, listed by one comparison at **$0.25/$1.50** per 1M tokens — roughly **$0.03 per 1-hour video**, or **$4–5/month** at 150 hour-videos. Confirm against Google's own pricing page before relying on it.
**Why the interface:** cheap models are retired on short notice, and this one is load-bearing for the budget.

## D-022 · Transfer quota is counted in characters, server-side · 2026-11-15 · accepted
**Decision:** The transfer quota is enforced on the server in **characters of transcript**, shown to the user as approximate minutes. Plus: a maximum size per transfer, and a repeat transfer of the same video by the same user is treated as the same job rather than reprocessed. The monthly spend cap is enforced in Redis by us, not left to the provider's budget alerts.
**Why:** Everything in a transfer — text, timings, claimed duration — comes from the user's browser and can be forged. A minutes-based quota can be defeated by sending a novel labelled as a one-minute video. Characters are what actually cost money.
**Supersedes** the "cap transfers by minutes of video" formulation, which survives only as the unit shown in the UI.

## D-021 · Two surfaces, one source of truth: capture vs transfer · 2026-11-15 · accepted (capture-only-on-youtube.com part: see D-028)
**Decision:** The product has two surfaces over one database.

| | **Capture** (on youtube.com) | **Transfer** (into the webapp) |
|---|---|---|
| Trigger | User opens a video with captions on | User clicks "Open in LinguaStream" |
| Runs | Entirely in the browser | On the server |
| Produces | Known-% score and new-word count for that video | Segmentation + punctuation, full track translation, full spaCy pass, search index, library entry |
| Cost | €0 | ~$0.01 per 1-hour video + CPU |
| Stores anything server-side | **No** | Yes |

- The score is shown **only on a video the user has opened**, never on search results, thumbnails or the YouTube home page. Scoring a results page would mean fetching many tracks at once, which guardrail 2 forbids.
- The score is computed **in the browser** from a form→lemma table and the user's known-lemma list, both read-only syncs from the server. Nothing is copied to the server until transfer.
- **The extension ships thin first:** score, new-word count and the transfer button. A Language Reactor-style overlay (hover translation, word panel, dual subtitles inside YouTube) comes later, once there are users.
- **Quota: transfers are capped by minutes of video** per user per period, not by count — a three-hour lecture and a five-minute clip cost very differently. Captures need no quota because they never reach the server.

**Why:** Expensive processing happens only for videos a user explicitly chooses to study, which removes the windowing machinery entirely. The score on the YouTube watch page is the clearest placement of the product's differentiator, at the moment someone is choosing what to watch.
**Consequences:** Scoring logic exists in the browser and on the server, so a shared package becomes necessary rather than optional. The browser's lemmatiser is a lookup table while the server's is spaCy, so the two scores can differ slightly — export the table from the same source to keep them aligned.
**Risk:** the whole content pipeline now depends on the extension passing Chrome Web Store review. The "paste transcript" fallback (D-014) becomes more important, not less.

## D-020 · Sentence segmentation is a precondition for parsing · 2026-11-15 · accepted
**Decision:** At transfer time, before any syntactic analysis, subtitle cues are re-segmented into sentences with punctuation. Manual caption tracks already carry punctuation and only need re-segmenting; auto-generated tracks need punctuation restored first. Sentence objects keep the start/end time of their first and last word so clip links still work.
**Why:** Caption cues are not sentences, and auto-generated tracks arrive without punctuation. A parser given unsegmented text produces nonsense, so this matters more to grammar accuracy than the choice of parser model does.
**Open:** which method (Q-11).

## D-019 · spaCy `de_core_news_sm` in the worker, replacing Google Cloud Natural Language · 2026-11-15 · accepted (pending spike)
**Decision:** Tokenizing, lemmatizing and morphological/syntactic analysis run locally with spaCy `de_core_news_sm` in a small Python service (or CLI invocation from the Node worker, to avoid holding ~200 MB resident). The whole video is analysed once on capture. Google Cloud NL is dropped from the design.
**Why:** Fixed, predictable cost instead of one that scales with users and with the no-deduplication rule. ~€3/month of extra VPS RAM beats $0.028 per 1-hour video past ~100 videos a month, and a hard budget cap favours predictability. Also removes a processor from the privacy policy.
**Not `md`/`lg`:** they differ from `sm` mainly in word vectors, which this app doesn't use; the accuracy gain for tagging and parsing is roughly a point.
**Open (Q-12):** whether any parser is accurate enough on subtitle German for case labels. The spike compares `sm` on raw captions, `sm` on punctuation-restored captions, and `de_dep_news_trf` on punctuation-restored captions. If the transformer wins on quality but not on resources, a possible hybrid is `sm` for the whole-video lemma pass and `trf` on demand for one sentence.
**Consequence:** Python returns to the stack (one container), after D-007 had removed it.

## D-018 · Translation by Gemini Flash-Lite, lazily per watched window · 2026-11-15 · accepted
**Decision:** The translation track is generated by a cheap LLM (Gemini 2.5 Flash-Lite class), for the **whole track in one batched job at transfer time** (D-021). Nothing is translated for a video nobody transfers.
**Simplified 2026-11-15:** this originally translated lazily, one ~10-minute window at a time as the user watched. The transfer button makes that unnecessary — no windows, no prefetch, no partial state — and removes the problem of punctuation depending on the translation call.
**Why:** ~$0.008 per 1-hour video, against $0.55 (Azure), $1.10 (Google Translate) or $1.38 (DeepL) for the same text through a dedicated translation API. Transferring only what the user chooses removes most of even that. Realistic spend: $1–2/month.
**Reliability requirement:** the model must return exactly one translated line per input line. Send numbered lines, validate the count and numbering on return, and retry the mismatched chunk.
**Replaces:** DeepL and LibreTranslate for track translation.

## D-017 · No DeepL; word meanings come from the dictionary · 2026-11-15 · accepted
**Decision:** DeepL is removed from the design entirely. Word meanings come from the Wiktextract table, and Gemini picks which dictionary sense fits the sentence.
**Why:** The free tier (500k characters a month) is about 4,000 contextual lookups across all users, which is not enough; and the dictionary already answers the question offline, instantly and for free. Removes a paid dependency and a processor from the privacy policy.
**Updates:** D-010.

## D-016 · Capture the source track only · 2026-11-15 · accepted
**Decision:** A capture takes the source-language track and nothing else. The user is never asked to switch caption tracks in the YouTube player to capture a translation.
**Why:** It would add UX friction, and YouTube remembers the caption-language choice, so capturing a translation would change what the user sees on YouTube afterwards. Translation is generated by us instead (D-018).
**Also keeps** the extension strictly passive (method 3 only) with no reason to drift towards driving the player (method 4).

## D-015 · Corrected legal basis; real address; no lawyer review · 2026-11-15 · accepted
**Decision:** (1) The legal basis for storing captured captions is the Federal Court of Justice's recorder case law: Internet-Radiorecorder (I ZR 32/19, 2020) and Internet-Radiorecorder II (I ZR 14/21, 2024). The customer alone is the maker of a copy when they start a fully automated process on the provider's equipment, users can rely on §53(1) sentence 1 UrhG, and the provider isn't liable without an unlawful act by the user. (2) The Impressum uses the developer's real address, not a c/o service. (3) No lawyer consultation is planned; the remaining uncertainty is accepted and listed under `legal/unverified-assumptions.md`.
**Why:** The recorder cases are closer to this app than the cases D-009 cited, and they also covered commercial services, so "free of charge" is a safety margin and not the foundation.
**Consequence:** The pipeline must stay fully automated: no manual handling of user transcripts, no admin view of transcript text.
**Corrects:** the reasoning in D-009. **Updates:** D-008 (c/o address).

## D-014 · Capture method: passive copy of the player's own caption response · 2026-11-15 · accepted (pending spike)
**Decision:** The extension captures captions by copying the response YouTube's own player loaded, after the user switched captions on and clicked capture (method 3 in `legal/extension-capture-methods.md`). Fallback if this proves unworkable or the Chrome Web Store rejects the extension: the user pastes YouTube's "Show transcript" panel (method 1). Never: our own caption requests with the player's token, generating tokens, server-side fetches, or touching video or audio streams.
**Why:** YouTube gates caption downloads behind a proof-of-origin token produced by its player. German courts treat YouTube's protection of video streams as an effective technical measure (OLG Hamburg, 5 U 54/23), and the private-copy rule doesn't permit circumvention. Passive reading never defeats or imitates that check. Language Reactor appears to work the same way (inferred from public evidence, not confirmed).
**Confirmed on youtube.com (spike, 2026-11-15):** with captions switched on, the player requests the track over **XMLHttpRequest** (not `fetch`) and the hook captured the full response: `GET /api/timedtext?...&fmt=json3&c=WEB&pot=...`, HTTP 200, 8,079 bytes of json3 with per-cue `tStartMs`/`dDurationMs` timings. One request per track, fired when captions are turned on. Hooking `window.fetch` alone captures nothing, so the extension must patch `XMLHttpRequest.prototype.open/send` (patch both anyway).
**Still open:** whether the same hook works inside an embed on our own site (Q-06). Driving the player to load translation tracks (method 4) needs its own decision.

## D-013 · Login as a modal on a third-party-free landing page · 2026-11-15 · accepted
**Decision:** Public pages make no third-party requests. Sign-in is a modal on the landing page; the Firebase SDK is imported dynamically only when the modal opens.
**Why:** Scanners target third-party requests on public pages (the "Google Fonts" style of GDPR warning letters). Firebase is strictly necessary for login, but it shouldn't load for visitors who never sign in.

## D-012 · Captured transcripts are processed asynchronously through a queue · 2026-11-15 · accepted
**Decision:** A capture stores the raw captions, then enqueues a job: punctuation and sentence fixing, Google Cloud Natural Language analysis, lemma counts, search indexing. Progress goes to the UI over SSE. The later upload pipeline reuses the same queue and worker.
**Why:** Analysis is slow and calls paid APIs, so it needs retries, quotas and a failed state. Building the queue with the YouTube flow brings it forward instead of waiting for uploads.
**Open:** queue technology (Q-02).

## D-011 · Postgres full-text search replaces Meilisearch · 2026-11-15 · proposed
**Decision:** Phrase search uses Postgres full-text search (`tsvector` with the German configuration, GIN index) plus `pg_trgm` for fuzzy matching, always scoped by `user_id`.
**Why:** Libraries are private and small per user, so Meilisearch's scale isn't needed. One less service to run, one place to delete from on account deletion, and it shows SQL skills.
**Replaces:** Meilisearch (D-E6).

## D-010 · Word data: dictionary first, AI only where needed · 2026-11-15 · accepted
**Decision:** Meanings, forms, gender and inflection tables from Wiktextract (imported into Postgres); lemma, morphology and dependency tree from Google Cloud Natural Language (once per video); frequency from FrequencyWords converted to lemmas; single-word translation from DeepL, cached; Gemini only to pick which dictionary sense applies in a sentence, cached. A Redis-backed AI limiter (per-user daily quota + global monthly cap) falls back to dictionary-only data.
**Why:** Speed (dictionary lookups take milliseconds), cost, and predictability.
**Replaces:** Gemini-generated word profiles as the main source (D-E5).

## D-009 · YouTube captions captured by the user, stored per user on the server · 2026-11-15 · accepted
**Decision:** A Chrome extension, started by the user, captures one video's captions at a time and sends them to the user's private library (Postgres, scoped by `user_id`). "Paste transcript" (from YouTube's own transcript panel) is the fallback if the Chrome Web Store rejects the extension.
**Why:** Storing a user's own copy in that user's private cloud space can be a private copy (CJEU *Strato* C-433/20, BGH I ZR 6/19), as long as the user makes the copy, nothing is shared, and the service is free. A service that captures content itself can't rely on that (CJEU *VCAST* C-265/16).
**Replaces:** D-002 (extension import into a server pipeline), and the intermediate idea of keeping YouTube text only in the browser (IndexedDB), which was dropped.
**Updated by:** D-014 (capture method) and D-015 (corrected legal basis).

## D-008 · Hosting and legal setup · 2026-11-15 · accepted
**Decision:** The developer runs the app from Germany as a public service, under their own name. Full Impressum under §5 DDG (name, an address where legal documents can be served via a c/o service, email, contact form); privacy policy naming the controller and processors; DSA duties of a hosting service (not an "online platform", because libraries are private).
**Why:** The operator's residence decides which law applies. Hosting offshore or under someone else's name doesn't remove the obligations and would be misrepresentation. A free, non-commercial project needs no business registration.
**Rejected:** anonymous or offshore hosting, Njalla-style domain privacy as a substitute for an Impressum, a friend as the named operator.
**Updated by:** D-015 (real address instead of a c/o service).

## D-007 · The server never fetches from YouTube · 2026-11-15 · accepted
**Decision:** No yt-dlp, no caption endpoints, no audio downloads, no third-party transcript APIs. Remove `/api/youtube/subtitles` and the yt-dlp and WhisperX-on-YouTube paths.
**Why:** The service would be making the copy (VCAST), it breaks YouTube's terms, datacenter IPs are blocked, and it's a bad story to tell recruiters.
