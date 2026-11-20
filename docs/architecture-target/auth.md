# Auth

**Since D-053:** one domain split by path (`/api/*` → NestJS, the rest → Next.js); both verify the Firebase session cookie through one shared check. The extension gets a short-lived custom token from our page, signs in to Firebase and sends ID tokens to NestJS.

- Web app: Firebase (Google sign-in or email + password) → existing httpOnly session cookie.
- Public pages don't load Firebase; the sign-in modal imports it dynamically (D-013).
- Extension (confirmed by spike 003, D-079):

```mermaid
sequenceDiagram
  participant P as Our page (signed in)
  participant A as API (NestJS)
  participant E as Extension service worker
  participant F as Firebase Auth
  P->>A: POST /api/extension-token (session cookie)
  A->>F: createCustomToken(uid)
  A-->>P: custom token (one-time)
  P->>E: chrome.runtime.sendMessage(EXTENSION_ID, token)<br/>only our origin (externally_connectable + origin check)
  E->>F: signInWithCustomToken (firebase/auth/web-extension, bundled)
  E->>A: API calls with its own ID token (Bearer)
  A->>F: verifyIdToken(token, checkRevoked)
  Note over P,A: Logout or account deletion → revokeRefreshTokens(uid)
  A-->>E: 401 revoked → the extension signs itself out
```

  The extension ID is a constant set by the manifest `key`. The session survives service-worker restarts and browser restarts; the ID token refreshes itself.

Since D-038 the private instance has no public sign-up (accounts are created by hand) and the demo preferably has no login. The landing page and sign-in modal (D-013) therefore apply to the deferred public edition, or to the demo if it ever needs a login.
