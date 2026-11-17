# Changes

One folder per roadmap step or self-contained change: `docs/changes/NNN-short-name/`.

## Workflow

1. **spec.md** – what and why. Written first, reviewed by you, before any code.
2. **plan.md** – how: affected files, schema changes, API changes, risks, test plan.
3. **tasks.md** – a checklist small enough that each item is one commit or PR.
4. Implement task by task on a `feature/NNN-short-name` branch.
5. **When done:** in the same PR, update `features/legacy/` and `features/target/`, `architecture-legacy/` and `architecture-target/`, and add any decisions to today's file in `decisions/`; then set the spec's status to `done`. The folder stays as a record.

## spec.md template

```markdown
# NNN – Title
Status: draft | approved | in progress | done
Roadmap step: N

## Problem
What's wrong or missing today, with evidence (numbers, code references).

## Goal
What changes for the user. Measurable where possible.

## Out of scope

## Acceptance criteria
- [ ] ...

## Decisions needed
Links to open-questions.md entries.
```

## plan.md template

```markdown
# NNN – Plan

## Approach
## Schema changes (migration names)
## API changes (routes, request/response shapes)
## Files touched
## Risks and rollback
## Tests (unit / integration / e2e)
```

## tasks.md template

```markdown
# NNN – Tasks
- [ ] 1. ...
```
