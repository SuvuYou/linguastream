import { Module } from "@nestjs/common";
import { VocabularyController } from "./vocabulary.controller";
import { VocabularyRepository } from "./vocabulary.repository";

@Module({
  controllers: [VocabularyController],
  providers: [VocabularyRepository],
  exports: [VocabularyRepository],
})
export class VocabularyModule {}
