import { db } from "../../src/client.js";

let counter = 0;
const next = () => ++counter;

export function createUser() {
  const n = next();
  return db.user.create({
    data: {
      firebaseUid: `uid-${n}`,
      email: `learner-${n}@example.com`,
      nativeLanguage: "en",
      learningLanguage: "de",
    },
  });
}

export function createVideo(userId: string, youtubeVideoId = `yt-${next()}`) {
  return db.video.create({
    data: { userId, youtubeVideoId, title: "Ein Tag in Hamburg", language: "de" },
  });
}

export function createTrack(videoId: string) {
  return db.track.create({
    data: {
      videoId,
      youtubeTrackId: "asr.de",
      language: "de",
      isAutoCaptions: true,
      rawJson3: new Uint8Array([1, 2, 3]),
      contentHash: `hash-${next()}`,
      processingVersion: 1,
    },
  });
}

export function createLine(trackId: string, index = 0) {
  return db.line.create({
    data: {
      trackId,
      index,
      startMs: index * 4000,
      endMs: index * 4000 + 4000,
      text: "Wir fangen am Hafen an.",
      rawText: "wir fangen am hafen an",
      words: [],
      lemmas: ["wir", "anfangen", "an", "der", "Hafen"],
    },
  });
}

export async function createTranslation(trackId: string, lineId: string, language = "en") {
  const translation = await db.trackTranslation.create({
    data: { trackId, language },
  });
  await db.lineTranslation.create({
    data: { translationId: translation.id, lineId, text: "We start at the harbour." },
  });
  return translation;
}

export function createWord(userId: string, lemma = "anfangen") {
  return db.vocabularyWord.create({
    data: {
      userId,
      language: "de",
      lemma,
      status: "learning",
      statusSource: "save",
      savedAt: new Date(),
    },
  });
}

export function createConnection(
  wordId: string,
  links: { videoId?: string; lineId?: string } = {},
) {
  return db.connection.create({
    data: {
      wordId,
      ...links,
      youtubeVideoId: "4Ja5iJtYOPw",
      videoTitle: "Ein Tag in Hamburg",
      startMs: 4000,
      endMs: 8000,
      sentence: "Wir fangen am Hafen an.",
      translation: "We start at the harbour.",
    },
  });
}

export function createDeck(userId: string, name = `Deck ${next()}`) {
  return db.deck.create({ data: { userId, name } });
}

export async function createCardWithReview(wordId: string) {
  const card = await db.card.create({ data: { wordId } });
  await db.reviewLog.create({
    data: { cardId: card.id, rating: 3, stateBefore: { state: "new" } },
  });
  return card;
}

/** A user with one video, track, line, translation, lemma count, and a saved
 * word with a connection to that line, a card with one review, and a deck. */
export async function createFullSetup() {
  const user = await createUser();
  const video = await createVideo(user.id);
  const track = await createTrack(video.id);
  const line = await createLine(track.id);
  const translation = await createTranslation(track.id, line.id);
  await db.videoLemmaCount.create({ data: { videoId: video.id, lemma: "anfangen", count: 2 } });
  const word = await createWord(user.id);
  const connection = await createConnection(word.id, { videoId: video.id, lineId: line.id });
  const card = await createCardWithReview(word.id);
  const deck = await createDeck(user.id);
  await db.deckWord.create({ data: { deckId: deck.id, wordId: word.id } });

  return { user, video, track, line, translation, word, connection, card, deck };
}
