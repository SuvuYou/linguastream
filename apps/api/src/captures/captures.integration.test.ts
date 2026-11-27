import { Logger, type INestApplication } from "@nestjs/common";
import { ApiError, CaptureCreated, CaptureLookup } from "@linguastream/contracts";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import request from "supertest";
import { ProcessingQueue } from "../processing/processing-queue";
import { createTestApp, decodedToken, fakeFirebaseAuth, fakeProcessingQueue } from "../test/auth-fakes";
import { CapturesRepository, type NewCapture, type StoredTrack, type TrackKey } from "./captures.repository";
import { MIN_EXTENSION_VERSION } from "./extension-version";

const RAW = JSON.stringify({ events: [{ tStartMs: 0, segs: [{ utf8: "Das Haus ist groß" }] }] });
const HASH = createHash("sha256").update(RAW).digest("hex");

function fakeRepository() {
  const rows: (NewCapture & StoredTrack)[] = [];
  const blocked = new Set<string>();
  const same = (row: TrackKey, key: TrackKey) =>
    row.userId === key.userId &&
    row.youtubeVideoId === key.youtubeVideoId &&
    row.youtubeTrackId === key.youtubeTrackId &&
    row.contentHash === key.contentHash &&
    row.processingVersion === key.processingVersion;

  return {
    rows,
    blocked,
    isBlocked: vi.fn(async (id: string) => blocked.has(id)),
    findTrack: vi.fn(async (key: TrackKey): Promise<StoredTrack | null> => {
      const row = rows.find((r) => same(r, key));
      return row ? { videoId: row.videoId, trackId: row.trackId, status: row.status } : null;
    }),
    create: vi.fn(async (capture: NewCapture) => {
      const row = { ...capture, videoId: `video-${capture.userId}-${capture.youtubeVideoId}`, trackId: `track-${rows.length + 1}`, status: "pending" as const };
      rows.push(row);
      return { track: { videoId: row.videoId, trackId: row.trackId, status: row.status }, created: true };
    }),
  };
}

const capture = (fields: { video?: object; track?: object } = {}) => ({
  video: { youtube_video_id: "4Ja5iJtYOPw", title: "Ein Tag in Hamburg", ...fields.video },
  track: { language: "de", kind: "asr", raw_json3: RAW, ...fields.track },
});

describe("captures API", () => {
  let app: INestApplication;
  let repo: ReturnType<typeof fakeRepository>;
  let queue: ReturnType<typeof fakeProcessingQueue>;
  let logs: string;

  beforeEach(async () => {
    repo = fakeRepository();
    queue = fakeProcessingQueue();
    const auth = fakeFirebaseAuth("firebase-uid-1");
    auth.verifyIdToken.mockImplementation(async (token: string) => {
      if (token === "token-1") return decodedToken("firebase-uid-1");
      if (token === "token-2") return decodedToken("firebase-uid-2");
      throw new Error("invalid");
    });
    logs = "";
    for (const level of ["log", "warn", "error", "debug", "verbose"] as const) {
      vi.spyOn(Logger.prototype, level).mockImplementation((...args: unknown[]) => {
        logs += JSON.stringify(args);
      });
    }
    app = await createTestApp({
      auth,
      users: { "firebase-uid-1": "user-1", "firebase-uid-2": "user-2" },
      providers: [
        { token: CapturesRepository, value: repo },
        { token: MIN_EXTENSION_VERSION, value: "0.2.0" },
        { token: ProcessingQueue, value: queue },
      ],
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await app.close();
  });

  const post = (body: unknown, token = "token-1", version = "0.2.0") =>
    request(app.getHttpServer())
      .post("/api/captures")
      .set("Authorization", `Bearer ${token}`)
      .set("X-Extension-Version", version)
      .send(body as object);

  const lookup = (query: Record<string, string>, token = "token-1", version = "0.2.0") =>
    request(app.getHttpServer())
      .get("/api/captures/lookup")
      .set("Authorization", `Bearer ${token}`)
      .set("X-Extension-Version", version)
      .query(query);

  const lookupQuery = { youtube_video_id: "4Ja5iJtYOPw", youtube_track_id: "a.de", hash: HASH };

  describe("POST /api/captures", () => {
    it("stores a new capture gzipped, hashed on the server, pending", async () => {
      const res = await post(capture()).expect(201);
      expect(CaptureCreated.parse(res.body)).toEqual({
        video_id: "video-user-1-4Ja5iJtYOPw",
        track_id: "track-1",
        status: "pending",
      });

      const [row] = repo.rows;
      expect(row).toMatchObject({
        userId: "user-1",
        youtubeVideoId: "4Ja5iJtYOPw",
        youtubeTrackId: "a.de",
        language: "de",
        isAutoCaptions: true,
        contentHash: HASH,
        processingVersion: 1,
        title: "Ein Tag in Hamburg",
      });
      expect(gunzipSync(row!.rawJson3).toString()).toBe(RAW);
    });

    it("queues a new capture for processing, once", async () => {
      await post(capture()).expect(201);
      await post(capture()).expect(200);
      expect(queue.enqueue.mock.calls).toEqual([["track-1"]]);
    });

    it("still stores the capture when the queue is down", async () => {
      queue.enqueue.mockRejectedValueOnce(Object.assign(new Error("Connection is closed."), { name: "MaxRetriesError" }));
      const res = await post(capture()).expect(201);
      expect(CaptureCreated.parse(res.body).status).toBe("pending");
      expect(logs).toContain("stays pending");
      expect(logs).not.toContain("Das Haus");
    });

    it("uses the uploaded track's id for uploaded captions", async () => {
      await post(capture({ track: { kind: "manual" } })).expect(201);
      expect(repo.rows[0]!.youtubeTrackId).toBe(".de");
      expect(repo.rows[0]!.isAutoCaptions).toBe(false);
    });

    it("treats the same capture again as the same job", async () => {
      const first = await post(capture()).expect(201);
      const second = await post(capture()).expect(200);
      expect(second.body).toEqual(first.body);
      expect(repo.rows).toHaveLength(1);
    });

    it("keeps each user's captures apart", async () => {
      await post(capture()).expect(201);
      const other = await post(capture(), "token-2").expect(201);
      expect(other.body.video_id).toBe("video-user-2-4Ja5iJtYOPw");
      expect(repo.rows).toHaveLength(2);
    });

    it("answers 426 to an old extension or none", async () => {
      const res = await post(capture(), "token-1", "0.1.9").expect(426);
      expect(ApiError.parse(res.body).error).toMatch(/update the extension/i);
      await request(app.getHttpServer()).post("/api/captures").set("Authorization", "Bearer token-1").send(capture()).expect(426);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it("answers 451 to a blocked video and stores nothing", async () => {
      repo.blocked.add("4Ja5iJtYOPw");
      const res = await post(capture()).expect(451);
      expect(ApiError.parse(res.body).error).toBeTruthy();
      expect(repo.create).not.toHaveBeenCalled();
    });

    it("answers 422 when the video forbids embedding", async () => {
      await post(capture({ video: { playable_in_embed: false } })).expect(422);
      await post(capture({ video: { playable_in_embed: true } })).expect(201);
    });

    it("answers 400 to a track that isn't json3, and to a bad body", async () => {
      const res = await post(capture({ track: { raw_json3: "<transcript/>" } })).expect(400);
      expect(ApiError.parse(res.body).error).toContain("json3");
      await post(capture({ track: { kind: "translated" } })).expect(400);
      await post({ video: {} }).expect(400);
    });

    it("accepts a large track and refuses one over the size limit", async () => {
      vi.stubEnv("TRANSFER_CHARS_PER_DAY", String(10_000_000));
      const segs = Array.from({ length: 20_000 }, (_, i) => ({ tStartMs: i, segs: [{ utf8: "Wort ".repeat(10) }] }));
      const big = JSON.stringify({ events: segs });
      expect(big.length).toBeGreaterThan(1024 * 1024);
      await post(capture({ track: { raw_json3: big } })).expect(201);

      const huge = "x".repeat(9 * 1024 * 1024);
      await post(capture({ track: { raw_json3: huge } })).expect(413);
      vi.unstubAllEnvs();
    });

    describe("daily transfer quota", () => {
      const track = (characters: number) =>
        JSON.stringify({ events: [{ tStartMs: 0, dDurationMs: 1000, segs: [{ utf8: "a".repeat(characters) }] }] });

      afterEach(() => vi.unstubAllEnvs());

      it("counts the caption text and refuses a capture over the day's limit", async () => {
        vi.stubEnv("TRANSFER_CHARS_PER_DAY", "2000");
        await post(capture({ track: { raw_json3: track(1500) } })).expect(201);

        const res = await post(capture({ video: { youtube_video_id: "abcdefghijk" }, track: { raw_json3: track(600) } })).expect(429);
        expect(ApiError.parse(res.body).error).toMatch(/Daily transfer limit reached\. About 0 minutes/);
        expect(repo.rows).toHaveLength(1);
        expect(queue.enqueue).toHaveBeenCalledTimes(1);
      });

      it("doesn't count sending the same track again", async () => {
        vi.stubEnv("TRANSFER_CHARS_PER_DAY", "2000");
        await post(capture({ track: { raw_json3: track(1500) } })).expect(201);
        await post(capture({ track: { raw_json3: track(1500) } })).expect(200);
        await post(capture({ video: { youtube_video_id: "abcdefghijk" }, track: { raw_json3: track(400) } })).expect(201);
      });

      it("gives the characters back when storing fails", async () => {
        vi.stubEnv("TRANSFER_CHARS_PER_DAY", "2000");
        repo.create.mockRejectedValueOnce(new Error("db down"));
        await post(capture({ track: { raw_json3: track(1500) } })).expect(500);
        await post(capture({ track: { raw_json3: track(1500) } })).expect(201);
      });
    });

    it("answers 401 without auth", async () => {
      await request(app.getHttpServer()).post("/api/captures").set("X-Extension-Version", "0.2.0").send(capture()).expect(401);
    });

    it("allows 10 captures a minute per user", async () => {
      for (let i = 0; i < 10; i++) await post(capture()).expect((r) => expect([200, 201]).toContain(r.status));
      await post(capture()).expect(429);
    });

    it("never logs the track or the title", async () => {
      await post(capture({ track: { raw_json3: "not json" } })).expect(400);
      await post(capture()).expect(201);
      expect(logs).not.toContain("Haus");
      expect(logs).not.toContain("Hamburg");
    });
  });

  describe("GET /api/captures/lookup", () => {
    it("says new, then exists for the same user", async () => {
      expect(CaptureLookup.parse((await lookup(lookupQuery).expect(200)).body)).toEqual({ status: "new" });
      await post(capture()).expect(201);
      expect((await lookup(lookupQuery).expect(200)).body).toEqual({
        status: "exists",
        video_id: "video-user-1-4Ja5iJtYOPw",
      });
    });

    it("never finds another user's track", async () => {
      await post(capture()).expect(201);
      expect((await lookup(lookupQuery, "token-2").expect(200)).body).toEqual({ status: "new" });
    });

    it("says blocked for a blocked video", async () => {
      repo.blocked.add("4Ja5iJtYOPw");
      expect((await lookup(lookupQuery).expect(200)).body).toEqual({ status: "blocked" });
    });

    it("answers 426 to an old extension and 400 to a bad hash", async () => {
      await lookup(lookupQuery, "token-1", "0.0.1").expect(426);
      await lookup({ ...lookupQuery, hash: "abc" }).expect(400);
    });
  });
});
