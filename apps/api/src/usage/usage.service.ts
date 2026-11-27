import { HttpException, HttpStatus, Inject, Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import type { ApiError, UsageSummary } from "@linguastream/contracts";
import { CLOCK, SpendLimiter, type Clock } from "./spend-limiter";
import { CHARACTERS_PER_MINUTE, DAY_KEY_TTL_SECONDS, berlinDay, usageKeys, usageLimits } from "./usage-config";
import { UsageStore } from "./usage-store";

function minutes(characters: number): number {
  return Math.max(0, Math.floor(characters / CHARACTERS_PER_MINUTE));
}

function tooMany(error: string): HttpException {
  return new HttpException({ error } satisfies ApiError, HttpStatus.TOO_MANY_REQUESTS);
}

function errorName(err: unknown): string {
  return err instanceof Error ? err.name : typeof err;
}

@Injectable()
export class UsageService {
  private readonly logger = new Logger(UsageService.name);

  constructor(
    @Inject(UsageStore) private readonly store: UsageStore,
    @Inject(SpendLimiter) private readonly spend: SpendLimiter,
    @Inject(CLOCK) private readonly now: Clock,
  ) {}

  async reserveTransfer(userId: string, characters: number): Promise<() => Promise<void>> {
    const key = usageKeys.transfer(userId, berlinDay(this.now()));
    const limit = usageLimits().transferCharactersPerDay;
    let total: number | null;
    try {
      total = await this.store.addWithin(key, characters, limit, DAY_KEY_TTL_SECONDS);
    } catch (err) {
      this.logger.warn(`Transfer quota not checked, usage store unavailable: ${errorName(err)}`);
      return async () => {};
    }
    if (total === null) {
      const left = minutes(limit - (await this.store.get(key).catch(() => limit)));
      throw tooMany(`Daily transfer limit reached. About ${left} minutes of video left today; the limit resets at midnight.`);
    }
    return async () => {
      await this.store.add(key, -characters, DAY_KEY_TTL_SECONDS).catch(() => undefined);
    };
  }

  async startAiCall(userId: string): Promise<void> {
    let allowed: boolean;
    let total: number | null;
    try {
      allowed = await this.spend.canSpend();
      total = allowed
        ? await this.store.addWithin(
            usageKeys.aiCalls(userId, berlinDay(this.now())),
            1,
            usageLimits().aiCallsPerDay,
            DAY_KEY_TTL_SECONDS,
          )
        : null;
    } catch (err) {
      this.logger.warn(`AI call refused, usage store unavailable: ${errorName(err)}`);
      throw new ServiceUnavailableException({ error: "AI is unavailable right now. Try again later." } satisfies ApiError);
    }
    if (!allowed) {
      throw new ServiceUnavailableException({ error: "AI limit reached for this month" } satisfies ApiError);
    }
    if (total === null) throw tooMany("Daily AI limit reached. It resets at midnight.");
  }

  async summary(userId: string, isAdmin: boolean): Promise<UsageSummary> {
    const day = berlinDay(this.now());
    const limits = usageLimits();
    const [transfer, aiCalls, spent] = await Promise.all([
      this.store.get(usageKeys.transfer(userId, day)),
      this.store.get(usageKeys.aiCalls(userId, day)),
      this.spend.monthSpendMicroUsd(),
    ]);
    return {
      day,
      transfer: {
        used_characters: transfer,
        limit_characters: limits.transferCharactersPerDay,
        minutes_left: minutes(limits.transferCharactersPerDay - transfer),
      },
      ai_calls: { used: aiCalls, limit: limits.aiCallsPerDay },
      paid_features_paused: spent >= limits.monthlySpendCapMicroUsd,
      ...(isAdmin && {
        month_spend_usd: spent / 1_000_000,
        month_spend_cap_usd: limits.monthlySpendCapMicroUsd / 1_000_000,
      }),
    };
  }
}
