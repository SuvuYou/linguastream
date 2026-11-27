import { Logger } from "@nestjs/common";
import { db } from "@linguastream/db";
import { Redis } from "ioredis";
import { errorReason } from "../processing/processing-error";

export interface Service {
  name: string;
  hint: string;
  check: () => Promise<void>;
}

export const RETRY_MS = 3_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function defaultServices(): Service[] {
  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
  return [
    {
      name: "Postgres",
      hint: "start it with `docker compose up -d` and check DATABASE_URL",
      check: async () => {
        await db.$queryRaw`SELECT 1`;
      },
    },
    {
      name: "Redis",
      hint: "start it with `docker compose up -d` and check REDIS_URL",
      check: async () => {
        const redis = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 0, retryStrategy: () => null });
        redis.on("error", () => undefined);
        try {
          await redis.connect();
          await redis.ping();
        } finally {
          redis.disconnect();
        }
      },
    },
  ];
}

export async function waitForServices(
  services: Service[] = defaultServices(),
  options: { retryMs?: number; logger?: Pick<Logger, "log" | "warn"> } = {},
): Promise<void> {
  const logger = options.logger ?? new Logger("Startup");
  for (const service of services) {
    let attempt = 0;
    for (;;) {
      try {
        await service.check();
        if (attempt > 0) logger.log(`${service.name} is up`);
        break;
      } catch (err) {
        if (attempt === 0 || attempt % 10 === 0)
          logger.warn(`Waiting for ${service.name} (${errorReason(err)}): ${service.hint}`);
        attempt++;
        await sleep(options.retryMs ?? RETRY_MS);
      }
    }
  }
}
