# Decisions 2026-11-20: spikes done

## D-086 · Word-data spike closed; gap decisions made during development · 2026-11-20 · accepted
**Result (spike 004, first run):** the German Wiktextract import works (53 s, 735 MB in Postgres, gender on 99% of nouns), covers 85–97% of the lemmas in 16 videos, word packs are 2–15 KB gzipped, Gemini sense picks cost ~$0.00007 each and look better than "first sense", Ukrainian glosses cost under a cent per video. Weak spots: unknown compounds and new words (e.g. "Nebenmission", which Language Reactor finds), poor first glosses for frequent function words, near-duplicate senses. Parser bugs (auxiliaries as forms, separable verbs, homographs, memory) were fixed in the spike code; the rerun was not done.
**Decision:** close the spike. How to fill dictionary gaps, default glosses for frequent words, compounds and Q-34 are decided when the dictionary step is built (Q-34, Q-40, Q-41, Q-42). Next: the feature order and roadmap.

## D-085 · Prisma stays the database library · 2026-11-20 · accepted
**Decision:** Prisma remains the ORM for both apps, with the schema in `packages/db` (D-054), on the self-hosted Postgres on the VPS (D-049). Queries Prisma doesn't express well (lemma-array lookups with GIN indexes, full-text search, bulk `COPY` imports for the dictionary) use raw SQL (`$queryRaw` or Prisma's typed SQL files), kept in one place per module.
**Why:** the current app already uses it, least rework. Compared with Drizzle and Kysely on 2026-11-20; it had only been carried over from D-E1 before.
**Note:** Neon (D-E1's hosted Postgres) is already replaced by D-049; this decision is only about the library.

## D-084 · Rejected punctuation chunks keep their punctuation; long runs split at pauses · 2026-11-20 · accepted
**Decision:**
1. **Salvage:** when the LLM punctuation step (unpunctuated tracks only, D-077) is still rejected after the retry because the model changed words, the chunk keeps the punctuation and capitals of every word the model left unchanged. Changed, dropped or added words are ignored; the captured words stay as they are (D-025 unchanged).
2. **Safety net:** after normalisation, any run of more than 40 words without a sentence end is split at the longest pause between two words (json3 start times), at least 10 words into the run. The split is a sentence boundary only; no mark is added to the text.
**Why:** F-12 showed that a chunk rejected after the retry got no edits at all, leaving ~500-word "sentences" on unpunctuated tracks, which break translation, cards and read-along lines. Salvage reuses the existing word alignment at no extra cost; the safety net is free, deterministic and also catches what salvage can't.
**Not chosen:** retrying rejected chunks in smaller pieces (extra cost; may be added if salvage leaves gaps).
**Updates** D-064 (rejection no longer means "no punctuation") and D-077 point 1. Implemented in the spike: `spike-002-punctuation-2.zip`.

## Note on D-073 (2026-11-20)
Reviewed and kept after F-09: uploaded German tracks have line timings only (no `tOffsetMs`); auto tracks have word timings. So on videos with uploaded German captions, read-along always highlights whole lines. Accepted.

## D-083 · Spike follow-ups and a word-data spike before the feature order · 2026-11-20 · accepted
**Decision:** The checks the spikes didn't run, plus new ones from the review (same bytes per track, an unpunctuated track, the page never seeing the token), are listed in `roadmap/spike-follow-ups.md` and run before the roadmap step that depends on them. Phase 4 starts with a **word-data spike** (`changes/004-word-data-spike/`), because word data is where the product's value and complexity are and it hasn't been tested. All spike code goes into a private `linguastream-spikes` repository.
**Why:** the review found three spikes closed on general reports, and the untested risks are in word data, not plumbing.

## D-082 · Security requirements · 2026-11-20 · accepted
**Decision:** The requirements in `architecture-target/security.md` apply to the build: a transfer button page scripts can't click, untrusted bridge messages, the page never holding a token (one-time code, to be confirmed in F-20), CSRF protection, input limits, a Content Security Policy, secrets only on the server, breakage monitoring, and the privacy note covering the list of captured videos.
**Why:** review of the spike decisions; the MAIN-world hook and the token handoff open paths that are cheap to close now.

## D-081 · The join rule checks verbs with Wiktextract; spaCy always runs after normalisation · 2026-11-20 · accepted
**Decision:** The verb exception of the join rule (D-078) looks the lowercase word up in the imported Wiktextract data (word form → parts of speech) instead of spaCy. If the form can be a verb or auxiliary in any entry, the full stop stays. spaCy runs once, after normalisation, on the normalised text.
**Why:** keeps the pipeline order normalise → spaCy (D-078 would have needed spaCy before normalisation) and uses data we import anyway (D-058). To be checked in the word-data spike and F-14.
**Updates** D-078.

## Note on D-075 (2026-11-20)
Reviewed and kept: the automatic switch stops when the user chooses other subtitles, as D-073 already says (switch once, never switch back).

## D-080 · Revocation checked on every API call, cached briefly per user · 2026-11-20 · accepted
**Decision:** NestJS checks whether a user's sessions were revoked on every request (session cookie or ID token), but remembers the answer per user for about a minute in memory, so most requests need no extra call to Firebase.
**Why:** almost as safe as checking every time (a logout locks out the extension within about a minute) at almost no extra latency.
**Resolves** Q-39.

## D-079 · Extension sign-in spike 003 done · 2026-11-20 · accepted
**Result:** reported by the developer on 2026-11-20: everything works. The D-053 handoff runs end to end: the page gets a custom token from the server (`createCustomToken`), hands it to the extension (`externally_connectable`, only our origin), the service worker signs in with `signInWithCustomToken` from `firebase/auth/web-extension` (bundled with esbuild), calls the API with its own ID token, and is refused after logout (`revokeRefreshTokens` + `verifyIdToken(token, true)`).
**Settled by the spike:**
- The extension ID is a constant, fixed by the `key` in the manifest; the page needs no lookup.
- Firebase must be bundled into the extension (MV3 loads no remote code). The spike bundle is ~220 KB unminified; the production build minifies it.
- When the API answers 401 for a revoked session, the extension signs itself out and shows "signed out".
**Open:** check revocation on every API call or only on some (Q-39). Per-check details not recorded in `changes/003-extension-signin-spike/results.md`.

## D-078 · Punctuation spike 002 done; the join rule skips verbs · 2026-11-20 · accepted
**Decision:** The free rule from D-077 joins a full stop followed by a lowercase word, **except when that word is a verb or auxiliary** (spaCy POS `VERB`/`AUX` on the captured text), and adds no comma. Abbreviations ("z.B.", "bzw."), ordinals ("17."), "...", "?" and "!" are never touched. Spike 002 is done.
**Evidence (7 videos):** the plain rule made 15 joins, about 10 right. The wrong ones were real sentence starts the captions had lowercased (a dropped "Ich", a question, an imperative: "bin", "wird", "macht"); skipping verbs leaves about 10 right and 2 wrong. Gemini made 9 of the same joins and avoided most wrong ones, but costs money and kept trying to change words. Its other 12 joins merged two correct sentences with a colon or comma: style, not errors.
**Updates** D-077 point 2.

## D-077 · Use YouTube's punctuation; the LLM step only for unpunctuated tracks · 2026-11-20 · accepted
**Decision:**
1. **No LLM punctuation step by default.** Captured tracks keep YouTube's punctuation. The LLM step from D-064 (punctuated text, edit list by word alignment) runs only for a track that looks unpunctuated (fewer than 2 sentence ends per 100 words).
2. **A free rule** fixes the most common wrong split: a full stop followed by a lowercase word (not an abbreviation such as "z.B." or "bzw.") is joined, as an edit in the edit list (D-025). Being tested in spike 002.
3. **Translation gets the neighbouring sentences as context**, so short spoken fragments translate correctly without changing the subtitles (extends D-026).
4. **Boundary fixing with a stronger model** is a later experiment, not a pipeline step.
**Why (spike 002):** German auto-captions from YouTube are already punctuated (1 sentence end per 6–19 words). gemini-3.1-flash-lite changed 0–2.4 marks per 100 words; with a prompt allowed to move sentence ends it joined only 0–8 per video (mostly full stop + lowercase), split none, and tried to change words more often (rejected). 73–78% of sampled sentences were right either way; most remaining errors are misheard words (D-076).
**Updates** D-064 (no longer always on) and D-050. **Cost:** saves ~$0.03–0.04 per hour of video.
**Known issue for the real pipeline:** free-standing punctuation (speaker dashes, `* … *` sound labels) must be matched between captured and returned text, not glued to the previous word.

## D-076 · Misheard words: visible fix suggestions, bottom of the feature list · 2026-11-20 · accepted
**Decision:** Misheard words in captions (e.g. "Fahrstund", "Tapetenkleiß") are not fixed by the punctuation step. A later feature shows the model's suggested fixes **next to the original text**, visible to the user; the captured text stays as it is (D-025 unchanged). It goes to the bottom of the feature list (#69).
**Why:** spike 002 showed misheard words are one of the two biggest quality problems, but a silent fix can't be checked automatically and could put words in the speaker's mouth.
