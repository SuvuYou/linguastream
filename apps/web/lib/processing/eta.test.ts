import { describe, expect, it } from "vitest";
import {
  MIN_SAMPLE_MS,
  formatRemaining,
  percentOf,
  progressLabel,
  remainingMs,
} from "./eta";

describe("remainingMs", () => {
  it("extrapolates from the lines done since the first sample", () => {
    expect(remainingMs({ at: 0, done: 100 }, { at: 60_000, done: 200 }, 800)).toBe(360_000);
  });

  it("waits for enough time and at least one more line", () => {
    expect(remainingMs({ at: 0, done: 0 }, { at: MIN_SAMPLE_MS - 1, done: 50 }, 800)).toBeNull();
    expect(remainingMs({ at: 0, done: 40 }, { at: 60_000, done: 40 }, 800)).toBeNull();
    expect(remainingMs({ at: 0, done: 0 }, { at: 10_000, done: 900 }, 800)).toBe(0);
  });
});

describe("labels", () => {
  it("says roughly how long is left", () => {
    expect(formatRemaining(null)).toBeNull();
    expect(formatRemaining(30_000)).toBe("less than a minute left");
    expect(formatRemaining(150_000)).toBe("about 3 min left");
  });

  it("counts lines and adds the time left when known", () => {
    expect(progressLabel({ done: 120, total: 812 }, null)).toBe("120 of 812 lines");
    expect(progressLabel({ done: 120, total: 812 }, 150_000)).toBe("120 of 812 lines · about 3 min left");
  });

  it("turns progress into a percentage", () => {
    expect(percentOf({ done: 120, total: 812 })).toBe(15);
    expect(percentOf({ done: 0, total: 0 })).toBe(0);
    expect(percentOf({ done: 9, total: 3 })).toBe(100);
  });
});
