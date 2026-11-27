import { Logger } from "@nestjs/common";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrepareReport } from "../../dictionary/word-pack.service";
import type { ProcessingRepository } from "../processing.repository";
import { createStepHandlers, type StepContext } from "./index";

afterEach(() => vi.restoreAllMocks());

describe("index step", () => {
  it("replaces the video's lemma counts with the track's words, and logs only numbers", async () => {
    const log = vi.spyOn(Logger.prototype, "log").mockImplementation(() => {});
    const repository = {
      lineWords: vi.fn(async () => [
        {
          index: 0,
          words: [
            { i: 0, text: "Ich", start_ms: 0, lemma: "ich", pos: "PRON" },
            { i: 1, text: "gehe", start_ms: 100, lemma: "gehen", pos: "VERB" },
            { i: 2, text: "gehe", start_ms: 200, lemma: "gehen", pos: "VERB" },
            { i: 3, text: "Berlin.", start_ms: 300, lemma: "Berlin", pos: "PROPN" },
          ],
        },
      ]),
      replaceLemmaCounts: vi.fn(async () => {}),
    };
    const handlers = createStepHandlers({ punctuate: vi.fn(), lexicon: null, analyse: vi.fn(), translate: vi.fn() });
    const context: StepContext = {
      trackId: "track-1",
      repository: repository as unknown as ProcessingRepository,
      spend: { canSpend: async () => true, record: async () => {} },
    };

    await handlers.index!(context);

    expect(repository.replaceLemmaCounts).toHaveBeenCalledWith("track-1", [
      { lemma: "gehen", count: 2 },
      { lemma: "ich", count: 1 },
    ]);
    expect(log).toHaveBeenCalledWith("Track track-1: 2 lemmas, 3 words counted");
  });

  const context = (): StepContext => ({
    trackId: "track-1",
    repository: { lineWords: vi.fn(async () => []), replaceLemmaCounts: vi.fn(async () => {}) } as unknown as ProcessingRepository,
    spend: { canSpend: async () => true, record: async () => {} },
  });
  const report: PrepareReport = { translated: 4, described: 2, calls: 2, skipped: null, failures: 1 };
  const handlersWith = (prepare: (trackId: string) => Promise<PrepareReport>) =>
    createStepHandlers({ punctuate: vi.fn(), lexicon: null, analyse: vi.fn(), translate: vi.fn(), words: { prepare } });

  it("prepares word data after the counts and logs what it did", async () => {
    const log = vi.spyOn(Logger.prototype, "log").mockImplementation(() => {});
    const prepare = vi.fn(async () => report);
    const ctx = context();
    await handlersWith(prepare).index!(ctx);
    expect(prepare).toHaveBeenCalledWith("track-1", ctx.spend);
    expect(log).toHaveBeenCalledWith(
      "Track track-1: word data 2 missing words described, 4 glosses translated, 2 calls, 1 failed",
    );
  });

  it("stays quiet without a dictionary and never fails the track", async () => {
    const log = vi.spyOn(Logger.prototype, "log").mockImplementation(() => {});
    const warn = vi.spyOn(Logger.prototype, "warn").mockImplementation(() => {});
    await handlersWith(vi.fn(async () => ({ ...report, skipped: "not_imported" as const }))).index!(context());
    expect(log).toHaveBeenCalledTimes(1);
    await expect(handlersWith(vi.fn(async (): Promise<PrepareReport> => Promise.reject(new Error("db down")))).index!(context())).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Track track-1: word data failed"));
  });
});
