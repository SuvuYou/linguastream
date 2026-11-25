import { describe, expect, it } from "vitest";
import { db } from "../src/client.js";
import {
  createCardWithReview,
  createDeck,
  createLine,
  createTrack,
  createTranslation,
  createUser,
  createVideo,
  createWord,
} from "./helpers/factories.js";

const UNIQUE_VIOLATION = { code: "P2002" };

describe("unique keys", () => {
  it("allows one vocabulary row per user, language and lemma", async () => {
    const user = await createUser();
    await createWord(user.id, "anfangen");

    await expect(createWord(user.id, "anfangen")).rejects.toMatchObject(UNIQUE_VIOLATION);
  });

  it("treats lemmas case-sensitively (Essen and essen are two words)", async () => {
    const user = await createUser();
    await createWord(user.id, "Essen");

    await expect(createWord(user.id, "essen")).resolves.toBeDefined();
  });

  it("lets two users have the same lemma", async () => {
    const first = await createUser();
    const second = await createUser();
    await createWord(first.id, "anfangen");

    await expect(createWord(second.id, "anfangen")).resolves.toBeDefined();
  });

  it("allows one video per user and YouTube ID, across users too", async () => {
    const first = await createUser();
    const second = await createUser();
    await createVideo(first.id, "4Ja5iJtYOPw");

    await expect(createVideo(first.id, "4Ja5iJtYOPw")).rejects.toMatchObject(UNIQUE_VIOLATION);
    await expect(createVideo(second.id, "4Ja5iJtYOPw")).resolves.toBeDefined();
  });

  it("allows one card per word", async () => {
    const user = await createUser();
    const word = await createWord(user.id);
    await createCardWithReview(word.id);

    await expect(db.card.create({ data: { wordId: word.id } })).rejects.toMatchObject(
      UNIQUE_VIOLATION,
    );
  });

  it("allows one translation per track and language", async () => {
    const user = await createUser();
    const video = await createVideo(user.id);
    const track = await createTrack(video.id);
    const line = await createLine(track.id);
    await createTranslation(track.id, line.id, "en");

    await expect(createTranslation(track.id, line.id, "en")).rejects.toMatchObject(
      UNIQUE_VIOLATION,
    );
    await expect(createTranslation(track.id, line.id, "uk")).resolves.toBeDefined();
  });

  it("allows one line per track and index", async () => {
    const user = await createUser();
    const video = await createVideo(user.id);
    const track = await createTrack(video.id);
    await createLine(track.id, 0);

    await expect(createLine(track.id, 0)).rejects.toMatchObject(UNIQUE_VIOLATION);
  });

  it("allows one deck name per user", async () => {
    const user = await createUser();
    await createDeck(user.id, "Kitchen");

    await expect(createDeck(user.id, "Kitchen")).rejects.toMatchObject(UNIQUE_VIOLATION);
  });
});

describe("defaults", () => {
  it("creates a card as new and due now", async () => {
    const user = await createUser();
    const word = await createWord(user.id);
    const before = Date.now();

    const card = await db.card.create({ data: { wordId: word.id } });

    expect(card).toMatchObject({ state: "new", reps: 0, lapses: 0, lastReview: null });
    expect(card.due.getTime()).toBeGreaterThanOrEqual(before - 1000);
    expect(card.due.getTime()).toBeLessThanOrEqual(Date.now() + 1000);
  });

  it("creates tracks and translations as pending at 0 %", async () => {
    const user = await createUser();
    const video = await createVideo(user.id);
    const track = await createTrack(video.id);
    const line = await createLine(track.id);
    const translation = await createTranslation(track.id, line.id);

    expect(track).toMatchObject({ status: "pending", progress: 0, errorCode: null });
    expect(translation).toMatchObject({ status: "pending", progress: 0, errorCode: null });
  });

  it("gives every row a UUID v7 ID", async () => {
    const user = await createUser();
    const word = await createWord(user.id);

    for (const id of [user.id, word.id]) {
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    }
  });
});
