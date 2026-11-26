import {
  ForbiddenException,
  Inject,
  Injectable,
  type CanActivate,
  type ExecutionContext,
  type Provider,
} from "@nestjs/common";
import type { ApiError } from "@linguastream/contracts";
import type { Request } from "express";

export const WEB_ORIGIN = Symbol("WEB_ORIGIN");

export const webOriginProvider: Provider = {
  provide: WEB_ORIGIN,
  useFactory: (): string => {
    const origin = process.env.WEB_ORIGIN;
    if (!origin) throw new Error("WEB_ORIGIN must be set (apps/api/.env), e.g. http://localhost:3000");
    return origin;
  },
};

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

@Injectable()
export class OriginGuard implements CanActivate {
  constructor(@Inject(WEB_ORIGIN) private readonly webOrigin: string) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(req.method)) return true;
    if (req.headers.authorization !== undefined) return true;
    if (req.headers.origin === this.webOrigin) return true;
    throw new ForbiddenException({ error: "Forbidden" } satisfies ApiError);
  }
}
