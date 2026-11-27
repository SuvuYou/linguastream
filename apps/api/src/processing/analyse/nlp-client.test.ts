import { ProcessingError } from "../processing-error";
import { NLP_BATCH_SENTENCES, nlpAnalyser } from "./nlp-client";

const tok = { start: 0, text: "Hallo", lemma: "hallo", pos: "INTJ", tag: "ITJ", morph: "", dep: "ROOT", head: 0 };

afterEach(() => vi.unstubAllGlobals());

describe("nlpAnalyser", () => {
  it("posts the sentences in batches and returns one token list per sentence", async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const { sentences } = JSON.parse(String(init.body)) as { sentences: string[] };
      return new Response(JSON.stringify({ model: "de_core_news_sm", sentences: sentences.map(() => [tok]) }));
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await nlpAnalyser("http://nlp.test")(Array.from({ length: NLP_BATCH_SENTENCES + 1 }, () => "Hallo"));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]![0]).toBe("http://nlp.test/analyse");
    expect(result).toHaveLength(NLP_BATCH_SENTENCES + 1);
    expect(result[0]).toEqual([tok]);
  });

  it("fails retryably when the service is down, errors or answers something else", async () => {
    const answers = [
      () => Promise.reject(new TypeError("fetch failed")),
      async () => new Response("boom", { status: 500 }),
      async () => new Response(JSON.stringify({ model: "x", sentences: [] })),
      async () => new Response(JSON.stringify({ model: "x", sentences: [[{ ...tok, head: -1 }]] })),
    ];
    for (const answer of answers) {
      vi.stubGlobal("fetch", vi.fn(answer));
      const error = await nlpAnalyser("http://nlp.test")(["Hallo"]).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ProcessingError);
      expect(error).toMatchObject({ code: "internal", retryable: true });
    }
  });
});
