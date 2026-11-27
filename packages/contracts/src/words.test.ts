import { describe, expect, it } from "vitest";
import { SetWordStatus, WordLookup, WordPack, getWordPackRoute, lookupWordRoute, setWordStatusRoute } from "./words.js";

const word = {
  lemma: "Hund",
  count: 3,
  pos: "noun",
  gender: "m",
  plural: "Hunde",
  flags: [],
  gloss: "собака",
  gloss_language: "uk",
  source: "dictionary",
  rank: 812,
  parts: [],
  status: "unknown",
};

describe("word pack contract", () => {
  it("is GET /api/videos/:videoId/words", () => {
    expect([getWordPackRoute.method, getWordPackRoute.path]).toEqual(["GET", "/api/videos/:videoId/words"]);
    expect(getWordPackRoute.params!.safeParse({ videoId: "x" }).success).toBe(false);
  });

  it("accepts dictionary, AI-made and unknown words", () => {
    const pack = {
      video_id: "0190f3c2-7d1a-7c00-8a00-000000000001",
      language: "de",
      native_language: "uk",
      words: [
        word,
        { ...word, lemma: "Schulterblick", source: "ai", rank: null, parts: ["Schulter", "Blick"] },
        { ...word, lemma: "xyz", pos: null, gender: null, plural: null, gloss: null, gloss_language: null, source: null, rank: null },
      ],
    };
    expect(WordPack.parse(pack)).toEqual(pack);
    expect(WordPack.safeParse({ ...pack, words: [{ ...word, source: "guess" }] }).success).toBe(false);
    expect(WordPack.safeParse({ ...pack, words: [{ ...word, count: 0 }] }).success).toBe(false);
  });
});

describe("word lookup contract", () => {
  const lookup = {
    video_id: "0190f3c2-7d1a-7c00-8a00-000000000001",
    line_index: 4,
    line: { text: "Der Hund läuft.", translation: "Собака біжить." },
    word: { i: 1, text: "Hund", pos: "NOUN", morph: "Case=Nom|Gender=Masc|Number=Sing" },
    language: "de",
    native_language: "uk",
    lemma: "Hund",
    status: "learning",
    rank: 812,
    gloss: "собака",
    gloss_language: "uk",
    entries: [
      {
        word: "Hund",
        pos: "noun",
        gender: "m",
        plural: "Hunde",
        flags: [],
        senses: [{ gloss: "dog", glosses: ["dog"], tags: [], example: "Der Hund bellt.", example_en: "The dog barks." }],
      },
    ],
    forms: [
      { form: "Hunde", pos: "noun", tags: ["nominative", "plural"] },
      { form: "Hundes", pos: "noun", tags: ["genitive", "singular"] },
    ],
    ai: null,
  };

  it("is GET by video, line index and word position", () => {
    expect([lookupWordRoute.method, lookupWordRoute.path]).toEqual(["GET", "/api/videos/:videoId/lines/:index/words/:i"]);
    expect(lookupWordRoute.params!.parse({ videoId: lookup.video_id, index: "4", i: "1" })).toEqual({
      videoId: lookup.video_id,
      index: 4,
      i: 1,
    });
    expect(lookupWordRoute.params!.safeParse({ videoId: lookup.video_id, index: "-1", i: "0" }).success).toBe(false);
  });

  it("accepts a dictionary word and a word without a lemma", () => {
    expect(WordLookup.parse(lookup)).toEqual(lookup);
    const punctuation = { ...lookup, lemma: null, status: "unknown", rank: null, gloss: null, gloss_language: null, entries: [], forms: [] };
    expect(WordLookup.parse(punctuation)).toEqual(punctuation);
  });

  it("sets a status with PUT /api/vocabulary/status", () => {
    expect([setWordStatusRoute.method, setWordStatusRoute.path]).toEqual(["PUT", "/api/vocabulary/status"]);
    expect(SetWordStatus.parse({ language: "de", lemma: " Hund ", status: "known" })).toEqual({
      language: "de",
      lemma: "Hund",
      status: "known",
    });
    expect(SetWordStatus.safeParse({ language: "de", lemma: "", status: "known" }).success).toBe(false);
    expect(SetWordStatus.safeParse({ language: "de", lemma: "Hund", status: "mastered" }).success).toBe(false);
  });
});
