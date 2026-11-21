# Dev tooling setup (roadmap step A0)

> Added 2026-11-21. Do this before A1. Claude Code is needed for everything here except the claude.ai skills: the hooks, plugins and CLI tools run on this computer.

## 1. Claude Code
- [ ] `npm install -g @anthropic-ai/claude-code`
- [ ] In `F:\Web_Projects\linguastream`, run `claude` and sign in with the same account as claude.ai (uploaded skills then load there too).

## 2. Hooks (block risky files, lint and test after each edit)
- [ ] Extract `claude-hooks.zip` into the repo root, so `.claude/settings.json` and `.claude/hooks/` exist.
- [ ] Check: ask Claude Code to edit `.env` (should be blocked) and to edit a `.ts` file (eslint and `vitest related` should run).
- What the hooks do is described in the app's `CLAUDE.md`.

## 3. claude.ai skills (uploaded as ZIPs: Customize → Skills → + → Create skill → Upload a skill; needs Settings → Capabilities → Code execution)
- [ ] mattpocock/skills (MIT): `tdd`, `diagnosing-bugs`, `grilling` + `grill-me`, `handoff`, `teach`
- [ ] emilkowalski/skills (MIT): `review-animations`, `break-ui` (description shortened to fit 200 characters), `learn-taste`
- [ ] MotionSites (`Motionsites-AI/claude-skill`): download the repo ZIP from GitHub, zip the folder `plugins/motionsites-web-builder/skills/motionsites-web-builder` and upload it. Its examples and media may be used for our sites but not redistributed. The screenshot loop needs Playwright, so it works fully only in Claude Code.

## 4. Design tools (for the demo landing page, D1)
- [ ] **impeccable**: `npx impeccable install` in the repo; say yes to the design hook. Set `IMPECCABLE_LIVE_COPY_AGENT=chat` before using live mode, otherwise its Apply button can launch `claude` with permission checks off.
- [ ] **taste-skill** (`Leonxlnx/taste-skill`, MIT): in Claude Code, `/plugin marketplace add Leonxlnx/taste-skill`, then `/plugin install taste-skill@taste-skill`. Needs Node 22+ and Chrome or Edge. Too large for a claude.ai upload (about 40 MB).

## 5. graphify (codebase knowledge graph)
- [ ] `pip install graphifyy` (two y's), then `graphify install`.
- [ ] In Claude Code: `/graphify .`. Code is parsed locally for free; docs and PDFs go through the model, so start with the code folders, not `docs/`.

## 6. Strix (AI pentesting) — not now
Set up before the friends milestone (after B6), when there is an API and an extension worth attacking.
- [ ] Docker running; `pipx install strix-agent` (the `curl | bash` installer needs WSL or Git Bash on Windows).
- [ ] A paid LLM API key, separate from the Claude subscription: `setx STRIX_LLM "openrouter/z-ai/glm-5.3"`, `setx LLM_API_KEY "..."`, then a new terminal. Using Claude as Strix's model needs Anthropic's cyber verification programme.
- [ ] `npx skills add usestrix/strix` for its nine skills.
- [ ] Scan only our own code and our own dev server, always with `--max-budget` (for example 15).

## Not installed (from the list of 2026-11-20)
llm-council, ponytail, condom, andrej-karpathy-skills (merging its principles into `CLAUDE.md` is still an open offer), awesome-free-llm-apis.
