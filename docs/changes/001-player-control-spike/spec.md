# 001 – Player control spike
Status: done (D-074)
Roadmap step: 0 (spikes, phase 3)

## Problem
D-071 lets the extension (private instance) switch on the learning-language caption track, because `cc_load_policy` does nothing in the embed (D-072). Nobody knows yet how to do that reliably:
- YouTube offers no documented way to choose a caption track. The [IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) documents playback, volume and quality, not captions.
- The player object has undocumented methods that other extensions use (`setOption('captions', 'track', …)`, `getOption('captions', 'tracklist')`, `loadModule('captions')`). They may change without notice.
- Clicking YouTube's own buttons (CC, then Settings → Subtitles → German) works through the UI, but the menu is translated and its layout changes.
- YouTube remembers the caption choice (D-016), so switching may change what the user sees on YouTube afterwards.
- Check 10 from spike 000 moved here: can the extension tell original audio from YouTube's AI dubs?

## Goal
A recommended way to switch on the right caption track, on youtube.com and in the embed on our own page, with evidence of how reliable it is. Plus the dubbed-audio answer. Time-box: one day.

## Setup
Extend the spike 000 extension and test page (outside the app repository, D-039):
- **Popup:** a "Turn on German captions" button. It sends a message to the active tab's bridge (`chrome.tabs.query` + `chrome.tabs.sendMessage`); the bridge passes it to the hook with `postMessage`. Nothing happens without the click (D-071: on a user action).
- **Hook:** tries the methods below in order, logs which one worked, and the existing capture logs the caption file the player then loads.
- **Test page:** loads the embed with `enablejsapi=1` and the IFrame Player API, and has its own "Turn on German captions" button (method C), so our page drives its own embed without the extension.

## Methods to compare
| | Where | How |
|---|---|---|
| A | youtube.com and embed, from the hook | The player element's own methods: read the track list, pick the track, `setOption('captions', 'track', {...})`; `loadModule('captions')` first if needed |
| B | youtube.com and embed, from the hook | Click the CC button (`.ytp-subtitles-button`); if the wrong language comes up, open Settings → Subtitles and pick German |
| C | embed only, from our page | IFrame Player API: `player.loadModule('captions')`, then `player.setOption('captions', 'track', {...})` |

Track choice for all three: the German track only (`languageCode` `de`), never a translated track (`tlang`); the uploaded track when both exist (D-073).

## Checks
1. **Works:** for each method, on youtube.com and in the embed: does the German track come on, and does the hook capture its json3 file? Try 5 German videos: auto captions only, manual + auto, and one where the user had English captions on before.
2. **Timing:** how soon after page load each method works (player ready, captions module loaded). Note any retry needed.
3. **After navigation:** on youtube.com, click to another video without reloading the page. Does the method still work?
4. **Side effect:** after switching, open a different video in a normal tab. Did YouTube keep German captions on? Can the previous setting be read first (`getOption('captions', 'track')`) and put back?
5. **No German track:** what each method does when the video has none (expect: nothing, and the popup says so).
6. **Uploaded tracks:** do uploaded German tracks have word timings (`tOffsetMs`)? Without them read-along highlights whole lines (D-073). Count on how many of the test videos they exist.
7. **Original vs dubbed audio** (was check 10): on a video with AI dubs, switch the audio track and record the player response's audio tracks and decoded `xtags` (`acont original` / `dubbed-auto`). Do captions follow the audio track (as FluentAI's `a.it` suggested)?
8. **Console errors:** any errors in YouTube's own code after method A or B.
9. **The user takes over (D-073):** after a method switched German on, change the track by hand (to auto German, to English, and off). The extension must not switch back; the popup shows which track is loaded; the capture follows the last German track the player loaded. Also: switching by hand to a second German track loads a second caption file; note both arrive.

## Out of scope
Sending anything to our server, the transfer button, the token handoff (D-053), the production extension, the public-edition prompt (a UI task, no unknowns).

## Acceptance criteria
- [ ] Each check has a result per method (works / doesn't / partly) with a log excerpt, in `results.md`.
- [ ] A recommended method for youtube.com and for the embed, with a fallback.
- [ ] An answer on the side effect (check 4) and whether to restore the previous setting.
- [ ] Results recorded in that day's decisions file.

## Decisions needed
- Restoring the user's previous caption setting after capture (from check 4).
