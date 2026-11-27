import { BadGatewayException, Inject, Injectable, Logger } from "@nestjs/common";
import {
  WordDefinition,
  type ApiError,
  type RequestQuery,
  type getWordDefinitionRoute,
} from "@linguastream/contracts";
import { UsageService } from "../usage/usage.service";
import { GeminiClient } from "./gemini.client";

type DefinitionQuery = RequestQuery<typeof getWordDefinitionRoute>;

export function buildDefinitionPrompt({ word, lang, context }: DefinitionQuery): string {
  return `Given the ${lang} word "${word}" as used in this sentence: "${context}"

    The provided context comes from YouTube subtitles.
    It may:
    - lack punctuation,
    - start or end in the middle of a sentence.

    Find the complete sentence that contains the target word.

    Return ONLY valid JSON:

    {
      "definition": "...",
      "translation": "...",
      "context_sentence": "..."
    }

    Rules:
    - DO NOT change, replace, translate, or add any words to "context_sentence".
    - You may ONLY remove unrelated surrounding text and add punctuation/capitalization if necessary.
    - "definition" is a short english dictionary-style definition for THIS context.
    - "translation" is the closest English equivalent in THIS context.
    - Prefer a single word for translation.
    - If impossible, use the shortest natural phrase.`;
}

const FAILED = { error: "Failed to generate definition" } satisfies ApiError;

@Injectable()
export class DefinitionService {
  private readonly logger = new Logger(DefinitionService.name);

  constructor(
    @Inject(GeminiClient) private readonly gemini: GeminiClient,
    @Inject(UsageService) private readonly usage: UsageService,
  ) {}

  async define(userId: string, query: DefinitionQuery): Promise<WordDefinition> {
    await this.usage.startAiCall(userId);
    let text: string;
    try {
      text = await this.gemini.generateText(buildDefinitionPrompt(query), {
        responseMimeType: "application/json",
      });
    } catch {
      throw new BadGatewayException(FAILED);
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      json = undefined;
    }

    const parsed = WordDefinition.safeParse(json);
    if (!parsed.success) {
      this.logger.warn("Gemini's answer is not a valid definition");
      throw new BadGatewayException(FAILED);
    }
    return parsed.data;
  }
}
