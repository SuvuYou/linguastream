import { looksPunctuated, tokensOf } from "./tokens";
import { normalise } from "./normalise";
import { readCues } from "../steps/parse-json3";

const event = (tStartMs: number, ...segs: [string, number?][]) => ({
  tStartMs,
  dDurationMs: 2000,
  segs: segs.map(([utf8, tOffsetMs]) => ({ utf8, ...(tOffsetMs !== undefined && { tOffsetMs }) })),
});
const json3 = (...events: object[]) => JSON.stringify({ events });

const noLlm = {
  punctuate: vi.fn(async () => {
    throw new Error("must not be called");
  }),
  canSpend: async () => true,
  lexicon: null,
};

describe("tokensOf", () => {
  it("gives every word its start time and line, merges bracket tags and glues pieces without a space", () => {
    const cues = readCues(
      json3(event(0, ["Guten"], [" Morgen", 400], [","]), event(2000, ["[", 0], [" __ ", 100], ["]", 200], [" ja", 300])),
    );
    expect(tokensOf(cues)).toEqual([
      { text: "Guten", startMs: 0, line: 0, tag: false },
      { text: "Morgen,", startMs: 400, line: 0, tag: false },
      { text: "[ __ ]", startMs: 2000, line: 1, tag: true },
      { text: "ja", startMs: 2300, line: 1, tag: false },
    ]);
  });

  it("calls a track unpunctuated below 2 sentence ends per 100 words", () => {
    expect(looksPunctuated([...Array(98).fill("a"), "b.", "c."])).toBe(true);
    expect(looksPunctuated([...Array(99).fill("a"), "b."])).toBe(false);
  });
});

describe("normalise", () => {
  it("keeps YouTube's punctuation, marks sentence ends and leaves tags in the text", async () => {
    const raw = json3(
      event(0, ["Hallo"], [" zusammen.", 300]),
      event(2000, ["[musik]"]),
      event(4000, ["Heute"], [" kochen", 200], [" wir?", 400]),
    );
    const { lines, normalisation } = await normalise(raw, noLlm);

    expect(lines.map((l) => l.text)).toEqual(["Hallo zusammen.", "[musik]", "Heute kochen wir?"]);
    expect(lines[0]!.words).toEqual([
      { i: 0, text: "Hallo", start_ms: 0 },
      { i: 1, text: "zusammen.", start_ms: 300, sentence_end: true },
    ]);
    expect(lines[1]!.words).toEqual([]);
    expect(normalisation).toMatchObject({
      version: 1,
      punctuated: true,
      punctuation: "not_needed",
      join_rule: "off",
      edits: [],
      sentence_ends: [1, 4],
    });
    expect(noLlm.punctuate).not.toHaveBeenCalled();
  });

  it("punctuates an unpunctuated track with the model and applies the edits per line", async () => {
    const raw = json3(event(0, ["ich weiß nicht"]), event(2000, ["ob das geht"]));
    const punctuate = vi.fn(async () => "Ich weiß nicht, ob das geht.");
    const { lines, normalisation } = await normalise(raw, { ...noLlm, punctuate });

    expect(lines.map((l) => l.text)).toEqual(["Ich weiß nicht,", "ob das geht."]);
    expect(normalisation.punctuated).toBe(false);
    expect(normalisation.punctuation).toMatchObject({ status: "done", chunks: 1 });
    expect(normalisation.sentence_ends).toEqual([5]);
  });

  it("splits a run of more than 40 words at the longest pause without changing the text", async () => {
    const words = Array.from({ length: 60 }, (_, k) => [` wort${k}`, k * 300 + (k >= 30 ? 3000 : 0)] as [string, number]);
    const raw = json3({ tStartMs: 0, dDurationMs: 30000, segs: words.map(([utf8, tOffsetMs]) => ({ utf8, tOffsetMs })) }, event(40000, ["Ende."]));
    const punctuate = vi.fn(async (text: string) => text);
    const { lines, normalisation } = await normalise(raw, { ...noLlm, punctuate, canSpend: async () => true });

    expect(lines[0]!.text).toBe(words.map(([w]) => w.trim()).join(" "));
    expect(normalisation.sentence_ends).toContain(29);
    expect(normalisation.edits).toContainEqual({ i: 29, sentenceEnd: true, pause: true });
    expect(lines[0]!.words[29]).toMatchObject({ text: "wort29", sentence_end: true });
  });

  it("joins wrongly split sentences when a verb lexicon is there", async () => {
    const raw = json3(event(0, ["Wir haben Flugzeuge."]), event(2000, ["und Schiffe."]));
    const { lines, normalisation } = await normalise(raw, {
      ...noLlm,
      lexicon: { canBeVerb: async () => false },
    });
    expect(lines.map((l) => l.text)).toEqual(["Wir haben Flugzeuge", "und Schiffe."]);
    expect(normalisation.join_rule).toBe("on");
    expect(normalisation.sentence_ends).toEqual([4]);
  });
});
