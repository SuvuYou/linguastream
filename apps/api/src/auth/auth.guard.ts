import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { ApiError } from "@linguastream/contracts";
import { parseCookie } from "cookie";
import type { Request } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { AuthUser } from "./auth-user";
import { FIREBASE_AUTH, type FirebaseAuth } from "./firebase-auth.provider";
import { IS_PUBLIC } from "./public.decorator";
import { RevocationCache, type SessionProblem } from "./revocation-cache";
import { UsersRepository } from "../users/users.repository";

type RejectReason = "missing" | "invalid" | SessionProblem;

const SESSION_COOKIE = "session";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(FIREBASE_AUTH) private readonly auth: FirebaseAuth,
    private readonly revocation: RevocationCache,
    private readonly users: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = await this.verify(req);

    const problem = await this.revocation.check(token.uid, token.auth_time);
    if (problem) this.reject(problem);

    const id = await this.users.findIdByFirebaseUid(token.uid);
    if (!id) this.reject("unknown-user");

    req.user = { id, firebaseUid: token.uid };
    return true;
  }

  private async verify(req: Request): Promise<DecodedIdToken> {
    const header = req.headers.authorization;
    if (header !== undefined) {
      const idToken = /^Bearer (\S+)$/.exec(header)?.[1];
      if (!idToken) this.reject("invalid");
      return this.auth.verifyIdToken(idToken, false).catch(() => this.reject("invalid"));
    }

    const cookie = req.headers.cookie ? parseCookie(req.headers.cookie)[SESSION_COOKIE] : undefined;
    if (!cookie) this.reject("missing");
    return this.auth.verifySessionCookie(cookie, false).catch(() => this.reject("invalid"));
  }

  private reject(reason: RejectReason): never {
    this.logger.debug(`401 ${reason}`);
    throw new UnauthorizedException({ error: "Unauthorized" } satisfies ApiError);
  }
}
