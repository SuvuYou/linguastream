import type { Line } from "@linguastream/contracts";

export const MARKER_STEP_MS = 10_000;
export const WINDOW_MS = 5 * 60 * 1000;

export function lastStartedIndex(lines: readonly Line[], ms: number): number {
  let lo = 0;
  let hi = lines.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lines[mid]!.start_ms <= ms) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found;
}

export function activeIndex(lines: readonly Line[], ms: number): number {
  const i = lastStartedIndex(lines, ms);
  return i >= 0 && ms < lines[i]!.end_ms ? i : -1;
}

export const LINE_SNAP_MS = 250;

export interface LineTargets {
  previous: number | null;
  repeat: number | null;
  next: number | null;
}

export function lineTargets(lines: readonly Line[], ms: number): LineTargets {
  const i = lastStartedIndex(lines, ms + LINE_SNAP_MS);
  return {
    previous: i > 0 ? lines[i - 1]!.start_ms : null,
    repeat: i >= 0 ? lines[i]!.start_ms : null,
    next: i + 1 < lines.length ? lines[i + 1]!.start_ms : null,
  };
}

export interface MarkerGroup {
  markerMs: number;
  lines: Line[];
}

export function groupByMarker(
  lines: readonly Line[],
  stepMs = MARKER_STEP_MS,
): MarkerGroup[] {
  const groups: MarkerGroup[] = [];
  for (const line of lines) {
    const markerMs = Math.floor(line.start_ms / stepMs) * stepMs;
    const last = groups.at(-1);
    if (last && last.markerMs === markerMs) last.lines.push(line);
    else groups.push({ markerMs, lines: [line] });
  }
  return groups;
}

export interface TimeWindow {
  fromMs: number;
  toMs: number;
}

export function windowsAround(
  durationMs: number,
  aroundMs: number,
  windowMs = WINDOW_MS,
): TimeWindow[] {
  const count = Math.max(1, Math.ceil(durationMs / windowMs));
  const first = Math.min(
    count - 1,
    Math.max(0, Math.floor(aroundMs / windowMs)),
  );
  const order = [
    first,
    ...Array.from({ length: count }, (_, i) => i).filter((i) => i !== first),
  ];
  return order.map((i) => ({ fromMs: i * windowMs, toMs: (i + 1) * windowMs }));
}

export function mergeLines(
  chunks: readonly (readonly Line[] | undefined)[],
): Line[] {
  const byIndex = new Map<number, Line>();
  for (const chunk of chunks)
    for (const line of chunk ?? []) byIndex.set(line.index, line);
  return [...byIndex.values()].sort((a, b) => a.index - b.index);
}

export function filterLines(lines: readonly Line[], query: string): Line[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return [...lines];
  return lines.filter(
    (line) =>
      line.text.toLocaleLowerCase().includes(q) ||
      line.translation?.toLocaleLowerCase().includes(q),
  );
}

export function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}
