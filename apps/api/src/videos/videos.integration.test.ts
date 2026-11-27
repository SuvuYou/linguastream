import type { INestApplication } from "@nestjs/common";
import {
  ApiError,
  LibraryPage,
  LineWindow,
  TranslationRequested,
  VideoDeleted,
  VideoDetail,
  type VideoTranslation,
} from "@linguastream/contracts";
import request from "supertest";
import { ProcessingQueue } from "../processing/processing-queue";
import { TEST_WEB_ORIGIN, createTestApp, fakeProcessingQueue } from "../test/auth-fakes";
import { VideosRepository, type VideoView } from "./videos.repository";

const VIDEO_ID = "0190f3c2-7d1a-7c00-8a00-000000000001";
const TRACK_ID = "0190f3c2-7d1a-7c00-8a00-000000000002";

const view = (track: boolean, translation: VideoTranslation = null): VideoView => ({
  trackId: track ? TRACK_ID : null,
  translationId: null,
  detail: {
    id: VIDEO_ID,
    youtube_video_id: "4Ja5iJtYOPw",
    title: "Ein Tag in Hamburg",
    channel_name: null,
    duration_ms: 768_000,
    language: "de",
    track: track ? { id: TRACK_ID, language: "de", is_auto_captions: true, status: "ready", line_count: 1 } : null,
    translation_language: null,
    translation,
  },
});

describe("videos API", () => {
  let app: INestApplication;
  let repo: {
    findVideo: ReturnType<typeof vi.fn>;
    linesInWindow: ReturnType<typeof vi.fn>;
    listVideos: ReturnType<typeof vi.fn>;
    markTranslationPending: ReturnType<typeof vi.fn>;
    deleteVideo: ReturnType<typeof vi.fn>;
  };
  let queue: ReturnType<typeof fakeProcessingQueue>;

  beforeEach(async () => {
    repo = {
      findVideo: vi.fn(async (userId: string, videoId: string) =>
        userId === "user-1" && videoId === VIDEO_ID ? view(true) : null,
      ),
      linesInWindow: vi.fn(async () => [{ index: 0, start_ms: 0, end_ms: 900, text: "Hallo", translation: null }]),
      listVideos: vi.fn(async (_userId: string, page: number) => ({
        items: [
          {
            id: VIDEO_ID,
            youtube_video_id: "4Ja5iJtYOPw",
            title: "Ein Tag in Hamburg",
            channel_name: null,
            duration_ms: 768_000,
            added_at: "2026-11-27T01:00:00.000Z",
            track: { id: TRACK_ID, status: "failed", progress: 1, error_code: "internal" },
            translation: null,
          },
        ],
        page,
        page_size: 24,
        total: 1,
      })),
      markTranslationPending: vi.fn(async () => {}),
      deleteVideo: vi.fn(async (userId: string, videoId: string) => userId === "user-1" && videoId === VIDEO_ID),
    };
    queue = fakeProcessingQueue();
    app = await createTestApp({
      providers: [
        { token: VideosRepository, value: repo },
        { token: ProcessingQueue, value: queue },
      ],
    });
  });

  afterEach(async () => {
    await app.close();
  });

  const get = (path: string) =>
    request(app.getHttpServer()).get(path).set("Authorization", "Bearer valid-id-token");

  it("returns the user's video", async () => {
    const res = await get(`/api/videos/${VIDEO_ID}`).expect(200);
    expect(VideoDetail.parse(res.body)).toEqual(view(true).detail);
    expect(repo.findVideo).toHaveBeenCalledWith("user-1", VIDEO_ID);
  });

  it("returns a window of lines for the video's track", async () => {
    const res = await get(`/api/videos/${VIDEO_ID}/lines?from_ms=0&to_ms=300000`).expect(200);
    expect(LineWindow.parse(res.body)).toEqual({
      from_ms: 0,
      to_ms: 300000,
      lines: [{ index: 0, start_ms: 0, end_ms: 900, text: "Hallo", translation: null }],
    });
    expect(repo.linesInWindow).toHaveBeenCalledWith(TRACK_ID, null, 0, 300000);
  });

  it("returns no lines when the video has no track yet", async () => {
    repo.findVideo.mockResolvedValueOnce(view(false));
    const res = await get(`/api/videos/${VIDEO_ID}/lines?from_ms=0&to_ms=1000`).expect(200);
    expect(res.body.lines).toEqual([]);
    expect(repo.linesInWindow).not.toHaveBeenCalled();
  });

  it("answers 404 for a video that isn't the user's", async () => {
    const other = "0190f3c2-7d1a-7c00-8a00-00000000dead";
    expect(ApiError.parse((await get(`/api/videos/${other}`).expect(404)).body).error).toBe("Video not found");
    await get(`/api/videos/${other}/lines?from_ms=0&to_ms=1000`).expect(404);
  });

  it("answers 400 for a bad id or window", async () => {
    await get("/api/videos/not-a-uuid").expect(400);
    await get(`/api/videos/${VIDEO_ID}/lines?from_ms=0`).expect(400);
    await get(`/api/videos/${VIDEO_ID}/lines?from_ms=1000&to_ms=1000`).expect(400);
    await get(`/api/videos/${VIDEO_ID}/lines?from_ms=0&to_ms=600001`).expect(400);
    expect(repo.linesInWindow).not.toHaveBeenCalled();
  });

  it("lists the user's videos, a page at a time", async () => {
    const res = await get("/api/videos").expect(200);
    expect(LibraryPage.parse(res.body).items[0]!.track).toEqual({
      id: TRACK_ID,
      status: "failed",
      progress: 1,
      error_code: "internal",
    });
    expect(repo.listVideos).toHaveBeenCalledWith("user-1", 0, undefined);

    await get("/api/videos?page=2&q=%20Hamburg%20").expect(200);
    expect(repo.listVideos).toHaveBeenLastCalledWith("user-1", 2, "Hamburg");
  });

  it("answers 400 for a bad page or search", async () => {
    await get("/api/videos?page=-1").expect(400);
    await get(`/api/videos?q=${"a".repeat(101)}`).expect(400);
    expect(repo.listVideos).not.toHaveBeenCalled();
  });

  it("answers 401 without a session", async () => {
    await request(app.getHttpServer()).get("/api/videos").expect(401);
    await request(app.getHttpServer()).get(`/api/videos/${VIDEO_ID}`).expect(401);
    await request(app.getHttpServer()).get(`/api/videos/${VIDEO_ID}/lines?from_ms=0&to_ms=1000`).expect(401);
  });

  const post = (path: string) =>
    request(app.getHttpServer()).post(path).set("Cookie", "session=valid-session-cookie").set("Origin", TEST_WEB_ORIGIN);
  const del = (path: string) =>
    request(app.getHttpServer()).delete(path).set("Cookie", "session=valid-session-cookie").set("Origin", TEST_WEB_ORIGIN);

  describe("POST /api/videos/:videoId/translation", () => {
    it("marks the translation pending and queues it", async () => {
      repo.findVideo.mockResolvedValue(view(true, { language: "uk", status: "failed" }));
      const res = await post(`/api/videos/${VIDEO_ID}/translation`).expect(202);
      expect(TranslationRequested.parse(res.body)).toEqual({
        video_id: VIDEO_ID,
        translation: { language: "uk", status: "pending" },
      });
      expect(repo.markTranslationPending).toHaveBeenCalledWith(TRACK_ID, "uk");
      expect(queue.enqueueTranslation).toHaveBeenCalledWith(TRACK_ID);
    });

    it("answers 409 when the video isn't ready, needs no translation, or is translated", async () => {
      for (const v of [view(false), view(true, null), view(true, { language: "uk", status: "ready" })]) {
        repo.findVideo.mockResolvedValueOnce(v);
        const res = await post(`/api/videos/${VIDEO_ID}/translation`).expect(409);
        expect(ApiError.parse(res.body).error).toBeTruthy();
      }
      expect(queue.enqueueTranslation).not.toHaveBeenCalled();
    });

    it("answers 404 for another user's video and 403 from another origin", async () => {
      repo.findVideo.mockResolvedValue(null);
      await post(`/api/videos/${VIDEO_ID}/translation`).expect(404);
      await request(app.getHttpServer())
        .post(`/api/videos/${VIDEO_ID}/translation`)
        .set("Cookie", "session=valid-session-cookie")
        .set("Origin", "https://evil.example")
        .expect(403);
    });
  });

  describe("DELETE /api/videos/:videoId", () => {
    it("deletes the user's own video", async () => {
      const res = await del(`/api/videos/${VIDEO_ID}`).expect(200);
      expect(VideoDeleted.parse(res.body)).toEqual({ video_id: VIDEO_ID, deleted: true });
      expect(repo.deleteVideo).toHaveBeenCalledWith("user-1", VIDEO_ID);
    });

    it("answers 404 when nothing was deleted and 400 for a bad id", async () => {
      await del("/api/videos/0190f3c2-7d1a-7c00-8a00-00000000ffff").expect(404);
      await del("/api/videos/nope").expect(400);
    });
  });
});
