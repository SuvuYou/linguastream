# 000 – Embed capture spike
Status: done (D-072)
Roadmap step: 0 (spikes)

## Problem
D-028 proposes that a user pastes a YouTube URL in our app, the video opens in the official embedded player on our page, and the extension captures the captions there instead of on youtube.com. Nobody knows whether that works:
- The capture hook (D-014) was confirmed only on youtube.com: the player loads captions with an `XMLHttpRequest` to `/api/timedtext?...&fmt=json3&pot=...`, and a patch of `XMLHttpRequest.prototype.open/send` reads the response.
- The earlier embed test (2026-11-15) was invalid: it opened `/embed/<id>` as a top-level page, which returns Error 153.
- The embed runs in a cross-origin iframe, so the extension's script must run inside that frame.
- Open sub-questions from Q-06 and D-036: how captions get switched on in an embed without the extension driving the player (method 4 is not allowed without a decision), and whether the video's category is readable inside the embed.

## Goal
A yes/no answer, with evidence, to: **can a passive MV3 extension capture the source caption track from the YouTube embed on our own page?** Plus answers to the sub-questions below. Time-box: one day.

## Setup
- A local page (`http://localhost`) that embeds one German video with auto-captions in an `<iframe>` (`https://www.youtube.com/embed/<id>`), once with the plain URL and once with `youtube-nocookie.com`.
- A minimal MV3 extension, loaded unpacked:
  - content script matching `https://www.youtube.com/embed/*` and `https://www.youtube-nocookie.com/embed/*`, `all_frames: true`, `world: "MAIN"`, `run_at: "document_start"`;
  - patches `XMLHttpRequest.prototype.open/send` (and `fetch`, to compare) and logs any `timedtext` request: URL parameters, status, response size, first cue;
  - makes **no** requests of its own and never touches video or audio (guardrails 12–13).

## Checks
1. **Hook runs in the embed frame:** the content script loads inside the iframe at document start.
2. **Caption request seen:** after the user clicks CC in the embed, a `timedtext` request is logged with a json3 body and per-cue timings.
3. **Same format as youtube.com:** `fmt=json3`, cue timings, and word-level offsets on auto-captions (needed for read-along, D-052).
4. **Ways to switch captions on, without the extension driving the player:**
   a. the user clicks CC in the embed;
   b. our page sets the official embed parameters `cc_load_policy=1` and `cc_lang_pref=de`. Record whether this works; whether it is allowed is a separate legal question (see below).
5. **Video category readable** from inside the embed (for the music check, D-036): note where, if anywhere, it appears.
6. **Embeddability:** what the user sees for a video that forbids embedding (D-027).
7. **youtube-nocookie.com:** checks 1–3 again on that domain.
8. **Punctuation in German auto-captions:** on 3 German videos with auto-captions, does the json3 text already contain punctuation and capitals? (English auto-captions did on 2026-11-18.) Decides whether the punctuation step (D-064) runs always, sometimes or never.
9. **Bracket tags:** note any `[Musik]`, `[Applaus]`-style tags and how they are segmented.
10. **Audio tracks:** on a video with AI dubs, is original vs dubbed readable from what the player loaded (e.g. `acont=original` / `dubbed-auto` in the audio track IDs)? Needed for Q-36.

## Out of scope
Sending anything to the server, the token handoff (D-053), the production extension, store listing, the Firebase SDK in the extension (separate check).

## Acceptance criteria
- [ ] Each check above has a result (works / doesn't / partly) with a log excerpt or screenshot.
- [ ] A recommendation for D-028: keep, change (e.g. capture only after the user clicks CC), or drop (capture stays on youtube.com).
- [ ] Results recorded in today's decisions file; Q-06 answered or narrowed.

## Decisions needed
- Q-06 (this spike).
- If check 4b works: does setting `cc_load_policy` on **our own** embed count as "driving the player" (method 4 in `legal/extension-capture-methods.md`)? It is our page's documented parameter, not the extension, but it needs a decision before use. Guardrails 12–15 to be re-read against the embed case (legal assumption 9).
