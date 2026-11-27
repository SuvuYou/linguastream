import { describe, expect, it, vi } from "vitest";
import type { DictionaryEntry } from "@linguastream/contracts";
import type { VocabularyRepository } from "../vocabulary/vocabulary.repository";
import { glossKey, type DictionaryRepository } from "./dictionary.repository";
import type { LookupLine, WordLookupRepository } from "./word-lookup.repository";
import { WordLookupService } from "./word-lookup.service";

const VIDEO = "0190f3c2-7d1a-7c00-8a00-000000000001";

const sense = (gloss: string) => ({ gloss, glosses: [gloss], tags: [], example: null, example_en: null });
const entry = (word: string, pos: string, glosses: string[]): DictionaryEntry => ({
  word,
  pos,
  gender: null,
  plural: null,
  flags: [],
  senses: glosses.map(sense),
});

const LINE: LookupLine = {
  language: "de",
  nativeLanguage: "uk",
  text: "Das Essen fängt an, sagt Anna.",
  translation: "Їжа починається, каже Анна.",
  words: [
    { i: 0, text: "Das", start_ms: 0, lemma: "der", pos: "DET" },
    { i: 1, text: "Essen", start_ms: 100, lemma: "Essen", pos: "NOUN", morph: "Case=Nom|Gender=Neut|Number=Sing" },
    { i: 2, text: "fängt", start_ms: 200, lemma: "anfangen", pos: "VERB" },
    { i: 3, text: "an,", start_ms: 300, lemma: "anfangen", pos: "ADP", particle_of: 2 },
    { i: 4, text: "sagt", start_ms: 400, lemma: "sagen", pos: "VERB" },
    { i: 5, text: "Anna.", start_ms: 500, lemma: "Anna", pos: "PROPN" },
  ],
};

function setup(line: LookupLine | null = LINE) {
  const lookups = { line: vi.fn(async () => line) };
  const dictionary = {
    fullEntries: vi.fn(async (_language: string, lemma: string) =>
      lemma === "Essen" ? [entry("essen", "verb", ["to eat"]), entry("Essen", "noun", ["food; meal", "dinner"])] : [],
    ),
    ranks: vi.fn(async () => new Map([["Essen", 1200]])),
    glossTranslations: vi.fn(async () => new Map([[glossKey({ word: "Essen", pos: "noun", gloss: "food" }), "їжа"]])),
    aiWords: vi.fn(async () => new Map([["anfangen", { pos: "verb", gender: null, gloss: "починати", parts: [] }]])),
  };
  const vocabulary = { status: vi.fn(async () => "learning" as const) };
  const service = new WordLookupService(
    lookups as unknown as WordLookupRepository,
    dictionary as unknown as DictionaryRepository,
    vocabulary as unknown as VocabularyRepository,
  );
  return { service, lookups, dictionary, vocabulary };
}

const ask = (i: number, index = 7) => ({ userId: "u1", videoId: VIDEO, index, i });

describe("WordLookupService", () => {
  it("returns the line, the word, its status, rank, native gloss and every entry, exact spelling first", async () => {
    const { service, lookups, dictionary, vocabulary } = setup();
    const result = await service.lookup(ask(1));
    expect(lookups.line).toHaveBeenCalledWith("u1", VIDEO, 7);
    expect(vocabulary.status).toHaveBeenCalledWith("u1", "de", "Essen");
    expect(result).toEqual({
      video_id: VIDEO,
      line_index: 7,
      line: { text: LINE.text, translation: LINE.translation },
      word: { i: 1, text: "Essen", pos: "NOUN", morph: "Case=Nom|Gender=Neut|Number=Sing" },
      language: "de",
      native_language: "uk",
      lemma: "Essen",
      status: "learning",
      rank: 1200,
      gloss: "їжа",
      gloss_language: "uk",
      entries: [entry("Essen", "noun", ["food; meal", "dinner"]), entry("essen", "verb", ["to eat"])],
      ai: null,
    });
    expect(dictionary.aiWords).not.toHaveBeenCalled();
  });

  it("gives a verb's particle the verb's word, and an AI entry when the dictionary has none", async () => {
    const { service, dictionary } = setup();
    const result = await service.lookup(ask(3));
    expect(result).toMatchObject({
      lemma: "anfangen",
      word: { i: 3, text: "an,", pos: "ADP", morph: null },
      entries: [],
      ai: { gloss: "починати" },
      gloss: "починати",
      gloss_language: "uk",
      rank: null,
    });
    expect(dictionary.glossTranslations).not.toHaveBeenCalled();
  });

  it("looks nothing up for names and keeps the line", async () => {
    const { service, dictionary, vocabulary } = setup();
    expect(await service.lookup(ask(5))).toMatchObject({
      lemma: null,
      status: "unknown",
      entries: [],
      gloss: null,
      line: { translation: LINE.translation },
    });
    expect(dictionary.fullEntries).not.toHaveBeenCalled();
    expect(vocabulary.status).not.toHaveBeenCalled();
  });

  it("uses the English gloss for English speakers without asking for a translation", async () => {
    const { service, dictionary } = setup({ ...LINE, nativeLanguage: "en" });
    expect(await service.lookup(ask(1))).toMatchObject({ gloss: "food", gloss_language: "en" });
    expect(dictionary.glossTranslations).not.toHaveBeenCalled();
  });

  it("returns null for a missing line or word position", async () => {
    expect(await setup(null).service.lookup(ask(1))).toBeNull();
    expect(await setup().service.lookup(ask(99))).toBeNull();
  });
});
