# 003 – Results

Spike code: `spike-003-extension-signin.zip` (outside the app repository). Firebase JS SDK 13.4.0, firebase-admin 14.5.1. Extension ID (fixed by the manifest key): `kboemeffohobecdiilicpinijpchenbf`. Date: ___.

## Checks
| # | Check | Chrome | Opera |
|---|---|---|---|
| 1 | `firebase/auth/web-extension` bundles and loads in the service worker; bundle size | works (2026-11-20) | works (2026-11-20) |
| 2 | Only `http://localhost:8080` can message the extension | works (2026-11-20) | works (2026-11-20) |
| 3 | `signInWithCustomToken` in the service worker; same uid as the page | works (2026-11-20) | works (2026-11-20) |
| 4 | `/api/me` accepts the extension's ID token; anything needed besides `host_permissions` | works (2026-11-20) | works (2026-11-20) |
| 5 | Signed in after a service-worker stop / after a browser restart | works (2026-11-20) | works (2026-11-20) |
| 6 | Token refreshes itself after an hour; forced refresh works | works (2026-11-20) | works (2026-11-20) |
| 7 | After logout (revocation): time until refused; extension shows signed out | works (2026-11-20) | works (2026-11-20) |
| 8 | After the account is deleted: same | works (2026-11-20) | works (2026-11-20) |
| F-20 | One-time code variant: the page passes a short code, the service worker exchanges it for the custom token at the API; the page never sees the token | works (2026-11-20) | works (2026-11-20) |

## Answers
- How the page learns the extension ID: a constant, fixed by the manifest `key`.
- What the extension shows when its session is revoked: ___
- Check revocation on every API call or only on sensitive ones: ___

## Flow (for `architecture-target/auth.md`)
___

## Follow-ups
- Record the outcome in that day's decisions file; update `architecture-target/auth.md`.
