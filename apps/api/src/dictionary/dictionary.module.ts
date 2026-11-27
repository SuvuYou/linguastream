import { Module } from "@nestjs/common";
import { GeminiClient } from "../ai/gemini.client";
import { UsageModule } from "../usage/usage.module";
import { VocabularyModule } from "../vocabulary/vocabulary.module";
import { DictionaryRepository } from "./dictionary.repository";
import { GeminiWordAi, WORD_AI } from "./word-ai";
import { WordLookupController } from "./word-lookup.controller";
import { WordLookupRepository } from "./word-lookup.repository";
import { WordLookupService } from "./word-lookup.service";
import { WordPackRepository } from "./word-pack.repository";
import { WordPackService } from "./word-pack.service";

@Module({
  imports: [UsageModule, VocabularyModule],
  controllers: [WordLookupController],
  providers: [
    WordLookupRepository,
    WordLookupService,
    DictionaryRepository,
    WordPackRepository,
    WordPackService,
    GeminiClient,
    { provide: WORD_AI, useClass: GeminiWordAi },
  ],
  exports: [WordPackService, DictionaryRepository],
})
export class DictionaryModule {}
