import { describe, expect, it } from "vitest";
import type { Line } from "@linguastream/contracts";
import {
  activeIndex,
  filterLines,
  formatTime,
  groupByMarker,
  lastStartedIndex,
  lineTargets,
  mergeLines,
  windowsAround,
} from "./lines";

const line = (
  index: number,
  start: number,
  end: number,
  text = `Zeile ${index}`,
  translation: string | null = `Line ${index}`,
): Line => ({
  index,
  start_ms: start,
  end_ms: end,
  text,
  translation,
  words: [],
});

const lines = [
  line(0, 0, 2000),
  line(1, 2500, 4000),
  line(2, 12_000, 15_000),
  line(3, 15_000, 18_000),
];

describe("lastStartedIndex / activeIndex", () => {
  it("finds the line being spoken", () => {
    expect(activeIndex(lines, 1000)).toBe(0);
    expect(activeIndex(lines, 15_000)).toBe(3);
  });

  it("is -1 between lines, while the transcript keeps the last line current", () => {
    expect(activeIndex(lines, 2200)).toBe(-1);
    expect(lastStartedIndex(lines, 2200)).toBe(0);
    expect(lastStartedIndex(lines, 9000)).toBe(1);
  });

  it("is -1 before the first line and with no lines", () => {
    expect(lastStartedIndex([line(0, 500, 900)], 100)).toBe(-1);
    expect(lastStartedIndex([], 100)).toBe(-1);
    expect(activeIndex(lines, 30_000)).toBe(-1);
  });
});

describe("groupByMarker", () => {
  it("groups lines under 10-second markers", () => {
    expect(
      groupByMarker(lines).map((g) => [
        g.markerMs,
        g.lines.map((l) => l.index),
      ]),
    ).toEqual([
      [0, [0, 1]],
      [10_000, [2, 3]],
    ]);
  });
});

describe("windowsAround", () => {
  it("loads the window around the playhead first, then the rest in order", () => {
    expect(
      windowsAround(14 * 60_000, 7 * 60_000).map((w) => w.fromMs / 60_000),
    ).toEqual([5, 0, 10]);
  });

  it("clamps a start past the end and always has one window", () => {
    expect(windowsAround(60_000, 10 * 60_000)).toEqual([
      { fromMs: 0, toMs: 300_000 },
    ]);
    expect(windowsAround(0, 0)).toHaveLength(1);
  });
});

describe("mergeLines", () => {
  it("merges windows in index order without duplicates", () => {
    expect(
      mergeLines([
        [lines[2]!, lines[3]!],
        undefined,
        [lines[0]!, lines[2]!],
      ]).map((l) => l.index),
    ).toEqual([0, 2, 3]);
  });
});

describe("filterLines", () => {
  it("matches the line or its translation, ignoring case", () => {
    const ls = [
      line(0, 0, 1, "Wir fahren zum Hafen", "We drive to the harbour"),
      line(1, 1, 2, "Das Wetter", null),
    ];
    expect(filterLines(ls, "hafen").map((l) => l.index)).toEqual([0]);
    expect(filterLines(ls, "HARBOUR").map((l) => l.index)).toEqual([0]);
    expect(filterLines(ls, "  ")).toHaveLength(2);
  });
});

describe("formatTime", () => {
  it("formats as m:ss and h:mm:ss", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(17_900)).toBe("0:17");
    expect(formatTime(768_000)).toBe("12:48");
    expect(formatTime(3 * 3600_000 + 5 * 60_000 + 9000)).toBe("3:05:09");
  });
});

describe("lineTargets", () => {
  const lines = [line(0, 1000, 2000), line(1, 3000, 4000), line(2, 5000, 6000)];

  it("points at the line before, the current line and the line after", () => {
    expect(lineTargets(lines, 3500)).toEqual({
      previous: 1000,
      repeat: 3000,
      next: 5000,
    });
  });

  it("treats a gap as still the line just heard", () => {
    expect(lineTargets(lines, 4500)).toEqual({
      previous: 1000,
      repeat: 3000,
      next: 5000,
    });
  });

  it("snaps to a line that starts a moment after the playhead", () => {
    expect(lineTargets(lines, 2900)).toEqual({
      previous: 1000,
      repeat: 3000,
      next: 5000,
    });
  });

  it("has nothing before the first line or after the last", () => {
    expect(lineTargets(lines, 0)).toEqual({
      previous: null,
      repeat: null,
      next: 1000,
    });
    expect(lineTargets(lines, 1200)).toEqual({
      previous: null,
      repeat: 1000,
      next: 3000,
    });
    expect(lineTargets(lines, 5500)).toEqual({
      previous: 3000,
      repeat: 5000,
      next: null,
    });
    expect(lineTargets([], 500)).toEqual({
      previous: null,
      repeat: null,
      next: null,
    });
  });
});
