# Spike follow-ups

Checks the spikes (phase 3) planned but didn't run or didn't record, plus checks added by the review on 2026-11-20. The spikes are closed (D-072, D-074, D-078, D-079); these are the gaps behind those records. Run each before the roadmap step that depends on it. Tick when the result is in the spike's `results.md`.

## Before building capture (roadmap step 3)

| ID | Spike | Check | Why it matters |
|---|---|---|---|
| F-01 | 000 | **Confirm capture inside the embed** on our own page: hook runs in the iframe, json3 captured, word offsets present, CC clicked by the user (checks 1–3, 4a). Recorded as working from a general "works very well", never confirmed explicitly | D-028 (add by URL, capture in the embed) rests on it |
| F-02 | 000 | youtube-nocookie.com embed: checks 1–3 again (check 7) | Which embed domain we use |
| F-03 | 000 | A video that forbids embedding: what the user sees, `playableInEmbed` false (check 6) | D-027 |
| F-04 | 000 | Category inside the embed (check 5, embed part) | Music check (D-036) |
| F-05 | 001 | Method C: our page switches its own embed through the IFrame API (`loadModule`, `setOption('captions', …)`) | Player control in the embed without the extension |
| F-06 | 001 | Timing (check 2), after in-app navigation on youtube.com (check 3), no German track (check 5), console errors from YouTube's code (check 8) | Reliability of method A and B |
| F-07 | 001 | Side effect (check 4): after an automatic switch, does YouTube keep German captions on in other videos? | What D-075 accepts; friends should know |
| F-08 | 001 | User takes over (check 9): after an automatic switch, change the track by hand (auto German, English, off); the extension never switches back, the capture follows the last German track | D-073, D-075 |
| F-09 | 001 | Uploaded German tracks: do they have per-word timings (`tOffsetMs`)? Count over at least 5 videos (check 6) | D-073's accepted cost: line-level read-along |
| F-10 | 001 | AI-dubbed audio: original vs dubbed readable from the audio tracks; do captions follow the audio track? (check 7) | Q-36 |
| F-11 | new | **Same track, same bytes?** Capture one track 3 times (reload, next day, other browser) and compare SHA-256 of the raw json3 and of the normalised events (text + times only) | D-070 saves nothing if the raw bytes change between loads; then hash the normalised events |

## Before building processing (roadmap step 3)

| ID | Spike | Check | Why it matters |
|---|---|---|---|
| F-12 | 002 | **An unpunctuated German track**: find one (older videos, live streams) and check that `inspect` flags it (< 2 sentence ends per 100 words) and that the LLM step punctuates it with few rejections | D-077's fallback and threshold have never seen such a track |
| F-13 | 002 | More kinds of video: news, interview, tutorial, and two videos older than 3 years; rerun `inspect` and `captured` | "German auto-captions are punctuated" rests on 4 videos, mostly gaming and vlog |
| F-14 | 002 | **The join rule with the Wiktextract verb check (D-081)** on all videos: you tick each join in `out/rule-joins.md` (the first run was graded by Claude, who wrote the rule) | D-078's "about 10 right, 2 wrong" is a projection |
| F-15 | 002 | Translation with neighbouring sentences as context: tokens and cost per hour, and whether fragments translate better (10 fragments marked) | D-077 point 3; cost.md's $4.50 ignores it |

## Before building sign-in (roadmap step 3)

| ID | Spike | Check | Why it matters |
|---|---|---|---|
| F-16 | 003 | Still signed in after a service-worker stop and after a browser restart (check 5) | Friends shouldn't reconnect daily |
| F-17 | 003 | After more than an hour: the token refreshes itself (check 6) | Same |
| F-18 | 003 | Account deleted in the console: the extension is refused and signs out (check 8) | Account deletion (D-053) |
| F-19 | 003 | Record which browser was used; repeat in the other one (Chrome / Opera) | Friends use both |
| F-20 | 003 | **The page never sees the token**: try a variant where the page passes the extension a short one-time code and the extension's service worker exchanges it for the custom token at the API | Security: an XSS on our site could otherwise steal a custom token (`architecture-target/security.md`) |

## Actions (not checks)

- [ ] **Delete the service-account key** downloaded for spike 003 (Google Cloud console → IAM → Service accounts → Keys). Production gets its own key as a server secret.
- [ ] Put all spike code into the private `linguastream-spikes` repository.
