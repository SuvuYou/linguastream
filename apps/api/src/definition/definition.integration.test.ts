import { Logger, type INestApplication } from "@nestjs/common";
import { ApiError, WordDefinition } from "@linguastream/contracts";
import request from "supertest";
import { InMemoryUsageStore, createTestApp } from "../test/auth-fakes";
import { UsageStore } from "../usage/usage-store";
import { GeminiClient } from "../ai/gemini.client";
import { definitionInstruction } from "../ai/prompts/definition";

const answer = {
  definition: "a building for people to live in",
  translation: "house",
  context_sentence: "Das Haus ist groß.",
};

const query = { word: "Haus", lang: "de", context: "das Haus ist groß und alt" };

describe("GET /api/definition", () => {
  let app: INestApplication;
  const gemini = { generateText: vi.fn<GeminiClient["generateText"]>() };
  let logs: string;
  let store: InMemoryUsageStore;

  beforeEach(async () => {
    gemini.generateText.mockReset().mockResolvedValue(JSON.stringify(answer));
    logs = "";
    for (const level of ["log", "warn", "error", "debug"] as const) {
      vi.spyOn(Logger.prototype, level).mockImplementation((...args: unknown[]) => {
        logs += JSON.stringify(args);
      });
    }
    store = new InMemoryUsageStore();
    app = await createTestApp({
      providers: [
        { token: GeminiClient, value: gemini },
        { token: UsageStore, value: store },
      ],
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await app.close();
  });

  const get = (q: Record<string, string> = query) =>
    request(app.getHttpServer())
      .get("/api/definition")
      .query(q)
      .set("Cookie", "session=valid-session-cookie");

  it("returns Gemini's definition in the contract's shape", async () => {
    const res = await get().expect(200);
    expect(WordDefinition.parse(res.body)).toEqual(answer);

    const [message, options] = gemini.generateText.mock.calls[0]!;
    expect(JSON.parse(message)).toEqual({ word: "Haus", text: "das Haus ist groß und alt" });
    expect(options).toEqual({
      systemInstruction: definitionInstruction("de", "uk"),
      responseMimeType: "application/json",
    });
  });

  it("answers 401 without a session and never calls Gemini", async () => {
    await request(app.getHttpServer()).get("/api/definition").query(query).expect(401);
    expect(gemini.generateText).not.toHaveBeenCalled();
  });

  it("answers 400 to over-long input and never calls Gemini", async () => {
    const res = await get({ ...query, context: "x".repeat(1001) }).expect(400);
    expect(ApiError.parse(res.body).error).toContain("query.context");
    expect(gemini.generateText).not.toHaveBeenCalled();
  });

  it("answers 502 without Gemini's error text when Gemini fails", async () => {
    gemini.generateText.mockRejectedValue(new Error("quota exceeded for das Haus ist groß"));
    const res = await get().expect(502);
    expect(ApiError.parse(res.body)).toEqual({ error: "Failed to generate definition" });
    expect(JSON.stringify(res.body)).not.toContain("quota");
  });

  it("answers 502 when Gemini's answer is not a definition", async () => {
    gemini.generateText.mockResolvedValueOnce("not json");
    await get().expect(502);
    gemini.generateText.mockResolvedValueOnce(JSON.stringify({ translation: "house" }));
    await get().expect(502);
  });

  it("never logs the sentence", async () => {
    gemini.generateText.mockResolvedValueOnce("not json");
    await get().expect(502);
    expect(logs).not.toContain("groß");
  });

  it("is limited to 20 calls a minute per user", async () => {
    for (let i = 0; i < 20; i++) await get().expect(200);
    const res = await get().expect(429);
    expect(ApiError.parse(res.body)).toEqual({ error: "Too many requests" });
  });

  describe("limits", () => {
    afterEach(() => vi.unstubAllEnvs());

    it("counts each call and refuses calls over the daily AI quota", async () => {
      vi.stubEnv("AI_CALLS_PER_DAY", "2");
      await get().expect(200);
      await get().expect(200);
      const res = await get().expect(429);
      expect(ApiError.parse(res.body).error).toBe("Daily AI limit reached. It resets at midnight.");
      expect(gemini.generateText).toHaveBeenCalledTimes(2);
    });

    it("answers 503 without calling Gemini once the month's spend cap is reached", async () => {
      vi.stubEnv("MONTHLY_SPEND_CAP_USD", "1");
      store.values.set(`usage:spend:${new Date().toISOString().slice(0, 7)}`, 1_000_000);
      const res = await get().expect(503);
      expect(ApiError.parse(res.body).error).toBe("AI limit reached for this month");
      expect(gemini.generateText).not.toHaveBeenCalled();
      expect(logs).toContain("Monthly spend cap reached");
    });

    it("refuses AI calls while their use can't be counted", async () => {
      store.failing = true;
      const res = await get().expect(503);
      expect(ApiError.parse(res.body).error).toContain("AI is unavailable right now");
      expect(gemini.generateText).not.toHaveBeenCalled();
    });
  });
});
