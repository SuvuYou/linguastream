import { Logger } from "@nestjs/common";
import { afterEach, describe, expect, it, vi } from "vitest";
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
});
