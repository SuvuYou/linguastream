# LinguaStream docs

Knowledge base for the app. Paths in these docs are written from `docs/`.

| Folder | What's in it |
|---|---|
| `vision/` | What the product is, differentiators, scope and deployments, targets, glossary |
| `features/` | Feature lists: `legacy/` (what the code does today) and `target/` (what we're building), by capability; `by-page.md` for the page view |
| `architecture-legacy/` | How the app works today |
| `architecture-target/` | How it is meant to work, including `cost.md` |
| `codebase-guide/` | Layout, commands, conventions, git workflow |
| `legal/` | Legal guardrails every change must respect |
| `decisions/` | Daily decision archive (`decisions-{date}-{topic}.md`) with an index |
| `roadmap/` | The plan (`plan.md`, D-062), the phase 1 backend checklist, the draft steps and the tasks before the demo |
| `study/` | The study plan (`plan.md`) and a study guide with resources for each block |
| `research/` | Research behind open decisions (e.g. word data sources) |
| `open-questions.md` | Questions that block or shape a step |
| `changes/` | One folder per roadmap step or change: spec, plan, tasks |
| `Inspiration/` | Competitor screenshots with notes, grouped by feature; `feature-review.md` rates and orders the candidate features |

## Rules

- **One topic per file.** A new topic gets a new file in the folder it belongs to.
- **Legacy and target.** Legacy describes what the code does today, target what it should do. When a change lands, update both in the same PR.
- **Decisions are never edited.** A new decision that supersedes an old one goes into today's file in `decisions/`; questions it answers are deleted from `open-questions.md`.
- **Terms** are defined in `vision/glossary.md`. "Private instance" is the current name for what D-031 to D-036 call the "personal edition".
