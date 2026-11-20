# Capture and transfer (target)

The extension lives in a separate private repository and is given to friends directly (D-039).

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| Capture the caption track | UI | Extension on youtube.com; embedded player on our site (proposed) | ⬜ | Passive copy of the player's own caption response (D-014). Needs captions on in the source language. Source track only (D-016). Capture inside our embed works (spike D-072). Captions on: player control in the private instance, a prompt in the public edition (D-071). |
| Transfer button → full processing | UI + Backend | Extension | ⬜ | "Open in LinguaStream" (D-021). Quota in characters (D-022); hidden if the video forbids embedding (D-027). |
| Add YouTube video by URL | UI + Backend | Library | 🟡 | Today: oEmbed metadata only. Target (D-028, proposed): paste a URL → the video opens in the embedded player → the extension captures there. Spike passed (D-072). |
| Music check and video-ID blocklist | Backend + Compliance | Extension, server | ⬜ | D-036. The private instance warns on Music-category videos; the blocklist applies on every deployment. |
| Extension sign-in (token handoff) | Backend | Extension | ⬜ | D-053 |
| "Paste transcript" fallback | UI | Library | ⬜ | Only if the extension method fails (D-014). Also the only route for a video without a capture (D-029). |
