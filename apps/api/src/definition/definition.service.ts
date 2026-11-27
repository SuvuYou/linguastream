import { BadGatewayException, Inject, Injectable, Logger } from "@nestjs/common";
import {
  type ApiError,
  type RequestQuery,
  type WordDefinition,
  type getWordDefinitionRoute,
} from "@linguastream/contracts";
import { GeminiClient } from "../ai/gemini.client";
import { definitionInstruction, definitionMessage, parseDefinition } from "../ai/prompts/definition";
import { UsageService } from "../usage/usage.service";
import { UsersRepository } from "../users/users.repository";

type DefinitionQuery = RequestQuery<typeof getWordDefinitionRoute>;

const FAILED = { error: "Failed to generate definition" } satisfies ApiError;

const FALLBACK_LANGUAGE = "en";

@Injectable()
export class DefinitionService {
  private readonly logger = new Logger(DefinitionService.name);

  constructor(
    @Inject(GeminiClient) private readonly gemini: GeminiClient,
    @Inject(UsageService) private readonly usage: UsageService,
    @Inject(UsersRepository) private readonly users: UsersRepository,
  ) {}

  async define(userId: string, query: DefinitionQuery): Promise<WordDefinition> {
    await this.usage.startAiCall(userId);
    const answerLanguage = (await this.users.findProfile(userId))?.nativeLanguage ?? FALLBACK_LANGUAGE;
    let text: string;
    try {
      text = await this.gemini.generateText(definitionMessage(query), {
        systemInstruction: definitionInstruction(query.lang, answerLanguage),
        responseMimeType: "application/json",
      });
    } catch {
      throw new BadGatewayException(FAILED);
    }

    const definition = parseDefinition(text);
    if (!definition) {
      this.logger.warn("Gemini's answer is not a valid definition");
      throw new BadGatewayException(FAILED);
    }
    return definition;
  }
}
