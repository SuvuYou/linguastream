import type { INestApplication } from "@nestjs/common";
import { UsageSummary } from "@linguastream/contracts";
import request from "supertest";
import { InMemoryUsageStore, createTestApp, fakeUsersRepository } from "../test/auth-fakes";
import { UsersRepository } from "../users/users.repository";
import { UsageStore } from "./usage-store";

describe("GET /api/usage", () => {
  let app: INestApplication;
  let users: ReturnType<typeof fakeUsersRepository>;

  beforeEach(async () => {
    users = fakeUsersRepository();
    const store = new InMemoryUsageStore();
    store.values.set(`usage:spend:${new Date().toISOString().slice(0, 7)}`, 1_500_000);
    app = await createTestApp({
      providers: [
        { token: UsageStore, value: store },
        { token: UsersRepository, value: users },
      ],
    });
  });

  afterEach(async () => {
    await app.close();
  });

  const get = () => request(app.getHttpServer()).get("/api/usage").set("Authorization", "Bearer valid-id-token");

  it("shows a user today's use without the instance's spend", async () => {
    const res = await get().expect(200);
    const summary = UsageSummary.parse(res.body);
    expect(summary.transfer).toEqual({ used_characters: 0, limit_characters: 165_000, minutes_left: 180 });
    expect(summary.ai_calls).toEqual({ used: 0, limit: 200 });
    expect(summary.paid_features_paused).toBe(false);
    expect(res.body).not.toHaveProperty("month_spend_usd");
  });

  it("shows an admin the month's spend and cap", async () => {
    users.findProfile.mockResolvedValueOnce({
      id: "user-1",
      email: "admin@linguastream.test",
      displayName: null,
      nativeLanguage: "uk",
      learningLanguage: "de",
      isAdmin: true,
    });
    const res = await get().expect(200);
    expect(UsageSummary.parse(res.body)).toMatchObject({ month_spend_usd: 1.5, month_spend_cap_usd: 10 });
  });

  it("answers 401 without a session", async () => {
    await request(app.getHttpServer()).get("/api/usage").expect(401);
  });
});
