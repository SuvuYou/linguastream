import { Controller, Get, Post, type INestApplication } from "@nestjs/common";
import {
  ApiError,
  defineRoute,
  type RequestBody,
  type RequestParams,
  type RequestQuery,
} from "@linguastream/contracts";
import request from "supertest";
import { z } from "zod";
import type { AuthUser } from "../auth/auth-user";
import { CurrentUser } from "../auth/current-user.decorator";
import { Public } from "../auth/public.decorator";
import { TEST_WEB_ORIGIN, createTestApp, decodedToken, fakeFirebaseAuth } from "../test/auth-fakes";
import { DEFAULT_RATE_LIMIT, RateLimit } from "./rate-limit";
import { ValidBody, ValidParams, ValidQuery } from "./valid-input.decorators";

const echoRoute = defineRoute({
  method: "POST",
  path: "/api/test-hardening/echo/:id",
  params: z.object({ id: z.string().max(10) }),
  query: z.object({ n: z.coerce.number().int().default(1) }),
  body: z.object({ note: z.string().max(1_000_000) }),
  response: z.unknown(),
});

@Controller("test-hardening")
class HardeningController {
  @Post("echo/:id")
  echo(
    @ValidParams(echoRoute) params: RequestParams<typeof echoRoute>,
    @ValidQuery(echoRoute) query: RequestQuery<typeof echoRoute>,
    @ValidBody(echoRoute) body: RequestBody<typeof echoRoute>,
    @CurrentUser() user: AuthUser,
  ) {
    return { params, query, noteLength: body.note.length, body, userId: user.id };
  }

  @Post("big")
  big(@ValidBody(echoRoute) body: RequestBody<typeof echoRoute>) {
    return { noteLength: body.note.length };
  }

  @Get("read")
  read() {
    return { ok: true };
  }

  @Post("expensive")
  @RateLimit(2)
  expensive(@CurrentUser() user: AuthUser) {
    return { userId: user.id };
  }

  @Public()
  @Get("public")
  @RateLimit(2)
  publicRoute() {
    return { ok: true };
  }
}

function twoUserAuth() {
  const auth = fakeFirebaseAuth("firebase-uid-1");
  auth.verifyIdToken.mockImplementation(async (token: string) => {
    if (token === "token-1") return decodedToken("firebase-uid-1");
    if (token === "token-2") return decodedToken("firebase-uid-2");
    throw new Error("invalid");
  });
  return auth;
}

async function newApp(largerBodyLimits?: Record<string, string>) {
  return createTestApp({
    auth: twoUserAuth(),
    users: { "firebase-uid-1": "user-1", "firebase-uid-2": "user-2" },
    controllers: [HardeningController],
    largerBodyLimits,
  });
}

const COOKIE = "session=valid-session-cookie";

describe("request hardening through the whole app", () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await newApp({ "/api/test-hardening/big": "200kb" });
  });

  afterEach(async () => {
    await app.close();
  });

  const post = (path: string) =>
    request(app.getHttpServer()).post(path).set("Cookie", COOKIE).set("Origin", TEST_WEB_ORIGIN);

  describe("validation", () => {
    it("hands the handler parsed input: coerced, defaulted, unknown keys stripped", async () => {
      const res = await post("/api/test-hardening/echo/abc?n=5")
        .send({ note: "hallo", isAdmin: true })
        .expect(201);
      expect(res.body).toMatchObject({
        params: { id: "abc" },
        query: { n: 5 },
        body: { note: "hallo" },
        userId: "user-1",
      });
      expect(res.body.body).not.toHaveProperty("isAdmin");

      const withDefault = await post("/api/test-hardening/echo/abc").send({ note: "x" }).expect(201);
      expect(withDefault.body.query).toEqual({ n: 1 });
    });

    it("answers 400 naming the fields", async () => {
      const res = await post("/api/test-hardening/echo/abc?n=lots").send({ note: "x" }).expect(400);
      const { error } = ApiError.parse(res.body);
      expect(error).toContain("query.n");
    });

    it("names a missing body field", async () => {
      const res = await post("/api/test-hardening/echo/abc").send({ text: "x" }).expect(400);
      expect(ApiError.parse(res.body).error).toContain("body.note");
    });

    it("never echoes the value it rejected", async () => {
      const secret = "Ich-heiße-Privat";
      const res = await post(`/api/test-hardening/echo/${secret}`).send({ note: "x" }).expect(400);
      const { error } = ApiError.parse(res.body);
      expect(error).toContain("params.id");
      expect(JSON.stringify(res.body)).not.toContain("Privat");
    });
  });

  describe("body size", () => {
    const note = (kb: number) => "a".repeat(kb * 1024);

    it("answers 413 above 100 KB", async () => {
      const res = await post("/api/test-hardening/echo/abc").send({ note: note(101) }).expect(413);
      expect(ApiError.parse(res.body)).toEqual({ error: "Request body too large" });
    });

    it("answers 400 to malformed JSON", async () => {
      const res = await post("/api/test-hardening/echo/abc")
        .set("Content-Type", "application/json")
        .send('{"note": ')
        .expect(400);
      expect(ApiError.parse(res.body)).toEqual({ error: "Invalid JSON" });
    });

    it("accepts a larger body on a route with a raised limit", async () => {
      const res = await post("/api/test-hardening/big").send({ note: note(150) }).expect(201);
      expect(res.body.noteLength).toBe(150 * 1024);
    });
  });

  describe("CSRF (Origin check, D-098)", () => {
    it("lets a cookie POST from our origin through", async () => {
      await post("/api/test-hardening/echo/abc").send({ note: "x" }).expect(201);
    });

    it("refuses a cookie POST from another origin or without one", async () => {
      const wrong = await request(app.getHttpServer())
        .post("/api/test-hardening/echo/abc")
        .set("Cookie", COOKIE)
        .set("Origin", "https://evil.example")
        .send({ note: "x" })
        .expect(403);
      expect(ApiError.parse(wrong.body)).toEqual({ error: "Forbidden" });

      await request(app.getHttpServer())
        .post("/api/test-hardening/echo/abc")
        .set("Cookie", COOKIE)
        .send({ note: "x" })
        .expect(403);
    });

    it("lets a GET through without Origin", async () => {
      await request(app.getHttpServer()).get("/api/test-hardening/read").set("Cookie", COOKIE).expect(200);
    });

    it("lets a bearer POST through without Origin (the extension)", async () => {
      await request(app.getHttpServer())
        .post("/api/test-hardening/echo/abc")
        .set("Authorization", "Bearer token-1")
        .send({ note: "x" })
        .expect(201);
    });
  });

  describe("rate limits", () => {
    const expensive = (token: string) =>
      request(app.getHttpServer()).post("/api/test-hardening/expensive").set("Authorization", `Bearer ${token}`);

    it("answers 429 with Retry-After once @RateLimit() is used up", async () => {
      await expensive("token-1").expect(201);
      await expensive("token-1").expect(201);
      const res = await expensive("token-1").expect(429);
      expect(ApiError.parse(res.body)).toEqual({ error: "Too many requests" });
      expect(Number(res.headers["retry-after"])).toBeGreaterThan(0);
    });

    it("counts each user separately", async () => {
      await expensive("token-1").expect(201);
      await expensive("token-1").expect(201);
      await expensive("token-1").expect(429);
      await expensive("token-2").expect(201);
    });

    it("counts public routes per IP", async () => {
      const get = () => request(app.getHttpServer()).get("/api/test-hardening/public");
      await get().expect(200);
      await get().expect(200);
      await get().expect(429);
    });

    it("limits every route by default", async () => {
      const server = app.getHttpServer();
      for (let i = 0; i < DEFAULT_RATE_LIMIT.limit; i++) {
        await request(server).get("/api/test-hardening/read").set("Cookie", COOKIE).expect(200);
      }
      await request(server).get("/api/test-hardening/read").set("Cookie", COOKIE).expect(429);
    });
  });
});
