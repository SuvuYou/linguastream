import { Logger } from "@nestjs/common";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProcessingRepository } from "../processing.repository";
import { TranslationProviderError, type SourceLine, type Translator } from "../translate/translate";
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
    saveTranslationProgress: vi.fn(async () => {}),
  };
  const report = { progress: vi.fn(async () => {}), translationFailed: vi.fn(async () => {}) };
  const handlers = createStepHandlers({
    punctuate: vi.fn(),
    lexicon: null,
    analyse: vi.fn(),
    translate:
      translate ??
      (async (request) => ({ translations: request.lines.map((l) => `uk:${l}`), costMicroUsd: 1234 })),
    retryDelayMs: 0,
  });
  const context: StepContext = {
    trackId: "track-1",
    repository: repository as unknown as ProcessingRepository,
    spend: { canSpend: async () => true, record: async () => {} },
    report,
  };
  return { run: () => handlers.translate!(context), repository, report };
}

afterEach(() => vi.restoreAllMocks());

describe("translate step", () => {
  it("translates into the owner's native language, reports progress and logs the cost without any text", async () => {
    const log = vi.spyOn(Logger.prototype, "log").mockImplementation(() => {});
    const { run, repository, report } = setup({ sourceLanguage: "de", targetLanguage: "uk" });
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
      totalLines: 2,
      chunks: 1,
      calls: 1,
      costMicroUsd: 1234,
    });
    expect(report.progress.mock.calls).toEqual([
      [0, 2],
      [2, 2],
    ]);
    expect(repository.saveTranslationProgress).toHaveBeenCalledWith("translation-1", 2);
    expect(report.translationFailed).not.toHaveBeenCalled();
    const messages = log.mock.calls.map((c) => String(c[0]));
    expect(messages).toEqual([
      "Track track-1 → uk: translating 2 of 2 lines",
      "Track track-1 → uk: ready, 2/2 lines, 1 chunks, 1 calls, $0.0012",
    ]);
    expect(messages.join()).not.toMatch(/Hallo|willkommen/);
  });

  it("finishes the step with a failed translation instead of failing the track, and says why", async () => {
    vi.spyOn(Logger.prototype, "log").mockImplementation(() => {});
    const warn = vi.spyOn(Logger.prototype, "warn").mockImplementation(() => {});
    const { run, repository, report } = setup({ sourceLanguage: "de", targetLanguage: "uk" }, async () => {
      throw new TranslationProviderError("gemini-3.5-flash 503", true);
    });
    await expect(run()).resolves.toBeUndefined();
    expect(repository.finishTranslation).toHaveBeenCalledWith(
      "translation-1",
      expect.objectContaining({ status: "failed", errorCode: "provider_unavailable", translatedLines: 0 }),
    );
    expect(report.translationFailed).toHaveBeenCalledWith("provider_unavailable");
    expect(warn.mock.calls.map((c) => String(c[0]))).toEqual([
      "Track track-1 → uk: lines 0–1, try 1 failed: gemini-3.5-flash 503",
      "Track track-1 → uk: lines 0–1, try 2 failed: gemini-3.5-flash 503",
      "Track track-1 → uk: failed (provider_unavailable), 0/2 lines, 1 chunks, 2 calls, $0.0000",
    ]);
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
