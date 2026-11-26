import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import type { ApiError } from "@linguastream/contracts";
import type { AuthUser } from "../auth/auth-user";

export const DEFAULT_RATE_LIMIT = { limit: 300, ttl: 60_000 };
export const STRICT_RATE_LIMIT = { limit: 20, ttl: 60_000 };

export const RateLimit = (limit = STRICT_RATE_LIMIT.limit, ttlMs = STRICT_RATE_LIMIT.ttl) =>
  Throttle({ default: { limit, ttl: ttlMs } });

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const user = req.user as AuthUser | undefined;
    return user ? `user:${user.id}` : `ip:${String(req.ip)}`;
  }

  protected async throwThrottlingException(): Promise<void> {
    throw new HttpException(
      { error: "Too many requests" } satisfies ApiError,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
