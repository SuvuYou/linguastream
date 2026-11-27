import { describe, expect, it } from "vitest";
import {
  PROCESSING_STEPS,
  ProcessingEvent,
  retryTrackRoute,
} from "./processing.js";

const ids = {
  track_id: "0190f3c2-7d1a-7c00-8a00-000000000001",
  video_id: "0190f3c2-7d1a-7c00-8a00-000000000002",
  title: "Ein Tag in Hamburg",
};

describe("processing contracts", () => {
  it("lists the steps in the order the worker runs them", () => {
    expect(PROCESSING_STEPS).toEqual([
      "parse",
      "normalise",
      "analyse",
      "translate",
      "index",
    ]);
  });

  it("parses each event type", () => {
    expect(ProcessingEvent.parse({ type: "queued", ...ids }).type).toBe(
      "queued",
    );
    expect(
      ProcessingEvent.parse({
        type: "step",
        ...ids,
        step: "parse",
        step_index: 0,
        step_count: 5,
      }),
    ).toMatchObject({
      step: "parse",
    });
    expect(ProcessingEvent.parse({ type: "ready", ...ids }).type).toBe("ready");
    expect(
      ProcessingEvent.parse({
        type: "failed",
        ...ids,
        error_code: "invalid_track",
      }),
    ).toMatchObject({
      error_code: "invalid_track",
    });
  });

  it("carries line progress on a step and a translation failure with its reason", () => {
    expect(
      ProcessingEvent.parse({
        type: "step",
        ...ids,
        step: "translate",
        step_index: 3,
        step_count: 5,
        progress: { done: 120, total: 812 },
      }),
    ).toMatchObject({ progress: { done: 120, total: 812 } });
    expect(
      ProcessingEvent.parse({ type: "translation_failed", ...ids, error_code: "provider_unavailable" }),
    ).toMatchObject({ error_code: "provider_unavailable" });
    expect(
      ProcessingEvent.safeParse({ type: "translation_failed", ...ids, error_code: "empty_track" }).success,
    ).toBe(false);
    expect(
      ProcessingEvent.safeParse({
        type: "step",
        ...ids,
        step: "translate",
        step_index: 3,
        step_count: 5,
        progress: { done: -1, total: 2 },
      }).success,
    ).toBe(false);
  });

  it("rejects unknown steps, codes and types", () => {
    expect(
      ProcessingEvent.safeParse({
        type: "step",
        ...ids,
        step: "dance",
        step_index: 0,
        step_count: 5,
      }).success,
    ).toBe(false);
    expect(
      ProcessingEvent.safeParse({ type: "failed", ...ids, error_code: "nope" })
        .success,
    ).toBe(false);
    expect(ProcessingEvent.safeParse({ type: "paused", ...ids }).success).toBe(
      false,
    );
  });

  it("takes a uuid track id for retries", () => {
    expect(
      retryTrackRoute.params!.safeParse({ trackId: ids.track_id }).success,
    ).toBe(true);
    expect(retryTrackRoute.params!.safeParse({ trackId: "1" }).success).toBe(
      false,
    );
  });
});
