import { Inject, Injectable, Logger } from "@nestjs/common";
import {
  PROCESSING_STEPS,
  type ProcessingEvent,
  type ProcessingStep,
} from "@linguastream/contracts";
import { UnrecoverableError, type Job } from "bullmq";
import { SpendLimiter } from "../usage/spend-limiter";
import { toProcessingError } from "./processing-error";
import {
  ProcessingRepository,
  type TrackSummary,
} from "./processing.repository";
import type { ProcessTrackJob } from "./queue-config";
import { GeminiClient } from "../definition/gemini.client";
import { nlpAnalyser } from "./analyse/nlp-client";
import { PUNCTUATION_PROMPT } from "./normalise/punctuate";
import { createStepHandlers, type StepHandler } from "./steps";

export const STEP_HANDLERS_TOKEN = Symbol("STEP_HANDLERS");

export type UntitledEvent = ProcessingEvent extends infer E
  ? E extends ProcessingEvent
    ? Omit<E, "title">
    : never
  : never;

export interface PublishedEvent {
  user_id: string;
  event: UntitledEvent;
}

export type ProcessJob = Pick<
  Job<ProcessTrackJob>,
  "data" | "attemptsMade" | "opts" | "updateProgress"
>;

function describe(err: unknown): string {
  if (!(err instanceof Error)) return typeof err;
  const code = (err as { code?: unknown }).code;
  return typeof code === "string" ? `${err.name} ${code}` : err.name;
}

export const stepHandlersProvider = {
  provide: STEP_HANDLERS_TOKEN,
  inject: [GeminiClient],
  useFactory: (gemini: GeminiClient) =>
    createStepHandlers({
      punctuate: (text) =>
        gemini.generateText(text, {
          systemInstruction: PUNCTUATION_PROMPT,
          temperature: 0,
          responseMimeType: "text/plain",
        }),
      lexicon: null,
      analyse: nlpAnalyser(),
    }),
};

@Injectable()
export class TrackProcessor {
  private readonly logger = new Logger(TrackProcessor.name);

  constructor(
    @Inject(ProcessingRepository)
    private readonly repository: ProcessingRepository,
    @Inject(STEP_HANDLERS_TOKEN)
    private readonly handlers: Partial<Record<ProcessingStep, StepHandler>>,
    @Inject(SpendLimiter)
    private readonly spend: Pick<SpendLimiter, "canSpend" | "record">,
  ) {}

  async process(job: ProcessJob): Promise<void> {
    const track = await this.repository.findTrack(job.data.trackId);
    if (!track || track.status === "ready") return;

    const base = { track_id: track.trackId, video_id: track.videoId };
    const publish = (event: UntitledEvent) =>
      job.updateProgress({
        user_id: track.userId,
        event,
      } satisfies PublishedEvent);

    await this.repository.markProcessing(track.trackId);
    try {
      await this.runSteps(track, base, publish);
    } catch (err) {
      const error = toProcessingError(err);
      this.logger.warn(
        `Track ${track.trackId} failed on attempt ${job.attemptsMade + 1}: ${describe(err)}`,
      );
      const lastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
      if (!error.retryable || lastAttempt) {
        await this.repository.markFailed(track.trackId, error.code);
        await publish({ type: "failed", ...base, error_code: error.code });
      }
      if (!error.retryable) throw new UnrecoverableError(error.code);
      throw error;
    }
    await this.repository.markReady(track.trackId);
    await publish({ type: "ready", ...base });
  }

  private async runSteps(
    track: TrackSummary,
    base: { track_id: string; video_id: string },
    publish: (event: UntitledEvent) => Promise<void>,
  ): Promise<void> {
    for (let index = track.progress; index < PROCESSING_STEPS.length; index++) {
      const step = PROCESSING_STEPS[index]!;
      await publish({
        type: "step",
        ...base,
        step,
        step_index: index,
        step_count: PROCESSING_STEPS.length,
      });
      await this.handlers[step]?.({
        trackId: track.trackId,
        repository: this.repository,
        spend: this.spend,
      });
      await this.repository.completeStep(track.trackId, index + 1);
    }
  }
}
