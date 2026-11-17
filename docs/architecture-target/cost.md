# Cost

Budget (`vision/targets.md`): soft cap **€30 a month**, hard cap **€50 a month**. Figures are estimates from research, not measured bills, unless marked otherwise.

## Fixed monthly costs

| Item | Estimate | Source |
|---|---|---|
| EU VPS running Docker Compose (Next.js, worker, Redis, Caddy) | Not priced yet. Postgres on the VPS may need the 8 GB plan | D-006, Q-15 |
| Extra VPS RAM for spaCy `de_core_news_sm` | ~€3 | D-019 |
| Postgres | Neon free tier won't hold the dictionary (1 GB storage, 100 CU-hours). Options: on the VPS (€0 extra, backups are ours), Neon paid (~$19), or a split | Q-15 |
| Firebase Auth, Sentry, uptime check | Not priced yet | |
| Domain | Not priced yet | |

## Per-use costs

| Item | Estimate | Source |
|---|---|---|
| Translation track, whole video at transfer | ~$0.03 per 1-hour video on gemini-3.1-flash-lite ($0.25 / $1.50 per 1M tokens, from a comparison site; confirm on Google's pricing page). Thinking tokens disabled. | D-023 (corrects D-018's $0.008 and D-021's ~$0.01) |
| Sense in context (Gemini) | Negligible; cached per (user, lemma, sentence hash) | `architecture-target/word-data.md` |
| Normalisation | ~0 if the LLM returns the edit list; a local punctuation model costs 0.5–1.4 GB RAM instead | D-025, Q-11 |
| spaCy analysis | €0 (local) | D-019 |
| Dictionary and frequency data | One-off import, €0 | D-010 |
| Transcription of uploads | $0.04 per hour of audio (Groq Whisper turbo; $0.111 for large-v3). €0 when the file has subtitles | D-040 |
| Storage and bandwidth for uploaded video | €0: no media stored; audio deleted after transcription | D-040 |
| Demo deployment | No paid API calls; everything precomputed. Hosting not priced | D-038 |

## Estimated monthly API spend

At 150 hour-long video transfers a month: **$4–5** (D-023). Add the fixed costs above once they are priced.

## Reference: one hour of German video

Roughly 55,000 characters (~8,400 words, ~800 cues). What the replaced options would cost for it: DeepL $1.38, Google Translate $1.10, Azure $0.55, Google Cloud Natural Language syntax $0.028.

## Cost controls

- Monthly spend cap enforced by us in Redis, not left to provider budget alerts (D-022).
- Transfer quota counted in characters, a maximum size per transfer, and a repeat transfer of the same video treated as the same job (D-022).
- AI limiter: per-user daily quota and a global monthly cap, falling back to dictionary-only data (D-010).
- Translation behind a provider interface, so a retired or repriced model can be swapped (D-023).
- The demo makes no paid calls (D-038).

## Open

VPS plan and price; where Postgres runs (Q-15).
