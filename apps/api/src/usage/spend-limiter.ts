import { Inject, Injectable, Logger } from "@nestjs/common";
import { MONTH_KEY_TTL_SECONDS, usageKeys, usageLimits, utcMonth } from "./usage-config";
import { UsageStore } from "./usage-store";

export const CLOCK = Symbol("CLOCK");
export type Clock = () => Date;
export const clockProvider = { provide: CLOCK, useValue: (() => new Date()) satisfies Clock };

@Injectable()
export class SpendLimiter {
  private readonly logger = new Logger(SpendLimiter.name);

  constructor(
    @Inject(UsageStore) private readonly store: UsageStore,
    @Inject(CLOCK) private readonly now: Clock,
  ) {}

  async monthSpendMicroUsd(): Promise<number> {
    return this.store.get(usageKeys.spend(utcMonth(this.now())));
  }

  async canSpend(): Promise<boolean> {
    const spent = await this.monthSpendMicroUsd();
    const allowed = spent < usageLimits().monthlySpendCapMicroUsd;
    if (!allowed) await this.logCapOnce();
    return allowed;
  }

  async record(microUsd: number): Promise<void> {
    if (microUsd <= 0) return;
    const total = await this.store.add(usageKeys.spend(utcMonth(this.now())), Math.ceil(microUsd), MONTH_KEY_TTL_SECONDS);
    if (total >= usageLimits().monthlySpendCapMicroUsd) await this.logCapOnce();
  }

  private async logCapOnce(): Promise<void> {
    const month = utcMonth(this.now());
    if (await this.store.setOnce(usageKeys.capLogged(month), MONTH_KEY_TTL_SECONDS)) {
      this.logger.warn(`Monthly spend cap reached for ${month}; paid features are paused until next month`);
    }
  }
}
