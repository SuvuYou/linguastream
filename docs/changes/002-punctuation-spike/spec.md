# 002 – Punctuation spike
Status: done (D-077, D-078)
Roadmap step: 0 (spikes, phase 3)

## Problem
The pipeline needs sentences: translation works on whole sentences (D-026), spaCy parses better with punctuation, and the learner sees punctuated text. The plan (D-064) is that Gemini returns punctuated text and our code aligns its words with the captured words, derives the edit list, and rejects the result if any word changed (D-025: the learner's words are never rewritten). None of this has been tried on real captions:
- Whether German auto-captions already have punctuation (English ones did, 2026-11-18). If they do, the step may be skipped for them.
- How often Gemini changes, adds or drops a word, so the alignment rejects it.
- How long a chunk can be, and how chunks are joined without breaking a sentence at the seam.
- What it really costs and how long it takes per hour of video (estimate: ~$0.03, D-068).
- How bracket tags (`[Musik]`, `[ __ ]` for censored words) are handled.
- Whether spaCy `de_core_news_sm` gives noticeably better lemmas on punctuated text than on raw captions (D-019, D-050).

## Goal
A yes/no with numbers: **does LLM punctuation with alignment work well enough on real German captions to go into the pipeline?** Plus the chunk size, the prompt, the cost per hour and the rejection rate. Time-box: two days.

## Setup
Outside the app repository, like the other spikes:
- **Input:** 10 raw json3 files downloaded with the spike extension's Raw button. Mix: 6 German auto-caption videos of different kinds (vlog, interview, news, comedy, tutorial, gaming), 2 with uploaded German captions, 2 long ones (45 min+). Include at least one with music or censored words.
- **`extract`** (TypeScript): json3 → a word list with start times; bracket tags kept as separate tokens and marked.
- **`punctuate`** (TypeScript, Gemini API, `GEMINI_API_KEY` from an `.env` file): words in chunks, punctuated text back; model from D-050 (gemini-3.1-flash-lite, thinking off), configurable.
- **`deriveEdits`** (TypeScript): the Block A exercise. Aligns the captured words with the returned text, outputs the edit list (punctuation after word *i*, capitalise word *j*, sentence ends), or a rejection naming the changed words.
- **`compare`** (Python, spaCy `de_core_news_sm`): lemmas and parts of speech on raw vs punctuated text.
- One report per video plus a summary table.

## Checks
1. **Already punctuated?** For each German auto-caption file: sentence ends per word, commas, capitals after sentence ends (the spike 000 heuristic). Uploaded tracks for comparison.
2. **Bracket tags:** which tags appear and how often; does keeping them out of the LLM input and putting them back by position work?
3. **Rejections:** share of chunks rejected on the first try, and on a retry. Which kinds of change cause them (spelling fixes, numbers written as digits, filler words dropped, `[ __ ]`).
4. **Chunk size:** compare 200, 500 and 1,000 words per chunk with ~30 words of overlap. Rejection rate, quality at the seams, time.
5. **Quality:** read 50 sentences across 5 videos and mark each: correct, wrong boundary, missing comma, wrong capital. Rough is fine.
6. **Cost and time:** tokens in and out per hour of video from the API's usage numbers, price from Google's pricing page on the day, wall time per video.
7. **spaCy:** on 200 sampled words, how many lemmas or parts of speech differ between raw and punctuated input, and which is right in a quick manual look.
8. **Prompt:** the prompt that worked, including how it is told not to change words; whether structured output (JSON) helps or hurts.

## Out of scope
Translation (D-026) and mapping it back onto cues, the worker, BullMQ, storage, a bigger spaCy model, case-label accuracy (measured with the grammar view, D-050).

## Acceptance criteria
- [ ] Each check has a result with numbers in `results.md`.
- [ ] A recommendation: keep D-064 as is, change it (e.g. skip punctuated tracks, a chunk size, a fallback when rejected twice), or replace it.
- [ ] The working prompt and `deriveEdits` kept in the spike folder for reuse in the worker.
- [ ] Results recorded in that day's decisions file; cost in `architecture-target/cost.md` updated.

## Needs before starting
- A Gemini API key (free tier is enough for 10 videos; check its limits).
- Block A, parts 3 (Gemini API) and 4 (sequence alignment) in `study/block-a-before-the-spikes.md`, or learn them during the spike.
