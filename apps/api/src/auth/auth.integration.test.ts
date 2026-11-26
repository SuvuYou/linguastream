import { Controller, Get, type INestApplication } from "@nestjs/common";
import { ApiError } from "@linguastream/contracts";
import request from "supertest";
import { createTestApp } from "../test/auth-fakes";
import type { AuthUser } from "./auth-user";
import { CurrentUser } from "./current-user.decorator";

@Controller("test-me")
class MeController {
  @Get()
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}

describe("auth through the whole app", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp({ controllers: [MeController] });
  });

  afterAll(async () => {
    await app.close();
  });

  it("protects routes by default", async () => {
    const res = await request(app.getHttpServer()).get("/test-me").expect(401);
    expect(ApiError.parse(res.body)).toEqual({ error: "Unauthorized" });
  });

  it("returns the user for a valid session cookie", async () => {
    const res = await request(app.getHttpServer())
      .get("/test-me")
      .set("Cookie", "session=valid-session-cookie")
      .expect(200);
    expect(res.body).toEqual({ id: "user-1", firebaseUid: "firebase-uid-1" });
  });

  it("returns the user for a valid bearer ID token", async () => {
    const res = await request(app.getHttpServer())
      .get("/test-me")
      .set("Authorization", "Bearer valid-id-token")
      .expect(200);
    expect(res.body).toEqual({ id: "user-1", firebaseUid: "firebase-uid-1" });
  });

  it("answers 401 with the ApiError body for a forged token", async () => {
    const res = await request(app.getHttpServer())
      .get("/test-me")
      .set("Authorization", "Bearer forged")
      .expect(401);
    expect(ApiError.parse(res.body)).toEqual({ error: "Unauthorized" });
  });

  it("keeps /health public", async () => {
    await request(app.getHttpServer()).get("/health").expect(200);
  });
});
