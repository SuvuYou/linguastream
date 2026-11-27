import { db } from "@linguastream/db";
import { WordLookupRepository } from "./word-lookup.repository";

const repo = new WordLookupRepository();
const OTHER = "0190f3c2-7d1a-7c00-8a00-00000000dead";

let n = 0;
async function setup(nativeLanguage = "uk") {
  n++;
  const user = await db.user.create({
    data: { firebaseUid: `uid-${n}`, email: `learner-${n}@example.com`, nativeLanguage, learningLanguage: "de" },
  });
  const video = await db.video.create({
    data: { userId: user.id, youtubeVideoId: `yt-${n}`, title: "Ein Tag", durationMs: 1000, language: "de" },
  });
  const track = async (status: "ready" | "failed", createdAt: Date, text: string) => {
    const t = await db.track.create({
      data: {
        videoId: video.id,
        youtubeTrackId: "a.de",
        language: "de",
        isAutoCaptions: true,
        rawJson3: new Uint8Array([1]),
        contentHash: `hash-${n}-${status}`,
        processingVersion: 1,
        status,
        createdAt,
      },
    });
    const line = await db.line.create({
      data: {
        trackId: t.id,
        index: 0,
        startMs: 0,
        endMs: 900,
        text,
        rawText: text,
        words: [{ i: 0, text: "Hund", start_ms: 0, lemma: "Hund", pos: "NOUN" }],
      },
    });
    return { track: t, line };
  };
  return { user, video, track };
}

describe("WordLookupRepository (Postgres)", () => {
  it("reads the line of the newest ready track with its translation in the user's native language", async () => {
    const { user, video, track } = await setup();
    const { track: ready, line } = await track("ready", new Date("2026-11-01"), "Der Hund.");
    await track("failed", new Date("2026-11-02"), "Kaputt.");
    const uk = await db.trackTranslation.create({ data: { trackId: ready.id, language: "uk", status: "ready" } });
    const en = await db.trackTranslation.create({ data: { trackId: ready.id, language: "en", status: "ready" } });
    await db.lineTranslation.createMany({
      data: [
        { translationId: en.id, lineId: line.id, text: "The dog." },
        { translationId: uk.id, lineId: line.id, text: "Собака." },
      ],
    });

    expect(await repo.line(user.id, video.id, 0)).toEqual({
      language: "de",
      nativeLanguage: "uk",
      text: "Der Hund.",
      translation: "Собака.",
      words: [{ i: 0, text: "Hund", start_ms: 0, lemma: "Hund", pos: "NOUN" }],
    });
  });

  it("leaves out an unfinished translation and finds nothing for others, missing lines or no ready track", async () => {
    const { user, video, track } = await setup();
    const { track: ready, line } = await track("ready", new Date(), "Der Hund.");
    const uk = await db.trackTranslation.create({ data: { trackId: ready.id, language: "uk", status: "processing" } });
    await db.lineTranslation.create({ data: { translationId: uk.id, lineId: line.id, text: "Собака." } });

    expect((await repo.line(user.id, video.id, 0))?.translation).toBeNull();
    expect(await repo.line(OTHER, video.id, 0)).toBeNull();
    expect(await repo.line(user.id, video.id, 1)).toBeNull();

    const second = await setup();
    await second.track("failed", new Date(), "Kaputt.");
    expect(await repo.line(second.user.id, second.video.id, 0)).toBeNull();
  });
});
