import { Logger, UnauthorizedException, type ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  NOW_SEC,
  decodedToken,
  fakeFirebaseAuth,
  fakeUsersRepository,
  userRecord,
  type FakeFirebaseAuth,
} from "../test/auth-fakes";
import type { AuthUser } from "./auth-user";
import { AuthGuard } from "./auth.guard";
import { RevocationCache } from "./revocation-cache";
import type { UsersRepository } from "../users/users.repository";

type FakeRequest = { headers: Record<string, string>; user?: AuthUser };

function contextFor(req: FakeRequest, isPublic = false): ExecutionContext {
  class TestController {}
  const handler = () => undefined;
  if (isPublic) Reflect.defineMetadata("isPublic", true, handler);
  return {
    getHandler: () => handler,
    getClass: () => TestController,
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext;
}

describe("AuthGuard", () => {
  let auth: FakeFirebaseAuth;
  let users: ReturnType<typeof fakeUsersRepository>;
  let guard: AuthGuard;
  let debug: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    auth = fakeFirebaseAuth("firebase-uid-1");
    users = fakeUsersRepository();
    guard = new AuthGuard(
      new Reflector(),
      auth,
      new RevocationCache(auth),
      users as unknown as UsersRepository,
    );
    debug = vi.spyOn(Logger.prototype, "debug").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function expect401(req: FakeRequest) {
    const result = guard.canActivate(contextFor(req));
    await expect(result).rejects.toBeInstanceOf(UnauthorizedException);
    await result.catch((err: UnauthorizedException) =>
      expect(err.getResponse()).toEqual({ error: "Unauthorized" }),
    );
    expect(req.user).toBeUndefined();
  }

  it("lets a public route through without credentials", async () => {
    await expect(guard.canActivate(contextFor({ headers: {} }, true))).resolves.toBe(true);
    expect(auth.verifySessionCookie).not.toHaveBeenCalled();
  });

  it("accepts a valid session cookie and attaches the user", async () => {
    const req: FakeRequest = { headers: { cookie: "theme=dark; session=valid-session-cookie" } };
    await expect(guard.canActivate(contextFor(req))).resolves.toBe(true);
    expect(req.user).toEqual({ id: "user-1", firebaseUid: "firebase-uid-1" });
    expect(auth.verifySessionCookie).toHaveBeenCalledWith("valid-session-cookie", false);
  });

  it("accepts a valid bearer ID token and attaches the user", async () => {
    const req: FakeRequest = { headers: { authorization: "Bearer valid-id-token" } };
    await expect(guard.canActivate(contextFor(req))).resolves.toBe(true);
    expect(req.user).toEqual({ id: "user-1", firebaseUid: "firebase-uid-1" });
    expect(auth.verifyIdToken).toHaveBeenCalledWith("valid-id-token", false);
  });

  it("rejects a request without credentials", async () => {
    await expect401({ headers: {} });
    await expect401({ headers: { cookie: "theme=dark" } });
  });

  it("rejects an expired or forged cookie", async () => {
    await expect401({ headers: { cookie: "session=forged" } });
  });

  it("rejects an expired or forged ID token", async () => {
    await expect401({ headers: { authorization: "Bearer forged" } });
  });

  it("rejects an Authorization header that is not a bearer token", async () => {
    await expect401({ headers: { authorization: "Basic dXNlcjpwYXNz" } });
    await expect401({ headers: { authorization: "Bearer" } });
    expect(auth.verifyIdToken).not.toHaveBeenCalled();
  });

  it("uses the bearer token when both are sent", async () => {
    const req: FakeRequest = {
      headers: { authorization: "Bearer valid-id-token", cookie: "session=valid-session-cookie" },
    };
    await expect(guard.canActivate(contextFor(req))).resolves.toBe(true);
    expect(auth.verifySessionCookie).not.toHaveBeenCalled();
  });

  it("does not fall back to a valid cookie when the bearer token is invalid", async () => {
    await expect401({
      headers: { authorization: "Bearer forged", cookie: "session=valid-session-cookie" },
    });
    expect(auth.verifySessionCookie).not.toHaveBeenCalled();
  });

  it("rejects a token issued before the user's sessions were revoked", async () => {
    auth.getUser.mockResolvedValue(
      userRecord({ tokensValidAfterTime: new Date((NOW_SEC + 60) * 1000).toUTCString() }),
    );
    await expect401({ headers: { cookie: "session=valid-session-cookie" } });
  });

  it("rejects a disabled user", async () => {
    auth.getUser.mockResolvedValue(userRecord({ disabled: true }));
    await expect401({ headers: { authorization: "Bearer valid-id-token" } });
  });

  it("rejects a valid Firebase user with no row in our users table", async () => {
    auth.verifyIdToken.mockResolvedValue(decodedToken("stranger-uid"));
    await expect401({ headers: { authorization: "Bearer valid-id-token" } });
    expect(users.findIdByFirebaseUid).toHaveBeenCalledWith("stranger-uid");
  });

  it("logs only the reason, never the token, cookie or user", async () => {
    await expect401({ headers: { cookie: "session=forged-secret-cookie" } });
    await expect401({ headers: { authorization: "Bearer forged-secret-token" } });
    auth.verifyIdToken.mockResolvedValue(decodedToken("stranger-uid"));
    await expect401({ headers: { authorization: "Bearer valid-id-token" } });

    const logged = JSON.stringify(debug.mock.calls);
    expect(debug.mock.calls).toEqual([["401 invalid"], ["401 invalid"], ["401 unknown-user"]]);
    for (const secret of ["forged-secret", "valid-id-token", "stranger-uid"]) {
      expect(logged).not.toContain(secret);
    }
  });
});
