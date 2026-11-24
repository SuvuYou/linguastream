// PostToolUse hook: after Claude edits a JS/TS file, run ESLint with --fix on it
// and the Vitest tests related to it, inside the workspace (apps/* or packages/*)
// that contains the file. On failure, exit code 2 sends the output back to Claude
// so it fixes the problem.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const file = String(input.tool_input?.file_path ?? '');
const norm = file.replace(/\\/g, '/');

if (!/\.(ts|tsx|js|jsx|mjs|cjs|mts|cts)$/.test(norm)) process.exit(0);
if (/(^|\/)(node_modules|\.next|\.turbo|dist|coverage|docs|\.claude)\//.test(norm)) process.exit(0);

const root = resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());

// Nearest folder with a package.json, below the repo root.
let workspace = null;
for (let dir = dirname(resolve(file)); dir.startsWith(root) && dir !== root; dir = dirname(dir)) {
  if (existsSync(join(dir, 'package.json'))) { workspace = dir; break; }
}
if (!workspace) process.exit(0); // root-level config files have no linter or tests of their own

const hasBin = (name) =>
  existsSync(join(workspace, 'node_modules', '.bin', name)) ||
  existsSync(join(workspace, 'node_modules', '.bin', `${name}.cmd`));
const run = (args) => spawnSync('pnpm', ['exec', ...args], { cwd: workspace, shell: true, encoding: 'utf8', timeout: 150_000 });
const quoted = `"${relative(workspace, resolve(file))}"`;
const problems = [];

if (hasBin('eslint')) {
  const lint = run(['eslint', '--fix', quoted]);
  if (lint.status !== 0) problems.push(`ESLint:\n${(lint.stdout || '') + (lint.stderr || '')}`);
}

if (problems.length) {
  const out = problems.join('\n\n');
  process.stderr.write(out.length > 6000 ? out.slice(0, 6000) + '\n… (output cut)' : out);
  process.exit(2);
}
process.exit(0);
