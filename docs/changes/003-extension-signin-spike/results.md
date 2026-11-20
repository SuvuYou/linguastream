# 003 – Results

Spike code: `spike-003-extension-signin.zip` (outside the app repository). Firebase JS SDK 13.4.0, firebase-admin 14.5.1. Extension ID (fixed by the manifest key): `kboemeffohobecdiilicpinijpchenbf`. Date: ___.

## Checks
| # | Check | Chrome | Opera |
|---|---|---|---|
| 1 | `firebase/auth/web-extension` bundles and loads in the service worker; bundle size | works (reported), browser not noted (F-19) | not recorded (F-19) |
| 2 | Only `http://localhost:8080` can message the extension | works (reported), browser not noted (F-19) | not recorded (F-19) |
| 3 | `signInWithCustomToken` in the service worker; same uid as the page | works (reported), browser not noted (F-19) | not recorded (F-19) |
| 4 | `/api/me` accepts the extension's ID token; anything needed besides `host_permissions` | works (reported), browser not noted (F-19) | not recorded (F-19) |
| 5 | Signed in after a service-worker stop / after a browser restart | not recorded (F-16), browser not noted (F-19) | not recorded (F-19) |
| 6 | Token refreshes itself after an hour; forced refresh works | not recorded (F-17), browser not noted (F-19) | not recorded (F-19) |
| 7 | After logout (revocation): time until refused; extension shows signed out | works (reported), browser not noted (F-19) | not recorded (F-19) |
| 8 | After the account is deleted: same | not recorded (F-18), browser not noted (F-19) | not recorded (F-19) |

## Answers
- How the page learns the extension ID: a constant, fixed by the manifest `key`.
- What the extension shows when its session is revoked: ___
- Check revocation on every API call or only on sensitive ones: ___

## Flow (for `architecture-target/auth.md`)
___

## Follow-ups
- Record the outcome in that day's decisions file; update `architecture-target/auth.md`.
