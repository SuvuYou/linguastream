import { joinCandidates, joinEdits, type VerbLexicon } from "./join-rule";

const words = "Wir haben Flugzeuge. wir haben z.B. viele am 17. september ich... und dann. iPhone Ja. und freut mich. bin da".split(" ");

describe("join rule", () => {
  it("finds a full stop before a lowercase word, but not abbreviations, ordinals, ellipses or brand names", () => {
    expect(joinCandidates(words).map((k) => words[k])).toEqual(["Flugzeuge.", "Ja.", "mich."]);
  });

  it("does nothing without a verb lexicon", async () => {
    expect(await joinEdits(words, null)).toEqual([]);
  });

  it("removes the full stop unless the next word can be a verb", async () => {
    const lexicon: VerbLexicon = { canBeVerb: async (form) => ["bin", "wird", "macht"].includes(form) };
    const edits = await joinEdits(words, lexicon);
    expect(edits.map((e) => [words[e.i], e.after])).toEqual([
      ["Flugzeuge.", ""],
      ["Ja.", ""],
    ]);
    expect(edits.every((e) => e.join && !e.sentenceEnd)).toBe(true);
  });

  it("keeps closing quotes when it removes the full stop", async () => {
    const lexicon: VerbLexicon = { canBeVerb: async () => false };
    expect(await joinEdits(["„gut“.", "und"], lexicon)).toEqual([{ i: 0, after: "“", join: true }]);
  });
});
