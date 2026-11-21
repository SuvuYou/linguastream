# Decisions 2026-11-21: parallel frontend track and Trello boards

## D-088 · Trello boards track the build order of Foundation and Core · 2026-11-21 · accepted
**Decision:** The boards "LinguaStream Foundation" and "Lingua Stream Core" (lists: TODO Frontend, TODO Backend, In progress, Done) hold the work of roadmap sections A and B as cards. `[N]` in a card title is its place in the build order on that board. Each card names its roadmap step and decisions. `roadmap/steps.md` and `roadmap/feature-queue/` stay the source for scope and reasons; the boards track what is being worked on. Started as a test.
**Links:** https://trello.com/b/I42rzyAa/linguastream-foundation · https://trello.com/b/OEXM7Lks/lingua-stream-core

## D-087 · Frontend built on mock data in parallel with the backend · 2026-11-21 · accepted
**Decision:** After the monorepo exists (Foundation [2]–[4]), the web frontend is built in parallel with the backend, against mock data:
1. **Contract first.** Before a screen is built, its request/response shapes are written as Zod schemas in `packages/contracts` (D-054). Frontend mocks and backend implementation both follow the schema; a change to a shape is a change to the schema.
2. **Mocks at the network level** with MSW (Mock Service Worker). Components call the real API client from the start; switching to the backend means turning MSW off for that route.
3. **Mock data is real data** from the spikes (spike 002's processed `4Ja5iJtYOPw`, spike 004 dictionary entries and word packs), plus worst cases for `break-ui`.
4. **A signed-in user is mocked** until the auth guard (A3) works.
5. **Not mocked:** the extension (capture, sign-in handoff, transfer button). It needs real YouTube and a real API, so it follows the backend track.
6. Screens are designed (phase 5) right before they are built on mocks.
**Why:** one developer, so "parallel" means alternating tracks, not a shorter total (A + B stays ~20 weeks). It removes waiting on the backend and gives time to learn React and Next.js on real screens.
**Updates** the order in `roadmap/steps.md` (frontend steps no longer wait for their backend step).
