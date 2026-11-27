import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import { Queue, Worker } from "bullmq";
import { ProcessingRepository } from "./processing.repository";
import {
  PROCESS_TRACK_JOB,
  PROCESS_TRACK_OPTIONS,
  PROCESSING_QUEUE,
  TRANSLATE_TRACK_JOB,
  blockingConnection,
  translateJobId,
  type ProcessTrackJob,
} from "./queue-config";
import { TrackProcessor } from "./track-processor";

export const WORKER_CONCURRENCY = 2;

@Injectable()
export class ProcessingWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProcessingWorker.name);
  private worker?: Worker<ProcessTrackJob>;
  private queue?: Queue<ProcessTrackJob>;

  constructor(
    @Inject(TrackProcessor) private readonly processor: TrackProcessor,
    @Inject(ProcessingRepository)
    private readonly repository: ProcessingRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    this.queue = new Queue<ProcessTrackJob>(PROCESSING_QUEUE, {
      connection: blockingConnection(),
    });
    this.worker = new Worker<ProcessTrackJob>(
      PROCESSING_QUEUE,
      (job) =>
        job.name === TRANSLATE_TRACK_JOB
          ? this.processor.translate(job)
          : this.processor.process(job),
      {
        connection: blockingConnection(),
        concurrency: WORKER_CONCURRENCY,
      },
    );
    this.worker.on("error", (err) =>
      this.logger.error(`Worker error: ${err.name}`),
    );
    await this.enqueuePending();
    this.logger.log(
      `Processing worker started (concurrency ${WORKER_CONCURRENCY})`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.queue?.close();
  }

  private async enqueuePending(): Promise<void> {
    const ids = await this.repository.pendingTrackIds();
    for (const trackId of ids) {
      await this.queue!.add(
        PROCESS_TRACK_JOB,
        { trackId },
        { ...PROCESS_TRACK_OPTIONS, jobId: trackId },
      );
    }
    if (ids.length > 0)
      this.logger.log(`Queued ${ids.length} pending track(s)`);

    const translations = await this.repository.pendingTranslationTrackIds();
    for (const trackId of translations) {
      await this.queue!.add(
        TRANSLATE_TRACK_JOB,
        { trackId },
        { ...PROCESS_TRACK_OPTIONS, jobId: translateJobId(trackId) },
      );
    }
    if (translations.length > 0)
      this.logger.log(`Queued ${translations.length} pending translation(s)`);
  }
}
