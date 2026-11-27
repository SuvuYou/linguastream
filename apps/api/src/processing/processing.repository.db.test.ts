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

  it("keeps one translation per language and fills its lines, resuming where it stopped", async () => {
    const track = await trackFor();
    await repo.replaceLines(track.id, [
      { index: 0, startMs: 0, endMs: 900, text: "Hallo zusammen" },
      { index: 1, startMs: 900, endMs: 1800, text: "und willkommen" },
    ]);
    expect(await repo.translationTarget(track.id)).toEqual({ sourceLanguage: "de", targetLanguage: "uk" });
    expect(await repo.translationTarget("0190f3c2-7d1a-7c00-8a00-000000000000")).toBeNull();

    const id = await repo.startTranslation(track.id, "uk");
    const lines = await repo.translationLines(track.id, id);
    expect(lines.map(({ index, text, translated }) => ({ index, text, translated }))).toEqual([
      { index: 0, text: "Hallo zusammen", translated: false },
      { index: 1, text: "und willkommen", translated: false },
    ]);

    await repo.saveLineTranslations(id, [{ lineId: lines[0]!.lineId, text: "Привіт усім" }]);
    await repo.saveLineTranslations(id, []);
    await repo.finishTranslation(id, {
      status: "failed",
      errorCode: "spend_cap",
      translatedLines: 1,
      chunks: 1,
      calls: 1,
      costMicroUsd: 10,
    });
    expect(await db.trackTranslation.findUniqueOrThrow({ where: { id } })).toMatchObject({
      language: "uk",
      status: "failed",
      errorCode: "spend_cap",
      progress: 1,
    });

    expect(await repo.startTranslation(track.id, "uk")).toBe(id);
    expect(await db.trackTranslation.findUniqueOrThrow({ where: { id } })).toMatchObject({
      status: "processing",
      errorCode: null,
    });
    expect((await repo.translationLines(track.id, id)).map((l) => l.translated)).toEqual([true, false]);

    await repo.saveLineTranslations(id, [
      { lineId: lines[0]!.lineId, text: "Привіт усім!" },
      { lineId: lines[1]!.lineId, text: "і ласкаво просимо" },
    ]);
    const saved = await db.lineTranslation.findMany({
      where: { translationId: id },
      include: { line: { select: { index: true } } },
      orderBy: { line: { index: "asc" } },
    });
    expect(saved.map((l) => l.text)).toEqual(["Привіт усім!", "і ласкаво просимо"]);

    const en = await repo.startTranslation(track.id, "en");
    expect(en).not.toBe(id);
    expect((await repo.translationLines(track.id, en)).map((l) => l.translated)).toEqual([false, false]);
  });

  it("finds open translations of ready tracks for the start-up sweep, and fails them", async () => {
    const ready = await trackFor(undefined, "ready");
    const processing = await trackFor(undefined, "processing");
    await db.trackTranslation.create({ data: { trackId: ready.id, language: "uk", status: "pending" } });
    await db.trackTranslation.create({ data: { trackId: ready.id, language: "en", status: "processing" } });
    await db.trackTranslation.create({ data: { trackId: processing.id, language: "uk", status: "pending" } });

    const ids = await repo.pendingTranslationTrackIds();
    expect(ids).toContain(ready.id);
    expect(ids.filter((id) => id === ready.id)).toHaveLength(1);
    expect(ids).not.toContain(processing.id);

    await repo.failOpenTranslations(ready.id);
    expect(
      (await db.trackTranslation.findMany({ where: { trackId: ready.id } })).map((t) => [t.status, t.errorCode]),
    ).toEqual([
      ["failed", "internal"],
      ["failed", "internal"],
    ]);
    expect(await repo.pendingTranslationTrackIds()).not.toContain(ready.id);
  });
});
