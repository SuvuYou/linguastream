import { Module } from "@nestjs/common";
import { SpendLimiter, clockProvider } from "../usage/spend-limiter";
import { UsageStore, redisClientProvider } from "../usage/usage-store";
import { ProcessingRepository } from "./processing.repository";
import { ProcessingWorker } from "./processing-worker";
import { TrackProcessor, stepHandlersProvider } from "./track-processor";

@Module({
  providers: [
    ProcessingRepository,
    TrackProcessor,
    stepHandlersProvider,
    ProcessingWorker,
    redisClientProvider,
    UsageStore,
    clockProvider,
    SpendLimiter,
  ],
})
export class WorkerModule {}
