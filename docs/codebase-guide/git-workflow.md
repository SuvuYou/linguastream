# Git workflow

`feature/*` → PR into `development` → PR into `master` at milestones. CI (`.github/workflows/ci.yml`) runs on PRs to both: lint, prisma generate, typecheck, coverage.
