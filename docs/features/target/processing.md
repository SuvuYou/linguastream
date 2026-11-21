# Processing pipeline (target)

Runs on the server after a transfer. Design: `architecture-target/capture-flow.md`.

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| Store the raw track and enqueue a job | Backend | Server | ⬜ | D-012; BullMQ on Redis, jobs carry IDs only (D-049). |
| Normalisation as an edit list (punctuation, capitalisation, sentence boundaries) | Backend | Server | ⬜ | D-020, D-025. YouTube's punctuation is kept; a free rule joins "full stop + lowercase word" unless Wiktextract says it can be a verb (D-078, D-081); the LLM step (D-064) runs only for unpunctuated tracks (D-077). Precondition for the grammar view. |
| ⏳ Word fix suggestions for misheard words | Backend + UI | Server, player | ⏳ | Bottom of the feature list (#69, D-076). Original text kept; suggested fixes visible to the user. |
| Linguistic analysis with spaCy, whole video | Backend | Server | ⬜ | D-019, free. `sm` first (D-050); integration Q-29. |
| Sentence translation via the provider interface | Backend | Server | ⬜ | D-018, D-023, D-026; each sentence with its neighbours as context (D-077) |
| Lemma counts and search index update | Backend + Data | Server | ⬜ | Feeds vocabulary and search |
| Progress over SSE, retries, failed state the user can retry | UI + Backend | Library | ⬜ | D-012 |
| Transfer quota (characters), AI quotas, monthly spend cap | Backend | Server | ⬜ | D-022, enforced in Redis |
| Progress toast with steps (feature review #15) | UI | Library, watch page | ⬜ | Shows the SSE progress |
| Translation engine fallback order (internal) (feature review #61) | Backend | Server | ⬜ | One model for now (D-050) |
| User-facing translation engine picker (feature review #63) | UI | Settings | ⏳ | Bottom of the list |
