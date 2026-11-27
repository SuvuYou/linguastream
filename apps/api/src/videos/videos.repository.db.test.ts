import { db } from "@linguastream/db";
import { VideosRepository } from "./videos.repository";

const repo = new VideosRepository();

let n = 0;
async function user(nativeLanguage = "uk") {
  n++;
  return db.user.create({
    data: { firebaseUid: `uid-${n}`, email: `learner-${n}@example.com`, nativeLanguage, learningLanguage: "de" },
  });
}

async function video(userId: string) {
  n++;
  return db.video.create({
    data: { userId, youtubeVideoId: `yt-${n}`, title: "Ein Tag in Hamburg", channelName: "Nordlicht Reisen", durationMs: 768_000, language: "de" },
  });
}

async function track(videoId: string, status: "pending" | "processing" | "ready" | "failed", createdAt: Date) {
  n++;
  return db.track.create({
    data: {
      videoId,
      youtubeTrackId: "a.de",
      language: "de",
      isAutoCaptions: true,
      rawJson3: new Uint8Array([1]),
      contentHash: `hash-${n}`,
      processingVersion: 1,
      status,
      createdAt,
    },
  });
}

async function lines(trackId: string, starts: number[]) {
  await db.line.createMany({
    data: starts.map((startMs, index) => ({
      trackId,
      index,
      startMs,
      endMs: startMs + 900,
      text: `Zeile ${index}`,
      rawText: `Zeile ${index}`,
      words: [],
    })),
  });
  return db.line.findMany({ where: { trackId }, orderBy: { index: "asc" } });
}

describe("VideosRepository (Postgres)", () => {
  it("returns the user's video with its newest ready track and line count", async () => {
    const u = await user();
    const v = await video(u.id);
    const ready = await track(v.id, "ready", new Date("2026-11-01"));
    await track(v.id, "failed", new Date("2026-11-02"));
    await lines(ready.id, [0, 1000, 2000]);

    const view = await repo.findVideo(u.id, v.id);
    expect(view).toEqual({
      trackId: ready.id,
      translationId: null,
      detail: {
        id: v.id,
        youtube_video_id: v.youtubeVideoId,
        title: "Ein Tag in Hamburg",
        channel_name: "Nordlicht Reisen",
        duration_ms: 768_000,
        language: "de",
        track: { id: ready.id, language: "de", is_auto_captions: true, status: "ready", line_count: 3 },
        translation_language: null,
      },
    });
  });

  it("falls back to the newest track when none is ready, and to none without tracks", async () => {
    const u = await user();
    const v = await video(u.id);
    expect((await repo.findVideo(u.id, v.id))!.detail.track).toBeNull();

    await track(v.id, "failed", new Date("2026-11-01"));
    const processing = await track(v.id, "processing", new Date("2026-11-02"));
    expect((await repo.findVideo(u.id, v.id))!.detail.track).toMatchObject({ id: processing.id, status: "processing" });
  });

  it("doesn't find another user's video", async () => {
    const owner = await user();
    const other = await user();
    const v = await video(owner.id);
    expect(await repo.findVideo(other.id, v.id)).toBeNull();
  });

  it("uses a ready translation in the user's native language only", async () => {
    const u = await user("uk");
    const v = await video(u.id);
    const t = await track(v.id, "ready", new Date());
    const [first, second] = await lines(t.id, [0, 1000]);
    const en = await db.trackTranslation.create({ data: { trackId: t.id, language: "en", status: "ready" } });
    await db.lineTranslation.create({ data: { translationId: en.id, lineId: first!.id, text: "Line 0" } });
    expect((await repo.findVideo(u.id, v.id))!.translationId).toBeNull();

    const uk = await db.trackTranslation.create({ data: { trackId: t.id, language: "uk", status: "processing" } });
    expect((await repo.findVideo(u.id, v.id))!.detail.translation_language).toBeNull();

    await db.trackTranslation.update({ where: { id: uk.id }, data: { status: "ready" } });
    await db.lineTranslation.create({ data: { translationId: uk.id, lineId: second!.id, text: "Рядок 1" } });
    const view = (await repo.findVideo(u.id, v.id))!;
    expect(view.detail.translation_language).toBe("uk");

    const window = await repo.linesInWindow(t.id, view.translationId, 0, 2000);
    expect(window.map((l) => l.translation)).toEqual([null, "Рядок 1"]);
  });

  it("returns the lines that start inside the window, in order", async () => {
    const u = await user();
    const v = await video(u.id);
    const t = await track(v.id, "ready", new Date());
    await lines(t.id, [0, 59_500, 60_000, 90_000, 120_000]);

    const window = await repo.linesInWindow(t.id, null, 60_000, 120_000);
    expect(window).toEqual([
      { index: 2, start_ms: 60_000, end_ms: 60_900, text: "Zeile 2", translation: null },
      { index: 3, start_ms: 90_000, end_ms: 90_900, text: "Zeile 3", translation: null },
    ]);
  });
});
