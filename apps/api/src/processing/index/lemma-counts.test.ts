import { describe, expect, it } from "vitest";
import type { StoredWord } from "../analyse/analyse";
import { countLemmas, isCountedWord } from "./lemma-counts";

const w = (i: number, text: string, lemma: string | undefined, pos: string | undefined, extra: Partial<StoredWord> = {}): StoredWord => ({
  i,
  text,
  start_ms: i * 100,
  ...(lemma !== undefined && { lemma }),
  ...(pos !== undefined && { pos }),
  ...extra,
});

describe("countLemmas", () => {
  it("counts every occurrence of a word's lemma, most frequent first", () => {
    const lines = [
      { index: 0, words: [w(0, "Ich", "ich", "PRON"), w(1, "gehe", "gehen", "VERB"), w(2, "heute,", "heute", "ADV")] },
      { index: 1, words: [w(3, "du", "du", "PRON"), w(4, "gehst", "gehen", "VERB"), w(5, "auch.", "auch", "ADV")] },
    ];
    expect(countLemmas(lines)).toEqual([
      { lemma: "gehen", count: 2 },
      { lemma: "auch", count: 1 },
      { lemma: "du", count: 1 },
      { lemma: "heute", count: 1 },
      { lemma: "ich", count: 1 },
    ]);
  });

  it("leaves out names, punctuation, numbers, symbols, words without a lemma, and a verb's particle", () => {
    const lines = [
      {
        index: 0,
        words: [
          w(0, "Ich", "ich", "PRON"),
          w(1, "fange", "anfangen", "VERB"),
          w(2, "in", "in", "ADP"),
          w(3, "Hamburg", "Hamburg", "PROPN"),
          w(4, "an.", "anfangen", "ADP", { particle_of: 1 }),
          w(5, "17", "17", "NUM"),
          w(6, "–", "–", "PUNCT"),
          w(7, "€", "€", "SYM"),
          w(8, "gibt's", undefined, "X"),
          w(9, "äh", undefined, undefined),
          w(10, "123", "123", "NOUN"),
        ],
      },
    ];
    expect(countLemmas(lines)).toEqual([
      { lemma: "anfangen", count: 1 },
      { lemma: "ich", count: 1 },
      { lemma: "in", count: 1 },
    ]);
    expect(isCountedWord(w(0, "Hamburg", "Hamburg", "PROPN"))).toBe(false);
  });

  it("returns nothing for a track without analysed words", () => {
    expect(countLemmas([])).toEqual([]);
    expect(countLemmas([{ index: 0, words: [w(0, "Hallo", undefined, undefined)] }])).toEqual([]);
  });
});
