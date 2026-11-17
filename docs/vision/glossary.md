# Glossary

| Term | Meaning |
|---|---|
| MediaContent | A video in a user's library (DB entity): a YouTube video or an upload. |
| Capture | The extension reading a video's caption track in the user's browser. Computes the known-word score; nothing leaves the browser (D-021). Code and API names (`/api/captures`) also say "capture" for the track once sent. |
| Transfer | The user sending a captured track to their library for full processing on the server (the "Open in LinguaStream" button, D-021). A pasted transcript enters the same way. |
| Track | A subtitle track in one language for one MediaContent. The source track has `is_source = true`. |
| Line | One subtitle cue (`SubtitleLine`). |
| Lemma | Dictionary form of a word ("rief" → "rufen"). Vocabulary status is per lemma. |
| Word status | A user's status for a lemma: unknown, learning, known or ignored. |
| Card | A flashcard: one word in one context sentence, linked to a clip. |
| Comprehension score | Share of a video's tokens whose lemma the user knows. |
| Private instance | The full deployment for the developer and people they personally know (D-038). Called "personal edition" in D-031 to D-036. |
| Demo | The separate public, read-only deployment with rights-cleared content (D-038). |
| Public edition | Browser-storage edition for anyone (D-031, D-032). Deferred (D-038). |
| Legacy / target | Legacy: what the code does today. Target: what it is meant to do. Used for `features/` and the architecture folders. |
