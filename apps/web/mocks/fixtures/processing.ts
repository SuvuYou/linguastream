import {
  PROCESSING_STEPS,
  type ProcessingEvent,
} from "@linguastream/contracts";
import { MOCK_VIDEO_IDS } from "./watch";

export const MOCK_PROCESSING_TRACKS = {
  succeeds: {
    track_id: "0190f3c2-7d1a-7c00-8b00-000000000001",
    video_id: MOCK_VIDEO_IDS.normal,
    title: "Ein Tag in Hamburg: Hafen, Fischmarkt und Speicherstadt",
  },
  failsOnce: {
    track_id: "0190f3c2-7d1a-7c00-8b00-000000000002",
    video_id: MOCK_VIDEO_IDS.long,
    title:
      "Drei Stunden Bahnfahrt von Hamburg nach München mit allen Durchsagen",
  },
} as const;

type Track =
  (typeof MOCK_PROCESSING_TRACKS)[keyof typeof MOCK_PROCESSING_TRACKS];

export function runEvents(
  track: Track,
  from = 0,
  failAt?: number,
): ProcessingEvent[] {
  const events: ProcessingEvent[] = [];
  if (from === 0) events.push({ type: "queued", ...track });
  for (let i = from; i < PROCESSING_STEPS.length; i++) {
    events.push({
      type: "step",
      ...track,
      step: PROCESSING_STEPS[i]!,
      step_index: i,
      step_count: PROCESSING_STEPS.length,
    });
    if (i === failAt) {
      events.push({ type: "failed", ...track, error_code: "internal" });
      return events;
    }
  }
  events.push({ type: "ready", ...track });
  return events;
}
