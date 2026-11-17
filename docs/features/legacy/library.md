# Library (legacy)

What the code does today, verified against commit `5e043e7` (2026-11-14). Fate: **Keep**, **Change**, **Disable** or **Remove**. Target: `features/target/library.md`, `features/target/capture.md`.

| Feature | Fate | Notes |
|---|---|---|
| Personal library: `/dashboard/personal`, type filter, search, delete | Keep | |
| Add YouTube video by URL (oEmbed metadata only) | Change | Becomes the embedded-player capture flow (D-028, proposed) |
| Subtitle file upload (SRT/VTT) | Keep | Used instead of transcription when a file has subtitles (D-040) |
| Local ingest pipeline: `spawn-ingest` → `ml/ingest-subtitles.py` → WhisperX (transcription) + LibreTranslate (translation) | Remove | Can't be deployed. Replaced by the queue + worker and the translation provider (D-023); self-hosted WhisperX not planned (D-030) |
| Server-side YouTube captions via yt-dlp (`/api/youtube/subtitles`) | Remove | D-007 |
| Jellyfin library (`/dashboard`, `/` redirects there), sync, admin "unregistered" mode, stream route | Remove | D-001. Also removes the API-key leak |
