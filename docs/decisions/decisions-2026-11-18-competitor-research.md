# Decisions 2026-11-18: competitor research

## D-070 · Caption hash check is per user · 2026-11-18 · accepted
**Decision:** Before uploading a captured caption track, the extension sends a SHA-256 hash of the raw json3 file. The server looks only among that user's own processed tracks (video ID, track ID, hash, processing version). On a hit it reuses that track; on a miss the extension uploads and the track is processed. Processed tracks are never linked across users, including in the private instance.
**Why:** saves repeat uploads and processing when one user captures the same track again, while keeping the rule in `architecture-target/capture-flow.md` that nothing is shared between users. Idea from FluentAI's traffic (`research/competitors/language-reactor-and-fluentai-api.md`).
**Accepted cost:** two friends capturing the same video pay for processing twice.
**Rejected:** reuse across the private instance (would share captured captions between users).
**Resolves** Q-35. **Accepts** proposal 1 of `capture-flow.md`; the other proposals there stay open.
