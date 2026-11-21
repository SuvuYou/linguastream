# YouTube capture and transfer flow (D-009, D-012, D-021)

1. The user opens a video in a YouTube player (on youtube.com, or in the embedded player on our own site after pasting a URL: D-028, spike passed D-072), captions are on (switched on by the user; in the private instance the extension may switch on the source track, D-071), and clicks the transfer button ("Open in LinguaStream", D-021) in the extension. The extension copies the caption response the player itself loaded (an **XHR**, format `json3`, with per-cue timings) and makes no requests of its own (D-014). It captures the **source track only** (D-016). Fallback: the user pastes YouTube's "Show transcript" panel.
2. The extension sends the caption track to `POST /api/captures` with the user's token. The payload schema (Zod) is shared between the extension and the API.
3. The API stores the raw track for that user and enqueues a processing job.
4. The worker, in order:
   a. **Normalise** (D-025, D-077): YouTube's punctuation is kept. A free rule joins wrong splits (full stop + lowercase word that can't be a verb according to Wiktextract, D-078, D-081) as edits. Only a track that looks unpunctuated goes to the LLM, which returns punctuated text; code aligns its words with the captured words, derives the edit list and rejects the result if any word changed (D-064); a chunk still rejected after one retry keeps the punctuation of its unchanged words (D-084). Then any run of more than 40 words without a sentence end is split at the longest pause, as a boundary only (D-084). Raw text is kept alongside.
   b. **spaCy** (always after normalisation, D-081) analyses the whole video — tokens, lemmas, morphology, dependencies. Local and free.
   c. **Translate whole sentences** (not cues), each with its neighbouring sentences as context (D-077), via the provider interface, mapping results back onto cues by time (D-026, D-023).
   d. Compute lemma counts, update the full-text index, create the library entry.
5. Progress is pushed to the UI over SSE. Failures retry with backoff, then land in a failed state the user can retry.

The server never calls YouTube (D-007). Every row is scoped by `user_id`; nothing is shared between users.

## Proposals (not decided)

From the competitor traffic in `research/competitors/language-reactor-and-fluentai-api.md`:

1. ~~Hash check before upload~~ **accepted as D-070, per user:** the extension computes SHA-256 of the raw json3 and asks `GET /api/captures/lookup?videoId&track&hash`. The server looks only among that user's own tracks; on a hit it reuses the processed track, on a miss the extension uploads.
2. **Processing version in the key.** A processed track is keyed by (video ID, track ID, content hash, processing version). A new spaCy model or prompt bumps the version and allows reprocessing without mixing results.
3. **Keep the raw json3** compressed (~1 MB → ~100 KB) so a track can be reprocessed without a new capture.
4. **Store `dep` and `head`** per token from spaCy (TIGER labels; separable particle = `svp`). Needed to join split separable verbs and for the grammar breakdown.
5. **Track metadata:** auto vs manual captions, whether the text already has punctuation (skip step 4a if so), and whether the audio is original or YouTube's AI dub (Q-36).
6. **Bracket tags** like `[music]` and `[laughter]` in auto-captions: strip from the text used for NLP and translation, keep for display.
