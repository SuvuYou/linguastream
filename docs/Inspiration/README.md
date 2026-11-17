# Inspiration: features seen in similar products

Screenshots grouped by feature. File names are `{site}-{what it shows}`. Sites: **fluentai** (FluentAI), **languagereactor** (Language Reactor), **trancy** (Trancy), **tubevocab** (TubeVocab), **lingopie** (Lingopie), **other** (unidentified site).

Each group lists the features visible in its screenshots and which sites have them. The last line of each group points at the LinguaStream area it relates to (`docs/features/target/`).

## discover-catalog
- Video catalog with **known % / unknown / learning counts per video**, filters "at my level / easier / harder", platform and language filters, "continue watching" banner (fluentai)
- Catalog rows by level (Beginner / Intermediate / Advanced) with **CEFR range and speech pace** tags, ASR badge, paste a YouTube or Netflix link, prompt to install the extension (other)
- Home page: continue watching, followed YouTube channels and podcasts, today's cards with "start studying / reviews only", 7-day review forecast, daily minutes goal, streak, study heatmap, retention (trancy)
- Catalog with level, duration and genre filters, rows by genre, featured title (lingopie)

→ Curated catalog (later), `vocabulary.md` (coverage per video)

## onboarding-placement
- Onboarding wizard: native language, then pick at least 3 YouTube channels by category (trancy)
- **Placement by frequency band**: rows of sample words per rank (100, 200, 300…), click the last row where you know all words, live preview of a coloured example text (languagereactor)

→ `vocabulary.md` (placement)

## player-layout
- Own player page for a YouTube video with transcript sidebar, "AI transcribe", download, bookmark (trancy)
- Theater mode with blurred ambient background and collapsible sidebar (trancy)

→ `watching.md`

## subtitle-display
- Per track: **show / blur / hide**, separately for original and translation (trancy, fluentai)
- Style per track: size, colour, font, bold, background opacity, background blur, outline/shadow (trancy, fluentai)
- **Read-along highlight** of the current word: underline, highlighter, word fill (karaoke), focus (trancy); "live word highlight" (fluentai)
- Keep platform cue timing, or **join short cues into full sentences** (fluentai)
- Prefer the platform's own subtitles, fill missing lines; action buttons on subtitle hover (play audio, breakdown, copy, bookmark) (fluentai)
- Show the dictionary base form above bookmarked words (fluentai, paid)
- Keyboard shortcuts to toggle each track (lingopie)

→ `watching.md`

## playback-controls
- **Playback modes**: normal, pause after each subtitle, repeat each subtitle (fluentai); auto-pause at the end of every subtitle (lingopie)
- **Pause while the pointer is over the subtitles**, resume when it leaves (fluentai)
- Previous / repeat / next subtitle with keys (languagereactor, lingopie)
- **A–B loop** by clicking two sentence times in the transcript (trancy)
- Quick menu on the player: tracks, blur, size, languages, speed, volume, mode, import subtitles, theater mode (fluentai)
- Hide controls when idle, keep the subtitle visible after it's spoken (fluentai)
- Button inside the YouTube player that opens the video in the product's own "Learning Mode" (trancy) — the same idea as our transfer button

→ `watching.md`, `capture.md` (transfer)

## transcript-panel
- Transcript with words **coloured by status**, hover gloss, star a line, more menu (languagereactor)
- Read-along transcript: current line has **Explain** and **Save**; a **Grammar Index** section (lingopie)

→ `watching.md` (sidebar)

## word-popup
- Mini popup: glosses + **status buttons** (known / learning) (languagereactor, fluentai)
- Popup with glosses per part of speech, audio, "looked up N times", save, mark known (trancy)
- **Phrase popup**: multi-word expressions ("ich möchte") with listen, speak, explain; expandable breakdown with each word's lemma and grammatical features (lingopie)
- Grammar tags in the popup (gender, number, person, case) (lingopie)
- Tabs: meaning in this sentence, examples, forms, related (fluentai, paid)

→ `word-lookup.md`

## word-details
- Dictionary panel: status buttons, frequency rank bar, AI **Explain / Examples / Grammar** ("adjective in dative plural, agrees with …"), dictionary entries, links to external dictionaries, examples from the current video and from Tatoeba, AI chat tab (languagereactor)
- AI definition: syllables, IPA, senses with target-language definitions and examples, inflection forms, etymology, phrases, synonyms, related words, "examples from the video" (trancy)
- **Contextual meaning** of the word in this sentence, usage tips, collocations, synonyms / antonyms, **common mistake** (tubevocab)

→ `word-lookup.md`, `grammar.md`

## word-coloring
- Colour per status (unknown, learning, known, ignored), separate light/dark colours, background or text colour, sound per status, colour picker (fluentai)
- Known, suggested, marked-to-learn, don't-learn, special words; outline style; "suggested to known" ratio; dim rare words (languagereactor)
- Word stats overlay in the corner of the video (fluentai)
- Colour by **part of speech** instead of status (lingopie)

→ `vocabulary.md`

## words-in-video
- Words of the video by **occurrence count** or by **frequency rank band**, coloured by status, with known / learning / ignored totals and tag filters (languagereactor)
- Saved / learning / all words of the video with counts and glosses (trancy)
- Saved words of this video + "Take a quiz" (lingopie)

→ `vocabulary.md` (ranked word list)

## translation-sources
- **Translation engine picker**: free (Google, SiliconFlow) or LLMs; force AI translation (trancy)
- **Fallback order** of engines with a timeout, drag to reorder; keys to mark status (fluentai)

→ `processing.md`

## web-page-lookup
- Word popup on any web page text (e.g. the YouTube title); trigger by button, Alt+select or direct; auto-save looked-up words; AI precise definition (trancy)

→ Planned later, on any website (D-043)

## ai-explanations
- "Learning feed": AI explanation of the current line, suggested follow-up questions, free chat (lingopie)

→ Bottom of the list (`feature-review.md` #17); conflicts with the "no AI chat" non-goal

## vocabulary-notebook
- Word list with **status tabs**, translation, type, **source video**, next review, date; filter by video and list; import / export; bulk actions (set status, add to list, export, delete) (fluentai)
- **Custom lists** with icon, colour, description, "generate with AI" (fluentai)
- Saved words with **frequency rank**, context sentence coloured by status, tags, stage, source; sort by date or frequency; saved phrases (languagereactor)
- **Ready-made word lists** (Goethe A1–C1); stages To learn / Learning / Reviewing / Mature / Mastered; hide meanings to test yourself (trancy)
- Word lists shown as **book covers with an animation** (not visible in a still; `trancy-word-list-book-cover-animation.jpg` is the same screen) (trancy)
- Filters by **grammar features** (gender, POS, tense, person, number); last occurrence and count; SRS stage buttons (lingopie)
- Word detail: **clip of the last occurrence**, appearance count, last seen, SRS stage ("review in 15 days"); **personal translation and note**; practice games (flashcards, matching, quiz, build the sentence) (lingopie)

→ `review.md`, `vocabulary.md`

## flashcard-review
- Card front: word, audio, context sentence with **clip playback**, show translation; pause card, AI "populate missing details", edit (Ctrl+E) (fluentai)
- Card back with a **customisable layout** (reorder or remove POS, item, context, usage examples); FSRS-style buttons showing intervals; keyboard shortcuts (fluentai)
- Inline card editing, add usage examples (fluentai)
- Session summary with **undo last review** (fluentai)
- Session settings: language, list, status, mode (balanced / new only / reviews only), **direction** (word → meaning or meaning → word) (fluentai)

→ `review.md`

## progress-stats
- Streak, vocabulary size by stage (mastered = interval ≥ 21 days), review accuracy, daily activity chart, this week vs last week, XP, videos watched, yearly heatmap, learning report (tubevocab)

→ Not planned yet

## word-search-in-videos
- **Video dictionary**: search a word or phrase, see every video moment where it is said, with timestamps; search history, popular and recent searches (tubevocab)
- Result page: AI contextual meaning, collocations, synonyms, common mistakes, **"create card" from any clip** (tubevocab)
- **Word graph**: a word linked to the videos it appears in; select one to play that moment with transcript and analysis (tubevocab)

→ `search.md` (differentiator 1)

## own-media
- Upload a video or audio file or open a link; recent files with rename and delete; **AI subtitles** with step progress (extract audio, upload, …); dual subtitles on your own file (fluentai)

→ `library.md` (uploads, D-040)

## account-settings
- Personal info, display name, **delete account** (fluentai)
- Profile: learning and native languages, plan, monthly credits, theme incl. sepia, meaning language (fluentai)
- **Password and signed-in devices** (website, extension) with sign-out everywhere (fluentai)
- Usage per feature and credit spending chart (fluentai)
- Learning / native / interface language, auto-switch to the video's language (fluentai)
- User menu with credits and word counts (fluentai); settings, support, changelog (trancy)
- Plan, payments, **hide mature content**, daily goal widget (lingopie)

→ `account.md`
