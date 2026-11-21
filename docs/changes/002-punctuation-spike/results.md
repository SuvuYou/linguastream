# 002 – Results

Spike code: `spike-002-punctuation.zip` (outside the app repository). Model: ___, thinking: ___. Date: ___.
Paste the generated files from `out/` (inspect.md, summary-*.md, spacy-compare.md) next to this file, or summarise below.

## Videos used
| Kind | Video ID | Minutes | Notes |
|---|---|---|---|
| Auto: vlog | | | |
| Auto: interview | | | |
| Auto: news | | | |
| Auto: comedy | | | |
| Auto: tutorial | | | |
| Auto: gaming | | | |
| Uploaded 1 | | | |
| Uploaded 2 | | | |
| Long 1 | | | |
| Long 2 | | | |

## Checks
| # | Check | Result |
|---|---|---|
| 1 | German auto captions already punctuated? | **Yes, all 4.** 1 sentence end per 6–19 words, 91–99% capitalised after a sentence end, commas throughout (2026-11-19, `npm run inspect`). The 3 uploaded tracks: 1 end per 8–14 words, 88–97%. Quality not yet checked (check 5 on the captured text). |
| 2 | Bracket tags: which, how often; kept out of the LLM and put back by position | Auto tracks: `[musik]` (up to 13 in 54 min), `[gelächter]` (12 in 18 min), `[räuspern]`, `[schreien]`, `[stöhnen]`, `[schnauben]`, `[ __ ]` (censored). Lower-case in German, unlike English. Uploaded tracks: `[singen]`, `[musik]`, `[ __ ]` in one, none in two. One run-together tag `[räuspern][husten]`. |
| 3 | Rejected on the 1st try / after the retry; kinds of change | Chunk 500: 21 of 55 chunks rejected on the 1st try, 8 still after the retry. Chunk 1000: 11 of 30, 5. Mostly `changed` (the model "fixes" misheard words, e.g. 68 changes in `UrYgzkIAtCo`), some `added`/`dropped`. Correctly refused (D-025). |
| 4 | Chunk size 200 / 500 / 1,000: rejections, seams, time | 500 vs 1,000: same edits, similar rejection share; 1,000 is faster (~3.5 min vs ~9 min for 161 min of video, partly rate-limit waits) and cheaper. 200 not run. |
| 5 | 50 sentences marked: correct / wrong boundary / missing comma / wrong capital | Chunk 500: 54 of 69 correct (78%); 15 wrong: 6 wrong boundary, 5 missing comma, 4 wrong capital. Chunk 1000: 48 of 66 (73%). Many "wrong" sentences are misheard words ("Fahrstund", "Risottois", "Tapetenkleiß", "dass" for "das"), which no punctuation step may fix. Because the model changed almost nothing (row 6), these are effectively YouTube's own punctuation. |
| 6 | Tokens and cost per hour of video; time per video | **$0.031–0.034 per hour of video** (estimate was ~$0.03), no thinking tokens. **Edits per 100 words: 0–0.5** on auto tracks and two uploaded tracks, 2.1 on `wacfow0aHDM`: the model keeps YouTube's punctuation almost unchanged. |
| 7 | spaCy: lemma/POS differences captured vs punctuated, which is right | 0 of 168 sampled words differ, as expected when the text barely changes. `wacfow0aHDM` skipped (word count mismatch from added free-standing punctuation; spike script issue, not relevant to the result). |
| 8 | Prompt that worked; text vs JSON mode | The German "change no word" prompt in `src/gemini.ts`; JSON mode not run. |

Reference (English auto captions, 2026-11-19, no API): 10,749 words in 49.5 min, already punctuated (1 sentence end per 10 words), only 46% capitalised after a sentence end; tags `[music]` ×3, `[laughter]` ×63, `[ __ ]` ×13.

## Notes from the first runs (2026-11-19)
- Inputs so far: 4 auto (6, 7, 18, 54 min) and 3 uploaded (11, 30, 34 min).
- First real run (chunk 500) stopped in the 5th chunk of the 54-minute video without an error: a hanging call. Fixed in the spike (90 s timeout, rate-limit wait, summary written after each video). Before it stopped: 1 chunk rejected after the retry, 3 accepted only after the retry.
- The dry run rejected 8 of 9 chunks of `wacfow0aHDM` (uploaded): its captions contain tokens without letters (speaker dashes), which the alignment counted as words. Fixed: such tokens are punctuation on both sides (test added).

## Second run (planned)
Same model, `--prompt boundaries`: the model may move sentence ends (join wrongly split sentences, split run-ons) and add commas; words still may not change. Marked in `out/boundaries-1000-text-boundaries.md`.

## Rule test (D-077 point 2)
`npm run rule`: 15 joins over 7 videos, about 10 right; 9 shared with the Gemini boundaries run. Wrong: "freut mich. bin", "weitermacht. wird", "daran. macht", "gemacht. sehr", "gast. beispielsweise". Skipping verbs/auxiliaries fixes the first three (D-078).

## Unpunctuated track (F-12, 2026-11-20)
Run on an unpunctuated German auto track (`eR1zYD2SWo0`, gaming live stream): the LLM step punctuates it well where a chunk is accepted. But a chunk rejected after the retry gets **no edits at all** (`deriveEdits` is all-or-nothing), so its ~500 words stay one "sentence" (a wall of text in the sample). Seen in earlier runs too. On punctuated tracks this is harmless (YouTube's punctuation stays); on unpunctuated tracks it breaks everything that works per sentence (translation, cards, read-along lines). The production pipeline needs a fallback for rejected chunks: **D-084** (keep the punctuation of unchanged words; split runs over 40 words at the longest pause). In the spike as `spike-002-punctuation-2.zip`; rerun this track to confirm the walls are gone.

## Recommendation for D-064
Replaced by D-077: keep YouTube's punctuation, a free join rule (refined by D-078), the LLM step only for unpunctuated tracks, translation with neighbouring sentences as context.

## Follow-ups
- Record the outcome in that day's decisions file; update `architecture-target/cost.md`.
