import { Logger } from "@nestjs/common";
import { defaultServices, waitForServices } from "./wait-for-services";

describe("waitForServices against the real Postgres and Redis", () => {
  it("finds both up", async () => {
    vi.stubEnv("REDIS_URL", process.env.TEST_REDIS_URL ?? "redis://localhost:6379/15");
    const logger = { log: vi.fn(), warn: vi.fn() } as unknown as Logger;
    await waitForServices(defaultServices(), { retryMs: 10, logger });
    expect(logger.warn).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it("reports Redis as down while nothing listens", async () => {
    vi.stubEnv("REDIS_URL", "redis://127.0.0.1:1");
    const redis = defaultServices().find((s) => s.name === "Redis")!;
    await expect(redis.check()).rejects.toBeDefined();
    vi.unstubAllEnvs();
  });
});
