import { Module } from "@nestjs/common";
import { GeminiClient } from "../ai/gemini.client";
import { UsageModule } from "../usage/usage.module";
import { UsersModule } from "../users/users.module";
import { DefinitionController } from "./definition.controller";
import { DefinitionService } from "./definition.service";

@Module({
  imports: [UsageModule, UsersModule],
  controllers: [DefinitionController],
  providers: [DefinitionService, GeminiClient],
})
export class DefinitionModule {}
