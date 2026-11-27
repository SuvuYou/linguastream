import { CHUNK_WORDS, OVERLAP_WORDS, punctuateWords } from "./punctuate";

const words = (n: number) => Array.from({ length: n }, (_, k) => `wort${k}`);
const yes = async () => true;

function capitaliseEvery(n: number) {
  return async (text: string) =>
    text
      .split("\n\n")
      .at(-1)!
      .split(" ")
      .map((w, k) => (k % n === 0 ? w[0]!.toUpperCase() + w.slice(1) : w) + ((k + 1) % n === 0 ? "." : ""))
      .join(" ");
}

describe("punctuateWords", () => {
  it("punctuates in overlapping chunks and keeps each chunk's own edits once", async () => {
    const input = words(CHUNK_WORDS + 200);
    const punctuate = vi.fn(capitaliseEvery(10));
    const { edits, report } = await punctuateWords(input, punctuate, yes);

    expect(punctuate).toHaveBeenCalledTimes(2);
    expect(punctuate.mock.calls[1]![0].split(" ")[0]).toBe(`wort${CHUNK_WORDS - OVERLAP_WORDS}`);
    expect(report).toEqual({ status: "done", chunks: 2, rejected: 0, failed: 0, salvagedEdits: 0 });
    const indexes = edits.map((e) => e.i);
    expect(new Set(indexes).size).toBe(indexes.length);
    expect(Math.max(...indexes)).toBeLessThan(input.length);
  });

  it("retries once with a note naming the changed words, then accepts", async () => {
    const punctuate = vi
      .fn<(text: string) => Promise<string>>()
      .mockResolvedValueOnce("Eins zwei drei falsch.")
      .mockResolvedValueOnce("Eins zwei drei vier.");
    const { edits, report } = await punctuateWords(["eins", "zwei", "drei", "vier"], punctuate, yes);

    expect(punctuate.mock.calls[1]![0]).toContain('"vier" → "falsch."');
    expect(report.status).toBe("done");
    expect(edits.at(-1)).toEqual({ i: 3, after: ".", sentenceEnd: true });
  });

  it("keeps the salvaged punctuation when both answers change words", async () => {
    const punctuate = vi.fn(async () => "Eins, zwei drei falsch.");
    const { edits, report } = await punctuateWords(["eins", "zwei", "drei", "vier"], punctuate, yes);
    expect(report).toMatchObject({ status: "partial", rejected: 1, salvagedEdits: 1 });
    expect(edits).toEqual([{ i: 0, after: ",", casing: "Eins" }]);
  });

  it("leaves a chunk as captured when the model can't be reached", async () => {
    const punctuate = vi.fn(async () => {
      throw new Error("timeout");
    });
    const { edits, report } = await punctuateWords(words(10), punctuate, yes);
    expect(punctuate).toHaveBeenCalledTimes(2);
    expect(edits).toEqual([]);
    expect(report).toMatchObject({ status: "partial", failed: 1 });
  });

  it("stops before a chunk once the month's spend cap is reached", async () => {
    const punctuate = vi.fn(capitaliseEvery(10));
    const none = await punctuateWords(words(10), punctuate, async () => false);
    expect(none.report.status).toBe("skipped_cap");
    expect(punctuate).not.toHaveBeenCalled();

    const canSpend = vi.fn<() => Promise<boolean>>().mockResolvedValueOnce(true).mockResolvedValue(false);
    const some = await punctuateWords(words(CHUNK_WORDS + 5), punctuate, canSpend);
    expect(some.report).toMatchObject({ status: "partial", chunks: 1 });
  });
});
