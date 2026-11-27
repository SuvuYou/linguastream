import { Logger } from "@nestjs/common";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProcessingRepository } from "../processing.repository";
import type { SourceLine, Translator } from "../translate/translate";
import { createStepHandlers, type StepContext } from "./index";

const lines: SourceLine[] = [
  { lineId: "l0", index: 0, text: "Hallo zusammen", translated: false },
  { lineId: "l1", index: 1, text: "und willkommen", translated: false },
];

function setup(target: { sourceLanguage: string; targetLanguage: string } | null, translate?: Translator) {
  const repository = {
    translationTarget: vi.fn(async () => target),
    startTranslation: vi.fn(async () => "translation-1"),
    translationLines: vi.fn(async () => lines),
    saveLineTranslations: vi.fn(async () => {}),
    finishTranslation: vi.fn(async () => {}),
  };
  const handlers = createStepHandlers({
    punctuate: vi.fn(),
    lexicon: null,
    analyse: vi.fn(),
    translate:
      translate ??
      (async (request) => ({ translations: request.lines.map((l) => `uk:${l}`), costMicroUsd: 1234 })),
  });
  const context: StepContext = {
    trackId: "track-1",
    repository: repository as unknown as ProcessingRepository,
    spend: { canSpend: async () => true, record: async () => {} },
  };
  return { run: () => handlers.translate!(context), repository };
}

afterEach(() => vi.restoreAllMocks());

describe("translate step", () => {
  it("translates into the owner's native language and logs the cost without any text", async () => {
    const log = vi.spyOn(Logger.prototype, "log").mockImplementation(() => {});
    const { run, repository } = setup({ sourceLanguage: "de", targetLanguage: "uk" });
    await run();

    expect(repository.startTranslation).toHaveBeenCalledWith("track-1", "uk");
    expect(repository.saveLineTranslations).toHaveBeenCalledWith("translation-1", [
      { lineId: "l0", text: "uk:Hallo zusammen" },
      { lineId: "l1", text: "uk:und willkommen" },
    ]);
    expect(repository.finishTranslation).toHaveBeenCalledWith("translation-1", {
      status: "ready",
      errorCode: null,
      translatedLines: 2,
      chunks: 1,
      calls: 1,
      costMicroUsd: 1234,
    });
    const message = String(log.mock.calls[0]![0]);
    expect(message).toBe("Track track-1 → uk: ready, 2/2 lines, 1 chunks, 1 calls, $0.0012");
    expect(message).not.toMatch(/Hallo|willkommen/);
  });

  it("finishes the step with a failed translation instead of failing the track", async () => {
    vi.spyOn(Logger.prototype, "log").mockImplementation(() => {});
    const { run, repository } = setup({ sourceLanguage: "de", targetLanguage: "uk" }, async () => {
      throw new Error("Gemini failed");
    });
    await expect(run()).resolves.toBeUndefined();
    expect(repository.finishTranslation).toHaveBeenCalledWith(
      "translation-1",
      expect.objectContaining({ status: "failed", errorCode: "internal", translatedLines: 0 }),
    );
  });

  it.each([
    [{ sourceLanguage: "de", targetLanguage: "de" }],
    [{ sourceLanguage: "de-DE", targetLanguage: "de" }],
    [null],
  ])("skips when there's nothing to translate into (%j)", async (target) => {
    const { run, repository } = setup(target);
    await run();
    expect(repository.startTranslation).not.toHaveBeenCalled();
  });
});
