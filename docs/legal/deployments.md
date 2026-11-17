# Deployments (D-038)

- **Private instance:** stores caption text on the server, so it is only for the developer and people they personally know. No public sign-up, ever. Its address is never published, and nobody is invited through a public post. Recruiters never get an account on it.
- **Demo deployment:** public, read-only, separate database, only content the developer has rights to. It cannot add videos or call paid APIs. It carries the Impressum, a privacy note and the YouTube consent prompt.
- **Public edition:** deferred. If revived: the server never persists transcript, translation or card text (D-032), adults only (D-033), launch conditions in D-037.
- **The extension lives in a separate private repository** and is given to friends directly; it is not in a store or a public repository (D-039).
- Rules about stored user content (`legal/copyright.md`, `legal/data-protection.md`) apply to the private instance; `legal/public-pages.md` applies to the demo.
