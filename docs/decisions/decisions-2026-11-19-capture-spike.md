# Decisions 2026-11-19: capture spike

## D-075 · Never restore the caption setting after capture · 2026-11-19 · accepted
**Decision:** after player control switches German captions on (D-071), the extension leaves them on. It does not put back the user's previous caption setting.
**Why:** simpler, and the user is in charge of their own player (D-073); they can switch captions themselves.
**Accepted cost:** YouTube may keep German captions on for the user's other videos. This replaces the reasoning in D-016 that the extension should avoid changing what the user sees on YouTube, for the private instance only.
**Resolves** Q-38.

## D-074 · Player control spike 001 done · 2026-11-19 · accepted
**Result:** reported by the developer on 2026-11-19: everything works. Both extension methods switch on the German track and the capture picks up its caption file: **A**, the player's own caption methods (`getOption`/`setOption('captions', …)`), and **B**, clicking CC and the settings menu.
**Use:** A first, because it doesn't depend on the interface language or menu layout; B as the fallback when A's methods are missing. Both are undocumented YouTube behaviour, so the extension checks they exist and falls back to asking the user (the public-edition prompt) if neither works.
**Not recorded in detail:** method C (our page through the IFrame API), and per-check results in `changes/001-player-control-spike/results.md`.
**Open:** whether to restore the user's previous caption setting after capture (Q-38).

## D-073 · Uploaded German captions first; the user's own track choice wins · 2026-11-19 · accepted
**Decision:**
1. When a video has both uploaded (manual) and auto-generated German captions, use the **uploaded** track.
2. Player control (D-071) switches the track **once**, when the user acts. After that the user is in charge: if they switch to another track or turn captions off, the extension never switches back. The capture takes the German track the player has loaded when the user transfers; a non-German track is not captured (D-016) and the user is told why.
**Why:** uploaded captions are written by people and usually more accurate; a user who changes the track has a reason.
**Accepted cost:** uploaded tracks may have no per-word timings. Then read-along highlights whole lines, not words (D-052). Spike 001 check 6 shows how common that is.
**Resolves** Q-37.

## D-072 · Capture spike 000 done · 2026-11-19 · accepted
**Result:** a passive MV3 extension (content script in the MAIN world, `all_frames`, `document_start`, wrapping `XMLHttpRequest` and `fetch`) captures caption files and player responses on youtube.com and inside the YouTube embed on our own page. Reported working by the developer on 2026-11-19; per-check details in `changes/000-embed-capture-spike/results.md`.
**Findings:**
- `cc_load_policy=1&cc_lang_pref=de` does not switch captions on in the embed. Handled by D-071.
- The video category is only in some player responses (those with `microformat`). Missing = unknown, never "not music" (D-036).
- `playableInEmbed` is often missing; only an explicit `false` means embedding is blocked (D-027).
**Moved to other spikes:** whether German auto-captions are punctuated and which bracket tags appear (punctuation spike); reading original vs dubbed audio (player-control spike).
**Resolves** Q-06. **D-028** (add by URL, capture in the embed) passes its spike. **D-014** confirmed as a real MV3 extension.

## D-071 · Switching captions on: player control in the private instance, a prompt in the public edition · 2026-11-19 · accepted
**Decision:**
- **Private instance (friends):** the extension, or our own page through the embed's player API, may switch on the **source caption track in the learning language** on the video the user opened, when the user acts (opens it in our app or clicks transfer). The player then loads the captions with its own request; the extension still only copies the response.
- **Public edition and demo:** no player control. If captions are off, a message asks the user to turn them on.
**Limits:** one video at a time, only the video the user opened, only the source track (D-016), never a translated track, nothing in the background, never our own caption request or token use (methods 5 and 6 stay forbidden).
**Why:** `cc_load_policy` doesn't work (D-072), and asking friends to click CC every time is friction. The public edition keeps the stricter rule.
**Updates** method 4 in `legal/extension-capture-methods.md` (was: not without a new decision). How to switch reliably is a new spike (`changes/001-player-control-spike/`).
