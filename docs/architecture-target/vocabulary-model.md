# Vocabulary model (D-004, D-005)

- `UserWord(user_id, language, lemma, status, status_source)` is the source of truth for word coloring.
- `LemmaFrequency(language, lemma, rank)`.
- One global vocabulary per user; decks group its words many-to-many (D-045).
- **Connections** (D-047): each saved moment of a word (video, line, copied sentence and translation). Deleted with their video; a word may have none.
- **Meanings** (D-063): each connection stores its meaning (dictionary sense) when known; the card back lists all meanings and marks those of the word's connections. How the meaning is set: Q-34.
- **Schedule per word** (D-047). The card front shows a random connection (skipping uploads whose file is not on this device); a word without connections shows a Wiktextract example, no clip. The back lists all connections.
- Saving a word sets its status to "learning"; saving it again adds a connection, not a card (D-047).
- `Card` links to `UserWord`; scheduling moves from SM-2 to FSRS fields.
- Each subtitle line stores its words as JSON (surface, lemma, POS, morphology, offsets, start time where known) and an indexed lemma array; a lemma-count table per video gives the ranked word list and the coverage score, computed per user (D-052).
- Word status and the FSRS schedule are independent (D-041). Review direction is a display choice; one schedule per card (D-042).
