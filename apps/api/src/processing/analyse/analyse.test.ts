import { analyseLines, lemmasOf, sentencesOf, type StoredLine } from "./analyse";
import type { NlpToken } from "./nlp-client";

const word = (i: number, text: string, end = false) => ({
  i,
  text,
  start_ms: i * 300,
  ...(end && { sentence_end: true as const }),
});

const token = (start: number, text: string, lemma: string, pos: string, dep: string, head: number, morph = ""): NlpToken => ({
  start,
  text,
  lemma,
  pos,
  tag: pos === "PUNCT" ? "$." : "X",
  morph,
  dep,
  head,
});

const lines = (): StoredLine[] => [
  { index: 0, words: [word(0, "Ich"), word(1, "fange"), word(2, "morgen")] },
  { index: 1, words: [word(3, "an.", true)] },
  { index: 2, words: [word(4, "Gibt's"), word(5, "Kaffee?", true)] },
];

const spacy = async (sentences: string[]): Promise<NlpToken[][]> => {
  expect(sentences).toEqual(["Ich fange morgen an.", "Gibt's Kaffee?"]);
  return [
    [
      token(0, "Ich", "ich", "PRON", "sb", 1, "Case=Nom|Person=1"),
      token(4, "fange", "fangen", "VERB", "ROOT", 1, "Person=1|Tense=Pres"),
      token(10, "morgen", "morgen", "ADV", "mo", 1),
      token(17, "an", "an", "ADP", "svp", 1),
      token(19, ".", "--", "PUNCT", "punct", 1),
    ],
    [
      token(0, "Gibt", "geben", "VERB", "ROOT", 0),
      token(4, "'s", "es", "PRON", "ep", 0),
      token(7, "Kaffee", "Kaffee", "NOUN", "oa", 0, "Case=Acc"),
      token(13, "?", "--", "PUNCT", "punct", 0),
    ],
  ];
};

describe("sentencesOf", () => {
  it("rebuilds sentences across lines from the sentence ends, with each word's offset", () => {
    const sentences = sentencesOf(lines());
    expect(sentences.map((s) => s.text)).toEqual(["Ich fange morgen an.", "Gibt's Kaffee?"]);
    expect(sentences[0]!.words.map((w) => w.offset)).toEqual([0, 4, 10, 17]);
  });

  it("keeps a trailing run without a sentence end as a sentence", () => {
    expect(sentencesOf([{ index: 0, words: [word(0, "noch"), word(1, "offen")] }]).map((s) => s.text)).toEqual([
      "noch offen",
    ]);
  });
});

describe("analyseLines", () => {
  it("gives each word the data of its main token and points heads at words", async () => {
    const [first, second, third] = await analyseLines(lines(), spacy);
    expect(first!.words[0]).toMatchObject({ lemma: "ich", pos: "PRON", morph: "Case=Nom|Person=1", dep: "sb", head: 1 });
    expect(third!.words[0]).toMatchObject({ text: "Gibt's", lemma: "geben", pos: "VERB", head: 4 });
    expect(third!.words[1]).toMatchObject({ lemma: "Kaffee", pos: "NOUN", head: 4 });
    expect(second!.words[0]).toMatchObject({ i: 3, text: "an.", start_ms: 900, sentence_end: true });
  });

  it("joins a separable verb's particle to the verb in both words", async () => {
    const [first, second] = await analyseLines(lines(), spacy);
    expect(first!.words[1]!.lemma).toBe("anfangen");
    expect(second!.words[0]).toMatchObject({ lemma: "anfangen", particle_of: 1 });
  });

  it("lists each line's distinct lemmas without punctuation or numbers", async () => {
    const analysed = await analyseLines(lines(), spacy);
    expect(analysed.map((l) => l.lemmas)).toEqual([["ich", "anfangen", "morgen"], ["anfangen"], ["geben", "Kaffee"]]);
    expect(
      lemmasOf([
        { i: 0, text: "17", start_ms: 0, lemma: "17", pos: "NUM" },
        { i: 1, text: "-", start_ms: 0, lemma: "--", pos: "PUNCT" },
        { i: 2, text: "Haus", start_ms: 0, lemma: "Haus", pos: "NOUN" },
        { i: 3, text: "Haus.", start_ms: 0, lemma: "Haus", pos: "NOUN" },
      ]),
    ).toEqual(["Haus"]);
  });

  it("doesn't call spaCy for a track without words", async () => {
    const analyse = vi.fn();
    expect(await analyseLines([{ index: 0, words: [] }], analyse)).toEqual([{ index: 0, words: [], lemmas: [] }]);
    expect(analyse).not.toHaveBeenCalled();
  });
});
