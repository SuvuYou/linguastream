import { Controller, Get, Inject, Logger, NotFoundException, Res } from "@nestjs/common";
import { lookupWordRoute, type ApiError, type RequestParams, type WordLookup } from "@linguastream/contracts";
import type { Response } from "express";
import type { AuthUser } from "../auth/auth-user";
import { CurrentUser } from "../auth/current-user.decorator";
import { ValidParams } from "../http/valid-input.decorators";
import { WordLookupService } from "./word-lookup.service";

export const LOOKUP_BUDGET_MS = 200;

@Controller("videos")
export class WordLookupController {
  private readonly logger = new Logger("WordLookup");

  constructor(@Inject(WordLookupService) private readonly lookups: WordLookupService) {}

  @Get(":videoId/lines/:index/words/:i")
  async lookup(
    @CurrentUser() user: AuthUser,
    @ValidParams(lookupWordRoute) params: RequestParams<typeof lookupWordRoute>,
    @Res({ passthrough: true }) res: Response,
  ): Promise<WordLookup> {
    const started = performance.now();
    const result = await this.lookups.lookup({ userId: user.id, ...params });
    const ms = Math.round(performance.now() - started);
    res.setHeader("Server-Timing", `lookup;dur=${ms}`);
    if (ms > LOOKUP_BUDGET_MS) this.logger.warn(`Word lookup took ${ms} ms (budget ${LOOKUP_BUDGET_MS} ms)`);
    else this.logger.debug(`Word lookup ${ms} ms`);
    if (!result) throw new NotFoundException({ error: "Word not found" } satisfies ApiError);
    return result;
  }
}
