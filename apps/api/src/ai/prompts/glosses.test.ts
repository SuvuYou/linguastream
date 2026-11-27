import { describe, expect, it } from "vitest";
import {
  glossInstruction,
  glossMessage,
  missingWordInstruction,
  missingWordMessage,
  parseGlosses,
  parseMissingWords,
} from "./glosses";

describe("gloss translation prompt", () => {
  it("asks for short glosses in the target language for each numbered item", () => {
    expect(glossInstruction("de", "uk")).toContain("short English dictionary glosses of German words into Ukrainian");
    expect(JSON.parse(glossMessage([{ word: "Hund", pos: "noun", gloss: "dog", example: "Der Hund bellt." }]))).toEqual([
      { i: 0, word: "Hund", pos: "noun", gloss: "dog", example: "Der Hund bellt." },
    ]);
  });

  it("keeps valid answers by index and drops the rest", () => {
    expect(parseGlosses('[{"i":0,"text":" собака "},{"i":1,"text":""},{"i":9,"text":"x"}]', 2)).toEqual(
      new Map([[0, "собака"]]),
    );
    expect(parseGlosses('```json\n{"items":[{"i":1,"text":"але"}]}\n```', 2)).toEqual(new Map([[1, "але"]]));
    expect(parseGlosses("not json", 2).size).toBe(0);
    expect(parseGlosses('[{"i":"0","text":"x"}]', 2).size).toBe(0);
  });
});

describe("missing word prompt", () => {
  it("asks for a gloss, the kind of word, gender and compound parts", () => {
    const instruction = missingWordInstruction("de", "uk");
    expect(instruction).toContain("short Ukrainian dictionary-style gloss");
    expect(instruction).toContain('Schulterblick → ["Schulter", "Blick"]');
    expect(JSON.parse(missingWordMessage([{ word: "Schulterblick", example: "Erst der Schulterblick." }]))).toEqual([
      { i: 0, word: "Schulterblick", example: "Erst der Schulterblick." },
    ]);
  });

  it("cleans the answer: known kinds, gender only for nouns, trimmed parts", () => {
    const answer = JSON.stringify([
      { i: 0, gloss: " погляд через плече ", pos: "noun", gender: "m", parts: ["Schulter", " Blick", ""] },
      { i: 1, gloss: null, pos: "name", gender: "f", parts: null },
      { i: 2, gloss: "легіт", pos: "slang", gender: "x" },
      { i: 7, gloss: "out of range" },
    ]);
    expect(parseMissingWords(answer, 3)).toEqual(
      new Map([
        [0, { gloss: "погляд через плече", pos: "noun", gender: "m", parts: ["Schulter", "Blick"] }],
        [1, { gloss: null, pos: "name", gender: null, parts: [] }],
        [2, { gloss: "легіт", pos: null, gender: null, parts: [] }],
      ]),
    );
    expect(parseMissingWords("[1,2]", 3).size).toBe(0);
  });
});
