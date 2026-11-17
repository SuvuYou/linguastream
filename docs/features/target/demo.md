# Demo deployment (target)

Separate public, read-only deployment for recruiters (D-038).

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| Read-only demo mode: no capture, no adding videos, no paid calls | Backend | Demo | ⬜ | Separate deployment and database; everything precomputed |
| Preloaded rights-cleared sample videos | Data | Demo | ⬜ | Q-27 |
| Discard visitor changes (nightly reset or per session) | Backend | Demo | ⬜ | Q-27 |
| No login | UI | Demo | ⬜ | Preferred (D-038) |
| Impressum, privacy note, YouTube consent prompt, demo label | Compliance | Demo | ⬜ | `legal/public-pages.md` |
| Attributions page (Wiktextract, FrequencyWords) | Compliance | Demo | ⬜ | Guardrail 9 |
| README, screen recording, load-test numbers | Infra | Repository | ⬜ | |
