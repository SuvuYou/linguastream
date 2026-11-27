import { describe, expect, it } from "vitest";
import { UsageSummary } from "./usage.js";

const summary = {
  day: "2026-11-27",
  transfer: {
    used_characters: 55000,
    limit_characters: 165000,
    minutes_left: 120,
  },
  ai_calls: { used: 3, limit: 200 },
  paid_features_paused: false,
};

describe("usage contract", () => {
  it("parses a user's summary and an admin's with the month's spend", () => {
    expect(UsageSummary.parse(summary)).toEqual(summary);
    expect(
      UsageSummary.parse({
        ...summary,
        month_spend_usd: 1.25,
        month_spend_cap_usd: 10,
      }).month_spend_usd,
    ).toBe(1.25);
  });

  it("rejects negative counts and a malformed day", () => {
    expect(
      UsageSummary.safeParse({ ...summary, ai_calls: { used: -1, limit: 200 } })
        .success,
    ).toBe(false);
    expect(
      UsageSummary.safeParse({ ...summary, day: "27.11.2026" }).success,
    ).toBe(false);
  });
});
