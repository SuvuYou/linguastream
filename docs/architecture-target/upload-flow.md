# Upload flow (D-040)

> **Postponed (D-066).** Designed, not built.

Private instance only. No video or audio is stored on the server.

1. The user picks a local video file. It plays from their disk.
2. The browser computes a **fingerprint** (file size + SHA-256 of sampled 1 MB pieces from start, middle and end) and checks the library: a match re-links the existing entry, no new processing.
3. If the file has subtitles (MKV subtitle track or a matching SRT/VTT), those are sent instead of audio and go straight to the normal pipeline. No transcription cost.
4. Otherwise the browser **extracts the audio track** (copy, no re-encode) and uploads it in resumable chunks.
5. The worker converts it to compressed mono, splits it into overlapping chunks, transcribes them in parallel through the transcription provider interface (Groq first), and stitches the timestamps.
6. Normal pipeline: normalise, spaCy, translate, index (`architecture-target/capture-flow.md`).
7. The audio is deleted. A test asserts nothing remains.

**Fallback:** if browser extraction fails for a file, the whole video is uploaded, the server extracts the audio and deletes the video immediately.

**Playback:** from the local file only. Chromium remembers the file handle locally; other browsers re-pick the file and it is matched by fingerprint. The server tracks no devices. Without the file, playback and card audio show "Locate file to play"; everything else works.

**Limits:** formats the browser cannot play (HEVC, some MKV) cannot be shown, since there is no server-side video conversion. A different encoding of the same film is a different file.

**Spike:** browser audio extraction on large MKV and MP4 files.
