# Language Reactor and FluentAI: what their network traffic shows

Observed 2026-11-18 in the browser's DevTools (Network tab, including the extension service worker) while using both extensions on youtube.com and Language Reactor's own site. Learning German, native English; test video in English (`IHDvQO9HAV8`, ~50 min). Tokens, email addresses and session IDs are left out on purpose.

This is for learning their design only. We do not call their APIs, and we do not use unofficial endpoints (see `legal/`).

## Language Reactor (dioco.io)

**Captions: the extension uploads what the player loaded.** On youtube.com, `caption_prepareSource` is a POST with the raw json3 caption file (`rawJson3`, ~1 MB for 50 min), `videoId`, `sourceVssId` (`a.en` = auto-captions) and `sourceLang_G`. The response is the cleaned, timed subtitles. Key format: `p_<videoId>_<vssId>_<target>_<hash>`. On their own site, `base_media_getYoutubeSubsTranslations` returns subtitles by video ID alone; most likely from a cache filled by extension uploads (not confirmed).

**NLP: a separate step, keyed by content hash.** `getNLP_11?key=SUBS_<lang>_2_<hash>&tm=3`. Per word: `form`, `form_norm`, `lemma`, `pos` (Universal Dependencies), `xpos` (STTS for German: `NN`, `NE`), `feats` (morphology), `deprel` and `pointer` (dependency relation and head index), `freq`. Whitespace is stored as its own token (`pos: "WS"`). The labels (`nsubj`, `amod`, `obl:tmod`) are Universal Dependencies, so the parser is probably Stanza or UDPipe, not spaCy (spaCy's German model uses TIGER labels; separable particles are `svp`).

**Senses: per subtitle track, precomputed.** `base_dict_getHoverDictEntriesForSubs_2?key=SUBS_de_2_<hash>&sl=de&tl=en&g=2.5…`, served from the browser's disk cache. For each word, in order of appearance, a list of senses: `pos`, `translation`, `definition`, `exampleStudy`/`exampleNative`, `grade` (`EXACT`), `kind` (`SENSE`, `EXPRESSION`, `CATCH_ALL`) and `share` (how common the sense is, e.g. 0.27). If senses really are per occurrence, they choose the sense in context ahead of time. `base_stats_senseEvents_1` after a click suggests they log which sense people open.

**Hover: a cacheable GET.** `base_dict_getHoverDict_8?form=aber&lemma=&sl=de&tl=en&pos=ADV&pow=n` returns 2–3 short glosses (`["but", "however", "only"]`). `Cache-Control: public, max-age=31536000` (a year) on BunnyCDN, so a repeat lookup never leaves the browser. The version in the name (`_8`) and parameters like `g=2.5` let them invalidate caches.

**Click:** `base_dict_getFullDict_9` (full entry) and `base_lexa_generate` (probably their AI explanation). `base_lexa_getConversation` is their AI chat; empty when not signed in.

**Saved words:** `base_items_getItems_6`. Key = lemma (`WORD|flasche|de`); `learningStage: "LEARNING"` separate from `reviewData`; `context` holds the line, its tokens, translations, `wordIndex` and `thumb_prev`/`thumb_next` (video thumbnails around the moment); `freqRank`; `source: "YOUTUBE"`.

**Discovery:** `base_media_getMediaPlaylists_5` with filters (tab, search text, duration, sort) and a frequency band (`freq95`).

**Other:** endpoint names carry a version (`_2`, `_5`, `_8`); everything goes through BunnyCDN; user-specific calls are `no-store`.

## FluentAI (fluentai.pro)

**API:** tRPC with batching (`/api/trpc/<router>.<procedure>?batch=1`).

**Track discovery on the server.** `platformDiscovery.discover`: the extension sends the intercepted player JSON plus an object graph read from the page (nodes and edges, `sources` of kind `INTERCEPTED_JSON` and `OBJECT_GRAPH`). The server returns candidate tracks with a confidence, a role (`SOURCE`), the language and whether it is the original version, under `strategyVersion: "structural-v1:youtube-provider-roots-v2"`. YouTube-specific logic lives on the server, so they can fix breakage without an extension release.

**Original audio language.** `platformSubtitleParser.readYoutubeOriginalAudioLanguage` takes YouTube audio track IDs (`251;<base64>`; 251 = Opus audio). Decoded, the base64 holds `acont=original, lang=en-US` or `acont=dubbed-auto, lang=it` etc. So they know which audio is original and which is YouTube's AI dub.

**Hash check before upload.**
1. `lookupParsedSubtitlePack` (GET, by platform, video ID, track key, language): `MISS`.
2. `linkParsedSubtitlePayload` (POST) with `rawKey` = SHA-256 of the raw caption file: `HIT`, existing pack linked to this video. The raw file is uploaded only if the server has never seen that hash.
3. The pack: `parseKey = YOUTUBE:youtube-json-v2:<rawKey>`, `parserVersion`, `segmentCount`, `timedSegments` (start, end, text).

**Learning-language subtitles from AI dubs.** With Italian as the learning language on the English video, the pack was `trackKey: "a.it"`: YouTube's auto-captions of the Italian auto-dub audio, one segment per word (9,992 segments vs 551 for the English track). A learning language is offered only when a dub exists (German: `MISS` for this video).

**Translation: unofficial Google Translate, one line at a time, from the service worker.** `clients5.google.com/translate_a/t?q=<line>&client=dict-chrome-ex&sl=en&tl=de`: the client ID of Google's Dictionary extension, no API key. Lines are translated in windows around the playhead; jumping outside the window costs 1–3 s. Requests come from the background service worker, so they are invisible in the page's DevTools. Chunks follow caption windows, not sentences, which shows in the output: "all right punishment you get to lose your legs" became "Strafe dafür, dass du deine Beine verlierst".

**Telemetry.** `playbackSnapshot.record` sends page title, URL, user agent, extension version, language settings and every audio and text track with `isPunctuated` (401 when signed out). PostHog (EU) for analytics: web vitals on, exception autocapture off, session recording configured.

**Hover:** calls to Language Reactor's `getHoverDict_8` were seen during the FluentAI session; both extensions were installed, so these were probably Language Reactor's (Initiator not checked).

## Comparison

| | Language Reactor | FluentAI |
|---|---|---|
| Captions | Extension uploads raw json3 every time | Hash check first, upload only on a miss |
| Processing key | Video, track, content hash | Platform, parser version, content hash |
| NLP | Full dependency parse, Universal Dependencies labels | Not seen |
| Word meanings | Per subtitle track, precomputed, with sense share | Not seen |
| Hover glosses | Cacheable GET, cached for a year | Not seen |
| Translation | Own server | Unofficial Google Translate, line by line, in the browser |
| Learning-language source | Original captions | Captions of YouTube's AI dubs |

## What we take

Proposals, not decisions:
- Hash check before upload, per user (D-070); a processing version in the key (proposal): `architecture-target/capture-flow.md`.
- Store `dep` and `head` per token (separable verbs, grammar breakdown): same file.
- Original vs dubbed flag per track; dubbed audio as a possible content source: Q-36.
- Choose each occurrence's sense in one batch at processing time: third option in Q-34.
- Small-popup glosses as cacheable GETs with a version in the URL: `architecture-target/word-data.md`.
- A thumbnail time on each connection for the card front.
- Spike checks: punctuation and `[music]`-style tags in German auto-captions, audio/dub tracks visible to the capture.

Not taken: unofficial translation endpoints, sending page structure or telemetry to our server, sharing one user's captures with everyone outside the private instance.
