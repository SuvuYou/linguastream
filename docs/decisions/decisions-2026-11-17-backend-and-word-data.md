# Decisions · 2026-11-17

Newest first. Rules and index: `decisions/README.md`.

## D-069 · D-043 limits confirmed · 2026-11-17 · accepted
**Decision:** The limits recorded in D-043 are confirmed by the developer: the capture code stays limited to youtube.com and our own domain; word lookup on other sites sends only the selected word or phrase and stores nothing unless the user saves the word.
**Closes** the last point of D-068.

## D-068 · Corrections to earlier entries · 2026-11-17 · accepted
Found in the review of the whole decision stream. The earlier entries stay as written; read them with these corrections:
- **D-051, demo on Vercel:** Vercel would host only the pages; the demo still needs an API and a database for search and review, which would run on the VPS. Taking load off the server needs a fully static demo. Demo hosting is open again (Q-32).
- **`cost.md`, punctuation:** it is a separate LLM call before translation (D-026), not part of it, so it costs about as much as translation: roughly $0.06 per hour of video in total, not $0.03.
- **D-056, full popup:** shows the dictionary translation in v1 (D-058), not the translation in this sentence.
- **D-042, card contents:** the card no longer stores one context; context lives on connections (D-047). Direction is still only display.
- **D-045, open question:** answered by D-047 (one schedule per word).
- **D-043:** the limits on lookup (capture stays youtube.com-only; only the selected word is sent) were added while recording and are not yet confirmed by the developer.

## D-067 · Word search uses lemma arrays; full-text search only for free-text phrases · 2026-11-17 · accepted
**Decision:** Finding a word (connections list, "find other cases", search by dictionary form) uses the per-line lemma arrays (D-052). Postgres full-text search (D-011) is kept only for free-text phrase search in the search overlay.
**Why:** two systems answering the same question; lemma arrays match by dictionary form, full-text search by stem.
**Narrows** D-011 and D-049.

## D-066 · Uploads postponed; a privacy note for friends · 2026-11-17 · accepted
**Decision:**
- **Uploads (D-040) are postponed.** The design stays recorded; nothing is built until it is picked up again from the bottom of the feature list.
- **Friends get a one-page privacy note:** what is stored, which services process it (Firebase, Gemini, the server host, Sentry), and how to have it deleted.
**Why:** uploads carry the weakest legal point added this week and are at the bottom of the list anyway. Running a server that holds other people's accounts and data is probably not covered by the household exemption, so an information duty likely applies even to friends (an assessment, not legal advice).
**Updates** D-038 (no public privacy policy; a private note instead) and D-040.

## D-065 · Gloss translation prompt includes the word's context · 2026-11-17 · accepted
**Decision:** When Gemini translates a gloss into Ukrainian (D-060), the prompt contains the German word, its part of speech, the English gloss and an example, and asks for the Ukrainian equivalent, not a translation of the English string alone.
**Why:** English glosses are often terse labels; translating them bare loses the meaning.
**Updates** D-060.

## D-064 · Punctuation: punctuated text from the LLM, edit list by word alignment · 2026-11-17 · accepted
**Decision:** The LLM returns the punctuated, capitalised text. Code aligns its words with the captured words, derives the edit list from the alignment, and rejects the result if any word was added, removed or changed. The guarantee of D-025 (the learner's text is never rewritten) stays.
**Why:** LLMs are unreliable at counting word positions; an edit list returned directly would fail validation often.
**Cost:** a separate call before translation, about $0.03 per hour of video (D-068).
**Updates** D-025 and D-050.

## D-063 · Words with several meanings: all meanings on the back, connection meanings marked · 2026-11-17 · accepted
**Decision:** The schedule stays per word (D-047). The back of the card lists the word's meanings; the meanings of its connections are marked as the ones being learned. Each connection stores its meaning when known.
**Open:** how a connection gets its meaning: Gemini picks the dictionary sense at save time (D-010), or the user picks it from the list when saving (Q-34).
**Updates** D-047 and D-058.

## D-062 · Order of work: study plan, spikes, feature order; learning in parallel · 2026-11-17 · accepted
**Decision:**
1. Study plan (phase 2).
2. Spikes: MV3 capture on youtube.com and in the embed, Firebase sign-in inside the extension, the punctuation step on about 10 real videos.
3. Feature order and a rebuilt roadmap with a **Core** section, so the smallest useful version ships first; everything else follows in order.
4. Designs, folded into the roadmap.
5. Follow the roadmap.

Learning runs in parallel, just in time: each roadmap step starts with a short study block for what it uses. Code is not held back until a study phase is finished.
**Supersedes** D-046 ("nothing is built before its concept is learned").

## D-061 · What this project is · 2026-11-17 · accepted
**Decision:** LinguaStream is **a portfolio and learning project used by a few friends.** When goals conflict, decisions favour a small, well-built core and a strong backend story over product breadth.
- The non-goal "no technology added only to list it on a CV" is replaced by: **learning is a legitimate reason to use a technology, but each one is used properly, not decoratively.**
- Differentiators matter for the portfolio story. Only differentiator 1 (searching your own library, with connections) is distinctive; competitors already show coverage per video, clip-based cards and grammar tags.
- **No lawyer consultation** for the friends-only system (D-015 stands; the D-034 recommendation is set aside). The unverified assumptions stay listed.
**Updates** D-048, `vision/product.md`, `vision/differentiators.md`.

## D-060 · Ukrainian glosses: translated English glosses, filled at word-pack build · 2026-11-17 · accepted
**Decision:** Dictionary glosses in Ukrainian (and later other native languages) are translations of the English Wiktextract glosses, made with Gemini (D-058) and cached for everyone (dictionary data, not user content). When a video's word pack is built, its missing glosses are translated in one batch call and added to the shared cache, so every transfer fills in more of them. A word looked up outside a pack (page-word popup) is translated on first lookup the same way.
**Rejected:** writing a Ukrainian Wiktionary extractor (kaikki.org has no Ukrainian edition; weeks of Python work, unknown German coverage).
**Answers** Q-17.

## D-059 · Project management on GitHub Projects · 2026-11-17 · accepted
**Decision:** Work is tracked on a GitHub Projects board linked to the repository. The docs stay the record of decisions and specs; the board tracks the work. Specs in `changes/` become issues.
**Pending:** GitHub is not yet connected to Claude, so the board is set up once it is.

## D-058 · Word lookup v1: dictionary translation, Wiktextract, spaCy, Gemini; "Save" and "connection" · 2026-11-17 · accepted
**Decision:**
- The **full popup shows the regular dictionary translation** in v1. Translating the word in its sentence (an LLM call) comes later.
- **Sources:** Wiktextract (English Wiktionary) for dictionary data, spaCy for the grammar of the word in its sentence, Gemini where a model is needed. Audio is left out for now.
- **Word pack:** at transfer, the server builds one bundle per video from its own Postgres copy of Wiktextract: every lemma in the video with a short gloss in the user's native language, part of speech and gender. The watch page loads it once; the small popup needs no request.
- **Badges:** word-level badges (part of speech, gender, plural type, separable or reflexive) come from Wiktextract and are stored on the word; occurrence-level badges (tense, person, number, case) come from the line's spaCy data and are stored on the connection. A word without connections has word-level badges only; filters on occurrence-level badges skip it.
- **Terms:** the button says **Save**; the saved moment is a **connection**.
**Answers** Q-13 except the Ukrainian glosses (Q-17).

## D-057 · Languages: learning, native and UI are separate; v1 scope · 2026-11-17 · accepted
**Decision:** The system treats three language settings independently, and is built so German, English and Ukrainian can each fill any of them, except that Ukrainian is never a learning language. Portuguese is added as a learning language later.
- **v1:** learning German; subtitle translation into any native language; dictionary glosses in English and Ukrainian; UI in English with translation support (i18n) in place from the start.
- Anything keyed by language (dictionary entries, glosses, frequency, models) carries a language code, never an implicit "German".
**Narrows** Q-17 to how Ukrainian glosses are produced (`research/word-data-sources.md`).

## D-056 · Word lookup levels and what each shows · 2026-11-17 · accepted
**Decision:** Four levels of word lookup:
1. **Page-word popup** (any website, D-043): one or a few translations, very fast; buttons to change status and to save.
2. **Small popup** (subtitles; on hover by default, the trigger is customisable): one or a few translations, very fast; status and save buttons.
3. **Full popup** (subtitles; on click by default, customisable): translation of the word in this sentence, grammar badges, status and save buttons.
4. **Sidebar details** (how it opens is not decided; perhaps a button in the full popup): the word with grammar badges, and tabs for Meanings (the fitting one highlighted, each with examples and translations), Forms, Phrases and related words, and Etymology. Later: synonyms, antonyms, collocations, usage tips, audio.
- **Grammar badges:** part of speech, gender, tense, person, number (more possible). They are also used to sort and filter the vocabulary.
- **Grammar breakdown** of a whole sentence: not designed yet; decided at the wireframe and design step.
**Open:** the word for the save action in the glossary; how badge data is filled when a word is saved without a subtitle line (Q-13).

## D-055 · German compounds: nothing for now · 2026-11-17 · accepted
**Decision:** Compound nouns missing from the dictionary are left as they are for v1: they count as unknown in the coverage score. Splitting them (on lookup or during processing) goes to the bottom of the feature list.
**Answers** Q-18.

## D-054 · Monorepo: pnpm workspaces with Turborepo; contracts published as a package · 2026-11-17 · accepted
**Decision:** The main repository becomes a pnpm + Turborepo monorepo: `apps/web` (Next.js), `apps/api` (NestJS and the worker), `packages/db` (Prisma schema), `packages/contracts` (shared Zod schemas). The extension lives in its own private repository (D-039), so `packages/contracts` is published as a small versioned package that the extension installs; the schemas hold nothing secret.
**Why:** both apps share the Prisma schema (D-049); Turborepo caches builds and tests in CI and is on the study plan.
**Answers** Q-33.

## D-053 · Auth across the two apps and the extension · 2026-11-17 · accepted
**Decision:**
- **Web:** one domain, split by path. Caddy sends `/api/*` to NestJS and everything else to Next.js, so the existing Firebase session cookie reaches both. NestJS verifies it with the Firebase Admin SDK, including revocation. One shared auth check lives in the monorepo. Next.js server components forward the cookie when they call NestJS.
- **Extension:** token handoff. The server mints a short-lived Firebase custom token for the logged-in user; our page passes it to the extension (only our domain may message it); the extension signs in to Firebase and calls NestJS with its own ID token. Logout and account deletion revoke its session.
- NestJS accepts either the session cookie or an ID token.
**To check in the extension spike:** the Firebase SDK inside an MV3 extension.
**Answers** Q-14.

## D-052 · Per-line word data and per-video counts · 2026-11-17 · accepted
**Decision:**
- Each subtitle line stores a JSON list of its words: surface form, lemma, part of speech, morphology, character offsets and a **start time** where known. An indexed array of the line's lemmas answers "which lines contain this word".
- A table of lemma counts per video gives coverage and the ranked word list.
- Word start times come from YouTube's auto-caption word offsets (kept at capture; the edit-list normaliser does not change words, D-025) or from transcription. Manual captions have none: the player estimates them from text length (read-along).
**Rejected:** one row per word occurrence (about 8,400 rows per hour of video); reusing the full-text index (stems, not lemmas; no positions).

## D-051 · Operations: backups, deployment, server choice, demo hosting · 2026-11-17 · accepted
**Decision:**
- **Backups:** a nightly `pg_dump` copied to storage off the server, plus the provider's server snapshots as a quick safety net. A restore is practised at least once.
- **Deployment:** GitHub Actions builds the images; the server pulls them and restarts. No deploy dashboard (such as Coolify).
- **Server:** chosen after measuring the real load. Price range found on 2026-11-17: about €7–11 a month for 8 GB of memory, €13–20 for 16 GB or more; about €10–25 a month in total with backup storage.
- **Private instance:** everything stays on the VPS, Next.js included (D-006 stands).
- **Demo hosting:** decided once there is a demo. Vercel's free Hobby plan is the leading option for it (non-commercial personal use only; Vercel then goes into the demo's privacy note).
**Why:** GitHub Actions and Docker deployment are on the study plan; the load decides the server size; the read-only demo is the part that suits Vercel.

## D-050 · Models: LLM punctuation, spaCy `sm`, one translation model · 2026-11-17 · accepted
**Decision:**
- **Punctuation and sentences:** the LLM returns the edit list (D-025) for now. A different punctuation engine goes to the bottom of the feature list.
- **Parser:** spaCy `de_core_news_sm` first; a larger model only if needed.
- **Translation:** one model, no fallback provider for now; a failed job retries later. A fallback comes later.
- **Transcription fallback:** decided later (Groq's terms still to be checked before first use, D-040).
**Answers** Q-11 and Q-12 (start with these; measure accuracy when the grammar view is built).

## D-049 · Backend stack: NestJS, BullMQ, Postgres on the VPS, Postgres search · 2026-11-17 · accepted
**Decision:**
- **NestJS** holds the worker and the new backend modules (captures, dictionary, quotas). All existing Next.js API routes move to NestJS gradually; Next.js ends up serving pages only.
- **Queue:** BullMQ on the Redis already planned, with Redis persistence on. Jobs carry IDs, never transcript text. No extra cost.
- **Postgres** is self-hosted on the VPS, in Docker Compose.
- **Search:** Postgres full-text search confirmed (D-011 accepted).
- **spaCy integration** (sidecar or a call per job) is decided after the parser is in use; **quota units** later (not blocking).
**Why:** NestJS and queues are on the study plan; Redis is already there; hosted Postgres costs more than the cap allows (Neon now bills by usage, the paid tiers of Supabase and DigitalOcean start at $25 and $15 a month).
**Answers** Q-02, Q-07, Q-15. **Consequence:** two apps share the Prisma schema, so the repository becomes a monorepo; both check the Firebase session.

## D-048 · Study plan covers app and non-app technologies separately · 2026-11-17 · accepted
**Decision:** The study plan (D-046, phase 2) has two parts: technologies the app uses, learned by building it, and technologies studied separately because they appear in job postings (for example AWS, GraphQL, MongoDB). The non-goal "no technology added only to list it on a CV" stays: the second part is not built into the app.

## D-047 · Vocabulary, connections and cards · 2026-11-17 · accepted
**Decision:**
- **Connection:** one saved moment of a vocabulary word: the video, the line, and a copy of the sentence and its translation.
- **Schedule per word.** A card's front shows a randomly chosen connection of the word (fully random, no weighting), skipping uploads whose file is not on this device. The back has a button that shows all connections.
- **Words without connections are allowed**, for example from a word list later, or after their connections are deleted. Their card shows a dictionary example from Wiktextract, with no clip.
- **Deleting a connection** never deletes the word, even when it is the last one.
- **Deleting a video** deletes its connections; the words stay.
- **Saving a word sets its status to "learning".** Setting a status never saves a word.
- Saving a word again adds a connection instead of a duplicate card.
**Answers** Q-04. **Supersedes** D-E4 (cards keep their copied sentence when a video is deleted).

## D-046 · Planning comes before the roadmap · 2026-11-17 · accepted
**Decision:** Work proceeds in this order:
1. Settle the backend: infrastructure, models, translation, pipeline, stack and cost (`roadmap/phase-1-backend.md`).
2. A study plan: the technologies the project uses, with a learning roadmap modelled on the developer's frontend → backend transition plan.
3. Cleanup and spikes, and the roadmap rebuilt in study-plan order, so nothing is built before its concept is learned. Runs in parallel with 1 and 2.
4. Designs, folded into the roadmap.
5. Follow the roadmap.

Until step 3, `roadmap/steps.md` is a draft.
**Why:** the model, infrastructure and feature decisions still change the steps.

## D-045 · Lists are decks; one vocabulary, words in many decks · 2026-11-17 · accepted
**Decision:** "Lists" (feature review #44) and decks are one concept. Each user has one global vocabulary of saved words, and each word can belong to one or more decks (many-to-many). A deck has a name, description, icon and colour. The limit of 50 decks per user (D-E8) stands.
**Open:** where the review schedule lives, per vocabulary word or per saved occurrence (Q-04).
**Supersedes:** the current model where a card belongs to exactly one deck.

## D-044 · One-shot AI explanation allowed as an exception to "no AI chat" · 2026-11-17 · accepted
**Decision:** An "Explain" button that returns one AI explanation of a line or word is allowed. Free-form chat and "ask the video" stay non-goals. It sits at the bottom of the feature list (feature review #17) and goes through the AI limiter.
**Updates:** the non-goal in `vision/product.md`.

## D-043 · Extension: word lookup on any website · 2026-11-17 · accepted (built later)
**Decision:** The extension will translate words the user selects or points at on any website, not only youtube.com. Built after the thin extension (D-021). Guardrail 15 changes: the **capture** code stays limited to youtube.com and our own domain; the **lookup** may run on other sites. It sends only the selected word or phrase to our API, never page content in bulk, and stores nothing unless the user saves the word.
**Why:** it is plain dictionary lookup, not capture, so the caption reasoning (D-014, D-015) does not apply. The extension is not in a store (D-039), so the store-review risk of broad permissions does not arise for now.
**Open:** host permission for all sites, or `activeTab` (access only after a user gesture such as a context-menu entry or a shortcut). Hover lookup needs the former.
**Updates** guardrail 15.

## D-042 · Review direction is a display choice · 2026-11-17 · accepted
**Decision:** A card stores its word, translation and context once. A review session shows either the word or the translation on the front (a session setting). Both directions share one FSRS schedule per card.
**Why:** one card per item; separate schedules per direction would double the cards.

## D-041 · Word status is independent of cards and FSRS · 2026-11-17 · accepted
**Decision:** Word status (unknown, learning, known, ignored per lemma, D-005) and the card schedule (FSRS, D-004) are separate systems. Status is the user's own judgement and is never changed by the scheduler: a word can stay "learning" while its card waits a month. Changing a status from a word list or popup changes only the status. The "mark as known?" prompt for mature cards stays a suggestion the user answers.
**Why:** from the feature review (Lingopie mixes manual stages with spaced repetition); FSRS sets the schedule itself.
**Partly answers** Q-04.

## D-040 · Uploads: audio processed and discarded, no media stored, files matched by fingerprint · 2026-11-17 · accepted
**Decision (private instance):**
- **No video and no audio is stored on the server.** The video plays from the user's own disk.
- **Flow:** the browser extracts the audio track from the local file (copy, no re-encode) → resumable chunked upload → the worker converts it to compressed mono audio → chunks transcribed in parallel through a transcription provider interface (Groq Whisper first: $0.04/hour turbo, $0.111/hour large-v3; fallback provider TBD) with overlap and timestamp stitching → normal pipeline (normalise, spaCy, translate, index) → audio deleted. Deletion is enforced and covered by a test.
- **Fallback if browser extraction fails for a file:** upload the whole video, extract the audio on the server, delete the video immediately (processed, never kept).
- **Subtitles already in the file** (MKV subtitle tracks, or a matching SRT/VTT) are used instead of transcription, at no cost. This re-enables the SRT/VTT import that D-030 disabled, for the private instance.
- **File identity:** a fingerprint (file size + SHA-256 of sampled 1 MB pieces from start, middle and end) is stored with the library entry. On any device the user picks the file and it is matched by fingerprint; renamed or moved files still match. Remembering the file (File System Access handle) is local to each browser. **The server tracks no devices.**
- **Without the file:** transcript, translation, search, word lists and cards still work; playback and card audio show "Locate file to play".
- **Quotas and the spend cap** (D-022) also cover transcription.
- **Everything runs on the hosted server.** No home-PC worker.
**Why:** storing media costs money and adds hosting exposure for nothing the user cannot get from their own copy.
**Cost:** about $0.07 per hour of audio (transcription $0.04 + translation ~$0.03); 10 users × 5 hours a month ≈ $3.50. No storage cost.
**Accepted limits:** card clips replay only where the file is available; a different encoding of the same film needs its own upload; browser playback depends on the file's format (HEVC and some MKV may not play; there is no server-side video conversion); remembering files works only in Chromium.
**Legal:** the user's own files, lawful sources only (terms). Pirated downloads and rips that break copy protection are not covered by the private-copy exception; anything reported or known to be unlawful is deleted. The transcription provider is a third-party processor: check its retention, training and age terms before use.
**Spike needed:** browser audio extraction on large MKV and MP4 files.
**Rejected:** storing the full video or a playback proxy (cost, CPU for conversion); keeping the compressed audio for card clips (no reason to store it); a home-PC worker (must be hosted the whole time).
**Resolves** Q-19. **Updates** D-030: Plyr is only a UI choice (a free library); self-hosted WhisperX is not used.
