# Target architecture: overview

> **Provisional.** Architecture, features and scope are still being decided (see `open-questions.md`). This file records the current best design and is rewritten as decisions are made. Anything marked *open* is undecided, not planned.

> **Deployments (D-038, 2026-11-16).** What follows describes the **private instance** (server-side storage, friends only). A separate **read-only demo** runs the same code against its own database of rights-cleared content. The public edition (browser storage) is deferred; keep storage and search behind interfaces so it can be added. Public-page elements in this folder (landing page, sign-in modal, DSA form) now concern the demo or the deferred edition, not the private instance.

How the app is meant to work once the roadmap steps land. For how it works today, see `architecture-legacy/`.


One EU VPS running Docker Compose (D-006). *Open (Q-15):* where Postgres runs: Neon today, possibly the VPS.

```mermaid
flowchart LR
  subgraph Client
    LP[Landing page<br/>no third-party requests]
    APP[Logged-in app<br/>YouTube embed, Sentry]
    EXT[Chrome extension]
  end
  LP -- sign-in modal loads Firebase --> FB[Firebase Auth]
  EXT -- captured captions --> API
  APP --> C[Caddy TLS]
  C --> API[Next.js<br/>pages + API]
  API --> PG[(Postgres, location open Q-15<br/>data + full-text search)]
  API --> R[(Redis<br/>cache, rate limits,<br/>AI quotas)]
  API -- enqueue --> Q[Job queue]
  Q --> W[Worker]
  W --> SP[spaCy<br/>local]
  W --> TR[Translation provider<br/>LLM, D-023]
  W --> GM[Gemini<br/>word sense]
  W --> GQ[Transcription API<br/>uploads, D-040]
  W --> PG
  API -- SSE progress --> APP
```
