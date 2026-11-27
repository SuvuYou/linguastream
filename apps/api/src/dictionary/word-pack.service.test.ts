import { describe, expect, it, vi } from "vitest";
import type { DictionaryRepository } from "./dictionary.repository";
import { glossKey } from "./dictionary.repository";
import type { EntrySummary } from "./word-pack";
import type { GlossItem, MissingWordAnswer, MissingWordItem } from "../ai/prompts/glosses";
import type { WordAi } from "./word-ai";
import type { WordPackRepository } from "./word-pack.repository";
import { MISSING_BATCH, WordPackService } from "./word-pack.service";

const entry = (word: string, pos: string, firstGloss: string | null): EntrySummary => ({
  word,
  pos,
  gender: null,
  plural: null,
  flags: [],
  senseCount: 1,
  firstGloss,
  firstExample: null,
});

function setup({ native = "uk", lemmas = ["Hund", "laufen", "Schulterblick"], imported = true } = {}) {
  const dictionary = {
    isImported: vi.fn(async () => imported),
    entries: vi.fn(async () =>
      new Map([
        ["hund", [entry("Hund", "noun", "dog (animal)")]],
        ["laufen", [entry("laufen", "verb", "to run; to walk")]],
      ]),
    ),
    ranks: vi.fn(async () => new Map([["Hund", 900]])),
    glossTranslations: vi.fn(async () => new Map<string, string>()),
    saveGlossTranslations: vi.fn(async () => {}),
    aiWords: vi.fn(async () => new Map()),
    saveAiWords: vi.fn(async () => {}),
  };
  const packs = {
    videoForUser: vi.fn(async () => ({ videoId: "v1", language: "de", nativeLanguage: native })),
    trackTarget: vi.fn(async () => ({ videoId: "v1", language: "de", nativeLanguage: native })),
    lemmaCounts: vi.fn(async () => lemmas.map((lemma, i) => ({ lemma, count: lemmas.length - i }))),
    examples: vi.fn(async () => new Map([["Schulterblick", "Erst der Schulterblick."]])),
  };
  const ai: WordAi = {
    translateGlosses: vi.fn(async (items: GlossItem[]) => new Map(items.map((item, i) => [i, `${item.gloss}-uk`]))),
    describeMissing: vi.fn(
      async (items: MissingWordItem[]) =>
        new Map<number, MissingWordAnswer>(items.map((_, i) => [i, { pos: "noun", gender: "m", gloss: "погляд", parts: [] }])),
    ),
  };
  const vocabulary = { statuses: vi.fn(async () => new Map([["Hund", "known" as const]])) };
  const service = new WordPackService(
    dictionary as unknown as DictionaryRepository,
    packs as unknown as WordPackRepository,
    ai,
    vocabulary,
  );
  return { service, dictionary, packs, ai, vocabulary };
}

const spend = (ok = true) => ({ canSpend: vi.fn(async () => ok) });

describe("WordPackService.build", () => {
  it("returns null for a video the user doesn't own", async () => {
    const { service, packs } = setup();
    packs.videoForUser.mockResolvedValueOnce(null as never);
    expect(await service.build("u1", "v1")).toBeNull();
  });

  it("joins counts with entries, translations, AI words, ranks and the user's statuses", async () => {
    const { service, dictionary, vocabulary } = setup();
    dictionary.glossTranslations.mockResolvedValueOnce(new Map([[glossKey({ word: "Hund", pos: "noun", gloss: "dog" }), "собака"]]));
    dictionary.aiWords.mockResolvedValueOnce(new Map([["Schulterblick", { pos: "noun", gender: "m", gloss: "погляд", parts: [] }]]));
    const pack = await service.build("u1", "v1");
    expect(pack?.native_language).toBe("uk");
    expect(pack?.words.map((w) => [w.lemma, w.gloss, w.gloss_language, w.source, w.rank, w.status])).toEqual([
      ["Hund", "собака", "uk", "dictionary", 900, "known"],
      ["laufen", "to run", "en", "dictionary", null, "unknown"],
      ["Schulterblick", "погляд", "uk", "ai", null, "unknown"],
    ]);
    expect(vocabulary.statuses).toHaveBeenCalledWith("u1", "de", ["Hund", "laufen", "Schulterblick"]);
    expect(dictionary.aiWords).toHaveBeenCalledWith("de", "uk", ["Schulterblick"]);
  });
});

describe("WordPackService.prepare", () => {
  it("skips everything until the dictionary is imported", async () => {
    const { service, ai } = setup({ imported: false });
    expect(await service.prepare("t1", spend())).toMatchObject({ skipped: "not_imported", calls: 0 });
    expect(ai.describeMissing).not.toHaveBeenCalled();
  });

  it("describes missing words and translates short glosses once", async () => {
    const { service, dictionary, ai } = setup();
    const report = await service.prepare("t1", spend());
    expect(report).toEqual({ translated: 2, described: 1, calls: 2, skipped: null, failures: 0 });
    expect(ai.describeMissing).toHaveBeenCalledWith([{ word: "Schulterblick", example: "Erst der Schulterblick." }], "de", "uk");
    expect(dictionary.saveGlossTranslations).toHaveBeenCalledWith("de", "uk", [
      { word: "Hund", pos: "noun", gloss: "dog", text: "dog-uk" },
      { word: "laufen", pos: "verb", gloss: "to run", text: "to run-uk" },
    ]);
  });

  it("asks nothing for what's already cached", async () => {
    const { service, dictionary, ai } = setup();
    dictionary.aiWords.mockResolvedValue(new Map([["Schulterblick", { pos: null, gender: null, gloss: null, parts: [] }]]));
    dictionary.glossTranslations.mockResolvedValue(
      new Map([
        [glossKey({ word: "Hund", pos: "noun", gloss: "dog" }), "собака"],
        [glossKey({ word: "laufen", pos: "verb", gloss: "to run" }), "бігти"],
      ]),
    );
    expect(await service.prepare("t1", spend())).toMatchObject({ calls: 0 });
    expect(ai.describeMissing).not.toHaveBeenCalled();
    expect(ai.translateGlosses).not.toHaveBeenCalled();
  });

  it("needs no gloss translation for English speakers", async () => {
    const { service, ai } = setup({ native: "en" });
    expect(await service.prepare("t1", spend())).toMatchObject({ translated: 0, calls: 1 });
    expect(ai.translateGlosses).not.toHaveBeenCalled();
  });

  it("stops at the spend cap", async () => {
    const { service, ai } = setup();
    expect(await service.prepare("t1", spend(false))).toMatchObject({ skipped: "spend_cap", calls: 0 });
    expect(ai.describeMissing).not.toHaveBeenCalled();
  });

  it("counts a failed call and carries on", async () => {
    const { service, ai } = setup();
    vi.mocked(ai.describeMissing).mockRejectedValueOnce(new Error("boom"));
    expect(await service.prepare("t1", spend())).toMatchObject({ failures: 1, described: 0, translated: 2, calls: 2 });
  });

  it("splits missing words into batches", async () => {
    const many = Array.from({ length: MISSING_BATCH + 5 }, (_, i) => `Wort${i}`);
    const { service, ai } = setup({ lemmas: many, native: "en" });
    expect(await service.prepare("t1", spend())).toMatchObject({ described: many.length, calls: 2 });
    expect(vi.mocked(ai.describeMissing).mock.calls.map(([items]) => items.length)).toEqual([MISSING_BATCH, 5]);
  });
});
