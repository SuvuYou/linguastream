# Extension and capture methods

YouTube gates caption downloads behind a proof-of-origin token that only its own player can produce. German courts treat YouTube's protection of video streams ("rolling cipher") as an effective technical measure (OLG Hamburg, 5 U 54/23), and the private-copy rule doesn't permit circumventing one. Captions haven't been tested in court. So how the captions are obtained decides the risk.

| # | Method | Status |
|---|---|---|
| 1 | The user opens YouTube's "Show transcript" panel and pastes it (or the extension reads the panel the user opened) | Allowed. Fallback (D-014). |
| 2 | Reading caption lines as they appear on screen during playback | Allowed. Not planned: only covers what was watched. |
| 3 | **Copying the caption response YouTube's own player loaded**, with captions switched on by the user | **Allowed. Primary method (D-014).** |
| 4 | Driving the player to switch tracks so it loads other languages | Not without a new decision in `decisions/`. |
| 5 | Making our own caption requests with the player's token | **Never.** |
| 6 | Generating tokens ourselves, or any server-side fetch | **Never.** |

12. **The extension is strictly passive.** It never builds its own requests to YouTube, never generates, extracts or reuses tokens, and never deciphers URLs.
13. **It never touches video or audio streams** on YouTube or any other site. (Extracting audio from the user's own local file for an upload happens in the web app, not the extension: D-040.)
14. **Sending caption data to the server requires a user click**, one video at a time. Reading the caption track in the browser to compute the on-page score is not a send: it stays in the user's browser, nothing is stored, and it only happens on a video the user has opened with captions already on (D-021). Nothing runs in the background, and no bulk or multi-video reading of any kind.
15. **Minimal permissions.** The capture code runs on youtube.com and the app's own domain only. Word lookup may run on any site (D-043): it sends only the selected word or phrase, never page content in bulk, and stores nothing unless the user saves the word.
16. **If the extension is ever listed in a store, the listing describes exactly what it does.** For now it is given to friends directly (D-039).
