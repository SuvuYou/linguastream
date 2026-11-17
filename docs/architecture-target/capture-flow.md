# YouTube capture and transfer flow (D-009, D-012, D-021)

1. The user opens a video in a YouTube player (on youtube.com, or in the embedded player on our own site after pasting a URL: *open, D-028, Q-06*), switches captions on, and clicks the transfer button ("Open in LinguaStream", D-021) in the extension. The extension copies the caption response the player itself loaded (an **XHR**, format `json3`, with per-cue timings) and makes no requests of its own (D-014). It captures the **source track only** (D-016). Fallback: the user pastes YouTube's "Show transcript" panel.
2. The extension sends the caption track to `POST /api/captures` with the user's token. The payload schema (Zod) is shared between the extension and the API.
3. The API stores the raw track for that user and enqueues a processing job.
4. The worker, in order:
   a. **Normalise** — the normaliser returns an *edit list* against the captured word sequence (punctuation, capitalisation, sentence boundaries), never rewritten text; output is validated by comparing word sequences (D-025). Raw text is kept alongside.
   b. **spaCy** analyses the whole video — tokens, lemmas, morphology, dependencies. Local and free.
   c. **Translate whole sentences** (not cues) via the provider interface, mapping results back onto cues by time (D-026, D-023).
   d. Compute lemma counts, update the full-text index, create the library entry.
5. Progress is pushed to the UI over SSE. Failures retry with backoff, then land in a failed state the user can retry.

The server never calls YouTube (D-007). Every row is scoped by `user_id`; nothing is shared between users.
