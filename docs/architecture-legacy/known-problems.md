# Known problems

- `spawn-ingest` needs a local Python venv; it can't be deployed.
- The Jellyfin stream URL sends the API key to the browser.
- yt-dlp is blocked from datacenter IPs, and server-side fetching from YouTube is ruled out anyway (D-007).
- Missing indexes on `SubtitleLine`, `Card`, `MediaContent`.
- No rate limits on routes that call paid or free-tier APIs.
- Word lookup is slow: the panel's translation waits on a Gemini call, and definitions aren't saved.
