import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { SpendLimiter, clockProvider } from "./spend-limiter";
import { UsageController } from "./usage.controller";
import { UsageService } from "./usage.service";
import { UsageStore, redisClientProvider } from "./usage-store";

@Module({
  imports: [UsersModule],
  controllers: [UsageController],
  providers: [redisClientProvider, UsageStore, clockProvider, SpendLimiter, UsageService],
  exports: [UsageService, SpendLimiter],
})
export class UsageModule {}
