# Vocabulary model (D-004, D-005)

- `UserWord(user_id, language, lemma, status, status_source)` is the source of truth for word coloring.
- `LemmaFrequency(language, lemma, rank)`.
- `Card` links to `UserWord`; scheduling moves from SM-2 to FSRS fields.
- Per-video lemma counts give the ranked word list and the comprehension score, computed per user.
