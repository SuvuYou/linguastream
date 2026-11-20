# Security requirements (D-082)

From the review of the spike decisions on 2026-11-20. These are requirements for the build, not options. The deployment is a private instance for friends (D-038, D-061), so the threats are modest; they are still cheap to get right from the start and expensive to retrofit.

## What we protect
- Friends' accounts (Firebase), their libraries, word lists and viewing history (which videos they captured is personal data).
- The model budget (Gemini) and the server.
- Secrets: the Firebase service-account key, the Gemini key.

## Extension
1. **The page can't drive a capture.** The hook runs in YouTube's page (MAIN world), so any script there (YouTube's own, an ad, another extension) can post the same messages to the bridge. Therefore:
   - The **transfer button** lives where page scripts can't click it: the extension popup or side panel, or a closed shadow root whose click handler accepts only `event.isTrusted`.
   - The bridge treats every message from the hook as untrusted: validated against the shared Zod schema (`packages/contracts`), size-capped, and only kept until the user transfers.
   - Player control (D-071) runs only after a trusted user action, never on a page message.
2. **No `innerHTML`** with captured text anywhere in the extension; render text as text.
3. **The MAIN-world script stays minimal**: wrap, read, post. No secrets, no tokens, no API calls from there. Only the service worker talks to our API.
4. **Token handoff:** `externally_connectable` lists only our domain, and the service worker checks `sender.origin` again. Preferred design (F-20): the page passes a short-lived one-time code; the service worker exchanges it for the custom token at the API, so page JavaScript never holds a token.
5. **Updates:** unpacked extensions don't update themselves. The API exposes the minimum supported extension version; an older extension shows "please update" and refuses to transfer. (Chrome Web Store unlisted is the alternative, with rule 16 of `legal/extension-capture-methods.md`.)

## API (NestJS)
6. **Authentication on every route**: session cookie (web) or ID token (extension), D-053. The signature is verified locally on every request; only the revocation lookup is cached, per user, for about a minute (D-080). Our own logout and account deletion clear that user's cache entry at once.
7. **CSRF**: the session cookie is `HttpOnly`, `Secure`, `SameSite=Strict`; every state-changing route also checks the `Origin` header against our domain.
8. **The custom-token route** (`POST /api/extension-token`, or the one-time-code exchange) requires the session cookie, the Origin check and a rate limit; it is logged without the token.
9. **Input limits**: request bodies capped (caption upload ≤ 5 MB), validated with the shared schemas, per-user rate limits, and the quotas and spend cap (D-022) checked before any model call.
10. **Every query scoped by `user_id`** (existing rule), including the hash check (D-070).

## Web pages
11. **Content Security Policy** on every page: no inline scripts, scripts only from our origin (and Firebase's when the sign-in modal loads, D-013). An XSS is the main way to steal a session.

## Secrets and operations
12. Service-account key and Gemini key live only on the server, as secrets readable by the app's user, never in the repository, never in the browser, never in logs. Keys used for spikes are deleted (the spike 003 key: `roadmap/spike-follow-ups.md`).
13. **No transcript text or personal data in logs or Sentry** (existing rule).
14. **Breakage monitoring**: a daily check against one known test video tells us when YouTube changes something the hook or player control relies on; the extension reports its own errors (without caption text) to our API.

## Privacy
15. The list of captured videos is personal data. The privacy note for friends (D-066) says what is stored, why, how long, and that deleting a video or the account removes it (`architecture-target/backups-and-deletion.md`).
