import { Controller, Get } from "@nestjs/common";
import {
  getWordDefinitionRoute,
  type RequestQuery,
  type WordDefinition,
} from "@linguastream/contracts";
import type { AuthUser } from "../auth/auth-user";
import { CurrentUser } from "../auth/current-user.decorator";
import { RateLimit } from "../http/rate-limit";
import { ValidQuery } from "../http/valid-input.decorators";
import { DefinitionService } from "./definition.service";

@Controller("definition")
export class DefinitionController {
  constructor(private readonly definitions: DefinitionService) {}

  @Get()
  @RateLimit()
  define(
    @CurrentUser() user: AuthUser,
    @ValidQuery(getWordDefinitionRoute) query: RequestQuery<typeof getWordDefinitionRoute>,
  ): Promise<WordDefinition> {
    return this.definitions.define(user.id, query);
  }
}
