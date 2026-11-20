# Cost

Budget (`vision/targets.md`): soft cap **€30 a month**, hard cap **€50 a month**. Figures are estimates from research, not measured bills, unless marked otherwise.

## Fixed monthly costs

| Item | Estimate | Source |
|---|---|---|
| EU VPS running Docker Compose (Caddy, Next.js, NestJS + worker, Redis, Postgres) | About €7–11 for 8 GB of memory, €13–20 for 16 GB or more (prices found 2026-11-17; chosen after measuring the load, Q-30) | D-006, D-051 |
| Extra VPS RAM for spaCy `de_core_news_sm` | ~€3 | D-019 |
| Postgres | €0 extra: self-hosted on the VPS (D-049). Hosted alternatives cost more: Neon now bills by usage (no fixed $19), Supabase paid from $25, DigitalOcean from $15 | D-049 |
| Backup storage off the server, server snapshots | A few euros (Hetzner object storage, for example, starts at €6.49) | D-051 |
| Firebase Auth | €0. Email/password and Google sign-in, and custom tokens for the extension, are free on the Spark plan (no card needed) up to 50,000 monthly active users. Only phone/SMS sign-in, multi-factor auth and SAML/OIDC cost money or need the Identity Platform upgrade; we use none of them. Checked 2026-11-20 on third-party summaries of Google's pricing page; confirm there | D-053 |
| Sentry, uptime check | Not priced yet | |
| Domain | Not priced yet | |

## Per-use costs

| Item | Estimate | Source |
|---|---|---|
| Translation track, whole video at transfer | ~$0.03 per 1-hour video on gemini-3.1-flash-lite ($0.25 / $1.50 per 1M tokens, from a comparison site; confirm on Google's pricing page). Thinking tokens disabled. | D-023 (corrects D-018's $0.008 and D-021's ~$0.01) |
| Sense in context (Gemini) | Negligible; cached per (user, lemma, sentence hash) | `architecture-target/word-data.md` |
| Punctuation and sentences | Usually €0: YouTube's punctuation is kept, plus a free rule (D-077, D-078). Only unpunctuated tracks get the LLM step: measured $0.031–0.034 per hour of video (spike 002) | D-064, D-077 |
| spaCy analysis | €0 (local) | D-019 |
| Dictionary and frequency data | One-off import, €0 | D-010 |
| Transcription of uploads (postponed, D-066) | $0.04 per hour of audio (Groq Whisper turbo; $0.111 for large-v3). €0 when the file has subtitles | D-040 |
| Storage and bandwidth for uploaded video | €0: no media stored; audio deleted after transcription | D-040 |
| Demo deployment | No paid API calls; everything precomputed. Hosting not priced | D-038 |

## Estimated monthly API spend

At 150 hour-long video transfers a month: about **$4.50** (translation only, ~$0.03 per hour; punctuation is free for punctuated tracks, D-077). **Unmeasured:** the neighbouring sentences in the translation prompt (D-077) may double the input tokens, so the real figure may be closer to the earlier $9 (F-15). Uploads are postponed (D-066). Add the fixed costs above once they are priced.

## Reference: one hour of German video

Roughly 55,000 characters (~8,400 words, ~800 cues). What the replaced options would cost for it: DeepL $1.38, Google Translate $1.10, Azure $0.55, Google Cloud Natural Language syntax $0.028.

## Cost controls

- Monthly spend cap enforced by us in Redis, not left to provider budget alerts (D-022).
- Transfer quota counted in characters, a maximum size per transfer, and a repeat transfer of the same video treated as the same job (D-022).
- AI limiter: per-user daily quota and a global monthly cap, falling back to dictionary-only data (D-010).
- Translation behind a provider interface, so a retired or repriced model can be swapped (D-023).
- The demo makes no paid calls (D-038).

## Open

Server choice (Q-30) and the exact backup storage. Total so far: roughly €10–25 a month for the server and backups, plus $5–10 of API use, under the €30 soft cap.
