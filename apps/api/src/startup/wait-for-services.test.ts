import { describe, expect, it, vi } from "vitest";
import { waitForServices, type Service } from "./wait-for-services";

const logger = () => ({ log: vi.fn(), warn: vi.fn() });

describe("waitForServices", () => {
  it("returns at once when every service answers", async () => {
    const log = logger();
    const check = vi.fn(async () => {});
    await waitForServices([{ name: "Postgres", hint: "start it", check }], { retryMs: 1, logger: log });
    expect(check).toHaveBeenCalledTimes(1);
    expect(log.warn).not.toHaveBeenCalled();
  });

  it("retries a service that's down, says what to do, and reports when it's up", async () => {
    const log = logger();
    const refused = Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:5432 secret-host"), { code: "ECONNREFUSED" });
    const check = vi.fn<Service["check"]>().mockRejectedValueOnce(refused).mockRejectedValueOnce(refused).mockResolvedValue();
    const redis = vi.fn(async () => {});

    await waitForServices(
      [
        { name: "Postgres", hint: "start it with docker compose", check },
        { name: "Redis", hint: "check REDIS_URL", check: redis },
      ],
      { retryMs: 1, logger: log },
    );

    expect(check).toHaveBeenCalledTimes(3);
    expect(log.warn).toHaveBeenCalledTimes(1);
    expect(log.warn).toHaveBeenCalledWith("Waiting for Postgres (ECONNREFUSED): start it with docker compose");
    expect(log.log).toHaveBeenCalledWith("Postgres is up");
    expect(redis).toHaveBeenCalledTimes(1);
  });

  it("names the error type when there's no code", async () => {
    const log = logger();
    const check = vi.fn<Service["check"]>().mockRejectedValueOnce(new TypeError("x")).mockResolvedValue();
    await waitForServices([{ name: "Redis", hint: "h", check }], { retryMs: 1, logger: log });
    expect(log.warn).toHaveBeenCalledWith("Waiting for Redis (TypeError): h");
  });
});
