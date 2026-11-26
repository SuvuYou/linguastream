import type { INestApplication } from "@nestjs/common";
import { ApiError, CurrentUser, getCurrentUserRoute } from "@linguastream/contracts";
import request from "supertest";
import { createTestApp } from "../test/auth-fakes";

describe("GET /api/user", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("serves the path in the contract", () => {
    expect(getCurrentUserRoute.path).toBe("/api/user");
  });

  it("returns the signed-in user in the contract's shape", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/user")
      .set("Cookie", "session=valid-session-cookie")
      .expect(200);
    expect(CurrentUser.parse(res.body)).toEqual({
      id: "user-1",
      email: "user-1@linguastream.test",
      display_name: null,
      native_language: "uk",
      learning_language: "de",
      is_admin: false,
    });
  });

  it("answers 401 without a session", async () => {
    const res = await request(app.getHttpServer()).get("/api/user").expect(401);
    expect(ApiError.parse(res.body)).toEqual({ error: "Unauthorized" });
  });
});
