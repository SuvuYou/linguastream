# Data protection (GDPR) in day-to-day work

23. **New third-party processor:** update the privacy policy and the processor list in the same PR, before merging. Current list: Firebase (Google), the database host, Gemini, the VPS host, Sentry. Planned: a hosted transcription API for uploads (D-040; Groq first), audio deleted after transcription. Removed from the design: DeepL (D-017), Google Cloud Natural Language (D-019) — spaCy runs locally and sends nothing anywhere.
24. **Paid tiers of AI APIs for user content.** Some free tiers allow the provider to use submitted data. Check the terms before sending user text anywhere.
25. **Account deletion covers every table.** A new table holding user data must be added to the deletion routine and its test in the same PR.
26. **Deletion is immediate in live systems.** Backups expire on a fixed, documented cycle (see `architecture-target/backups-and-deletion.md`). If a backup is ever restored, the deletion log is re-applied before the app goes back online.
27. **No transcript text or personal data in logs or Sentry.** Scrub request bodies; log IDs, not content.
28. **Transactional emails only.** No marketing emails without double opt-in.
