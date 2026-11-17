# Copyright

1. **The server never fetches anything from YouTube.** No yt-dlp, no caption endpoints, no audio downloads, no scraping, no third-party transcript APIs. Content only arrives from the user (extension capture, pasted transcript, own local video files once uploads are built, D-040, postponed D-066).
2. **Every capture is started by the user, one video per action.** No bulk import, no channel import, no background capture.
3. **The pipeline is fully automated.** Nobody fixes, curates or reviews a user's transcripts by hand, and no admin screen shows transcript text. The legal basis depends on the user, not the operator, being the one who makes the copy (D-015).
4. **Strict per-user isolation.** No shared or deduplicated transcripts, analysis results or search results. Every cache key and query on user content includes `user_id`, never only `video_id`.
5. **No public or shareable transcript pages**, no SEO pages per video, no public profiles showing library content.
6. **No export of YouTube caption text** (.srt, .txt, full transcript). Exporting a single context sentence per flashcard (e.g. Anki) is OK **[PROPOSED]**.
7. **Stays free, as a safety margin.** The court cases the design relies on also covered commercial services, so charging wouldn't automatically remove the legal basis. Still: no paid tier and no ads without a legal review first.
8. **Terms of service limit use to private individuals and private study.**
9. **Only owned or licensed assets** (images, icons, fonts). Credit CC-BY-SA data sources (Wiktextract, FrequencyWords) on an attributions page.
10. **Catalog (if built): metadata only**, only in the logged-in area, refreshed or deleted within 30 days (YouTube API Services policy). No ranking by YouTube statistics.
11. **Cross-user aggregates of lemma statistics** (no text) for discovery or recommendations: not built until reviewed.
