import { Module } from "@nestjs/common";
import { UsageModule } from "../usage/usage.module";
import { DefinitionController } from "./definition.controller";
import { DefinitionService } from "./definition.service";
import { GeminiClient } from "./gemini.client";

@Module({
  imports: [UsageModule],
  controllers: [DefinitionController],
  providers: [DefinitionService, GeminiClient],
})
export class DefinitionModule {}
