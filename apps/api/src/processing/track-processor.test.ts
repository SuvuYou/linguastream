import { Logger } from "@nestjs/common";
import type { ProcessingStep } from "@linguastream/contracts";
import { UnrecoverableError } from "bullmq";
import { ProcessingError } from "./processing-error";
import type { ProcessingRepository, TrackSummary } from "./processing.repository";
import { TrackProcessor, type ProcessJob, type PublishedEvent } from "./track-processor";
import type { StepHandler } from "./steps";

const TRACK: TrackSummary = {
  trackId: "0190f3c2-7d1a-7c00-8a00-000000000001",
  videoId: "0190f3c2-7d1a-7c00-8a00-000000000002",
  userId: "user-1",
  title: "Ein Tag in Hamburg",
  status: "pending",
  progress: 0,
};

function setup(track: TrackSummary | null = { ...TRACK }, handlers: Partial<Record<ProcessingStep, StepHandler>> = {}) {
  const repository = {
    findTrack: vi.fn(async () => track),
    markProcessing: vi.fn(async () => {}),
    completeStep: vi.fn(async (_id: string, progress: number) => {
      if (track) track.progress = progress;
    }),
    markReady: vi.fn(async () => {}),
    markFailed: vi.fn(async () => {}),
    failOpenTranslations: vi.fn(async () => {}),
  };
  const spend = { canSpend: vi.fn(async () => true), record: vi.fn(async () => {}) };
  const processor = new TrackProcessor(repository as unknown as ProcessingRepository, handlers, spend);
  const published: PublishedEvent[] = [];
  const job = (attemptsMade = 0): ProcessJob => ({
    data: { trackId: TRACK.trackId },
    attemptsMade,
    opts: { attempts: 3 },
    updateProgress: vi.fn(async (progress) => {
      published.push(progress as PublishedEvent);
    }),
  });
  return { repository, processor, published, job };
}

describe("TrackProcessor", () => {
  beforeEach(() => {
    vi.spyOn(Logger.prototype, "warn").mockImplementation(() => {});
  });

  it("runs every step in order, records progress and publishes events for the track's owner", async () => {
    const parse = vi.fn(async () => {});
    const { processor, repository, published, job } = setup(undefined, { parse });

    await processor.process(job());

    expect(parse).toHaveBeenCalledWith(
      expect.objectContaining({ trackId: TRACK.trackId, spend: expect.objectContaining({ canSpend: expect.any(Function) }) }),
    );
    expect(repository.markProcessing).toHaveBeenCalledWith(TRACK.trackId);
    expect(repository.completeStep.mock.calls.map((c) => c[1])).toEqual([1, 2, 3, 4, 5]);
    expect(repository.markReady).toHaveBeenCalledWith(TRACK.trackId);
    expect(published.every((p) => p.user_id === "user-1")).toBe(true);
    expect(published.map((p) => (p.event.type === "step" ? p.event.step : p.event.type))).toEqual([
      "parse",
      "normalise",
      "analyse",
      "translate",
      "index",
      "ready",
    ]);
    expect(published[0]!.event).toMatchObject({ step_index: 0, step_count: 5 });
    expect(JSON.stringify(published)).not.toContain(TRACK.title);
  });

  it("resumes after the last finished step", async () => {
    const parse = vi.fn(async () => {});
    const { processor, published, job } = setup({ ...TRACK, status: "processing", progress: 2 }, { parse });

    await processor.process(job(1));

    expect(parse).not.toHaveBeenCalled();
    expect(published[0]!.event).toMatchObject({ type: "step", step: "analyse", step_index: 2 });
  });

  it("does nothing for a deleted or already ready track", async () => {
    for (const track of [null, { ...TRACK, status: "ready" as const }]) {
      const { processor, repository, published, job } = setup(track);
      await processor.process(job());
      expect(repository.markProcessing).not.toHaveBeenCalled();
      expect(published).toEqual([]);
    }
  });

  it("rethrows a retryable failure without marking the track failed before the last attempt", async () => {
    const { processor, repository, published, job } = setup(undefined, {
      parse: async () => {
        throw new Error("connection reset");
      },
    });

    await expect(processor.process(job(0))).rejects.toMatchObject({ code: "internal", message: "internal" });
    expect(repository.markFailed).not.toHaveBeenCalled();
    expect(repository.completeStep).not.toHaveBeenCalled();
    expect(published.map((p) => p.event.type)).toEqual(["step"]);
  });

  it("marks the track failed on the last attempt", async () => {
    const warn = vi.spyOn(Logger.prototype, "warn").mockImplementation(() => {});
    const { processor, repository, published, job } = setup(undefined, {
      parse: async () => {
        throw new ProcessingError("internal", true, "NLP service answered 500");
      },
    });

    await expect(processor.process(job(2))).rejects.toThrow("internal");
    expect(warn).toHaveBeenCalledWith(
      `Track ${TRACK.trackId} failed at parse on attempt 3: internal, NLP service answered 500`,
    );
    expect(repository.markFailed).toHaveBeenCalledWith(TRACK.trackId, "internal");
    expect(published.at(-1)!.event).toMatchObject({ type: "failed", error_code: "internal" });
  });

  it("fails at once, without retries, on an error that can't be fixed by retrying", async () => {
    const { processor, repository, published, job } = setup(undefined, {
      parse: async () => {
        throw new ProcessingError("invalid_track", false);
      },
    });

    await expect(processor.process(job(0))).rejects.toBeInstanceOf(UnrecoverableError);
    expect(repository.markFailed).toHaveBeenCalledWith(TRACK.trackId, "invalid_track");
    expect(published.at(-1)!.event).toMatchObject({ type: "failed", error_code: "invalid_track" });
  });

  describe("translate job", () => {
    const ready = () => ({ ...TRACK, status: "ready" as const, progress: 5 });

    it("runs only the translate step on a ready track and tells the owner", async () => {
      const translate = vi.fn(async () => {});
      const parse = vi.fn(async () => {});
      const { processor, repository, published, job } = setup(ready(), { translate, parse });

      await processor.translate(job());

      expect(translate).toHaveBeenCalledWith(expect.objectContaining({ trackId: TRACK.trackId }));
      expect(parse).not.toHaveBeenCalled();
      expect(repository.markProcessing).not.toHaveBeenCalled();
      expect(published.map((p) => p.event)).toEqual([
        { type: "step", track_id: TRACK.trackId, video_id: TRACK.videoId, step: "translate", step_index: 3, step_count: 5 },
        { type: "ready", track_id: TRACK.trackId, video_id: TRACK.videoId },
      ]);
    });

    it("skips a track that's gone or not ready", async () => {
      for (const track of [null, { ...TRACK }]) {
        const translate = vi.fn(async () => {});
        const { processor, published, job } = setup(track, { translate });
        await processor.translate(job());
        expect(translate).not.toHaveBeenCalled();
        expect(published).toEqual([]);
      }
    });

    it("retries a failure, and on the last attempt marks the translation failed but keeps the video ready", async () => {
      const translate = vi.fn(async () => {
        throw new Error("db down");
      });
      const first = setup(ready(), { translate });
      await expect(first.processor.translate(first.job(0))).rejects.toThrow("db down");
      expect(first.repository.failOpenTranslations).not.toHaveBeenCalled();

      const last = setup(ready(), { translate });
      await last.processor.translate(last.job(2));
      expect(last.repository.failOpenTranslations).toHaveBeenCalledWith(TRACK.trackId);
      expect(last.repository.markFailed).not.toHaveBeenCalled();
      expect(last.published.slice(-2).map((p) => p.event)).toEqual([
        { type: "translation_failed", track_id: TRACK.trackId, video_id: TRACK.videoId, error_code: "internal" },
        { type: "ready", track_id: TRACK.trackId, video_id: TRACK.videoId },
      ]);
    });

    it("lets the step publish line progress and a translation failure, in the pipeline too", async () => {
      const translate: StepHandler = async (context) => {
        await context.report!.progress(40, 812);
        await context.report!.translationFailed("provider_unavailable");
      };
      const base = { track_id: TRACK.trackId, video_id: TRACK.videoId };
      for (const run of ["translate", "process"] as const) {
        const { processor, published, job } = setup(run === "translate" ? ready() : { ...TRACK }, { translate });
        await processor[run](job());
        const events = published.map((p) => p.event);
        expect(events).toContainEqual({
          type: "step",
          ...base,
          step: "translate",
          step_index: 3,
          step_count: 5,
          progress: { done: 40, total: 812 },
        });
        expect(events).toContainEqual({ type: "translation_failed", ...base, error_code: "provider_unavailable" });
        expect(events.at(-1)!.type).toBe("ready");
      }
    });
  });

  it("counts lemmas for a single track on request, without events", async () => {
    const index = vi.fn<StepHandler>(async () => {});
    const { processor, repository, published } = setup({ ...TRACK, status: "ready", progress: 5 }, { index });
    await processor.indexTrack(TRACK.trackId);
    expect(index).toHaveBeenCalledWith(expect.objectContaining({ trackId: TRACK.trackId, repository }));
    expect(published).toEqual([]);
  });
});
