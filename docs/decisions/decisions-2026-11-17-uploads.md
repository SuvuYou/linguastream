# Decisions · 2026-11-17

Newest first. Rules and index: `decisions/README.md`.

## D-040 · Uploads: audio processed and discarded, no media stored, files matched by fingerprint · 2026-11-17 · accepted
**Decision (private instance):**
- **No video and no audio is stored on the server.** The video plays from the user's own disk.
- **Flow:** the browser extracts the audio track from the local file (copy, no re-encode) → resumable chunked upload → the worker converts it to compressed mono audio → chunks transcribed in parallel through a transcription provider interface (Groq Whisper first: $0.04/hour turbo, $0.111/hour large-v3; fallback provider TBD) with overlap and timestamp stitching → normal pipeline (normalise, spaCy, translate, index) → audio deleted. Deletion is enforced and covered by a test.
- **Fallback if browser extraction fails for a file:** upload the whole video, extract the audio on the server, delete the video immediately (processed, never kept).
- **Subtitles already in the file** (MKV subtitle tracks, or a matching SRT/VTT) are used instead of transcription, at no cost. This re-enables the SRT/VTT import that D-030 disabled, for the private instance.
- **File identity:** a fingerprint (file size + SHA-256 of sampled 1 MB pieces from start, middle and end) is stored with the library entry. On any device the user picks the file and it is matched by fingerprint; renamed or moved files still match. Remembering the file (File System Access handle) is local to each browser. **The server tracks no devices.**
- **Without the file:** transcript, translation, search, word lists and cards still work; playback and card audio show "Locate file to play".
- **Quotas and the spend cap** (D-022) also cover transcription.
- **Everything runs on the hosted server.** No home-PC worker.
**Why:** storing media costs money and adds hosting exposure for nothing the user cannot get from their own copy.
**Cost:** about $0.07 per hour of audio (transcription $0.04 + translation ~$0.03); 10 users × 5 hours a month ≈ $3.50. No storage cost.
**Accepted limits:** card clips replay only where the file is available; a different encoding of the same film needs its own upload; browser playback depends on the file's format (HEVC and some MKV may not play; there is no server-side video conversion); remembering files works only in Chromium.
**Legal:** the user's own files, lawful sources only (terms). Pirated downloads and rips that break copy protection are not covered by the private-copy exception; anything reported or known to be unlawful is deleted. The transcription provider is a third-party processor: check its retention, training and age terms before use.
**Spike needed:** browser audio extraction on large MKV and MP4 files.
**Rejected:** storing the full video or a playback proxy (cost, CPU for conversion); keeping the compressed audio for card clips (no reason to store it); a home-PC worker (must be hosted the whole time).
**Resolves** Q-19. **Updates** D-030: Plyr is only a UI choice (a free library); self-hosted WhisperX is not used.
