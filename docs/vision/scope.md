# Scope

## How it is deployed (D-038)

- **Private instance:** full features, data on the server, for the developer and people they know. Not public.
- **Read-only demo:** a separate public deployment with preselected, rights-cleared content, for recruiters.
- **Public edition:** deferred.

The boundary table below describes the private instance.

## Product boundary (decided 2026-11-15)

| In scope | Out of scope |
|---|---|
| YouTube videos in the official embedded player; subtitles captured by the user through the extension (or pasted) and stored privately for that user | The server fetching anything from YouTube |
| Private, isolated library per user | Public library, shared transcripts, public transcript pages |
| Accounts via Google sign-in or email + password | Paid tier or ads (see `legal/copyright.md`, rule 7) |
| Optional later: a curated catalog of YouTube channels (metadata only) | Jellyfin, Netflix and other streaming sites |

**Uploads (D-040):** designed, postponed (D-066). The video plays from the user's disk; the audio is transcribed and deleted; no media is stored on the server.

Reasons and legal basis: `decisions/` and `legal/`.
