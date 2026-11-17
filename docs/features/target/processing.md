# Processing pipeline (target)

Runs on the server after a transfer. Design: `architecture-target/capture-flow.md`.

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| Store the raw track and enqueue a job | Backend | Server | ⬜ | D-012. Queue technology open (Q-02). |
| Normalisation as an edit list (punctuation, capitalisation, sentence boundaries) | Backend | Server | ⬜ | D-020, D-025. Method open (Q-11). Precondition for the grammar view. |
| Linguistic analysis with spaCy, whole video | Backend | Server | ⬜ | D-019, free. Parser accuracy open (Q-12). |
| Sentence translation via the provider interface | Backend | Server | ⬜ | D-018, D-023, D-026 |
| Lemma counts and search index update | Backend + Data | Server | ⬜ | Feeds vocabulary and search |
| Progress over SSE, retries, failed state the user can retry | UI + Backend | Library | ⬜ | D-012 |
| Transfer quota (characters), AI quotas, monthly spend cap | Backend | Server | ⬜ | D-022, enforced in Redis |
