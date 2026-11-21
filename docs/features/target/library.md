# Library (target)

Adding a YouTube video (by URL, capture, paste) is in `target/capture.md`.

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| Personal library: list, type filter, search, delete | UI | Library | ✅ | |
| Local video + audio-only transcription | UI + Backend | Library | ⏳ | Postponed (D-066). D-040. Video plays from disk; audio extracted in the browser, transcribed, deleted. `architecture-target/upload-flow.md` |
| File fingerprint and "Locate file to play" | UI + Backend | Library, watch page | ⏳ | Postponed (D-066). D-040. No device tracking |
| Player for local files | UI | Watch page | ⏳ | Plyr (free library) or a plain `<video>`: UI choice only (D-040) |
| Subtitle file import (SRT/VTT, embedded MKV tracks) | UI + Backend | Library | 🟡 | SRT/VTT import exists; kept for the private instance and used instead of transcription when available (D-040) |
| Level per video: known %, difficulty band, "at my level" filter (feature review #55) | UI | Library | ⏳ | Discovery page, bottom of the list |
| Pick interests / channels for discovery (feature review #56) | UI | Onboarding | ⏳ | Discovery page, bottom of the list |
