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
| 1 | German track comes on and its file is captured (youtube.com / embed) | works (reported) | works (reported) | not run (F-05) |
| 2 | How soon after load it works; retries needed | not recorded (F-06) | not recorded (F-06) | not run (F-05) |
| 3 | Still works after in-app navigation (youtube.com) | not recorded (F-06) | not recorded (F-06) | – |
| 4 | YouTube keeps German on for other videos? Restore works? | not recorded (F-07) | not recorded (F-07) | not run (F-05) |
| 5 | No German track: behaviour | not recorded (F-06) | not recorded (F-06) | not run (F-05) |
| 6 | Uploaded German tracks have word timings? (how many of the test videos) | not recorded (F-09) | not recorded (F-09) | not recorded (F-09) |
| 7 | Original vs dubbed audio readable; captions follow the audio track? | not recorded (F-10) | not recorded (F-10) | not recorded (F-10) |
| 8 | Errors in YouTube's console | not recorded (F-06) | not recorded (F-06) | – |
| 9 | User switches the track: extension never switches back, capture follows the last German track | not recorded (F-08) | not recorded (F-08) | not run (F-05) |

## Recommendation
- youtube.com: ___ (fallback ___)
- Embed on our page: ___ (fallback ___)
- Restore the user's previous caption setting after capture: yes / no

## Follow-ups
- Record the outcome in that day's decisions file.
