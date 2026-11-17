# Account (target)

Private instance: accounts are created by hand, no public sign-up (D-038).

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| Email + password sign-in (Firebase) | UI | Sign-in | ✅ | 14-day httpOnly session cookie |
| Google sign-in | UI | Sign-in | ⬜ | Firebase provider |
| Route protection | Backend | Every page | ✅ | |
| Account page | UI | Account | 🟡 | Stub today |
| Account and data deletion | Backend + Compliance | Account | ⬜ | All tables + deletion log; `architecture-target/backups-and-deletion.md`. Friends can have their data deleted (D-038). |
| Impressum link on the login page | Compliance | Sign-in | ⬜ | D-039; listed in `roadmap/before-demo.md` |
| Landing page + sign-in modal, Firebase loaded lazily | UI | Landing | ⏳ | D-013 |
| Impressum, privacy policy, terms for public users | Compliance | Every page | ⏳ | The demo has its own: `target/demo.md` |
| DSA notice form + report button | UI + Compliance | Every page | ⏳ | `legal/dsa.md` |
