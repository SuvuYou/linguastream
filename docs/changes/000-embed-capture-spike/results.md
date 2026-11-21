# 000 – Results

Spike code: `spike-000-capture.zip` (outside the app repository, D-039). Browser: ___ (version ___). Date: ___.
Paste each run's report (popup → Copy report) into `reports/run-X.json` next to this file, or summarise below.

## Videos used
| Role | Video ID | Notes |
|---|---|---|
| German, auto captions 1 | | |
| German, auto captions 2 | | |
| German, auto captions 3 | | |
| German, manual captions | | |
| With AI-dubbed audio | | |
| Embedding forbidden | | |

## Checks
| # | Check | Result (works / doesn't / partly) | Evidence |
|---|---|---|---|
| 1 | Hook runs in the embed frame | works | confirmed 2026-11-20 (F-01): tested repeatedly, in several environments |
| 2 | Caption request seen in the embed (json3, timings) | works | confirmed 2026-11-20 (F-01): tested repeatedly, in several environments |
| 3 | Same format as youtube.com, word offsets on auto captions | works | confirmed 2026-11-20 (F-01): tested repeatedly, in several environments |
| 4a | Captions on via the user clicking CC in the embed | works | confirmed 2026-11-20 (F-01): tested repeatedly, in several environments |
| 4b | Captions on via `cc_load_policy=1&cc_lang_pref=de` | doesn't work | 2026-11-19: captions stayed off. The legal question in the spec is moot. |
| 5 | Video category readable (watch page / embed) | partly (watch page and embed) | 2026-11-19: only in some `/youtubei/v1/player` responses (those with `microformat`); two responses per video, one in English labels without category, one in the UI language with `Music`. 2026-11-20 (F-04): same in the embed, present sometimes, mostly not. **Not reliable:** also showed `Music` on videos that were not music videos. Neither presence nor absence can be trusted for D-036. |
| 6 | What a non-embeddable video shows | not seen yet (F-03 open) | Note: `playableInEmbed` is often missing (popup shows –); only an explicit `false` means blocked. 2026-11-20: no blocked video met during testing; to close, upload an own unlisted video with "Allow embedding" off. |
| 7 | youtube-nocookie.com: checks 1–3 | works | 2026-11-20 (F-02) |
| 8 | German auto captions already punctuated? (sentence ends per words) | moved | Punctuation spike |
| 9 | Bracket tags (`[Musik]`, `[ __ ]` = censored word) | moved | Punctuation spike |
| 10 | Original vs AI-dubbed audio readable | moved | Player-control spike (001) |

Seen on an English auto-caption track (2026-11-18, before the spike): json3, every segment timed, punctuated (1 sentence end per 10 words), tags `[music]`, `[laughter]`, `[ __ ]`, `[clears throat]`, `[snorts]`.

## Recommendation for D-028
Keep. Capture in the embed works; captions are switched on by the user (public) or by player control (private, D-071). Recorded as D-072.

## Follow-ups
- Record the outcome in today's decisions file; answer or narrow Q-06; update D-064's punctuation step if check 8 says German auto captions are punctuated.
