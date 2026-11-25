// One test per row of the delete-rules table in docs/changes/006-data-model/spec.md.
import { describe, expect, it } from "vitest";
import { db } from "../src/client.js";
import { createFullSetup, createTrack, createWord, createConnection } from "./helpers/factories.js";

async function counts() {
  return {
    users: await db.user.count(),
    videos: await db.video.count(),
    tracks: await db.track.count(),
    lines: await db.line.count(),
    trackTranslations: await db.trackTranslation.count(),
    lineTranslations: await db.lineTranslation.count(),
    lemmaCounts: await db.videoLemmaCount.count(),
    words: await db.vocabularyWord.count(),
    connections: await db.connection.count(),
    cards: await db.card.count(),
    reviewLogs: await db.reviewLog.count(),
    decks: await db.deck.count(),
    deckWords: await db.deckWord.count(),
  };
}

describe("deleting an account", () => {
  it("deletes everything the user owns", async () => {
    const { user } = await createFullSetup();

    await db.user.delete({ where: { id: user.id } });

    expect(Object.values(await counts()).every((n) => n === 0)).toBe(true);
  });

  it("leaves other users' data alone", async () => {
    const first = await createFullSetup();
    await createFullSetup();

    await db.user.delete({ where: { id: first.user.id } });

    expect(await db.user.count()).toBe(1);
    expect(await db.connection.count()).toBe(1);
  });
});

describe("deleting a video", () => {
  it("deletes its tracks, lines, translations and lemma counts", async () => {
    const { video } = await createFullSetup();

    await db.video.delete({ where: { id: video.id } });

    expect(await counts()).toMatchObject({
      videos: 0,
      tracks: 0,
      lines: 0,
      trackTranslations: 0,
      lineTranslations: 0,
      lemmaCounts: 0,
    });
  });

  it("keeps its connections, with the video and line links set to null", async () => {
    const { video, connection } = await createFullSetup();

    await db.video.delete({ where: { id: video.id } });

    const kept = await db.connection.findUniqueOrThrow({ where: { id: connection.id } });
    expect(kept).toMatchObject({
      videoId: null,
      lineId: null,
      youtubeVideoId: "4Ja5iJtYOPw",
      sentence: "Wir fangen am Hafen an.",
    });
  });

  it("keeps the words, cards, review logs and decks", async () => {
    const { video } = await createFullSetup();

    await db.video.delete({ where: { id: video.id } });

    expect(await counts()).toMatchObject({
      words: 1,
      cards: 1,
      reviewLogs: 1,
      decks: 1,
      deckWords: 1,
    });
  });
});

describe("deleting a track (reprocessing)", () => {
  it("deletes its lines and translations but keeps the video's other data", async () => {
    const { track, video } = await createFullSetup();
    await createTrack(video.id);

    await db.track.delete({ where: { id: track.id } });

    expect(await counts()).toMatchObject({
      videos: 1,
      tracks: 1,
      lines: 0,
      trackTranslations: 0,
      lineTranslations: 0,
      lemmaCounts: 1,
    });
  });

  it("keeps connections to its lines, with the line link set to null", async () => {
    const { track, video, connection } = await createFullSetup();

    await db.track.delete({ where: { id: track.id } });

    const kept = await db.connection.findUniqueOrThrow({ where: { id: connection.id } });
    expect(kept.lineId).toBeNull();
    expect(kept.videoId).toBe(video.id);
  });
});

describe("deleting a word", () => {
  it("deletes its connections, card, review log and deck memberships", async () => {
    const { word } = await createFullSetup();

    await db.vocabularyWord.delete({ where: { id: word.id } });

    expect(await counts()).toMatchObject({
      words: 0,
      connections: 0,
      cards: 0,
      reviewLogs: 0,
      deckWords: 0,
    });
  });

  it("keeps the decks and videos", async () => {
    const { word } = await createFullSetup();

    await db.vocabularyWord.delete({ where: { id: word.id } });

    expect(await counts()).toMatchObject({ decks: 1, videos: 1, lines: 1 });
  });
});

describe("deleting a connection", () => {
  it("keeps the word, even when it was the last connection", async () => {
    const { connection, word } = await createFullSetup();

    await db.connection.delete({ where: { id: connection.id } });

    expect(await db.vocabularyWord.findUnique({ where: { id: word.id } })).not.toBeNull();
    expect(await db.card.count()).toBe(1);
  });

  it("keeps the word's other connections", async () => {
    const { connection, word } = await createFullSetup();
    await createConnection(word.id);

    await db.connection.delete({ where: { id: connection.id } });

    expect(await db.connection.count()).toBe(1);
  });
});

describe("deleting a deck", () => {
  it("deletes its memberships and keeps the words", async () => {
    const { deck } = await createFullSetup();

    await db.deck.delete({ where: { id: deck.id } });

    expect(await counts()).toMatchObject({ decks: 0, deckWords: 0, words: 1 });
  });
});

describe("deleting a card", () => {
  it("deletes its review log and keeps the word", async () => {
    const { card } = await createFullSetup();

    await db.card.delete({ where: { id: card.id } });

    expect(await counts()).toMatchObject({ cards: 0, reviewLogs: 0, words: 1 });
  });
});

describe("words without connections", () => {
  it("can exist on their own", async () => {
    const { user } = await createFullSetup();

    await createWord(user.id, "Wecker");

    expect(await db.vocabularyWord.count()).toBe(2);
  });
});
