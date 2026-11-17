# Data model (summary)

See `prisma/schema.prisma`.
- `User` (firebase_uid, native_language, is_admin)
- `MediaContent` (type, source_language, youtube_video_id / jellyfin_id / file_path, job_status/progress/logs)
- `SubtitleTrack` (language, is_source; unique per media + language) → `SubtitleLine` (index, start_ms, end_ms, text)
- `Deck` (name, is_default) → `Card` (word, lemma, word_translation, context_text, context_translation, media_content_id, start_ms/end_ms, SM-2 fields, word_profile_id)
- `WordProfile` (word, lemma, POS, JSON forms/lexical_family/collocations; unique per word + language)
- `StudySession` → `StudySessionCard`

`Card.media_content_id` is deliberately **not** a foreign key: cards survive when a video is deleted.
