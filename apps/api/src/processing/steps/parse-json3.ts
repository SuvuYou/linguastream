import { ProcessingError } from "../processing-error";

export interface ParsedLine {
  index: number;
  startMs: number;
  endMs: number;
  text: string;
}

interface Json3Event {
  tStartMs?: number;
  dDurationMs?: number;
  aAppend?: number;
  segs?: { utf8?: string }[];
}

const FALLBACK_DURATION_MS = 2_000;

function readEvents(raw: string): Json3Event[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ProcessingError("invalid_track", false);
  }
  const events = (parsed as { events?: unknown })?.events;
  if (!Array.isArray(events)) throw new ProcessingError("invalid_track", false);
  return events as Json3Event[];
}

export function parseJson3(raw: string): ParsedLine[] {
  const cues = readEvents(raw)
    .filter((event) => !event.aAppend && Array.isArray(event.segs) && typeof event.tStartMs === "number")
    .map((event) => ({
      startMs: event.tStartMs!,
      durationMs: event.dDurationMs,
      text: event
        .segs!.map((seg) => seg.utf8 ?? "")
        .join("")
        .replace(/\s+/g, " ")
        .trim(),
    }))
    .filter((cue) => cue.text.length > 0)
    .sort((a, b) => a.startMs - b.startMs);

  if (cues.length === 0) throw new ProcessingError("empty_track", false);

  return cues.map((cue, index) => {
    const next = cues[index + 1];
    const ownEnd = cue.startMs + (cue.durationMs ?? FALLBACK_DURATION_MS);
    const endMs = next && next.startMs < ownEnd ? next.startMs : ownEnd;
    return { index, startMs: cue.startMs, endMs: Math.max(endMs, cue.startMs + 1), text: cue.text };
  });
}
