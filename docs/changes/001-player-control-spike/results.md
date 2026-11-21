# 001 – Results

Spike code: `spike-001-player-control.zip` (outside the app repository, D-039). Browser: ___ (version ___). Date: ___.

## Videos used
| Role | Video ID | Notes |
|---|---|---|
| German, auto captions only | | |
| German, uploaded + auto | | |
| No German captions | | |
| With AI-dubbed audio | | |

## Checks (per method)
| # | Check | A: player methods | B: click CC | C: our page, IFrame API |
|---|---|---|---|---|
| 1 | German track comes on and its file is captured (youtube.com / embed) | works (reported) | works (reported) | works (2026-11-20, F-05) |
| 2 | How soon after load it works; retries needed | works about 0.5 s after the click (522 ms measured), no retry; time from page load not measurable by hand (2026-11-20) | same as A | not recorded |
| 3 | Still works after in-app navigation (youtube.com) | works (2026-11-20, F-06). Note: hovering a thumbnail (inline preview) also loads that video's player response and captions, so the hook sees videos the user only hovered | same as A | – |
| 4 | YouTube keeps German on for other videos? Restore works? | yes, German stays on for other videos; restoring the previous setting works (2026-11-20, F-07) | same as A | not recorded |
| 5 | No German track: behaviour | fails; popup says there is no German track (2026-11-20) | **wrong track:** on an English video with only English auto captions, B turned on YouTube's auto-translated German (translated from the English ASR track). Must never be captured; B needs a guard (2026-11-20) | fails (2026-11-20) |
| 6 | Uploaded German tracks have word timings? (how many of the test videos) | **no:** uploaded tracks checked had line timings only (no `tOffsetMs`); auto tracks have word timings, punctuated or not (2026-11-20, F-09; number of videos not noted) | same | same |
| 7 | Original vs dubbed audio readable; captions follow the audio track? | yes and yes (2026-11-20, F-10) | yes and yes | yes and yes |
| 8 | Errors in YouTube's console | no new errors (2026-11-20) | no new errors (2026-11-20) | – |
| 9 | User switches the track: extension never switches back, capture follows the last German track | works: never switches back, the user's choice stays (2026-11-20, F-08) | same as A | not recorded |

## Recommendation
- youtube.com: A (fallback B, only after A's track list shows a real German track; B alone turned on auto-translated German on an English video)
- Embed on our page: C (our page, no extension needed) or A from the hook (fallback B, same guard)
- Restore the user's previous caption setting after capture: no (D-075), although restoring works
- Capture must reject translated tracks (`tlang` in the URL) and take only the main player's current video, not inline previews from hovering thumbnails

## Follow-ups
- Record the outcome in that day's decisions file.
