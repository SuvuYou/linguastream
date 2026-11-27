import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import {
  PROCESS_TRACK_JOB,
  PROCESS_TRACK_OPTIONS,
  PROCESSING_QUEUE,
  TRANSLATE_TRACK_JOB,
  producerConnection,
  translateJobId,
  type ProcessTrackJob,
} from "./queue-config";

@Injectable()
export class ProcessingQueue implements OnModuleDestroy {
  private queue?: Queue<ProcessTrackJob>;

  private get bullQueue(): Queue<ProcessTrackJob> {
    this.queue ??= new Queue<ProcessTrackJob>(PROCESSING_QUEUE, { connection: producerConnection() });
    return this.queue;
  }

  async enqueue(trackId: string): Promise<void> {
    await this.bullQueue.add(PROCESS_TRACK_JOB, { trackId }, { ...PROCESS_TRACK_OPTIONS, jobId: trackId });
  }

  async requeue(trackId: string): Promise<void> {
    const previous = await this.bullQueue.getJob(trackId);
    await previous?.remove();
    await this.enqueue(trackId);
  }

  async enqueueTranslation(trackId: string): Promise<void> {
    const jobId = translateJobId(trackId);
    const previous = await this.bullQueue.getJob(jobId);
    if (previous && (await previous.isActive())) return;
    await previous?.remove();
    await this.bullQueue.add(TRANSLATE_TRACK_JOB, { trackId }, { ...PROCESS_TRACK_OPTIONS, jobId });
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue?.close();
  }
}
