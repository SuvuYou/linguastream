import { Inject, Injectable, Logger } from "@nestjs/common";
import {
  PROCESSING_STEPS,
  type ProcessingEvent,
  type ProcessingStep,
} from "@linguastream/contracts";
import { UnrecoverableError, type Job } from "bullmq";
import { SpendLimiter } from "../usage/spend-limiter";
import { describeError, toProcessingError } from "./processing-error";
import {
  ProcessingRepository,
  type TrackSummary,
} from "./processing.repository";
import type { ProcessTrackJob } from "./queue-config";
import { GeminiClient } from "../ai/gemini.client";
import { nlpAnalyser } from "./analyse/nlp-client";
import { PUNCTUATION_INSTRUCTION } from "../ai/prompts/punctuation";
import { geminiTranslator } from "./translate/gemini-translator";
import { createStepHandlers, type StepHandler, type StepReporter } from "./steps";

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

export const stepHandlersProvider = {
  provide: STEP_HANDLERS_TOKEN,
  inject: [GeminiClient],
  useFactory: (gemini: GeminiClient) =>
    createStepHandlers({
      punctuate: (text) =>
        gemini.generateText(text, {
          systemInstruction: PUNCTUATION_INSTRUCTION,
          temperature: 0,
          responseMimeType: "text/plain",
        }),
      lexicon: null,
      analyse: nlpAnalyser(),
      translate: geminiTranslator(gemini),
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
    let step: ProcessingStep | undefined;
    try {
      await this.runSteps(track, base, publish, (current) => (step = current));
    } catch (err) {
      const error = toProcessingError(err);
      this.logger.warn(
        `Track ${track.trackId} failed at ${step ?? "start"} on attempt ${job.attemptsMade + 1}: ${describeError(err)}`,
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

  async translate(job: ProcessJob): Promise<void> {
    const track = await this.repository.findTrack(job.data.trackId);
    if (!track || track.status !== "ready") return;

    const base = { track_id: track.trackId, video_id: track.videoId };
    const publish = (event: UntitledEvent) =>
      job.updateProgress({ user_id: track.userId, event } satisfies PublishedEvent);

    await publish({
      type: "step",
      ...base,
      step: "translate",
      step_index: PROCESSING_STEPS.indexOf("translate"),
      step_count: PROCESSING_STEPS.length,
    });
    try {
      await this.handlers.translate?.({
        trackId: track.trackId,
        repository: this.repository,
        spend: this.spend,
        report: this.reporter(base, publish),
      });
    } catch (err) {
      this.logger.warn(
        `Translation of track ${track.trackId} failed on attempt ${job.attemptsMade + 1}: ${describeError(err)}`,
      );
      if (job.attemptsMade + 1 < (job.opts.attempts ?? 1)) throw err;
      await this.repository.failOpenTranslations(track.trackId);
      await publish({ type: "translation_failed", ...base, error_code: "internal" });
    }
    await publish({ type: "ready", ...base });
  }

  async indexTrack(trackId: string): Promise<void> {
    await this.handlers.index?.({ trackId, repository: this.repository, spend: this.spend });
  }

  private reporter(
    base: { track_id: string; video_id: string },
    publish: (event: UntitledEvent) => Promise<void>,
  ): StepReporter {
    const step = "translate" as const;
    return {
      progress: (done, total) =>
        publish({
          type: "step",
          ...base,
          step,
          step_index: PROCESSING_STEPS.indexOf(step),
          step_count: PROCESSING_STEPS.length,
          progress: { done, total },
        }),
      translationFailed: (error_code) => publish({ type: "translation_failed", ...base, error_code }),
    };
  }

  private async runSteps(
    track: TrackSummary,
    base: { track_id: string; video_id: string },
    publish: (event: UntitledEvent) => Promise<void>,
    onStep: (step: ProcessingStep) => void,
  ): Promise<void> {
    for (let index = track.progress; index < PROCESSING_STEPS.length; index++) {
      const step = PROCESSING_STEPS[index]!;
      onStep(step);
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
        report: this.reporter(base, publish),
      });
      await this.repository.completeStep(track.trackId, index + 1);
    }
  }
}
