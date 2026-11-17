# Glossary

| Term | Meaning |
|---|---|
| MediaContent | A video in a user's library (DB entity): a YouTube video or an upload. |
| Capture | The extension reading a video's caption track in the user's browser. Computes the known-word score; nothing leaves the browser (D-021). Code and API names (`/api/captures`) also say "capture" for the track once sent. |
| Transfer | The user sending a captured track to their library for full processing on the server (the "Open in LinguaStream" button, D-021). A pasted transcript enters the same way. |
| Track | A subtitle track in one language for one MediaContent. The source track has `is_source = true`. |
| Line | One subtitle cue (`SubtitleLine`). |
| Lemma | Dictionary form of a word ("rief" → "rufen"). Vocabulary status is per lemma. |
| Word status | A user's status for a lemma: unknown, learning, known or ignored. Set by the user, independent of the card schedule (D-041). |
| Vocabulary | A user's saved words, one global list per user (D-045). |
| Deck | A named group of vocabulary words, with description, icon and colour; a word can be in several decks (D-045). Also called a list. |
| Save | The action that adds a word to the vocabulary and, from a subtitle line, creates a connection (D-058). |
| Connection | One saved moment of a vocabulary word: the video, the line, a copy of the sentence and its translation, and the word's meaning there when known (D-047, D-063). Deleted with its video. |
| Card | The review item for one vocabulary word, with one schedule (D-047). Its front shows a random connection, or a dictionary example if the word has none. |
| Coverage score | Share of a video's tokens whose lemma the user knows. Measures vocabulary coverage, not comprehension (differentiator 3). Older docs and decisions call it "comprehension score". |
| Private instance | The full deployment for the developer and people they personally know (D-038). Called "personal edition" in D-031 to D-036. |
| Demo | The separate public, read-only deployment with rights-cleared content (D-038). |
| Public edition | Browser-storage edition for anyone (D-031, D-032). Deferred (D-038). |
| Legacy / target | Legacy: what the code does today. Target: what it is meant to do. Used for `features/` and the architecture folders. |
