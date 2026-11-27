import { ConflictException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PROCESSING_STEPS, type ApiError, type ProcessingEvent, type RetriedTrack } from "@linguastream/contracts";
import { ProcessingQueue } from "./processing-queue";
import { ProcessingRepository, type TrackSummary } from "./processing.repository";

function currentState(track: TrackSummary): ProcessingEvent {
  const base = { track_id: track.trackId, video_id: track.videoId, title: track.title };
  const step = PROCESSING_STEPS[track.progress];
  if (track.status === "processing" && step) {
    return { type: "step", ...base, step, step_index: track.progress, step_count: PROCESSING_STEPS.length };
  }
  return { type: "queued", ...base };
}

@Injectable()
export class ProcessingService {
  private readonly logger = new Logger(ProcessingService.name);

  constructor(
    @Inject(ProcessingQueue) private readonly queue: ProcessingQueue,
    @Inject(ProcessingRepository) private readonly repository: ProcessingRepository,
  ) {}

  async enqueue(trackId: string): Promise<void> {
    try {
      await this.queue.enqueue(trackId);
    } catch (err) {
      this.logger.warn(`Track ${trackId} stays pending, queue unavailable: ${err instanceof Error ? err.name : typeof err}`);
    }
  }

  async retry(userId: string, trackId: string): Promise<RetriedTrack> {
    const track = await this.repository.findUserTrack(userId, trackId);
    if (!track) throw new NotFoundException({ error: "Track not found" } satisfies ApiError);
    if (track.status !== "failed") {
      throw new ConflictException({ error: "Only a failed track can be retried" } satisfies ApiError);
    }
    await this.repository.markPendingAgain(trackId);
    await this.queue.requeue(trackId);
    return { track_id: trackId, status: "pending" };
  }

  async enqueueTranslation(trackId: string): Promise<void> {
    await this.queue.enqueueTranslation(trackId);
  }

  async currentEvents(userId: string): Promise<ProcessingEvent[]> {
    const [tracks, translations] = await Promise.all([
      this.repository.unfinishedTracks(userId),
      this.repository.openTranslations(userId),
    ]);
    return [
      ...tracks.map(currentState),
      ...translations.map(({ track, done, total }): ProcessingEvent => ({
        type: "step",
        track_id: track.trackId,
        video_id: track.videoId,
        title: track.title,
        step: "translate",
        step_index: PROCESSING_STEPS.indexOf("translate"),
        step_count: PROCESSING_STEPS.length,
        progress: { done, total },
      })),
    ];
  }
}
