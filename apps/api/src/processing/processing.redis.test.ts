import { Logger } from "@nestjs/common";
import type { ProcessingEvent } from "@linguastream/contracts";
import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { firstValueFrom, take, toArray } from "rxjs";
import { ProcessingError } from "./processing-error";
import { ProcessingEvents } from "./processing-events";
import { ProcessingQueue } from "./processing-queue";
import type { ProcessingRepository, TrackSummary } from "./processing.repository";
import { ProcessingWorker } from "./processing-worker";
import { PROCESSING_QUEUE } from "./queue-config";
import type { StepHandler } from "./steps";
import { TrackProcessor } from "./track-processor";

function testRedisUrl(): string {
  const url = process.env.TEST_REDIS_URL;
  if (!url) throw new Error("TEST_REDIS_URL is not set (see .env.example).");
  const db = new URL(url).pathname.slice(1);
  if (!db || db === "0") throw new Error("TEST_REDIS_URL must name a Redis database other than 0, e.g. redis://localhost:6379/15");
  return url;
}

const ids = (n: number) => `0190f3c2-7d1a-7c00-8a00-00000000000${n}`;

let pendingTranslations: string[] = [];
let withoutCounts: string[] = [];

function fakeRepository(tracks: TrackSummary[]) {
  const find = (id: string) => tracks.find((t) => t.trackId === id) ?? null;
  return {
    findTrack: vi.fn(async (id: string) => find(id)),
    pendingTrackIds: vi.fn(async () => tracks.filter((t) => t.status === "pending").map((t) => t.trackId)),
    pendingTranslationTrackIds: vi.fn(async () => pendingTranslations),
    failOpenTranslations: vi.fn(async () => {}),
    readyTracksWithoutLemmaCounts: vi.fn(async () => withoutCounts),
    markProcessing: vi.fn(async (id: string) => void (find(id)!.status = "processing")),
    completeStep: vi.fn(async (id: string, progress: number) => void (find(id)!.progress = progress)),
    markReady: vi.fn(async (id: string) => void (find(id)!.status = "ready")),
    markFailed: vi.fn(async (id: string) => void (find(id)!.status = "failed")),
  };
}

describe("processing queue (Redis)", { timeout: 15_000 }, () => {
  let redis: Redis;
  let tracks: TrackSummary[];
  let parse: ReturnType<typeof vi.fn<StepHandler>>;
  let translate: ReturnType<typeof vi.fn<StepHandler>>;
  let index: ReturnType<typeof vi.fn<StepHandler>>;
  let worker: ProcessingWorker;
  let queue: ProcessingQueue;
  let events: ProcessingEvents;

  beforeAll(() => {
    process.env.REDIS_URL = testRedisUrl();
  });

  beforeEach(async () => {
    vi.spyOn(Logger.prototype, "log").mockImplementation(() => {});
    vi.spyOn(Logger.prototype, "warn").mockImplementation(() => {});
    redis = new Redis(testRedisUrl());
    await redis.flushdb();
    tracks = [1, 2].map((n) => ({
      trackId: ids(n),
      videoId: ids(9),
      userId: `user-${n}`,
      title: `Video ${n}`,
      status: "pending" as const,
      progress: 0,
    }));
    parse = vi.fn<StepHandler>(async () => {});
    translate = vi.fn<StepHandler>(async () => {});
    pendingTranslations = [];
    withoutCounts = [];
    index = vi.fn<StepHandler>(async () => {});
    const repository = fakeRepository(tracks) as unknown as ProcessingRepository;
    const spend = { canSpend: vi.fn(async () => true), record: vi.fn(async () => {}) };
    worker = new ProcessingWorker(new TrackProcessor(repository, { parse, translate, index }, spend), repository);
    queue = new ProcessingQueue();
    events = new ProcessingEvents(repository);
  });

  afterEach(async () => {
    await worker.onModuleDestroy();
    await queue.onModuleDestroy();
    await events.onModuleDestroy();
    await redis.quit();
  });

  async function collect(userId: string, count: number): Promise<ProcessingEvent[]> {
    const received = firstValueFrom(events.forUser(userId).pipe(take(count), toArray()));
    await events.whenListening();
    await new Promise((resolve) => setTimeout(resolve, 200));
    return received;
  }

  it("runs a queued track and streams its steps, with the title from the database, to its owner only", async () => {
    const forOwner = collect("user-1", 6);
    let otherUserEvents = 0;
    events.forUser("user-3").subscribe(() => otherUserEvents++);
    await new Promise((resolve) => setTimeout(resolve, 300));
    tracks[1]!.status = "ready";

    await worker.onModuleInit();
    await queue.enqueue(ids(1));

    const received = await forOwner;
    expect(received.map((e) => (e.type === "step" ? e.step : e.type))).toEqual([
      "parse",
      "normalise",
      "analyse",
      "translate",
      "index",
      "ready",
    ]);
    expect(received.every((e) => e.title === "Video 1")).toBe(true);
    expect(parse).toHaveBeenCalledTimes(1);
    expect(tracks[0]).toMatchObject({ status: "ready", progress: 5 });
    expect(otherUserEvents).toBe(0);
  });

  it("queues tracks left pending when the worker starts, and never twice", async () => {
    const one = collect("user-1", 6);
    const two = collect("user-2", 6);
    await queue.enqueue(ids(1));

    await worker.onModuleInit();

    await Promise.all([one, two]);
    expect(parse).toHaveBeenCalledTimes(2);
  });

  it("fails an unfixable track at once and runs it again when requeued", async () => {
    parse.mockRejectedValueOnce(new ProcessingError("invalid_track", false));
    const failed = collect("user-1", 2);
    tracks[1]!.status = "ready";
    await worker.onModuleInit();
    await queue.enqueue(ids(1));

    expect((await failed).at(-1)).toMatchObject({ type: "failed", error_code: "invalid_track" });
    const bull = new Queue(PROCESSING_QUEUE, { connection: { url: testRedisUrl() } });
    const job = await bull.getJob(ids(1));
    expect(await job?.getState()).toBe("failed");
    expect(job?.failedReason).toBe("invalid_track");
    expect(job?.data).toEqual({ trackId: ids(1) });
    expect(JSON.stringify(job)).not.toContain("Video 1");
    await bull.close();

    tracks[0]!.status = "pending";
    const again = collect("user-1", 6);
    await queue.requeue(ids(1));
    expect((await again).at(-1)).toMatchObject({ type: "ready" });
    expect(parse).toHaveBeenCalledTimes(2);
  });

  it("runs a translate job on a ready track, and queues open translations when the worker starts", async () => {
    tracks[0]!.status = "ready";
    tracks[0]!.progress = 5;
    tracks[1]!.status = "ready";
    pendingTranslations = [ids(2)];
    const one = collect("user-1", 2);
    const two = collect("user-2", 2);

    await worker.onModuleInit();
    await queue.enqueueTranslation(ids(1));
    await queue.enqueueTranslation(ids(1));

    for (const received of await Promise.all([one, two])) {
      expect(received.map((e) => (e.type === "step" ? e.step : e.type))).toEqual(["translate", "ready"]);
    }
    expect(translate).toHaveBeenCalledTimes(2);
    expect(parse).not.toHaveBeenCalled();

    const again = collect("user-1", 2);
    await queue.enqueueTranslation(ids(1));
    await again;
    expect(translate).toHaveBeenCalledTimes(3);
  });

  it("counts lemmas for earlier ready videos when it starts, and carries on after a failure", async () => {
    withoutCounts = [ids(1), ids(2)];
    index.mockRejectedValueOnce(new Error("db hiccup"));
    await worker.onModuleInit();
    await worker.backfill;
    expect(index.mock.calls.map(([context]) => context.trackId)).toEqual([ids(1), ids(2)]);
    expect(Logger.prototype.log).toHaveBeenCalledWith("Counted lemmas for 1 of 2 earlier video(s)");
  });
});
