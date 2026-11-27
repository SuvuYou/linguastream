import { describe, expect, it, vi } from "vitest";
import {
  CONTEXT_LINES,
  translateLines,
  type SourceLine,
  type TranslatedLine,
  type TranslationRequest,
  type Translator,
} from "./translate";

const source = (count: number, translated: number[] = []): SourceLine[] =>
  Array.from({ length: count }, (_, i) => ({
    lineId: `line-${i}`,
    index: i,
    text: `Zeile ${i}`,
    translated: translated.includes(i),
  }));

const echo: Translator = async (request) => ({
  translations: request.lines.map((line) => line.replace("Zeile", "Рядок")),
  costMicroUsd: 10,
});

function setup(translate: Translator = echo, options: { canSpend?: () => Promise<boolean>; chunkLines?: number; concurrency?: number } = {}) {
  const saved: TranslatedLine[] = [];
  const requests: TranslationRequest[] = [];
  const deps = {
    translate: vi.fn<Translator>(async (request) => {
      requests.push(request);
      return translate(request);
    }),
    canSpend: options.canSpend ?? (async () => true),
    save: vi.fn(async (lines: TranslatedLine[]) => {
      saved.push(...lines);
    }),
    sourceLanguage: "de",
    targetLanguage: "uk",
    chunkLines: options.chunkLines ?? 4,
    concurrency: options.concurrency ?? 1,
  };
  return { deps, saved, requests };
}

describe("translateLines", () => {
  it("sends numbered chunks with the lines around them as context and saves one translation per line", async () => {
    const { deps, saved, requests } = setup();
    const report = await translateLines(source(10), deps);

    expect(report).toEqual({ status: "ready", errorCode: null, translatedLines: 10, chunks: 3, calls: 3, costMicroUsd: 30 });
    expect(requests.map((r) => r.lines.length)).toEqual([4, 4, 2]);
    expect(requests[1]).toEqual({
      lines: ["Zeile 4", "Zeile 5", "Zeile 6", "Zeile 7"],
      before: ["Zeile 1", "Zeile 2", "Zeile 3"],
      after: ["Zeile 8", "Zeile 9"],
      sourceLanguage: "de",
      targetLanguage: "uk",
    });
    expect(requests[0]!.before).toEqual([]);
    expect(requests[0]!.after).toHaveLength(CONTEXT_LINES);
    expect(saved).toHaveLength(10);
    expect(saved[7]).toEqual({ lineId: "line-7", text: "Рядок 7" });
  });

  it("only sends lines that have no translation yet, keeping their neighbours as context", async () => {
    const { deps, requests } = setup();
    const report = await translateLines(source(8, [0, 1, 2, 5]), deps);

    expect(requests.map((r) => r.lines)).toEqual([["Zeile 3", "Zeile 4"], ["Zeile 6", "Zeile 7"]]);
    expect(requests[0]!.before).toEqual(["Zeile 0", "Zeile 1", "Zeile 2"]);
    expect(requests[0]!.after).toEqual(["Zeile 5", "Zeile 6", "Zeile 7"]);
    expect(report).toMatchObject({ status: "ready", translatedLines: 8, chunks: 2 });
  });

  it("does nothing when every line is translated", async () => {
    const { deps } = setup();
    expect(await translateLines(source(3, [0, 1, 2]), deps)).toMatchObject({ status: "ready", chunks: 0, calls: 0 });
    expect(await translateLines([], deps)).toMatchObject({ status: "ready", translatedLines: 0 });
    expect(deps.translate).not.toHaveBeenCalled();
  });

  it("asks again with a note when the answer has the wrong number of lines", async () => {
    let first = true;
    const { deps, requests, saved } = setup(async (request) => {
      if (first) {
        first = false;
        return { translations: ["zu wenig"], costMicroUsd: 5 };
      }
      return echo(request);
    });
    const report = await translateLines(source(3), deps);

    expect(report).toMatchObject({ status: "ready", calls: 2, costMicroUsd: 15 });
    expect(requests[1]!.wrongAnswer).toEqual({ received: 1 });
    expect(saved.map((l) => l.text)).toEqual(["Рядок 0", "Рядок 1", "Рядок 2"]);
  });

  it("splits a chunk in half when the second answer is still wrong", async () => {
    const { deps, requests, saved } = setup(async (request) =>
      request.lines.length > 2 ? { translations: [], costMicroUsd: 1 } : echo(request),
    );
    const report = await translateLines(source(4), deps);

    expect(requests.map((r) => r.lines.length)).toEqual([4, 4, 2, 2]);
    expect(requests[2]!.after).toEqual(["Zeile 2", "Zeile 3"]);
    expect(requests[3]!.before).toEqual(["Zeile 0", "Zeile 1"]);
    expect(report).toMatchObject({ status: "ready", translatedLines: 4, calls: 4 });
    expect(saved).toHaveLength(4);
  });

  it("fails as internal when a single line can't be translated, keeping what was done and starting nothing new", async () => {
    const { deps, saved } = setup(
      async (request) => (request.lines.includes("Zeile 4") ? { translations: [], costMicroUsd: 0 } : echo(request)),
      { chunkLines: 2 },
    );
    const report = await translateLines(source(10), deps);

    expect(report).toMatchObject({ status: "failed", errorCode: "internal", translatedLines: 4, chunks: 5 });
    expect(saved.map((l) => l.lineId)).toEqual(["line-0", "line-1", "line-2", "line-3"]);
  });

  it("retries a provider error once, then fails", async () => {
    const translate = vi
      .fn<Translator>()
      .mockRejectedValueOnce(new Error("Gemini failed"))
      .mockImplementationOnce(echo)
      .mockRejectedValue(new Error("Gemini failed"));
    const { deps, requests } = setup(translate, { chunkLines: 2 });
    const report = await translateLines(source(4), deps);

    expect(requests[1]!.wrongAnswer).toBeUndefined();
    expect(report).toMatchObject({ status: "failed", errorCode: "internal", translatedLines: 2, calls: 4 });
  });

  it("stops at the spend cap and reports it", async () => {
    let budget = 2;
    const { deps } = setup(echo, { canSpend: async () => budget-- > 0, chunkLines: 2 });
    const report = await translateLines(source(6), deps);

    expect(report).toMatchObject({ status: "failed", errorCode: "spend_cap", translatedLines: 4, calls: 2 });
  });

  it("runs at most the given number of chunks at once", async () => {
    let running = 0;
    let peak = 0;
    const { deps } = setup(
      async (request) => {
        running++;
        peak = Math.max(peak, running);
        await new Promise((resolve) => setTimeout(resolve, 5));
        running--;
        return echo(request);
      },
      { chunkLines: 1, concurrency: 3 },
    );
    const report = await translateLines(source(8), deps);

    expect(peak).toBe(3);
    expect(report).toMatchObject({ status: "ready", translatedLines: 8, calls: 8 });
  });
});
