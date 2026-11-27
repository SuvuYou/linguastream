import { applyEdit, deriveEdits, mergeEdits, splitLongRuns, splitToken, type Edit } from "./align";

const cap = "ich weiß nicht ob das geht aber wir versuchen es".split(" ");
const apply = (words: string[], edits: Edit[]) => {
  const byI = new Map(edits.map((e) => [e.i, e]));
  return words.map((w, k) => applyEdit(w, byI.get(k)));
};

describe("deriveEdits", () => {
  it("accepts punctuation and capitals only, recording sentence ends", () => {
    const r = deriveEdits(cap, "Ich weiß nicht, ob das geht. Aber wir versuchen es.");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(apply(cap, r.edits).join(" ")).toBe("Ich weiß nicht, ob das geht. Aber wir versuchen es.");
    expect(r.edits.filter((e) => e.sentenceEnd).map((e) => e.i)).toEqual([5, 9]);
  });

  it("rejects changed, dropped and added words", () => {
    const changed = deriveEdits(cap, "Ich weiß nicht, ob das klappt. Aber wir versuchen es.");
    expect(changed).toMatchObject({ ok: false, changes: [{ kind: "changed", i: 5, captured: "geht", returned: "klappt." }] });
    const dropped = deriveEdits(cap, "Ich weiß nicht, ob das geht. Wir versuchen es.");
    expect(dropped).toMatchObject({ ok: false, changes: [{ kind: "dropped", i: 6, captured: "aber" }] });
    const added = deriveEdits(cap, "Ich weiß nicht, ob das geht. Aber wir versuchen es doch.");
    expect(added).toMatchObject({ ok: false, changes: [{ kind: "added", afterI: 9, returned: "doch." }] });
  });

  it("glues the model's free-standing dash to the previous word", () => {
    expect(deriveEdits(["das", "ist", "gut"], "Das ist – gut.").ok).toBe(true);
  });

  it("leaves captured punctuation-only tokens (speaker dashes, >>) out of the comparison", () => {
    const c = ["-", "Kommst", "du?", "-", "Ja,", "gleich."];
    expect(deriveEdits(c, "– Kommst du? – Ja, gleich.").ok).toBe(true);
    const r = deriveEdits(c, "Kommst du? Ja, gleich.");
    expect(r.ok && r.edits.map((e) => e.i)).toEqual([2, 5]);
    expect(deriveEdits([">>", "yeah", "right"], "Yeah, right.").ok).toBe(true);
  });

  it("salvages the punctuation of unchanged words from a rejected answer, never replacing a word", () => {
    const r = deriveEdits(cap, "Ich weiß nicht, ob das klappt. Aber wir versuchen es.");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(apply(cap, r.salvaged).join(" ")).toBe("Ich weiß nicht, ob das geht Aber wir versuchen es.");

    const worse = deriveEdits(cap, "Ich weiß, ob das klappt. Wir versuchen es doch.");
    if (worse.ok) throw new Error("expected a rejection");
    apply(cap, worse.salvaged).forEach((w, k) => expect(splitToken(w).core.toLowerCase()).toBe(cap[k]));
  });
});

describe("splitToken", () => {
  it("splits leading and trailing punctuation from the word", () => {
    expect(splitToken("„Hallo,")).toEqual({ before: "„", core: "Hallo", after: "," });
    expect(splitToken("geht’s?")).toEqual({ before: "", core: "geht’s", after: "?" });
  });
});

describe("splitLongRuns", () => {
  const never = () => false;

  it("splits a long run at the longest pause, at least 10 words in, without visible marks", () => {
    const words = Array.from({ length: 50 }, (_, k) => `w${k}`);
    const times = words.map((_, k) => k * 300 + (k > 22 ? 2000 : 0));
    expect(splitLongRuns(words, times, never)).toEqual([{ i: 22, sentenceEnd: true, pause: true }]);
  });

  it("leaves runs up to 40 words alone and restarts after a sentence end", () => {
    const forty = Array.from({ length: 40 }, (_, k) => `w${k}`);
    expect(splitLongRuns(forty, forty.map((_, k) => k * 300), never)).toEqual([]);
    const words = [...Array(30).fill("a"), "b.", ...Array(30).fill("c")];
    expect(splitLongRuns(words, words.map((_, k) => k * 300), (k) => words[k] === "b.")).toEqual([]);
  });

  it("keeps splitting a very long wall until no run is over 40 words", () => {
    const words = Array.from({ length: 500 }, (_, k) => `w${k}`);
    const splits = splitLongRuns(words, words.map((_, k) => k * 300 + (k % 17 === 0 ? 900 : 0)), never);
    const ends = [-1, ...splits.map((s) => s.i), 499];
    const lengths = ends.slice(1).map((e, k) => e - ends[k]!);
    expect(Math.max(...lengths)).toBeLessThanOrEqual(40);
  });
});

describe("mergeEdits", () => {
  it("combines edits on the same word and keeps them ordered", () => {
    expect(mergeEdits([{ i: 3, after: "," }, { i: 1, casing: "Ich" }], [{ i: 3, sentenceEnd: true, pause: true }])).toEqual([
      { i: 1, casing: "Ich" },
      { i: 3, after: ",", sentenceEnd: true, pause: true },
    ]);
  });
});
