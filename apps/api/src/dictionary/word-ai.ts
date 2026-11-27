import { Inject, Injectable } from "@nestjs/common";
import { GeminiClient } from "../ai/gemini.client";
import {
  glossInstruction,
  glossMessage,
  missingWordInstruction,
  missingWordMessage,
  parseGlosses,
  parseMissingWords,
  type GlossItem,
  type MissingWordAnswer,
  type MissingWordItem,
} from "../ai/prompts/glosses";

export interface WordAi {
  translateGlosses(items: GlossItem[], source: string, target: string): Promise<Map<number, string>>;
  describeMissing(items: MissingWordItem[], source: string, target: string): Promise<Map<number, MissingWordAnswer>>;
}

export const WORD_AI = Symbol("WORD_AI");

@Injectable()
export class GeminiWordAi implements WordAi {
  constructor(@Inject(GeminiClient) private readonly gemini: Pick<GeminiClient, "generateText">) {}

  async translateGlosses(items: GlossItem[], source: string, target: string) {
    const answer = await this.gemini.generateText(glossMessage(items), {
      systemInstruction: glossInstruction(source, target),
      temperature: 0,
      responseMimeType: "application/json",
    });
    return parseGlosses(answer, items.length);
  }

  async describeMissing(items: MissingWordItem[], source: string, target: string) {
    const answer = await this.gemini.generateText(missingWordMessage(items), {
      systemInstruction: missingWordInstruction(source, target),
      temperature: 0,
      responseMimeType: "application/json",
    });
    return parseMissingWords(answer, items.length);
  }
}
