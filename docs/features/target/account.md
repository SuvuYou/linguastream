# Account (target)

Private instance: accounts are created by hand, no public sign-up (D-038).

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| Email + password sign-in (Firebase) | UI | Sign-in | ✅ | 14-day httpOnly session cookie |
| Google sign-in | UI | Sign-in | ⬜ | Firebase provider |
| Route protection | Backend | Every page | ✅ | |
| Account page | UI | Account | 🟡 | Stub today |
| Account and data deletion (feature review #60) | Backend + Compliance | Account | ⬜ | All tables + deletion log; `architecture-target/backups-and-deletion.md`. Friends can have their data deleted (D-038). |
| Impressum link on the login page | Compliance | Sign-in | ⬜ | D-039; listed in `roadmap/before-demo.md` |
| Landing page + sign-in modal, Firebase loaded lazily | UI | Landing | ⏳ | D-013 |
| Impressum, privacy policy, terms for public users | Compliance | Every page | ⏳ | The demo has its own: `target/demo.md` |
| DSA notice form + report button | UI + Compliance | Every page | ⏳ | `legal/dsa.md` |
| Onboarding: learning, native (and UI) language in one step (feature review #54) | UI | Onboarding | ⬜ | D-057 |
| Themes: light, dark, system (feature review #62) | UI | Every page | ⬜ |  |
| Usage page: per-feature usage against quotas (feature review #64) | UI | Account | ⬜ |  |
| Signed-in devices with sign-out (feature review #65) | UI | Account | ⏳ | Maybe never: needs our own session table |
| Separate interface language (feature review #66) | UI | Every page | ⏳ | i18n set up from the start (D-057); translations later |
