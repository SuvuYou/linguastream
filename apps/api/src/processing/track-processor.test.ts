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
    const { processor, repository, published, job } = setup(undefined, {
      parse: async () => {
        throw new Error("connection reset");
      },
    });

    await expect(processor.process(job(2))).rejects.toThrow("internal");
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
});
