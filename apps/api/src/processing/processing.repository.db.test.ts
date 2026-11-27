import { db } from "@linguastream/db";
import { gzipSync } from "node:zlib";
import { ProcessingRepository } from "./processing.repository";

const repo = new ProcessingRepository();

let n = 0;
async function trackFor(userId?: string, status: "pending" | "processing" | "ready" | "failed" = "pending") {
  n++;
  const owner =
    userId ??
    (
      await db.user.create({
        data: { firebaseUid: `uid-${n}`, email: `learner-${n}@example.com`, nativeLanguage: "uk", learningLanguage: "de" },
      })
    ).id;
  const video = await db.video.create({
    data: { userId: owner, youtubeVideoId: `yt-${n}`, title: `Video ${n}`, language: "de" },
  });
  return db.track.create({
    data: {
      videoId: video.id,
      youtubeTrackId: "a.de",
      language: "de",
      isAutoCaptions: true,
      rawJson3: new Uint8Array(gzipSync('{"events":[]}')),
      contentHash: `hash-${n}`,
      processingVersion: 1,
      status,
    },
    include: { video: true },
  });
}

describe("ProcessingRepository (Postgres)", () => {
  it("finds a track with its owner and title", async () => {
    const track = await trackFor();
    expect(await repo.findTrack(track.id)).toEqual({
      trackId: track.id,
      videoId: track.videoId,
      userId: track.video.userId,
      title: track.video.title,
      status: "pending",
      progress: 0,
    });
    expect(await repo.findTrack("0190f3c2-7d1a-7c00-8a00-000000000000")).toBeNull();
  });

  it("only finds a user's own tracks", async () => {
    const mine = await trackFor();
    const theirs = await trackFor();
    expect(await repo.findUserTrack(mine.video.userId, mine.id)).not.toBeNull();
    expect(await repo.findUserTrack(mine.video.userId, theirs.id)).toBeNull();
  });

  it("lists a user's pending and processing tracks only", async () => {
    const pending = await trackFor();
    const userId = pending.video.userId;
    const processing = await trackFor(userId, "processing");
    await trackFor(userId, "ready");
    await trackFor(userId, "failed");
    await trackFor(undefined, "pending");

    expect((await repo.unfinishedTracks(userId)).map((t) => t.trackId)).toEqual([pending.id, processing.id]);
  });

  it("lists pending tracks of every user for the worker's start-up sweep", async () => {
    const a = await trackFor();
    const b = await trackFor();
    await trackFor(undefined, "ready");
    expect((await repo.pendingTrackIds()).sort()).toEqual([a.id, b.id].sort());
  });

  it("moves a track through processing, progress, ready, failed and back to pending", async () => {
    const track = await trackFor();
    await repo.markProcessing(track.id);
    await repo.completeStep(track.id, 2);
    await repo.markFailed(track.id, "internal");
    expect(await db.track.findUniqueOrThrow({ where: { id: track.id } })).toMatchObject({
      status: "failed",
      progress: 2,
      errorCode: "internal",
    });

    await repo.markPendingAgain(track.id);
    expect(await db.track.findUniqueOrThrow({ where: { id: track.id } })).toMatchObject({
      status: "pending",
      progress: 2,
      errorCode: null,
    });

    await repo.markReady(track.id);
    const ready = await db.track.findUniqueOrThrow({ where: { id: track.id } });
    expect(ready.status).toBe("ready");
    expect(ready.processedAt).toBeInstanceOf(Date);
  });

  it("replaces a track's lines, so a rerun doesn't duplicate them", async () => {
    const track = await trackFor();
    const lines = [
      { index: 0, startMs: 0, endMs: 1000, text: "Eins" },
      { index: 1, startMs: 1000, endMs: 2000, text: "Zwei" },
    ];
    await repo.replaceLines(track.id, lines);
    await repo.replaceLines(track.id, lines);

    const stored = await db.line.findMany({ where: { trackId: track.id }, orderBy: { index: "asc" } });
    expect(stored.map((l) => [l.index, l.startMs, l.endMs, l.text, l.rawText])).toEqual([
      [0, 0, 1000, "Eins", "Eins"],
      [1, 1000, 2000, "Zwei", "Zwei"],
    ]);
  });

  it("reads the stored raw track", async () => {
    const track = await trackFor();
    expect(Buffer.from(await repo.rawJson3(track.id))).toEqual(gzipSync('{"events":[]}'));
  });

  it("saves the normalised text and words of each line, and the edit list on the track", async () => {
    const track = await trackFor();
    await repo.replaceLines(track.id, [
      { index: 0, startMs: 0, endMs: 1000, text: "ich weiß nicht" },
      { index: 1, startMs: 1000, endMs: 2000, text: "ob das geht" },
    ]);
    const normalisation = {
      version: 1,
      punctuated: false,
      punctuation: { status: "done" as const, chunks: 1, rejected: 0, failed: 0, salvagedEdits: 0 },
      join_rule: "off" as const,
      edits: [{ i: 0, casing: "Ich" }, { i: 2, after: "," }, { i: 5, after: ".", sentenceEnd: true }],
      sentence_ends: [5],
    };
    await repo.saveNormalisation(
      track.id,
      [
        { index: 0, text: "Ich weiß nicht,", words: [{ i: 0, text: "Ich", start_ms: 0 }] },
        { index: 1, text: "ob das geht.", words: [{ i: 5, text: "geht.", start_ms: 1500, sentence_end: true }] },
      ],
      normalisation,
    );

    const lines = await db.line.findMany({ where: { trackId: track.id }, orderBy: { index: "asc" } });
    expect(lines.map((l) => [l.text, l.rawText])).toEqual([
      ["Ich weiß nicht,", "ich weiß nicht"],
      ["ob das geht.", "ob das geht"],
    ]);
    expect(lines[1]!.words).toEqual([{ i: 5, text: "geht.", start_ms: 1500, sentence_end: true }]);
    expect((await db.track.findUniqueOrThrow({ where: { id: track.id } })).normalisation).toEqual(normalisation);
  });

  it("reads each line's words and saves the analysed words and lemma arrays", async () => {
    const track = await trackFor();
    await repo.replaceLines(track.id, [
      { index: 0, startMs: 0, endMs: 1000, text: "Ich fange" },
      { index: 1, startMs: 1000, endMs: 2000, text: "an." },
    ]);
    const words = [
      { index: 0, text: "Ich fange", words: [{ i: 0, text: "Ich", start_ms: 0 }, { i: 1, text: "fange", start_ms: 300 }] },
      { index: 1, text: "an.", words: [{ i: 2, text: "an.", start_ms: 1000, sentence_end: true as const }] },
    ];
    await repo.saveNormalisation(track.id, words, {
      version: 1,
      punctuated: true,
      punctuation: "not_needed",
      join_rule: "off",
      edits: [],
      sentence_ends: [2],
    });
    expect((await repo.lineWords(track.id)).map((l) => l.words.map((w) => w.text))).toEqual([["Ich", "fange"], ["an."]]);

    await repo.saveAnalysis(track.id, [
      { index: 0, words: [{ i: 0, text: "Ich", start_ms: 0, lemma: "ich", pos: "PRON" }, { i: 1, text: "fange", start_ms: 300, lemma: "anfangen", pos: "VERB" }], lemmas: ["ich", "anfangen"] },
      { index: 1, words: [{ i: 2, text: "an.", start_ms: 1000, lemma: "anfangen", pos: "ADP", particle_of: 1 }], lemmas: ["anfangen"] },
    ]);

    const lines = await db.line.findMany({ where: { trackId: track.id }, orderBy: { index: "asc" } });
    expect(lines.map((l) => l.lemmas)).toEqual([["ich", "anfangen"], ["anfangen"]]);
    expect(lines[1]!.words).toEqual([{ i: 2, text: "an.", start_ms: 1000, lemma: "anfangen", pos: "ADP", particle_of: 1 }]);
    expect(
      (await db.line.findMany({ where: { trackId: track.id, lemmas: { has: "anfangen" } } })).map((l) => l.index),
    ).toEqual([0, 1]);
  });
});
