import { parseTranslations, translationInstruction, translationMessage } from "../../ai/prompts/translation";
import type { Translator } from "./translate";

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
    const answer = await gemini.generateText(translationMessage(request), {
      systemInstruction: translationInstruction(request.sourceLanguage, request.targetLanguage),
      temperature: 0,
      responseMimeType: "application/json",
      onCost: (cost) => {
        costMicroUsd += cost;
      },
    });
    return { translations: parseTranslations(answer, request.lines.length), costMicroUsd };
  };
}
