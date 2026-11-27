import { describe, expect, it } from "vitest";
import { parseFrequencyLine, parseLine } from "../src/dictionary/wiktextract.js";
import { kaikki } from "./helpers/kaikki.js";

const parse = (entry: object) => parseLine(JSON.stringify(entry));

describe("parseLine", () => {
  it("reads a noun with gender, plural, senses with examples, and its forms", () => {
    const { entry, forms } = parse(kaikki.hund);
    expect(entry).toEqual({
      word: "Hund",
      pos: "noun",
      gender: "m",
      plural: "Hunde",
      flags: [],
      senses: [
        {
          gloss: "dog (Canis lupus familiaris)",
          glosses: ["dog (Canis lupus familiaris)"],
          tags: [],
          example: "Der Hund bellt.",
          example_en: "The dog barks.",
        },
        { gloss: "scoundrel", glosses: ["scoundrel"], tags: ["derogatory"], example: null, example_en: null },
      ],
    });
    expect(forms.map((f) => f.form)).toEqual(["Hund", "Hunde", "Hundes"]);
    expect(forms.every((f) => f.lemma === "Hund" && f.pos === "noun")).toBe(true);
  });

  it("keeps only the form link of a 'form of' entry", () => {
    expect(parse(kaikki.hunde)).toEqual({
      entry: null,
      forms: [
        { form: "Hunde", lemma: "Hunde", pos: "noun", tags: [] },
        { form: "Hunde", lemma: "Hund", pos: "noun", tags: ["form-of"] },
      ],
    });
  });

  it("finds separable verbs from split forms and never indexes the auxiliary as a form", () => {
    const { entry, forms } = parse(kaikki.anfangen);
    expect(entry!.flags).toEqual(["reflexive", "separable"]);
    expect(entry!.senses[0]!.example_en).toBe("We start.");
    expect(forms.map((f) => f.form)).toEqual(["anfangen", "fängt an", "angefangen"]);
  });

  it("reads verb flags from categories, raw glosses, and no gender for non-nouns", () => {
    const { entry } = parse(kaikki.gehen);
    expect(entry).toMatchObject({ gender: null, plural: null, flags: ["aux-sein"] });
    expect(entry!.senses[0]!.gloss).toBe("(intransitive) to go");
  });

  it("finds the gender in tags, and skips other languages and broken lines", () => {
    expect(parse({ ...kaikki.hund, head_templates: [], tags: ["feminine"] }).entry!.gender).toBe("f");
    expect(parse(kaikki.english)).toEqual({ entry: null, forms: [] });
    expect(parseLine("not json")).toEqual({ entry: null, forms: [] });
    expect(parse({ lang_code: "de", pos: "noun" })).toEqual({ entry: null, forms: [] });
  });
});

describe("parseFrequencyLine", () => {
  it("reads 'word count' and lowercases the word", () => {
    expect(parseFrequencyLine("Ich 1234\r")).toEqual({ word: "ich", count: 1234 });
    expect(parseFrequencyLine("broken")).toBeNull();
    expect(parseFrequencyLine("a b c")).toBeNull();
    expect(parseFrequencyLine("x -3")).toBeNull();
  });
});
