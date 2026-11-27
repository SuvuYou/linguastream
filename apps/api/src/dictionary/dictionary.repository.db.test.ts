import { db } from "@linguastream/db";
import { DictionaryRepository } from "./dictionary.repository";

const repo = new DictionaryRepository();

async function entry(word: string, pos: string, senses: object[], extra: { gender?: string; flags?: string[] } = {}) {
  await db.dictionaryEntry.create({
    data: { language: "de", word, wordLower: word.toLowerCase(), pos, senses, senseCount: senses.length, ...extra },
  });
}

describe("DictionaryRepository (Postgres)", () => {
  it("knows whether a language is imported", async () => {
    expect(await new DictionaryRepository().isImported("de")).toBe(false);
    await entry("Hund", "noun", [{ gloss: "dog" }]);
    expect(await repo.isImported("de")).toBe(true);
    expect(await repo.isImported("fr")).toBe(false);
  });

  it("finds verb forms case-insensitively", async () => {
    await db.dictionaryForm.createMany({
      data: [
        { language: "de", form: "geht", formLower: "geht", lemma: "gehen", pos: "verb" },
        { language: "de", form: "Hunde", formLower: "hunde", lemma: "Hund", pos: "noun" },
      ],
    });
    expect(await repo.canBeVerb("de", "Geht")).toBe(true);
    expect(await repo.canBeVerb("de", "Hunde")).toBe(false);
  });

  it("groups entries by lowercase word with their first sense", async () => {
    await entry("Essen", "noun", [{ gloss: "food", example: "Das Essen ist kalt." }, { gloss: "meal" }], { gender: "n" });
    await entry("essen", "verb", [{ gloss: "to eat" }], { flags: ["strong"] });
    await entry("Hund", "noun", []);
    const found = await repo.entries("de", ["Essen", "essen", "Hund", "Katze"]);
    expect([...found.keys()].sort()).toEqual(["essen", "hund"]);
    expect(found.get("essen")?.sort((a, b) => a.pos.localeCompare(b.pos))).toEqual([
      { word: "Essen", pos: "noun", gender: "n", plural: null, flags: [], senseCount: 2, firstGloss: "food", firstExample: "Das Essen ist kalt." },
      { word: "essen", pos: "verb", gender: null, plural: null, flags: ["strong"], senseCount: 1, firstGloss: "to eat", firstExample: null },
    ]);
    expect(found.get("hund")?.[0]).toMatchObject({ firstGloss: null, firstExample: null });
  });

  it("returns ranks by exact lemma", async () => {
    await db.lemmaFrequency.createMany({
      data: [
        { language: "de", word: "Hund", count: 100n, rank: 812 },
        { language: "de", word: "hund", count: 1n, rank: 40000 },
      ],
    });
    expect(await repo.ranks("de", ["Hund", "Katze"])).toEqual(new Map([["Hund", 812]]));
  });

  it("saves and reads gloss translations per target language, keeping the first", async () => {
    const dog = { word: "Hund", pos: "noun", gloss: "dog" };
    await repo.saveGlossTranslations("de", "uk", [{ ...dog, text: "собака" }]);
    await repo.saveGlossTranslations("de", "uk", [{ ...dog, text: "пес" }]);
    await repo.saveGlossTranslations("de", "pl", [{ ...dog, text: "pies" }]);
    const found = await repo.glossTranslations("de", "uk", [dog, { word: "Katze", pos: "noun", gloss: "cat" }]);
    expect([...found.values()]).toEqual(["собака"]);
    expect(await repo.glossTranslations("de", "uk", [])).toEqual(new Map());
  });

  it("saves and reads AI word entries", async () => {
    const word = { lemma: "Schulterblick", pos: "noun", gender: "m", gloss: "погляд через плече", parts: ["Schulter", "Blick"] };
    await repo.saveAiWords("de", "uk", [word]);
    await repo.saveAiWords("de", "uk", []);
    expect(await repo.aiWords("de", "uk", ["Schulterblick", "Trevor"])).toEqual(
      new Map([["Schulterblick", { pos: "noun", gender: "m", gloss: "погляд через плече", parts: ["Schulter", "Blick"] }]]),
    );
    expect(await repo.aiWords("de", "en", ["Schulterblick"])).toEqual(new Map());
  });

  it("returns every entry for a lemma with all senses, most senses first", async () => {
    await entry("essen", "verb", [{ gloss: "to eat", glosses: ["to eat"], tags: ["transitive"], example: "Wir essen.", example_en: "We eat." }]);
    await entry("Essen", "noun", [{ gloss: "food" }, { gloss: "meal" }], { gender: "n" });
    await entry("Esse", "noun", [{ gloss: "chimney" }]);
    expect(await repo.fullEntries("de", "Essen")).toEqual([
      {
        word: "Essen",
        pos: "noun",
        gender: "n",
        plural: null,
        flags: [],
        senses: [
          { gloss: "food", glosses: ["food"], tags: [], example: null, example_en: null },
          { gloss: "meal", glosses: ["meal"], tags: [], example: null, example_en: null },
        ],
      },
      {
        word: "essen",
        pos: "verb",
        gender: null,
        plural: null,
        flags: [],
        senses: [{ gloss: "to eat", glosses: ["to eat"], tags: ["transitive"], example: "Wir essen.", example_en: "We eat." }],
      },
    ]);
    expect(await repo.fullEntries("de", "Katze")).toEqual([]);
  });

  it("lists a lemma's forms with their tags, once each", async () => {
    await db.dictionaryForm.createMany({
      data: [
        { language: "de", form: "Hunde", formLower: "hunde", lemma: "Hund", pos: "noun", tags: ["nominative", "plural"] },
        { language: "de", form: "Hunde", formLower: "hunde", lemma: "Hund", pos: "noun", tags: ["nominative", "plural"] },
        { language: "de", form: "Hundes", formLower: "hundes", lemma: "Hund", pos: "noun", tags: ["genitive", "singular"] },
        { language: "de", form: "hunde", formLower: "hunde", lemma: "hunden", pos: "verb", tags: [] },
      ],
    });
    expect(await repo.forms("de", "Hund")).toEqual([
      { form: "Hunde", pos: "noun", tags: ["nominative", "plural"] },
      { form: "Hundes", pos: "noun", tags: ["genitive", "singular"] },
    ]);
    expect(await repo.forms("de", "Katze")).toEqual([]);
  });
});
