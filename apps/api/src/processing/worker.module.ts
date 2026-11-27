import { Module } from "@nestjs/common";
import { ProcessingRepository } from "./processing.repository";
import { ProcessingWorker } from "./processing-worker";
import { TrackProcessor, stepHandlersProvider } from "./track-processor";

@Module({
  providers: [ProcessingRepository, TrackProcessor, stepHandlersProvider, ProcessingWorker],
})
export class WorkerModule {}
