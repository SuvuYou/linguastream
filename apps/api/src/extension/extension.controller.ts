import { Controller, HttpCode, Inject, Post, UnauthorizedException } from "@nestjs/common";
import {
  exchangeExtensionCodeRoute,
  type ApiError,
  type ExtensionCode,
  type ExtensionToken,
  type RequestBody,
} from "@linguastream/contracts";
import type { AuthUser } from "../auth/auth-user";
import { CurrentUser } from "../auth/current-user.decorator";
import { FIREBASE_AUTH, type FirebaseAuth } from "../auth/firebase-auth.provider";
import { Public } from "../auth/public.decorator";
import { AllowedOrigin } from "../http/origin.guard";
import { RateLimit } from "../http/rate-limit";
import { ValidBody } from "../http/valid-input.decorators";
import { SignInCodes } from "./sign-in-codes";

@Controller("extension")
export class ExtensionController {
  constructor(
    private readonly codes: SignInCodes,
    @Inject(FIREBASE_AUTH) private readonly auth: FirebaseAuth,
  ) {}

  @Post("code")
  @RateLimit(5)
  createCode(@CurrentUser() user: AuthUser): ExtensionCode {
    const { code, expiresAt } = this.codes.issue(user);
    return { code, expires_at: expiresAt.toISOString() };
  }

  @Post("token")
  @HttpCode(200)
  @Public()
  @AllowedOrigin("extension")
  @RateLimit(10)
  async exchange(
    @ValidBody(exchangeExtensionCodeRoute) body: RequestBody<typeof exchangeExtensionCodeRoute>,
  ): Promise<ExtensionToken> {
    const firebaseUid = this.codes.redeem(body.code);
    if (!firebaseUid) throw new UnauthorizedException({ error: "Unauthorized" } satisfies ApiError);
    return { custom_token: await this.auth.createCustomToken(firebaseUid) };
  }
}
