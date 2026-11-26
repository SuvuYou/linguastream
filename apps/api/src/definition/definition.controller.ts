import { Controller, Get } from "@nestjs/common";
import {
  getWordDefinitionRoute,
  type RequestQuery,
  type WordDefinition,
} from "@linguastream/contracts";
import { RateLimit } from "../http/rate-limit";
import { ValidQuery } from "../http/valid-input.decorators";
import { DefinitionService } from "./definition.service";

@Controller("definition")
export class DefinitionController {
  constructor(private readonly definitions: DefinitionService) {}

  @Get()
  @RateLimit()
  define(
    @ValidQuery(getWordDefinitionRoute) query: RequestQuery<typeof getWordDefinitionRoute>,
  ): Promise<WordDefinition> {
    return this.definitions.define(query);
  }
}
