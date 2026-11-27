import { describe, expect, it, vi } from "vitest";
import { dictionaryVerbLexicon } from "./verb-lexicon";

describe("dictionaryVerbLexicon", () => {
  it("asks the form index once the dictionary is imported", async () => {
    const dictionary = { isImported: vi.fn(async () => true), canBeVerb: vi.fn(async (_l: string, f: string) => f === "geht") };
    const lexicon = dictionaryVerbLexicon(dictionary);
    expect(await lexicon.canBeVerb("geht")).toBe(true);
    expect(await lexicon.canBeVerb("und")).toBe(false);
    expect(dictionary.canBeVerb).toHaveBeenCalledWith("de", "und");
  });

  it("keeps every full stop while there's no dictionary", async () => {
    const dictionary = { isImported: vi.fn(async () => false), canBeVerb: vi.fn(async () => false) };
    expect(await dictionaryVerbLexicon(dictionary).canBeVerb("und")).toBe(true);
    expect(dictionary.canBeVerb).not.toHaveBeenCalled();
  });
});
