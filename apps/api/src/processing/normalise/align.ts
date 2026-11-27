export interface Edit {
  i: number;
  before?: string;
  after?: string;
  casing?: string;
  sentenceEnd?: boolean;
  pause?: boolean;
  join?: boolean;
}

export type Change =
  | { kind: "changed"; i: number; captured: string; returned: string }
  | { kind: "dropped"; i: number; captured: string }
  | { kind: "added"; afterI: number; returned: string };

export type AlignResult = { ok: true; edits: Edit[] } | { ok: false; changes: Change[]; salvaged: Edit[] };

const LEAD = /^[„“"»«‚‘'([¿¡–—-]+/u;
const TRAIL = /[.,;:!?…"“”»«'’)\]–—-]+$/u;
const HAS_WORD = /[\p{L}\p{N}]/u;

export function splitToken(token: string) {
  const before = token.match(LEAD)?.[0] ?? "";
  let rest = token.slice(before.length);
  const after = rest.match(TRAIL)?.[0] ?? "";
  rest = rest.slice(0, rest.length - after.length);
  return { before, core: rest, after };
}

const norm = (word: string) => splitToken(word).core.toLowerCase();

function returnedTokens(text: string) {
  const out: { before: string; core: string; after: string; raw: string }[] = [];
  for (const raw of text.split(/\s+/).filter(Boolean)) {
    const parts = splitToken(raw);
    if (!HAS_WORD.test(parts.core)) {
      const last = out.at(-1);
      if (last) last.after += (last.after ? " " : "") + raw;
      continue;
    }
    out.push({ ...parts, raw });
  }
  return out;
}

function lcsAlign(a: string[], b: string[]): [number, number][] {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let x = n - 1; x >= 0; x--) {
    for (let y = m - 1; y >= 0; y--) {
      dp[x]![y] = a[x] === b[y] ? dp[x + 1]![y + 1]! + 1 : Math.max(dp[x + 1]![y]!, dp[x]![y + 1]!);
    }
  }
  const pairs: [number, number][] = [];
  let x = 0;
  let y = 0;
  while (x < n && y < m) {
    if (a[x] === b[y]) pairs.push([x++, y++]);
    else if (dp[x + 1]![y]! >= dp[x]![y + 1]!) pairs.push([x++, -1]);
    else pairs.push([-1, y++]);
  }
  while (x < n) pairs.push([x++, -1]);
  while (y < m) pairs.push([-1, y++]);
  return pairs;
}

function editFor(k: number, captured: string, returned: { before: string; core: string; after: string }): Edit | null {
  const cap = splitToken(captured);
  const edit: Edit = { i: k };
  if (returned.before && returned.before !== cap.before) edit.before = returned.before;
  if (returned.after !== cap.after) edit.after = returned.after;
  if (returned.core !== cap.core) edit.casing = returned.core;
  if (/[.!?…]/.test(returned.after)) edit.sentenceEnd = true;
  return Object.keys(edit).length > 1 ? edit : null;
}

function compareWords(captured: string[], punctuated: string): AlignResult {
  const returned = returnedTokens(punctuated);
  const a = captured.map(norm);
  const b = returned.map((t) => t.core.toLowerCase());

  if (a.length === b.length && a.every((w, k) => w === b[k])) {
    const edits: Edit[] = [];
    captured.forEach((word, k) => {
      const edit = editFor(k, word, returned[k]!);
      if (edit) edits.push(edit);
    });
    return { ok: true, edits };
  }

  const pairs = lcsAlign(a, b);
  const changes: Change[] = [];
  let lastI = -1;
  for (let k = 0; k < pairs.length; k++) {
    const [x, y] = pairs[k]!;
    if (x >= 0 && y >= 0) {
      lastI = x;
      continue;
    }
    const next = pairs[k + 1];
    if (x >= 0 && next && next[0] === -1 && next[1] >= 0) {
      changes.push({ kind: "changed", i: x, captured: captured[x]!, returned: returned[next[1]]!.raw });
      lastI = x;
      k++;
      continue;
    }
    if (x === -1 && next && next[0] >= 0 && next[1] === -1) {
      changes.push({ kind: "changed", i: next[0], captured: captured[next[0]]!, returned: returned[y]!.raw });
      lastI = next[0];
      k++;
      continue;
    }
    if (x >= 0) {
      changes.push({ kind: "dropped", i: x, captured: captured[x]! });
      lastI = x;
    } else changes.push({ kind: "added", afterI: lastI, returned: returned[y]!.raw });
  }
  const salvaged: Edit[] = [];
  for (const [x, y] of pairs) {
    if (x < 0 || y < 0) continue;
    const edit = editFor(x, captured[x]!, returned[y]!);
    if (edit) salvaged.push(edit);
  }
  return { ok: false, changes, salvaged };
}

export function deriveEdits(captured: string[], punctuated: string): AlignResult {
  const keep = captured.map((w, k) => (HAS_WORD.test(w) ? k : -1)).filter((k) => k >= 0);
  const result = compareWords(
    keep.map((k) => captured[k]!),
    punctuated,
  );
  const at = (i: number) => (i >= 0 ? keep[i]! : i);
  if (result.ok) return { ok: true, edits: result.edits.map((e) => ({ ...e, i: at(e.i) })) };
  return {
    ok: false,
    changes: result.changes.map((c) => (c.kind === "added" ? { ...c, afterI: at(c.afterI) } : { ...c, i: at(c.i) })),
    salvaged: result.salvaged.map((e) => ({ ...e, i: at(e.i) })),
  };
}

export function applyEdit(word: string, edit: Edit | undefined): string {
  if (!edit) return word;
  const parts = splitToken(word);
  return (edit.before ?? parts.before) + (edit.casing ?? parts.core) + (edit.after ?? parts.after);
}

export function mergeEdits(base: Edit[], extra: Edit[]): Edit[] {
  const byI = new Map(base.map((e) => [e.i, { ...e }]));
  for (const edit of extra) byI.set(edit.i, { ...byI.get(edit.i), ...edit });
  return [...byI.values()].sort((a, b) => a.i - b.i);
}

export function splitLongRuns(
  words: string[],
  startMs: number[],
  isEnd: (k: number) => boolean,
  max = 40,
  min = 10,
): Edit[] {
  const splits: Edit[] = [];
  let runStart = 0;
  for (let k = 0; k < words.length; k++) {
    if (isEnd(k)) {
      runStart = k + 1;
      continue;
    }
    if (k - runStart + 1 <= max) continue;
    let best = runStart + min - 1;
    let bestGap = -1;
    for (let j = runStart + min - 1; j < k; j++) {
      const gap = startMs[j + 1]! - startMs[j]!;
      if (gap > bestGap) {
        bestGap = gap;
        best = j;
      }
    }
    splits.push({ i: best, sentenceEnd: true, pause: true });
    runStart = best + 1;
  }
  return splits;
}
