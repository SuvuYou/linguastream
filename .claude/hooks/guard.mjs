// PreToolUse hook: blocks edits to secrets, lock files and applied migrations,
// and the commands CLAUDE.md forbids. Exit code 2 blocks the tool call and shows
// the message to Claude.
import { existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const tool = input.tool_name ?? '';
const args = input.tool_input ?? {};

function block(reason) {
  process.stderr.write(`Blocked by .claude/hooks/guard.mjs: ${reason}\n`);
  process.exit(2);
}

if (tool === 'Bash') {
  const cmd = String(args.command ?? '');
  if (/\bprisma\s+db\s+push\b/.test(cmd)) block('`prisma db push` is not allowed. Use `pnpm db:migrate` (CLAUDE.md).');
  if (/\bnpm\s+audit\s+fix\b.*--force/.test(cmd)) block('`npm audit fix --force` is not allowed (CLAUDE.md).');
  if (/\bpnpm\s+audit\b.*--fix/.test(cmd)) block('`pnpm audit --fix` is not allowed; update dependencies one at a time (CLAUDE.md).');
  process.exit(0);
}

const file = String(args.file_path ?? '').replace(/\\/g, '/');
if (!file) process.exit(0);
const name = basename(file);

if (/^\.env(\..+)?$/.test(name) && name !== '.env.example') {
  block(`${name} holds secrets; edit it yourself. Change .env.example for new variables.`);
}
if (/^service-account.*\.json$/i.test(name) || /firebase-adminsdk.*\.json$/i.test(name)) {
  block(`${name} is a credential file.`);
}
if (['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'].includes(name)) {
  block(`${name} is generated; change package.json and run the package manager instead.`);
}
if (/(^|\/)prisma\/migrations\/.+/.test(file) && existsSync(args.file_path)) {
  block('applied migrations must not be edited; create a new one with `pnpm db:migrate`.');
}
process.exit(0);
