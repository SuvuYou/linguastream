import { describe, expect, it } from "vitest";
import { addedLabel, coverTint, thumbnailUrl } from "./format";

describe("thumbnailUrl", () => {
  it("points at YouTube's medium thumbnail", () => {
    expect(thumbnailUrl("4Ja5iJtYOPw")).toBe("https://i.ytimg.com/vi/4Ja5iJtYOPw/mqdefault.jpg");
  });
});

describe("coverTint", () => {
  it("picks the same theme colour for the same video", () => {
    const id = "0190f3c2-7d1a-7c00-8a00-000000000001";
    expect(coverTint(id)).toBe(coverTint(id));
    expect(coverTint(id)).toMatch(/^var\(--(primary|known|learning|unknown)\)$/);
    const tints = new Set(Array.from({ length: 20 }, (_, i) => coverTint(`video-${i}`)));
    expect(tints.size).toBeGreaterThan(1);
  });
});

describe("addedLabel", () => {
  const now = new Date(2026, 10, 27, 15, 0);
  const at = (y: number, m: number, d: number, h = 12) => new Date(y, m, d, h).toISOString();

  it("counts calendar days, then weeks, then shows the date", () => {
    expect(addedLabel(at(2026, 10, 27, 1), now)).toBe("added today");
    expect(addedLabel(at(2026, 10, 26, 23), now)).toBe("added yesterday");
    expect(addedLabel(at(2026, 10, 24), now)).toBe("added 3 days ago");
    expect(addedLabel(at(2026, 10, 13), now)).toBe("added 2 weeks ago");
    expect(addedLabel(at(2026, 2, 5), now)).toBe("added Mar 5");
    expect(addedLabel(at(2025, 11, 31), now)).toBe("added Dec 31, 2025");
  });

  it("treats a time in the future as today", () => {
    expect(addedLabel(at(2026, 10, 28), now)).toBe("added today");
  });
});
