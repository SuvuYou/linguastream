# 4. Demo

Going live: deployment and operations (D1), then friends, then the public read-only demo for recruiters (D2, D-038). After Essential, so the demo shows the differentiators. Study: Block D before D1 (D-090). Checklist: `roadmap/before-demo.md`.

| # | Feature | Target file | Status | Why here / depends on |
|---|---|---|---|---|
| | **Deployment and operations (D1)** | | | |
| 1 | Docker Compose deployment on a VPS | [platform](../../features/target/platform.md) | ⬜ | First deployment; moved from Foundation |
| 2 | CI builds and deploys | [platform](../../features/target/platform.md) | ⬜ | Needs 1 |
| 3 | Nightly `pg_dump` off the server + snapshots; one practised restore | [platform](../../features/target/platform.md) | ⬜ | Before anyone's data is on the server |
| 4 | Sentry (scrubbed), structured logs, health check | [platform](../../features/target/platform.md) | ⬜ | Before friends use it |
| 5 | Account and data deletion (#60) | [account](../../features/target/account.md) | ⬜ | Promised in the privacy note (D-066) |
| | **Milestone: friends** | | | |
| | **Read-only demo (D2)** | | | |
| 6 | Read-only demo mode: no capture, no adding videos, no paid calls | [demo](../../features/target/demo.md) | ⬜ | Separate deployment (Q-32) |
| 7 | Preloaded rights-cleared sample videos | [demo](../../features/target/demo.md) | ⬜ | Q-27 |
| 8 | Discard visitor changes | [demo](../../features/target/demo.md) | ⬜ | Q-27 |
| 9 | No login | [demo](../../features/target/demo.md) | ⬜ | D-038 |
| 10 | Consent prompt before the YouTube player loads | [watching](../../features/target/watching.md) | ⬜ | Required on the demo (guardrail 19) |
| 11 | Impressum, privacy note, YouTube consent prompt, demo label | [demo](../../features/target/demo.md) | ⬜ | Public page; check Q-21 first |
| 12 | Impressum link on the login page | [account](../../features/target/account.md) | ⬜ | D-039 |
| 13 | Attributions page (Wiktextract, FrequencyWords) | [demo](../../features/target/demo.md) | ⬜ | Wiktionary is CC BY-SA |
| 14 | README, screen recording, load-test numbers | [demo](../../features/target/demo.md) | ⬜ | Last: shows the finished demo |
