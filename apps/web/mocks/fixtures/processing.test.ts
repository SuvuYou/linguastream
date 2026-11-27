import { ProcessingEvent } from "@linguastream/contracts";
import { describe, expect, it } from "vitest";
import { MOCK_PROCESSING_TRACKS, runEvents } from "./processing";

describe("mock processing runs", () => {
  it("plays a whole run from queued to ready, every event valid", () => {
    const events = runEvents(MOCK_PROCESSING_TRACKS.succeeds);
    expect(events.map((e) => e.type)).toEqual([
      "queued",
      "step",
      "step",
      "step",
      "step",
      "step",
      "ready",
    ]);
    expect(events.every((e) => ProcessingEvent.safeParse(e).success)).toBe(
      true,
    );
  });

  it("fails at the given step and resumes from it", () => {
    expect(
      runEvents(MOCK_PROCESSING_TRACKS.failsOnce, 0, 3).at(-1),
    ).toMatchObject({ type: "failed", error_code: "internal" });
    const resumed = runEvents(MOCK_PROCESSING_TRACKS.failsOnce, 3);
    expect(resumed[0]).toMatchObject({ type: "step", step: "translate" });
    expect(resumed.at(-1)!.type).toBe("ready");
  });
});
