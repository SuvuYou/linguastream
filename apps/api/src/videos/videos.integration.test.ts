import type { INestApplication } from "@nestjs/common";
import { ApiError, LineWindow, VideoDetail } from "@linguastream/contracts";
import request from "supertest";
import { createTestApp } from "../test/auth-fakes";
import { VideosRepository, type VideoView } from "./videos.repository";

const VIDEO_ID = "0190f3c2-7d1a-7c00-8a00-000000000001";
const TRACK_ID = "0190f3c2-7d1a-7c00-8a00-000000000002";

const view = (track: boolean): VideoView => ({
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
  },
});

describe("videos API", () => {
  let app: INestApplication;
  let repo: { findVideo: ReturnType<typeof vi.fn>; linesInWindow: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    repo = {
      findVideo: vi.fn(async (userId: string, videoId: string) =>
        userId === "user-1" && videoId === VIDEO_ID ? view(true) : null,
      ),
      linesInWindow: vi.fn(async () => [{ index: 0, start_ms: 0, end_ms: 900, text: "Hallo", translation: null }]),
    };
    app = await createTestApp({ providers: [{ token: VideosRepository, value: repo }] });
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

  it("answers 401 without a session", async () => {
    await request(app.getHttpServer()).get(`/api/videos/${VIDEO_ID}`).expect(401);
    await request(app.getHttpServer()).get(`/api/videos/${VIDEO_ID}/lines?from_ms=0&to_ms=1000`).expect(401);
  });
});
