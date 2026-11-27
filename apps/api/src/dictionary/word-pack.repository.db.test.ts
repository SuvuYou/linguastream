import { db } from "@linguastream/db";
import { WordPackRepository } from "./word-pack.repository";

const repo = new WordPackRepository();

async function setup() {
  const user = await db.user.create({
    data: { firebaseUid: "uid-1", email: "learner@example.com", nativeLanguage: "uk", learningLanguage: "de" },
  });
  const video = await db.video.create({
    data: { userId: user.id, youtubeVideoId: "yt-1", title: "Ein Tag", durationMs: 1000, language: "de" },
  });
  const track = await db.track.create({
    data: {
      videoId: video.id,
      youtubeTrackId: "a.de",
      language: "de",
      isAutoCaptions: true,
      rawJson3: new Uint8Array([1]),
      contentHash: "hash-1",
      processingVersion: 1,
      status: "ready",
    },
  });
  return { user, video, track };
}

describe("WordPackRepository (Postgres)", () => {
  it("finds the video only for its owner, with the owner's native language", async () => {
    const { user, video, track } = await setup();
    const target = { videoId: video.id, language: "de", nativeLanguage: "uk" };
    expect(await repo.videoForUser(user.id, video.id)).toEqual(target);
    expect(await repo.videoForUser("0190f3c2-7d1a-7c00-8a00-00000000dead", video.id)).toBeNull();
    expect(await repo.trackTarget(track.id)).toEqual(target);
    expect(await repo.trackTarget("0190f3c2-7d1a-7c00-8a00-00000000dead")).toBeNull();
  });

  it("lists lemma counts, most frequent first", async () => {
    const { video } = await setup();
    await db.videoLemmaCount.createMany({
      data: [
        { videoId: video.id, lemma: "gehen", count: 2 },
        { videoId: video.id, lemma: "Hund", count: 5 },
      ],
    });
    expect(await repo.lemmaCounts(video.id)).toEqual([
      { lemma: "Hund", count: 5 },
      { lemma: "gehen", count: 2 },
    ]);
  });

  it("takes the first line that contains each lemma as its example", async () => {
    const { track } = await setup();
    const line = (index: number, text: string, lemmas: string[]) => ({
      trackId: track.id,
      index,
      startMs: index * 1000,
      endMs: index * 1000 + 900,
      text,
      rawText: text,
      words: [],
      lemmas,
    });
    await db.line.createMany({
      data: [line(1, "Der Hund geht.", ["Hund", "gehen"]), line(0, "Wir gehen.", ["wir", "gehen"]), line(2, "Hallo.", ["hallo"])],
    });
    expect(await repo.examples(track.id, ["gehen", "Hund", "Katze"])).toEqual(
      new Map([
        ["gehen", "Wir gehen."],
        ["Hund", "Der Hund geht."],
      ]),
    );
    expect(await repo.examples(track.id, [])).toEqual(new Map());
  });
});
