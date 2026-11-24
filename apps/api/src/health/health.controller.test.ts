import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { HealthResponse } from "@linguastream/contracts";
import request from "supertest";
import { AppModule } from "../app.module";

describe("GET /health", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns a body that matches the shared contract", async () => {
    const res = await request(app.getHttpServer()).get("/health").expect(200);
    expect(HealthResponse.parse(res.body)).toEqual({ status: "ok" });
  });
});
