import type { StepProgress } from "@linguastream/contracts";

export interface ProgressSample {
  at: number;
  done: number;
}

export const MIN_SAMPLE_MS = 5_000;

export function remainingMs(
  start: ProgressSample,
  now: ProgressSample,
  total: number,
): number | null {
  const elapsed = now.at - start.at;
  const done = now.done - start.done;
  if (elapsed < MIN_SAMPLE_MS || done <= 0) return null;
  return Math.max(0, ((total - now.done) * elapsed) / done);
}

export function formatRemaining(ms: number | null): string | null {
  if (ms === null) return null;
  if (ms < 60_000) return "less than a minute left";
  const minutes = Math.round(ms / 60_000);
  return `about ${minutes} min left`;
}

export function progressLabel(
  progress: StepProgress,
  remaining: number | null,
): string {
  const lines = `${progress.done} of ${progress.total} lines`;
  const left = formatRemaining(remaining);
  return left ? `${lines} · ${left}` : lines;
}

export function percentOf(progress: StepProgress): number {
  return progress.total === 0
    ? 0
    : Math.min(100, Math.round((progress.done / progress.total) * 100));
}
