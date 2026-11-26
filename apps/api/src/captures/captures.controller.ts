import { Controller, Get, Headers, Inject, Post, Res } from "@nestjs/common";
import {
  EXTENSION_VERSION_HEADER,
  createCaptureRoute,
  lookupCaptureRoute,
  type CaptureCreated,
  type CaptureLookup,
  type RequestBody,
  type RequestQuery,
} from "@linguastream/contracts";
import type { Response } from "express";
import type { AuthUser } from "../auth/auth-user";
import { CurrentUser } from "../auth/current-user.decorator";
import { RateLimit } from "../http/rate-limit";
import { ValidBody, ValidQuery } from "../http/valid-input.decorators";
import { CapturesService } from "./captures.service";
import { MIN_EXTENSION_VERSION, assertSupportedVersion } from "./extension-version";

@Controller("captures")
export class CapturesController {
  constructor(
    private readonly captures: CapturesService,
    @Inject(MIN_EXTENSION_VERSION) private readonly minVersion: string,
  ) {}

  @Get("lookup")
  lookup(
    @CurrentUser() user: AuthUser,
    @Headers(EXTENSION_VERSION_HEADER) version: string | undefined,
    @ValidQuery(lookupCaptureRoute) query: RequestQuery<typeof lookupCaptureRoute>,
  ): Promise<CaptureLookup> {
    assertSupportedVersion(version, this.minVersion);
    return this.captures.lookup(user.id, query);
  }

  @Post()
  @RateLimit(10)
  async create(
    @CurrentUser() user: AuthUser,
    @Headers(EXTENSION_VERSION_HEADER) version: string | undefined,
    @ValidBody(createCaptureRoute) body: RequestBody<typeof createCaptureRoute>,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CaptureCreated> {
    assertSupportedVersion(version, this.minVersion);
    const { track, created } = await this.captures.create(user.id, body);
    if (!created) res.status(200);
    return { video_id: track.videoId, track_id: track.trackId, status: track.status };
  }
}
