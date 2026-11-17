# Account (legacy)

What the code does today, verified against commit `5e043e7` (2026-11-14). Fate: **Keep**, **Change**, **Disable** or **Remove**. Target: `features/target/account.md`.

| Feature | Fate | Notes |
|---|---|---|
| Email + password sign-in (Firebase), `/auth/signin`, 14-day httpOnly session cookie | Keep | Google sign-in to be added |
| Route protection: `proxy.ts`; API routes check `getCurrentUser()` | Keep | |
| Account page, `app/account/page.tsx` | Change | Stub |
| `is_admin` from the database, admin screens | Change | The Jellyfin admin mode goes (`legacy/library.md`) |
