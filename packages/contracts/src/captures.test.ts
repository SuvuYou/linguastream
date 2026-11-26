import { describe, expect, it } from "vitest";
import { createCaptureRoute, lookupCaptureRoute, MAX_TRACK_CHARS, youtubeTrackId } from "./captures.js";

const body = createCaptureRoute.body!;
const valid = {
  video: { youtube_video_id: "4Ja5iJtYOPw", title: "Ein Tag in Hamburg" },
  track: { language: "de", kind: "asr", raw_json3: '{"events":[]}' },
};

describe("youtubeTrackId", () => {
  it("uses YouTube's vssId form", () => {
    expect(youtubeTrackId("de", "manual")).toBe(".de");
    expect(youtubeTrackId("de", "asr")).toBe("a.de");
  });
});

describe("createCaptureRoute", () => {
  it("is POST /api/captures and accepts a capture", () => {
    expect([createCaptureRoute.method, createCaptureRoute.path]).toEqual(["POST", "/api/captures"]);
    expect(body.safeParse(valid).success).toBe(true);
  });

  it("caps the track and the title", () => {
    expect(body.safeParse({ ...valid, track: { ...valid.track, raw_json3: "x".repeat(MAX_TRACK_CHARS + 1) } }).success).toBe(false);
    expect(body.safeParse({ ...valid, video: { ...valid.video, title: "x".repeat(301) } }).success).toBe(false);
  });

  it("rejects an unknown track kind", () => {
    expect(body.safeParse({ ...valid, track: { ...valid.track, kind: "translated" } }).success).toBe(false);
  });
});

describe("lookupCaptureRoute", () => {
  it("needs a SHA-256 hex hash", () => {
    const query = lookupCaptureRoute.query!;
    const q = { youtube_video_id: "abc", youtube_track_id: "a.de" };
    expect(query.safeParse({ ...q, hash: "a".repeat(64) }).success).toBe(true);
    expect(query.safeParse({ ...q, hash: "A".repeat(64) }).success).toBe(false);
    expect(query.safeParse({ ...q, hash: "abc" }).success).toBe(false);
  });
});
