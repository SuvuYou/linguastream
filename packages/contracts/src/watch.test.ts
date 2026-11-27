import { describe, expect, it } from "vitest";
import {
  Line,
  MAX_LINE_WINDOW_MS,
  TranslationRequested,
  VideoDeleted,
  VideoDetail,
  deleteVideoRoute,
  getLineWindowRoute,
  getVideoRoute,
  translateVideoRoute,
} from "./watch.js";

const video = {
  id: "0190f3c2-7d1a-7c00-8a00-000000000001",
  youtube_video_id: "abc123",
  title: "Ein Tag in Hamburg",
  channel_name: "Nordlicht Reisen",
  duration_ms: 768_000,
  language: "de",
  track: { id: "t1", language: "de", is_auto_captions: true, status: "ready", line_count: 212 },
  translation_language: "en",
  translation: { language: "en", status: "ready", error_code: null, progress: null },
};

describe("watch contracts", () => {
  it("are GET routes under /api/videos", () => {
    expect([getVideoRoute.method, getVideoRoute.path]).toEqual(["GET", "/api/videos/:videoId"]);
    expect([getLineWindowRoute.method, getLineWindowRoute.path]).toEqual(["GET", "/api/videos/:videoId/lines"]);
  });

  it("accept a video with or without a track and translation", () => {
    expect(VideoDetail.parse(video)).toEqual(video);
    expect(VideoDetail.safeParse({ ...video, track: null, translation_language: null }).success).toBe(true);
    expect(VideoDetail.safeParse({ ...video, track: { ...video.track, status: "done" } }).success).toBe(false);
    expect(VideoDetail.safeParse({ ...video, translation: null }).success).toBe(true);
    const translation = { language: "uk", status: "none", error_code: null, progress: null };
    expect(VideoDetail.safeParse({ ...video, translation }).success).toBe(true);
    expect(
      VideoDetail.safeParse({
        ...video,
        translation: { ...translation, status: "failed", error_code: "provider_unavailable", progress: { done: 40, total: 812 } },
      }).success,
    ).toBe(true);
    expect(VideoDetail.safeParse({ ...video, translation: { ...translation, status: "done" } }).success).toBe(false);
    expect(VideoDetail.safeParse({ ...video, translation: { ...translation, error_code: "oops" } }).success).toBe(false);
  });

  it("translate and delete a video by its id", () => {
    expect([translateVideoRoute.method, translateVideoRoute.path]).toEqual(["POST", "/api/videos/:videoId/translation"]);
    expect([deleteVideoRoute.method, deleteVideoRoute.path]).toEqual(["DELETE", "/api/videos/:videoId"]);
    expect(TranslationRequested.safeParse({ video_id: video.id, translation: { language: "uk", status: "pending" } }).success).toBe(true);
    expect(TranslationRequested.safeParse({ video_id: video.id, translation: { language: "uk", status: "ready" } }).success).toBe(false);
    expect(VideoDeleted.parse({ video_id: video.id, deleted: true })).toEqual({ video_id: video.id, deleted: true });
    expect(deleteVideoRoute.params!.safeParse({ videoId: "x" }).success).toBe(false);
  });

  it("need a uuid video id", () => {
    expect(getVideoRoute.params!.safeParse({ videoId: video.id }).success).toBe(true);
    expect(getVideoRoute.params!.safeParse({ videoId: "123" }).success).toBe(false);
  });

  it("cap a line window at ten minutes", () => {
    const query = getLineWindowRoute.query!;
    expect(query.parse({ from_ms: "0", to_ms: String(MAX_LINE_WINDOW_MS) })).toEqual({ from_ms: 0, to_ms: MAX_LINE_WINDOW_MS });
    expect(query.safeParse({ from_ms: 0, to_ms: MAX_LINE_WINDOW_MS + 1 }).success).toBe(false);
    expect(query.safeParse({ from_ms: 5000, to_ms: 5000 }).success).toBe(false);
  });

  it("carry each line's words with their lemma", () => {
    const line = {
      index: 0,
      start_ms: 0,
      end_ms: 900,
      text: "Der Hund, 2026!",
      translation: null,
      words: [
        { i: 0, text: "Der", lemma: "der" },
        { i: 1, text: "Hund,", lemma: "Hund" },
        { i: 2, text: "2026!", lemma: null },
      ],
    };
    expect(Line.parse(line)).toEqual(line);
    expect(Line.safeParse({ ...line, words: undefined }).success).toBe(false);
  });
});
