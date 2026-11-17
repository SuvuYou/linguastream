# Processing pipeline (target)

Runs on the server after a transfer. Design: `architecture-target/capture-flow.md`.

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| Store the raw track and enqueue a job | Backend | Server | ⬜ | D-012; BullMQ on Redis, jobs carry IDs only (D-049). |
| Normalisation as an edit list (punctuation, capitalisation, sentence boundaries) | Backend | Server | ⬜ | D-020, D-025; the LLM returns punctuated text, the edit list comes from word alignment (D-064). Precondition for the grammar view. |
| Linguistic analysis with spaCy, whole video | Backend | Server | ⬜ | D-019, free. `sm` first (D-050); integration Q-29. |
| Sentence translation via the provider interface | Backend | Server | ⬜ | D-018, D-023, D-026 |
| Lemma counts and search index update | Backend + Data | Server | ⬜ | Feeds vocabulary and search |
| Progress over SSE, retries, failed state the user can retry | UI + Backend | Library | ⬜ | D-012 |
| Transfer quota (characters), AI quotas, monthly spend cap | Backend | Server | ⬜ | D-022, enforced in Redis |
