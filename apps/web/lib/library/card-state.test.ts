import { describe, expect, it } from "vitest";
import type { LibraryVideo, ProcessingEvent } from "@linguastream/contracts";
import { cardState } from "./card-state";

const ids = {
  track_id: "0190f3c2-7d1a-7c00-8b00-000000000001",
  video_id: "0190f3c2-7d1a-7c00-8a00-000000000001",
  title: "Ein Tag in Hamburg",
};

const video = (track: LibraryVideo["track"]): LibraryVideo => ({
  id: ids.video_id,
  youtube_video_id: "4Ja5iJtYOPw",
  title: ids.title,
  channel_name: null,
  duration_ms: null,
  added_at: "2026-11-27T01:00:00.000Z",
  track,
  translation: null,
});

const track = (status: "pending" | "processing" | "ready" | "failed", progress = 0, error_code: "internal" | "empty_track" | null = null) => ({
  id: ids.track_id,
  status,
  progress,
  error_code,
});

describe("cardState", () => {
  it("reads the state from the track", () => {
    expect(cardState(video(null))).toEqual({ kind: "waiting" });
    expect(cardState(video(track("pending")))).toEqual({ kind: "waiting" });
    expect(cardState(video(track("ready", 5)))).toEqual({ kind: "ready" });
    expect(cardState(video(track("processing", 2)))).toEqual({ kind: "preparing", stage: "Words", percent: 40 });
    expect(cardState(video(track("processing", 9)))).toEqual({ kind: "preparing", stage: "Finishing", percent: 80 });
    expect(cardState(video(track("failed", 1, "empty_track")))).toEqual({
      kind: "failed",
      message: "These captions have no text.",
      retryable: false,
    });
    expect(cardState(video(track("failed", 1, null)))).toMatchObject({ kind: "failed", retryable: true });
  });

  it("lets a live event win over the track", () => {
    const v = video(track("ready", 5));
    const events: [ProcessingEvent, ReturnType<typeof cardState>][] = [
      [{ type: "queued", ...ids }, { kind: "waiting" }],
      [{ type: "step", ...ids, step: "translate", step_index: 3, step_count: 5 }, { kind: "preparing", stage: "Translating", percent: 60 }],
      [{ type: "ready", ...ids }, { kind: "ready" }],
      [{ type: "failed", ...ids, error_code: "internal" }, { kind: "failed", message: "Something went wrong on our side. Try again.", retryable: true }],
    ];
    for (const [event, state] of events) expect(cardState(v, event)).toEqual(state);
  });
});
