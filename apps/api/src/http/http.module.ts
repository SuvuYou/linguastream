import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import { OriginGuard, webOriginProvider } from "./origin.guard";
import { DEFAULT_RATE_LIMIT, RateLimitGuard } from "./rate-limit";

@Module({
  imports: [ThrottlerModule.forRoot({ throttlers: [{ name: "default", ...DEFAULT_RATE_LIMIT }] })],
  providers: [
    webOriginProvider,
    { provide: APP_GUARD, useClass: OriginGuard },
    { provide: APP_GUARD, useClass: RateLimitGuard },
  ],
})
export class HttpModule {}
