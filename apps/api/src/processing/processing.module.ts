import { Module } from "@nestjs/common";
import { ProcessingController } from "./processing.controller";
import { ProcessingEvents } from "./processing-events";
import { ProcessingQueue } from "./processing-queue";
import { ProcessingRepository } from "./processing.repository";
import { ProcessingService } from "./processing.service";

@Module({
  controllers: [ProcessingController],
  providers: [ProcessingQueue, ProcessingEvents, ProcessingRepository, ProcessingService],
  exports: [ProcessingService],
})
export class ProcessingModule {}
