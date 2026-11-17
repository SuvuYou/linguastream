# Auth

- Web app: Firebase (Google sign-in or email + password) → existing httpOnly session cookie.
- Public pages don't load Firebase; the sign-in modal imports it dynamically (D-013).
- Extension: a short-lived token handed over by the logged-in site, refreshed by the extension. Details TBD in the extension spike.

Since D-038 the private instance has no public sign-up (accounts are created by hand) and the demo preferably has no login. The landing page and sign-in modal (D-013) therefore apply to the deferred public edition, or to the demo if it ever needs a login.
