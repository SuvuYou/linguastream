import { Logger } from "@nestjs/common";
import { InMemoryUsageStore } from "../test/auth-fakes";
import { SpendLimiter } from "./spend-limiter";
import { berlinDay, costMicroUsd, utcMonth } from "./usage-config";
import type { UsageStore } from "./usage-store";
import { UsageService } from "./usage.service";

function setup(now = new Date("2026-11-27T10:00:00Z")) {
  const store = new InMemoryUsageStore();
  const clock = () => now;
  const spend = new SpendLimiter(store as unknown as UsageStore, clock);
  const usage = new UsageService(store as unknown as UsageStore, spend, clock);
  return { store, spend, usage };
}

beforeEach(() => {
  vi.spyOn(Logger.prototype, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("usage keys", () => {
  it("counts days in Berlin time and months in UTC", () => {
    expect(berlinDay(new Date("2026-11-27T22:59:00Z"))).toBe("2026-11-27");
    expect(berlinDay(new Date("2026-11-27T23:00:00Z"))).toBe("2026-11-28");
    expect(berlinDay(new Date("2026-07-01T21:59:00Z"))).toBe("2026-07-01");
    expect(berlinDay(new Date("2026-07-01T22:00:00Z"))).toBe("2026-07-02");
    expect(utcMonth(new Date("2026-11-30T23:30:00Z"))).toBe("2026-11");
  });

  it("prices calls per model in micro-dollars, rounding up", () => {
    expect(costMicroUsd("gemini-3.1-flash-lite", 1_000_000, 1_000_000)).toBe(1_750_000);
    expect(costMicroUsd("gemini-3.1-flash-lite", 1, 0)).toBe(1);
    expect(costMicroUsd("unknown-model", 1000, 0)).toBe(costMicroUsd("gemini-3.5-flash", 1000, 0));
  });
});

describe("UsageService.reserveTransfer", () => {
  it("allows transfers up to the daily limit and gives characters back on refund", async () => {
    vi.stubEnv("TRANSFER_CHARS_PER_DAY", "1000");
    const { usage, store } = setup();
    const refund = await usage.reserveTransfer("u1", 800);
    await expect(usage.reserveTransfer("u1", 300)).rejects.toMatchObject({ status: 429 });
    await refund();
    await expect(usage.reserveTransfer("u1", 300)).resolves.toBeTypeOf("function");
    expect(store.values.get("usage:transfer:u1:2026-11-27")).toBe(300);
    expect(store.ttls.get("usage:transfer:u1:2026-11-27")).toBe(2 * 24 * 60 * 60);
  });

  it("says roughly how many minutes are left", async () => {
    const { usage } = setup();
    await usage.reserveTransfer("u1", 165_000 - 55_000);
    await expect(usage.reserveTransfer("u1", 60_000)).rejects.toMatchObject({
      response: { error: expect.stringContaining("About 60 minutes of video left today") },
    });
  });

  it("keeps each user's quota separate", async () => {
    vi.stubEnv("TRANSFER_CHARS_PER_DAY", "1000");
    const { usage } = setup();
    await usage.reserveTransfer("u1", 1000);
    await expect(usage.reserveTransfer("u2", 1000)).resolves.toBeTypeOf("function");
  });

  it("lets transfers through when usage can't be counted", async () => {
    const { usage, store } = setup();
    store.failing = true;
    const refund = await usage.reserveTransfer("u1", 10);
    await expect(refund()).resolves.toBeUndefined();
  });
});

describe("UsageService.summary", () => {
  it("reports today's use, and the month's spend to admins only", async () => {
    const { usage, spend } = setup();
    await usage.reserveTransfer("u1", 55_000);
    await usage.startAiCall("u1");
    await spend.record(2_500_000);

    const forUser = await usage.summary("u1", false);
    expect(forUser).toEqual({
      day: "2026-11-27",
      transfer: { used_characters: 55_000, limit_characters: 165_000, minutes_left: 120 },
      ai_calls: { used: 1, limit: 200 },
      paid_features_paused: false,
    });
    expect(await usage.summary("u1", true)).toMatchObject({ month_spend_usd: 2.5, month_spend_cap_usd: 10 });
  });
});

describe("SpendLimiter", () => {
  it("adds up the month's spend and stops at the cap, logging once", async () => {
    vi.stubEnv("MONTHLY_SPEND_CAP_USD", "1");
    const warn = vi.spyOn(Logger.prototype, "warn").mockImplementation(() => {});
    const { spend, store } = setup();
    await spend.record(600_000);
    expect(await spend.canSpend()).toBe(true);
    await spend.record(400_000);
    expect(await spend.canSpend()).toBe(false);
    expect(await spend.canSpend()).toBe(false);
    expect(store.values.get("usage:spend:2026-11")).toBe(1_000_000);
    expect(warn.mock.calls.filter(([m]) => String(m).includes("spend cap reached"))).toHaveLength(1);
  });

  it("ignores zero costs", async () => {
    const { spend, store } = setup();
    await spend.record(0);
    expect(store.values.size).toBe(0);
  });
});
