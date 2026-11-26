import {
  ForbiddenException,
  Inject,
  Injectable,
  SetMetadata,
  type CanActivate,
  type ExecutionContext,
  type Provider,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { ApiError } from "@linguastream/contracts";
import type { Request } from "express";

export const WEB_ORIGIN = Symbol("WEB_ORIGIN");
export const EXTENSION_ORIGIN = Symbol("EXTENSION_ORIGIN");

export const webOriginProvider: Provider = {
  provide: WEB_ORIGIN,
  useFactory: (): string => {
    const origin = process.env.WEB_ORIGIN;
    if (!origin) throw new Error("WEB_ORIGIN must be set (apps/api/.env), e.g. http://localhost:3000");
    return origin;
  },
};

export const extensionOriginProvider: Provider = {
  provide: EXTENSION_ORIGIN,
  useFactory: (): string => {
    const id = process.env.EXTENSION_ID;
    if (!id) throw new Error("EXTENSION_ID must be set (apps/api/.env)");
    return `chrome-extension://${id}`;
  },
};

const ALLOWED_ORIGIN = "allowedOrigin";

export const AllowedOrigin = (origin: "extension") => SetMetadata(ALLOWED_ORIGIN, origin);

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

@Injectable()
export class OriginGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(WEB_ORIGIN) private readonly webOrigin: string,
    @Inject(EXTENSION_ORIGIN) private readonly extensionOrigin: string,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const allowed = this.reflector.getAllAndOverride<"extension" | undefined>(ALLOWED_ORIGIN, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (allowed === "extension") {
      if (req.headers.origin === this.extensionOrigin) return true;
      this.forbid();
    }

    if (SAFE_METHODS.has(req.method)) return true;
    if (req.headers.authorization !== undefined) return true;
    if (req.headers.origin === this.webOrigin) return true;
    this.forbid();
  }

  private forbid(): never {
    throw new ForbiddenException({ error: "Forbidden" } satisfies ApiError);
  }
}
