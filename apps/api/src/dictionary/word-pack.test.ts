import { describe, expect, it } from "vitest";
import { packWord, pickEntry, shortGloss, type EntrySummary } from "./word-pack";

const entry = (fields: Partial<EntrySummary>): EntrySummary => ({
  word: "Hund",
  pos: "noun",
  gender: "m",
  plural: "Hunde",
  flags: [],
  senseCount: 2,
  firstGloss: "dog (Canis lupus familiaris)",
  firstExample: null,
  ...fields,
});

describe("shortGloss", () => {
  it("cuts at the first ; or ( and drops leading labels", () => {
    expect(shortGloss("dog (Canis lupus familiaris)")).toBe("dog");
    expect(shortGloss("to begin; to start")).toBe("to begin");
    expect(shortGloss("(intransitive) to go")).toBe("to go");
    expect(shortGloss("(colloquial) (dated) mate")).toBe("mate");
    expect(shortGloss("(only a label)")).toBe("(only a label)");
  });
});

describe("pickEntry", () => {
  it("prefers the exact spelling, then any case, then the entry with most senses", () => {
    const noun = entry({ word: "Essen", pos: "noun", senseCount: 2 });
    const verb = entry({ word: "essen", pos: "verb", senseCount: 3 });
    const verb2 = entry({ word: "essen", pos: "verb", senseCount: 1 });
    expect(pickEntry("Essen", [verb, noun])).toBe(noun);
    expect(pickEntry("essen", [noun, verb2, verb])).toBe(verb);
    expect(pickEntry("ESSEN", [verb2, noun])).toBe(noun);
    expect(pickEntry("Hund", [])).toBeNull();
  });
});

describe("packWord", () => {
  it("uses the translated gloss in the native language, else the English one", () => {
    const base = { lemma: "Hund", count: 3, entry: entry({}), ai: null, rank: 812, status: "learning" as const };
    expect(packWord({ ...base, translation: "собака" }, "uk")).toEqual({
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
      status: "learning",
    });
    expect(packWord({ ...base, translation: null }, "uk")).toMatchObject({ gloss: "dog", gloss_language: "en" });
    expect(packWord({ ...base, translation: "собака" }, "en")).toMatchObject({ gloss: "dog", gloss_language: "en" });
    expect(packWord({ ...base, entry: entry({ firstGloss: null }), translation: null }, "uk")).toMatchObject({
      gloss: null,
      gloss_language: null,
    });
  });

  it("uses an AI-made entry for a missing word, and nothing when there's none", () => {
    const ai = { pos: "noun", gender: "m", gloss: "погляд через плече", parts: ["Schulter", "Blick"] };
    expect(packWord({ lemma: "Schulterblick", count: 1, entry: null, translation: null, ai, rank: null, status: "unknown" }, "uk")).toEqual({
      lemma: "Schulterblick",
      count: 1,
      pos: "noun",
      gender: "m",
      plural: null,
      flags: [],
      gloss: "погляд через плече",
      gloss_language: "uk",
      source: "ai",
      rank: null,
      parts: ["Schulter", "Blick"],
      status: "unknown",
    });
    expect(packWord({ lemma: "xyz", count: 1, entry: null, translation: null, ai: null, rank: null, status: "unknown" }, "uk")).toMatchObject({
      gloss: null,
      source: null,
      pos: null,
    });
    expect(
      packWord({ lemma: "Trevor", count: 1, entry: null, translation: null, ai: { ...ai, gloss: null }, rank: null, status: "unknown" }, "uk"),
    ).toMatchObject({ gloss: null, gloss_language: null, source: "ai" });
  });
});
