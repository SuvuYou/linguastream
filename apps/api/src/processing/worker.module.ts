import { Module } from "@nestjs/common";
import { GeminiClient } from "../ai/gemini.client";
import { DictionaryRepository } from "../dictionary/dictionary.repository";
import { GeminiWordAi, WORD_AI } from "../dictionary/word-ai";
import { WordPackRepository } from "../dictionary/word-pack.repository";
import { WordPackService } from "../dictionary/word-pack.service";
import { VocabularyRepository } from "../vocabulary/vocabulary.repository";
import { SpendLimiter, clockProvider } from "../usage/spend-limiter";
import { UsageStore, redisClientProvider } from "../usage/usage-store";
import { ProcessingRepository } from "./processing.repository";
import { ProcessingWorker } from "./processing-worker";
import { TrackProcessor, stepHandlersProvider } from "./track-processor";

@Module({
  providers: [
    ProcessingRepository,
    TrackProcessor,
    stepHandlersProvider,
    ProcessingWorker,
    redisClientProvider,
    UsageStore,
    clockProvider,
    SpendLimiter,
    GeminiClient,
    DictionaryRepository,
    WordPackRepository,
    WordPackService,
    VocabularyRepository,
    { provide: WORD_AI, useClass: GeminiWordAi },
  ],
})
export class WorkerModule {}
