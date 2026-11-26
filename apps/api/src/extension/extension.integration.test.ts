import { Logger, type INestApplication } from "@nestjs/common";
import { ApiError, ExtensionCode, ExtensionToken } from "@linguastream/contracts";
import request from "supertest";
import {
  TEST_EXTENSION_ORIGIN,
  TEST_WEB_ORIGIN,
  createTestApp,
  fakeFirebaseAuth,
  type FakeFirebaseAuth,
} from "../test/auth-fakes";
import { SignInCodes } from "./sign-in-codes";

const COOKIE = "session=valid-session-cookie";

describe("extension sign-in codes", () => {
  let app: INestApplication;
  let auth: FakeFirebaseAuth;
  let logs: string;

  beforeEach(async () => {
    auth = fakeFirebaseAuth("firebase-uid-1");
    logs = "";
    for (const level of ["log", "warn", "error", "debug", "verbose"] as const) {
      vi.spyOn(Logger.prototype, level).mockImplementation((...args: unknown[]) => {
        logs += JSON.stringify(args);
      });
    }
    app = await createTestApp({ auth });
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    await app.close();
  });

  const newCode = () =>
    request(app.getHttpServer()).post("/api/extension/code").set("Cookie", COOKIE).set("Origin", TEST_WEB_ORIGIN);

  const exchange = (code: unknown, origin = TEST_EXTENSION_ORIGIN) =>
    request(app.getHttpServer()).post("/api/extension/token").set("Origin", origin).send({ code });

  async function issueCode() {
    const res = await newCode().expect(201);
    return ExtensionCode.parse(res.body).code;
  }

  describe("POST /api/extension/code", () => {
    it("gives a signed-in user a code valid for about 2 minutes", async () => {
      const res = await newCode().expect(201);
      const { expires_at } = ExtensionCode.parse(res.body);
      const ttl = Date.parse(expires_at) - Date.now();
      expect(ttl).toBeGreaterThan(SignInCodes.TTL_MS - 5000);
      expect(ttl).toBeLessThanOrEqual(SignInCodes.TTL_MS);
    });

    it("answers 401 without a session", async () => {
      await request(app.getHttpServer()).post("/api/extension/code").set("Origin", TEST_WEB_ORIGIN).expect(401);
    });

    it("answers 403 from another origin", async () => {
      await request(app.getHttpServer())
        .post("/api/extension/code")
        .set("Cookie", COOKIE)
        .set("Origin", "https://evil.example")
        .expect(403);
    });

    it("makes the previous code invalid", async () => {
      const first = await issueCode();
      await issueCode();
      await exchange(first).expect(401);
    });

    it("is limited to 5 a minute", async () => {
      for (let i = 0; i < 5; i++) await newCode().expect(201);
      await newCode().expect(429);
    });
  });

  describe("POST /api/extension/token", () => {
    it("exchanges a code for a custom token for that user", async () => {
      const code = await issueCode();
      const res = await exchange(code).expect(200);
      expect(ExtensionToken.parse(res.body)).toEqual({ custom_token: "custom-token-for-firebase-uid-1" });
      expect(auth.createCustomToken).toHaveBeenCalledWith("firebase-uid-1");
    });

    it("accepts a code only once", async () => {
      const code = await issueCode();
      await exchange(code).expect(200);
      const res = await exchange(code).expect(401);
      expect(ApiError.parse(res.body)).toEqual({ error: "Unauthorized" });
    });

    it("refuses an unknown code", async () => {
      await exchange("not-a-real-code").expect(401);
      expect(auth.createCustomToken).not.toHaveBeenCalled();
    });

    it("refuses an expired code", async () => {
      const code = await issueCode();
      const realNow = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(realNow + SignInCodes.TTL_MS + 1000);
      await exchange(code).expect(401);
    });

    it("answers 403 to any origin but the extension's, even with an Authorization header", async () => {
      const code = await issueCode();
      await exchange(code, TEST_WEB_ORIGIN).expect(403);
      await request(app.getHttpServer()).post("/api/extension/token").send({ code }).expect(403);
      await request(app.getHttpServer())
        .post("/api/extension/token")
        .set("Authorization", "Bearer anything")
        .send({ code })
        .expect(403);
      await exchange(code).expect(200);
    });

    it("answers 400 to a missing or over-long code", async () => {
      await exchange(undefined).expect(400);
      await exchange("a".repeat(101)).expect(400);
    });

    it("is limited to 10 a minute per IP", async () => {
      for (let i = 0; i < 10; i++) await exchange("guess").expect(401);
      await exchange("guess").expect(429);
    });

    it("never logs the code or the token", async () => {
      const code = await issueCode();
      await exchange(code).expect(200);
      await exchange(code).expect(401);
      expect(logs).not.toContain(code);
      expect(logs).not.toContain("custom-token-for");
    });
  });
});
