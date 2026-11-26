import { Module } from "@nestjs/common";
import { DefinitionController } from "./definition.controller";
import { DefinitionService } from "./definition.service";
import { GeminiClient } from "./gemini.client";

@Module({
  controllers: [DefinitionController],
  providers: [DefinitionService, GeminiClient],
})
export class DefinitionModule {}
