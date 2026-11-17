# Block A: before the spikes

**When:** first, before phase 3. **Leads into:** the spikes (D-062). **Hours:** about 19.
**Block exercise:** the spikes themselves are the exercise. Do the topic exercises first, then run `changes/000-embed-capture-spike/`.

## 1. Browser extensions (MV3) · ~8 h

**Learn**
- The manifest: `manifest_version: 3`, permissions vs host permissions, `content_scripts`, `background.service_worker`.
- Content scripts: isolated world vs `world: "MAIN"` (needed to patch the page's `XMLHttpRequest`), `run_at: "document_start"`, `all_frames` and iframes.
- The service worker lifecycle: it stops when idle, so no state in globals; use `chrome.storage`.
- Messaging: content script ↔ service worker, and `externally_connectable` so our web page can send the extension a token.
- Loading unpacked, reloading, and where each part's console and logs live.

**Exercise:** an extension that logs every `XMLHttpRequest` URL on youtube.com from a MAIN-world content script, and shows a count in the popup.

**Resources**
- [Chrome extensions: develop](https://developer.chrome.com/docs/extensions/develop)
- [Content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [Message passing](https://developer.chrome.com/docs/extensions/develop/concepts/messaging)
- [`externally_connectable`](https://developer.chrome.com/docs/extensions/reference/manifest/externally-connectable)
- [Service worker lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)

**You know it when** you can explain why the capture hook must run in the MAIN world at document start, and why the service worker can't hold the user's token in a variable.

## 2. Firebase Auth beyond the basics · ~4 h

**Learn**
- ID tokens (short-lived, refreshed by the SDK) vs session cookies (server-issued, up to 14 days).
- Custom tokens: the server mints one for a user, the client signs in with it (the extension handoff, D-053).
- Verifying on the server with the Admin SDK, and revocation (`revokeRefreshTokens`, `checkRevoked`).
- Using Firebase Auth inside an MV3 extension: import from `firebase/auth/web-extension` (Web SDK 10.8 or later) in the service worker and popup; sign-in methods that need a page (Google pop-up, reCAPTCHA) need an offscreen document; the extension's ID goes into the authorised domains. Check that `signInWithCustomToken` works from `web-extension` (that is what D-053 relies on).

**Exercise:** a Node script that mints a custom token, signs in with it, gets an ID token, verifies it, revokes the user and shows the verification failing.

**Resources**
- [Manage session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies)
- [Create custom tokens](https://firebase.google.com/docs/auth/admin/create-custom-tokens)
- [Verify ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Manage user sessions (revocation)](https://firebase.google.com/docs/auth/admin/manage-sessions)
- [Firebase Auth in a Chrome extension](https://firebase.google.com/docs/auth/web/chrome-extension)

**You know it when** you can draw the D-053 flow and say what happens to the extension's session when the user deletes their account.

## 3. LLM APIs in practice (Gemini) · ~5 h

**Learn**
- Calling the API, choosing a model, turning "thinking" off where it bills as output.
- Structured output: a JSON schema the response must follow.
- Tokens: counting them, the price per million input and output tokens, estimating a job's cost before running it.
- Rate limits, retries with backoff, timeouts.

**Exercise:** send 50 caption lines without punctuation, ask for punctuated text as JSON, log tokens and cost per call.

**Resources**
- [Gemini API docs](https://ai.google.dev/gemini-api/docs)
- [Structured output](https://ai.google.dev/gemini-api/docs/structured-output)
- [Token counting](https://ai.google.dev/gemini-api/docs/tokens)
- [Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)

**You know it when** you can predict a one-hour video's cost within a factor of two before running it.

## 4. Sequence alignment · ~2 h

**Learn**
- Longest common subsequence and word-level diffs.
- Normalising before comparing (case, punctuation) and mapping the result back to original word positions.
- Turning an alignment into the D-025 edit list, and rejecting it when a word was added, removed or changed (D-064).

**Exercise:** a function `deriveEdits(captured: string[], punctuated: string): Edit[] | Rejected`, with tests for an added word, a dropped word and a changed word.

**Resources**
- [jsdiff (`diff` on npm)](https://github.com/kpdecker/jsdiff)
- [Python `difflib`](https://docs.python.org/3/library/difflib.html)
- [Longest common subsequence](https://en.wikipedia.org/wiki/Longest_common_subsequence)

**You know it when** your function's tests prove the learner's words can never change.
