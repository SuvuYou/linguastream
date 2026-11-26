import type { INestApplication } from "@nestjs/common";
import { HealthResponse } from "@linguastream/contracts";
import request from "supertest";
import { createTestApp } from "../test/auth-fakes";

describe("GET /health", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns a body that matches the shared contract, without credentials", async () => {
    const res = await request(app.getHttpServer()).get("/health").expect(200);
    expect(HealthResponse.parse(res.body)).toEqual({ status: "ok" });
  });
});
