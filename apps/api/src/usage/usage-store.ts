import { Inject, Injectable, type OnModuleDestroy } from "@nestjs/common";
import { Redis } from "ioredis";

export const REDIS_CLIENT = Symbol("REDIS_CLIENT");

export const redisClientProvider = {
  provide: REDIS_CLIENT,
  useFactory: () =>
    new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { lazyConnect: true, maxRetriesPerRequest: 1 }),
};

const ADD_WITHIN = `
local current = tonumber(redis.call("GET", KEYS[1]) or "0")
local amount = tonumber(ARGV[1])
if current + amount > tonumber(ARGV[2]) then return -1 end
local total = redis.call("INCRBY", KEYS[1], amount)
redis.call("EXPIRE", KEYS[1], ARGV[3])
return total
`;

@Injectable()
export class UsageStore implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get(key: string): Promise<number> {
    return Number((await this.redis.get(key)) ?? 0);
  }

  async addWithin(key: string, amount: number, limit: number, ttlSeconds: number): Promise<number | null> {
    const total = Number(await this.redis.eval(ADD_WITHIN, 1, key, amount, limit, ttlSeconds));
    return total < 0 ? null : total;
  }

  async add(key: string, amount: number, ttlSeconds: number): Promise<number> {
    const total = await this.redis.incrby(key, amount);
    await this.redis.expire(key, ttlSeconds);
    return total;
  }

  async setOnce(key: string, ttlSeconds: number): Promise<boolean> {
    return (await this.redis.set(key, "1", "EX", ttlSeconds, "NX")) === "OK";
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis.status !== "wait" && this.redis.status !== "end") await this.redis.quit().catch(() => undefined);
  }
}
