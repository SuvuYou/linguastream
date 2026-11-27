import { describe, expect, it, vi } from "vitest";
import { translationInstruction, translationMessage } from "../../ai/prompts/translation";
import { geminiTranslator, type TextGenerator } from "./gemini-translator";
import { GeminiCallError } from "../../ai/gemini.client";
import { TranslationAnswerError, TranslationProviderError } from "./translate";

const request = {
  lines: ["und dann sind wir", "zum Hafen gegangen."],
  before: ["Am Morgen war es kalt."],
  after: [],
  sourceLanguage: "de",
  targetLanguage: "uk",
};

describe("geminiTranslator", () => {
  it("calls Gemini with JSON output at temperature 0 and returns the call's cost", async () => {
    const generateText = vi.fn<TextGenerator["generateText"]>(async (_prompt, options) => {
      options.onCost(120);
      options.onCost(30);
      return '["а потім ми", "пішли до гавані."]';
    });
    const answer = await geminiTranslator({ generateText })(request);

    expect(answer).toEqual({ translations: ["а потім ми", "пішли до гавані."], costMicroUsd: 150 });
    expect(generateText).toHaveBeenCalledWith(translationMessage(request), {
      systemInstruction: translationInstruction("de", "uk"),
      temperature: 0,
      responseMimeType: "application/json",
      onCost: expect.any(Function),
    });
  });

  it("reports an answer with the wrong number of lines", async () => {
    const generateText = vi.fn<TextGenerator["generateText"]>(async () => '["nur eins"]');
    await expect(geminiTranslator({ generateText })(request)).rejects.toEqual(new TranslationAnswerError(2, 1));
  });

  it("turns a Gemini failure into a provider error that says whether to try again", async () => {
    const failing = (error: unknown) =>
      geminiTranslator({ generateText: vi.fn<TextGenerator["generateText"]>(async () => Promise.reject(error)) })(request);
    await expect(failing(new GeminiCallError("gemini-3.5-flash", 503, true))).rejects.toEqual(
      new TranslationProviderError("gemini-3.5-flash 503", true),
    );
    await expect(failing(new GeminiCallError("gemini-3.1-flash-lite", null, false))).rejects.toMatchObject({
      reason: "gemini-3.1-flash-lite error",
      retryable: false,
    });
    await expect(failing(new TypeError("x"))).rejects.toMatchObject({ reason: "TypeError", retryable: true });
  });
});
