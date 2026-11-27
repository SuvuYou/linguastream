import { parseTranslations, translationInstruction, translationMessage } from "../../ai/prompts/translation";
import { GeminiCallError } from "../../ai/gemini.client";
import { TranslationProviderError, type Translator } from "./translate";

export interface TextGenerator {
  generateText(
    prompt: string,
    options: {
      systemInstruction: string;
      temperature: number;
      responseMimeType: "application/json";
      onCost: (costMicroUsd: number) => void;
    },
  ): Promise<string>;
}

export function geminiTranslator(gemini: TextGenerator): Translator {
  return async (request) => {
    let costMicroUsd = 0;
    let answer: string;
    try {
      answer = await gemini.generateText(translationMessage(request), {
        systemInstruction: translationInstruction(request.sourceLanguage, request.targetLanguage),
        temperature: 0,
        responseMimeType: "application/json",
        onCost: (cost) => {
          costMicroUsd += cost;
        },
      });
    } catch (err) {
      if (err instanceof GeminiCallError)
        throw new TranslationProviderError(`${err.model} ${err.status ?? "error"}`, err.retryable);
      throw new TranslationProviderError(err instanceof Error ? err.name : "unknown", true);
    }
    return { translations: parseTranslations(answer, request.lines.length), costMicroUsd };
  };
}
