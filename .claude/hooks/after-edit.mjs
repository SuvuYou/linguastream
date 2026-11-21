// PostToolUse hook: after Claude edits a JS/TS file, run ESLint with --fix on it
// and the Vitest tests related to it. On failure, exit code 2 sends the output
// back to Claude so it fixes the problem.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const file = String(input.tool_input?.file_path ?? '');
const norm = file.replace(/\\/g, '/');

if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(norm)) process.exit(0);
if (/(^|\/)(node_modules|\.next|dist|coverage|docs|\.claude)\//.test(norm)) process.exit(0);

const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const run = (args) => spawnSync('npx', args, { cwd, shell: true, encoding: 'utf8', timeout: 150_000 });
const quoted = `"${file}"`;
const problems = [];

const lint = run(['eslint', '--fix', quoted]);
if (lint.status !== 0) problems.push(`ESLint:\n${(lint.stdout || '') + (lint.stderr || '')}`);

// config/setup files have no related tests; --passWithNoTests keeps that quiet
const tests = run(['vitest', 'related', quoted, '--run', '--passWithNoTests']);
if (tests.status !== 0) problems.push(`Vitest (tests related to ${file}):\n${(tests.stdout || '') + (tests.stderr || '')}`);

if (problems.length) {
  const out = problems.join('\n\n');
  process.stderr.write(out.length > 6000 ? out.slice(0, 6000) + '\n… (output cut)' : out);
  process.exit(2);
}
process.exit(0);
