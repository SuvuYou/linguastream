# Decisions · 2026-11-16

Newest first. Rules and index: `decisions/README.md`.

## D-039 · Legal design final; extension in a separate private repository · 2026-11-16 · accepted
**Decision:** The legal design is final as of D-038. It is not reopened without new facts (a lawyer's view, a notice received, a change in what the product does).
- **Repositories:** the main application repository can be public; the browser extension, including the capture module, lives in a **separate private repository**. Resolves Q-26.
- **Private instance:** stays login-protected. An Impressum link on its login page is to be added later (the hostname is discoverable through public certificate logs, so this removes the dependence on assumption 13).
- **Who gets access:** the developer is selective; only people they personally know.
- **Public wording** (CV, LinkedIn, README) describes the tool accurately by its purpose, language learning, never as a subtitle saver or downloader.
- **Product name and trademark search:** not decided yet; done at the end, before the demo goes up (task in `roadmap/before-demo.md`, Q-20).

## D-038 · Private instance for friends plus a read-only demo; public edition deferred · 2026-11-16 · accepted
**Decision:** The product is deployed as:
1. **A private instance** for the developer and people they personally know: full features, transcripts stored on the server (Postgres), accounts created by hand, no public sign-up, address not published anywhere. No Impressum, public privacy policy or notice form (assumption 13). Friends are told what is stored and can have it deleted.
2. **A separate read-only demo deployment** for recruiters: same code, its own small database holding only preselected content the developer has rights to (own recordings, or Creative Commons videos with attribution; no music). No adding videos, no capture, no extension needed, no paid API calls (everything precomputed). Visitors can click words, search and try a review session; changes are not kept (nightly reset or per-session only). Preferably no login. Labelled as a demo.
3. **The public edition (D-031, D-032) is deferred, not deleted.** Storage and search stay behind interfaces so it can be added later. D-033 (adults only) and D-037 (launch conditions) apply if it is revived.

**The demo is a public page**, so it needs: an Impressum (real name and address), a short privacy note (server logs, YouTube player), the consent prompt before the YouTube player loads, and the trademark search for the name (Q-20) before it goes up.
**Extension:** given to friends directly (Chrome developer mode from a folder, or a signed private Firefox add-on); not listed in a store for now.
**For recruiters:** README, a short screen recording, the demo link, a live walkthrough in interviews, and a load test with published numbers in place of user counts. Never "message me for access".
**Why:** Friends-only is the strongest private-copy position and removes nearly all compliance work and the second codebase. The demo supplies the clickable link, which is most of what a public site would add to a job application.
**Changes the goal:** "about 50 daily users in Germany" is replaced by a small private group; the cost caps stay.
**Open:** whether the repository is public, private, or public with the extension's capture module in a separate private repository (Q-26). A public repository still distributes the capture code (D-034).
**Supersedes:** the public-edition parts of D-031, D-032 and D-035 for now.

## D-037 · Launch conditions for the public edition · 2026-11-16 · accepted (public edition deferred: D-038)
**Decision:** The public edition does not go live until all of these are done:
1. **Trademark search** for the product name in the DPMA and EUIPO registers (Q-20).
2. **A "forgets" test:** an automated test sends a marker sentence through the pipeline and asserts it is absent from the database, logs, job queue (including failed jobs) and error tracker afterwards. Also check how long the model provider retains prompts and state it in the privacy policy.
3. **Legal texts from an established German generator** (Impressum, privacy policy), not drafted by an AI assistant; they must list every processor and the YouTube embed.
4. **Separate Google accounts:** personal account holds nothing of the project; one project account for Firebase and the model provider's billing; one used only for the Chrome Web Store registration. Set up from the start; never as a way around a suspension.
**Recommended, not decided:** one lawyer consultation on the §95a question (D-034).
**Accepted residual risk:** distributing the extension and the open-source repository may be attacked under §95a(3) whatever the storage design; rated low, potentially four figures or more. The developer accepts it.

## D-036 · Unlawful sources: music blocked, video-ID blocklist, terms clause · 2026-11-16 · accepted
**Decision:**
- **Music:** the extension reads the video's YouTube category from the page it already has. Public edition: videos in the Music category are refused, with a short explanation. Personal edition: a warning only.
- **Blocklist by video ID:** a video reported through the notice form goes on a list; both editions refuse to process it from then on, and the personal edition deletes stored copies of it. The lookup is by video ID only and never reads transcript text (this is the one permitted cross-user use of `video_id`; guardrail 4 otherwise stands).
- **Terms:** users may only process videos they are allowed to use, for private study.
- **Not built:** title keyword filters or channel reputation checks. They are unreliable.
**Why:** §53 excludes obviously unlawful sources (D-034). Lyrics are the most actively enforced text. Pirated uploads cannot be detected reliably, so removal on notice is the honest control.
**Limits:** the category is set by the uploader, so the music check is imperfect. Whether the category is readable inside an embedded player on our own site is unverified (check with Q-06). Blocking music removes learning from songs in the public edition; accepted.

## D-035 · Two-edition design confirmed; recruiter showcase; accepted risks · 2026-11-16 · accepted
**Decision:** Confirms D-031 and D-032 with these points:
- **Personal edition:** hosted for the developer and personally known friends, transcripts stored on the server, all features, **no Impressum** (assumption: a login-gated instance with no public sign-up and no public promotion is not a service offered to the public; unverified, see `legal/unverified-assumptions.md`). Its URL is not published, including in the README.
- **Public edition:** the server stores account data and other selected data that contains **no text from videos** (exactly what is open: Q-25); transcripts, analysis, translations and cards live in the browser database; features limited. Impressum, privacy policy and the 18+ rule (D-033) apply.
- **Both editions get captions from the extension** (D-014). The risk that the Chrome Web Store removes or rejects it is accepted by the developer. Paste remains the fallback.
- **For recruiters:** the README, a short screen recording, and a demo on the public edition preloaded with content the developer has rights to (own recordings or Creative Commons videos with attribution). No recruiter gets an account on the personal edition.
**Not covered by the accepted store risk:** distributing the extension is also the act exposed to §95a (D-034). That exposure is known and unchanged.
**Rejected along the way:** cards on the public server with a per-video cap (a cap is hostile to real learners; cards stay in the browser).

## D-034 · Legal risk position after the 2026-11-16 review · 2026-11-16 · accepted
**Decision:** The risk of an Abmahnung cannot be removed, only reduced; the two-edition design (D-031) is the response. Recorded corrections to earlier reasoning:
- The private-copy basis (D-015) is an **analogy** to the recorder cases, not a precedent: the server also normalises, translates and sends text to a model provider, which no court has ruled on.
- §95a UrhG (anti-circumvention) is the weakest point and private copying is **no defence** to it. Distributing the extension is the exposed act, in both editions.
- §53 excludes obviously unlawful sources (pirated uploads, lyrics); judged copy by copy.
- The §97a(3) fee cap may not apply to the operator of a service; plan as if it does not.
- Competitors cannot recover fees for Impressum/privacy-notice errors (§13(4) UWG); associations can.
- Still no lawyer consultation (D-015 stands). A first consultation is capped at EUR 190 net for a consumer; recommended before the public edition opens, not decided.
**Unchecked:** trademark search for the name (Q-20); YouTube developer policies vs. the subtitle overlay on the embedded player (Q-21).

## D-033 · Model provider terms: adults only, paid tier · 2026-11-16 · accepted
**Decision:** The Gemini API requires the developer to be 18+, and (in at least the 2024 version of its terms) forbids use in apps directed at or likely to be accessed by under-18s. The public edition is adults-only: an 18+ line in the terms, a confirmation at sign-up, no marketing to schools or pupils. Paid tier only (required for EEA users; also the tier where submitted text is not used to improve Google products). The provider interface (D-023) stays so a suspended key means switching provider.
**Open:** confirm the wording on the live terms page (Q-24). Self-hosted translation (e.g. Opus-MT) is the fallback that removes the third-party transfer entirely; quality and VPS cost unmeasured.

## D-032 · Public edition: extension capture, accounts for quota only · 2026-11-16 · accepted (public edition deferred: D-038)
**Decision:** The public edition gets captions from the extension (passive copy, D-014), not from paste; paste stays a fallback. It has accounts, used only to enforce transfer and AI quotas (D-022). The server stores the account and usage counters and **no transcript, translation or card text**; it processes text and discards it. No text in logs, queues, caches or backups.
**Rejected (user decision):** paste-only capture and an account-free public edition, which Claude recommended as the smallest legal surface.
**Consequence accepted:** the public edition keeps the Chrome Web Store risk and the §95a exposure of distributing the extension; accounts mean personal data, so the privacy policy, account deletion and Impressum remain.

## D-031 · Two editions · 2026-11-16 · accepted (public edition deferred: D-038)
**Decision:** The product ships as two editions from one codebase.

| | **Personal edition** | **Public edition** |
|---|---|---|
| Users | The developer and people they personally know | Anyone (adults) |
| Sign-up | None public; accounts created by hand | Public |
| Features | Full | Limited by what works with browser storage |
| Transcripts, translations, cards | Server (Postgres), per user | The user's browser (IndexedDB), with file export/import |
| Search | Postgres full-text search | In-browser index |
| Server role | Stores and processes | Processes and forgets; accounts + quotas only (D-032) |
| Source | Open source | Same repository |

**Why:** A server-side store of other people's caption text offered to strangers is the main copyright exposure and the reason for most compliance work. Keeping the full backend for a private circle preserves the backend showcase (the repository is what recruiters read) while strangers only get the version with no stored copy.
**Limits:** "Friends" means people the developer actually knows; once strangers can join the personal edition it is a public service again. Open-sourcing the code is itself distribution of the capture tool (D-034). Two storage and search layers is roughly 1.5x the work: build the personal edition first, the public edition as a "local mode" of the same frontend.
**Supersedes:** the single public server-side product in D-009 and D-021 (their capture/transfer mechanics still apply inside each edition) and the invite-only plan discussed but never recorded.

## D-030 · Uploads, subtitle-file import and the Plyr/WhisperX components reopened · 2026-11-16 · accepted
**Decision:** Whether users can upload their own videos is **undecided** (Q-19). It depends on a cost estimate for storing or handling video and for transcription, which was never made. Until then:
- Subtitle file upload (SRT/VTT) is built but **disabled**; it may return later.
- The Plyr player stays in the code only as a candidate for uploaded videos; it is removed if uploads are dropped.
- Self-hosted WhisperX is not planned. If uploads stay, transcription uses a hosted transcription API. (Recommendation, not yet decided: WhisperX needs more CPU/RAM or a GPU than the VPS budget allows.)
- Jellyfin, LibreTranslate and the spawned Python ingest script are still being removed.
**Why:** D-001 excluded video storage on cost grounds without a number behind it, and the product-boundary table claimed "plays from the user's disk" without a worked-out design. Both were stated as settled when they were not.
**Reopens** the upload parts of D-001 and D-003. **Does not change** Jellyfin removal.

## D-029 · No transcript without a capture or a paste · 2026-11-16 · accepted
**Decision:** A YouTube video enters a library only through an extension capture or a transcript the user pastes (or an upload, if Q-19 settles that way). There is no other route: no server fetch, no catalog-supplied transcripts. A video found in the webapp, including a curated catalog entry, has no transcript until the user captures or pastes it.
**Why:** Guardrail 1 and the legal basis (D-015) require that content only arrives from the user. The extension or the paste is the user's action.
**Resolves** Q-16.

## D-028 · Adding by URL opens the embedded player and captures there · 2026-11-16 · proposed (needs spike)
**Decision:** When a user pastes a YouTube URL in the webapp, the video opens in the official embedded player on our own site and the extension intercepts the captions from that player, instead of the user having to go to youtube.com first.
**Why:** It is the more natural flow and keeps the user in the app.
**Open:** whether the XHR hook works inside an embed iframe (Q-06 is reopened; the 2026-11-15 embed test was invalid because it loaded `/embed/` as a top-level page); whether captions can be switched on in an embed without driving the player (method 4 needs its own decision); whether videos that forbid embedding make this flow impossible for them (D-027 then applies at paste time). Guardrails 12–15 must be re-read against the embed case before building it.
**Partly supersedes** D-021 ("capture happens only on youtube.com") and the "Q-06 resolved" note.
