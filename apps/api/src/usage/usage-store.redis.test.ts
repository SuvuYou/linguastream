import { Redis } from "ioredis";
import { UsageStore } from "./usage-store";

function testRedisUrl(): string {
  const url = process.env.TEST_REDIS_URL;
  if (!url) throw new Error("TEST_REDIS_URL is not set (see .env.example).");
  const db = new URL(url).pathname.slice(1);
  if (!db || db === "0") throw new Error("TEST_REDIS_URL must name a Redis database other than 0, e.g. redis://localhost:6379/15");
  return url;
}

describe("UsageStore (Redis)", () => {
  let redis: Redis;
  let store: UsageStore;

  beforeEach(async () => {
    redis = new Redis(testRedisUrl());
    await redis.flushdb();
    store = new UsageStore(redis);
  });

  afterEach(async () => {
    await redis.quit();
  });

  it("adds only while the total stays within the limit, and sets an expiry", async () => {
    expect(await store.addWithin("k", 600, 1000, 60)).toBe(600);
    expect(await store.addWithin("k", 500, 1000, 60)).toBeNull();
    expect(await store.addWithin("k", 400, 1000, 60)).toBe(1000);
    expect(await store.get("k")).toBe(1000);
    expect(await redis.ttl("k")).toBeGreaterThan(50);
  });

  it("never lets concurrent additions pass the limit", async () => {
    const results = await Promise.all(Array.from({ length: 50 }, () => store.addWithin("c", 30, 1000, 60)));
    expect(results.filter((r) => r !== null)).toHaveLength(33);
    expect(await store.get("c")).toBe(990);
  });

  it("adds without a limit, reads missing keys as 0, and sets a flag only once", async () => {
    expect(await store.get("none")).toBe(0);
    expect(await store.add("s", 5, 60)).toBe(5);
    expect(await store.add("s", -2, 60)).toBe(3);
    expect(await store.setOnce("f", 60)).toBe(true);
    expect(await store.setOnce("f", 60)).toBe(false);
  });
});
