import { Logger, type INestApplication } from "@nestjs/common";
import { ApiError, ProcessingEvent, RetriedTrack } from "@linguastream/contracts";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { firstValueFrom, Subject, take, toArray } from "rxjs";
import request from "supertest";
import {
  createTestApp,
  fakeProcessingEvents,
  fakeProcessingQueue,
  fakeProcessingRepository,
} from "../test/auth-fakes";
import { withCurrentState } from "./processing.controller";
import { ProcessingEvents } from "./processing-events";
import { ProcessingQueue } from "./processing-queue";
import { ProcessingRepository, type TrackSummary } from "./processing.repository";

const ids = (n: number) => `0190f3c2-7d1a-7c00-8a00-00000000000${n}`;

const track = (fields: Partial<TrackSummary>): TrackSummary => ({
  trackId: ids(1),
  videoId: ids(9),
  userId: "user-1",
  title: "Ein Tag in Hamburg",
  status: "pending",
  progress: 0,
  ...fields,
});

function readEvents(url: string, count: number): Promise<{ type: string; data: unknown }[]> {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { headers: { Authorization: "Bearer valid-id-token" } }, (res) => {
      if (res.headers["content-type"]?.startsWith("text/event-stream") !== true) {
        reject(new Error(`unexpected ${res.statusCode} ${res.headers["content-type"]}`));
        return;
      }
      let buffer = "";
      const events: { type: string; data: unknown }[] = [];
      res.setEncoding("utf8");
      res.on("data", (chunk: string) => {
        buffer += chunk;
        let end: number;
        while ((end = buffer.indexOf("\n\n")) !== -1) {
          const block = buffer.slice(0, end);
          buffer = buffer.slice(end + 2);
          const type = /^event: (.*)$/m.exec(block)?.[1];
          const data = /^data: (.*)$/m.exec(block)?.[1];
          if (type && data) events.push({ type, data: JSON.parse(data) });
          if (events.length === count) {
            req.destroy();
            resolve(events);
          }
        }
      });
    });
    req.on("error", (err) => {
      if (!(err as NodeJS.ErrnoException).code?.includes("ECONNRESET")) reject(err);
    });
  });
}

describe("processing API", () => {
  let app: INestApplication;
  let queue: ReturnType<typeof fakeProcessingQueue>;
  let events: ReturnType<typeof fakeProcessingEvents>;
  let repository: ReturnType<typeof fakeProcessingRepository>;
  let baseUrl: string;

  beforeEach(async () => {
    vi.spyOn(Logger.prototype, "warn").mockImplementation(() => {});
    queue = fakeProcessingQueue();
    events = fakeProcessingEvents();
    repository = fakeProcessingRepository([
      track({ trackId: ids(1), status: "processing", progress: 1 }),
      track({ trackId: ids(2), status: "failed", progress: 3 }),
      track({ trackId: ids(3), status: "ready", progress: 5 }),
      track({ trackId: ids(4), userId: "user-2", status: "failed" }),
      track({ trackId: ids(5), status: "pending" }),
    ]);
    app = await createTestApp({
      providers: [
        { token: ProcessingQueue, value: queue },
        { token: ProcessingEvents, value: events },
        { token: ProcessingRepository, value: repository },
      ],
    });
    await app.listen(0);
    baseUrl = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    await app.close();
  });

  describe("GET /api/processing/events", () => {
    it("starts with the state of the user's unfinished tracks, then streams their live events", async () => {
      const received = readEvents(`${baseUrl}/api/processing/events`, 4);
      await vi.waitFor(() => expect(events.forUser).toHaveBeenCalledWith("user-1"));
      const live = (userId: string, n: number) => ({
        user_id: userId,
        event: { type: "ready" as const, track_id: ids(n), video_id: ids(9), title: "Ein Tag in Hamburg" },
      });
      await vi.waitFor(() => expect(repository.unfinishedTracks).toHaveBeenCalled());
      await new Promise((r) => setTimeout(r, 50));
      events.published.next(live("user-2", 4));
      events.published.next(live("user-1", 1));
      events.published.next(live("user-1", 5));

      const list = await received;
      expect(list.every((e) => e.type === "processing")).toBe(true);
      const parsed = list.map((e) => ProcessingEvent.parse(e.data));
      expect(parsed[0]).toMatchObject({ type: "step", track_id: ids(1), step: "normalise", step_index: 1 });
      expect(parsed[1]).toMatchObject({ type: "queued", track_id: ids(5) });
      expect(parsed.slice(2).map((e) => [e.type, e.track_id])).toEqual([
        ["ready", ids(1)],
        ["ready", ids(5)],
      ]);
    });

    it("answers 401 without a session", async () => {
      await request(app.getHttpServer()).get("/api/processing/events").expect(401);
    });
  });

  describe("POST /api/tracks/:trackId/retry", () => {
    const retry = (trackId: string) =>
      request(app.getHttpServer())
        .post(`/api/tracks/${trackId}/retry`)
        .set("Authorization", "Bearer valid-id-token");

    it("queues a failed track again and answers 202", async () => {
      const res = await retry(ids(2)).expect(202);
      expect(RetriedTrack.parse(res.body)).toEqual({ track_id: ids(2), status: "pending" });
      expect(repository.markPendingAgain).toHaveBeenCalledWith(ids(2));
      expect(queue.requeue).toHaveBeenCalledWith(ids(2));
    });

    it("answers 409 for a track that hasn't failed", async () => {
      const res = await retry(ids(3)).expect(409);
      expect(ApiError.parse(res.body).error).toContain("failed");
      expect(queue.requeue).not.toHaveBeenCalled();
    });

    it("answers 404 for another user's track and 400 for a bad id", async () => {
      await retry(ids(4)).expect(404);
      await retry("not-a-uuid").expect(400);
      expect(queue.requeue).not.toHaveBeenCalled();
    });

    it("answers 401 without a session", async () => {
      await request(app.getHttpServer()).post(`/api/tracks/${ids(2)}/retry`).expect(401);
    });
  });
});

describe("withCurrentState", () => {
  const event = (n: number): ProcessingEvent => ({
    type: "queued",
    track_id: ids(n),
    video_id: ids(9),
    title: "t",
  });

  it("keeps live events that arrive while the current state loads, after it", async () => {
    const live = new Subject<ProcessingEvent>();
    let finishLoad!: (events: ProcessingEvent[]) => void;
    const stream = withCurrentState(live, () => new Promise((resolve) => (finishLoad = resolve)));
    const collected = firstValueFrom(stream.pipe(take(3), toArray()));

    live.next(event(2));
    finishLoad([event(1)]);
    await Promise.resolve();
    live.next(event(3));

    expect((await collected).map((e) => e.track_id)).toEqual([ids(1), ids(2), ids(3)]);
  });

  it("passes on a failed load as an error", async () => {
    const stream = withCurrentState(new Subject<ProcessingEvent>(), () => Promise.reject(new Error("db down")));
    await expect(firstValueFrom(stream)).rejects.toThrow("db down");
  });
});
