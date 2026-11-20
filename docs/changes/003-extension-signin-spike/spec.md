# 003 – Extension sign-in spike
Status: done (D-079)
Roadmap step: 0 (spikes, phase 3)

## Problem
D-053 decides how the extension signs in: the server mints a short-lived Firebase **custom token** for the logged-in user, our page hands it to the extension (only our domain may message it), the extension signs in to Firebase itself and calls the API with its own **ID token**. Logout and account deletion revoke its session. None of this has run yet:
- Firebase in an MV3 extension needs the `firebase/auth/web-extension` import (Web SDK 10.8+). Firebase's guide lists `signInWithCustomToken` as supported there directly, without an offscreen document ([guide](https://firebase.google.com/docs/auth/web/chrome-extension)). Not tried by us.
- MV3 service workers can't load remote code, so the SDK must be bundled into the extension.
- The service worker is stopped when idle. Does the sign-in survive that, and does the ID token refresh itself after an hour?
- Our page must know the extension's ID to message it. Unpacked extensions get an ID from their folder path unless the manifest has a fixed `key`.
- How fast a logout on the site reaches the extension (revocation).

## Goal
A working end-to-end path, with evidence: **signed in on our page → one click → the extension is signed in as the same user → its API call is accepted → logout on the page → its next call is refused.** Time-box: one day.

## Setup
Outside the app repository, like the other spikes:
- **Firebase:** a separate test project (not the one your friends use), with email + password sign-in on and one test user. A service-account key for the server (kept out of git).
- **Server** (plain Node, standing in for NestJS): `firebase-admin`.
  - `POST /api/extension-token`: requires a signed-in page (ID token in the `Authorization` header for the spike; the session cookie in the real app), returns `createCustomToken(uid)`.
  - `GET /api/me`: accepts `Authorization: Bearer <ID token>`, verifies it with `verifyIdToken(token, true)` (revocation checked), returns the uid and email.
  - `POST /api/logout`: `revokeRefreshTokens(uid)`.
- **Page** (`http://localhost:8080`): sign in with email + password (web SDK), a "Connect extension" button that fetches a custom token and sends it with `chrome.runtime.sendMessage(EXTENSION_ID, …)`, and a "Log out" button.
- **Extension** (MV3, bundled with esbuild):
  - `manifest.json` with a fixed `key` (stable ID), `externally_connectable.matches` = `http://localhost:8080/*` only, `host_permissions` for the server.
  - Service worker: `onMessageExternal` checks the sender's origin, calls `signInWithCustomToken`, stores nothing itself (Firebase keeps the session).
  - Popup: shows who is signed in, a "Call /api/me" button and its result.

## Checks
1. **Bundle:** `firebase/auth/web-extension` bundles with esbuild and loads in the service worker without errors. Note the bundle size.
2. **Handoff:** the page's message reaches the extension; a message from any other origin is refused (try from a second local port).
3. **Sign-in:** `signInWithCustomToken` works in the service worker; the popup shows the same uid as the page.
4. **API call:** the service worker gets an ID token (`getIdToken()`) and `/api/me` accepts it. Note whether CORS needs anything beyond `host_permissions`.
5. **Survives restarts:** stop the service worker (`chrome://serviceworker-internals` or the extensions page), then open the popup: still signed in? After closing and reopening the browser?
6. **Refresh:** after more than an hour, does `getIdToken()` return a fresh token without a new handoff? (Or force it with `getIdToken(true)`.)
7. **Revocation:** after "Log out" on the page (`revokeRefreshTokens`), how soon does `/api/me` refuse the extension's token (immediately with `checkRevoked`)? Does the extension notice and show "signed out"? What does the token refresh do?
8. **Account deleted:** delete the test user in the console; same questions as 7.
9. **Opera:** all of the above in Opera as well as Chrome (Opera is your daily browser).

## Out of scope
NestJS and the session cookie (D-053's web side), Google sign-in inside the extension (the handoff avoids it), the production extension, store listing.

## Acceptance criteria
- [ ] Each check has a result in `results.md`.
- [ ] A short sequence diagram of the working flow, for `architecture-target/auth.md`.
- [ ] Answers to: how the page learns the extension ID; what the extension shows when its session is revoked; whether the API must check revocation on every call or only on sensitive ones.
- [ ] Results recorded in that day's decisions file.

## Needs before starting
- Block A, part 2 (Firebase Auth beyond the basics) in `study/block-a-before-the-spikes.md`, or learn it during the spike.
- A Firebase test project you create (free plan).
